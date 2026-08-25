import crypto from 'node:crypto'
import { after, NextResponse } from 'next/server'
import { getDealerImportAccess } from '@/lib/dealer-import-access'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { isBusinessFeatureEnabled } from '@/lib/business-feature-flags'
import { processDealerImportRun } from '@/lib/dealer-import/worker'

export const runtime = 'nodejs'
export const maxDuration = 300

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const verificationMethods = new Set(['dns', 'html_file', 'meta_tag', 'manual_admin'])
const sourceSelect = 'id,name,source_type,website_url,inventory_url,feed_url,verified_domain,verification_status,sync_status,sync_interval_hours,discovered_count,imported_count,published_count,review_count,error_count,last_success_at,next_sync_at,last_error,publication_approved_at,created_at,updated_at'

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const access = await getDealerImportAccess()
  if (!access.allowed) return NextResponse.json({ error: access.error }, { status: access.status })
  const { id } = await context.params
  if (!uuidPattern.test(id)) return NextResponse.json({ error: 'INVALID_SOURCE_ID' }, { status: 400 })

  const { data: source, error } = await access.admin.from('dealer_import_sources').select(sourceSelect).eq('id', id).eq('organization_id', access.organizationId).is('deleted_at', null).maybeSingle()
  if (error) return NextResponse.json({ error: 'SOURCE_READ_FAILED' }, { status: 500 })
  if (!source) return NextResponse.json({ error: 'SOURCE_NOT_FOUND' }, { status: 404 })

  const [{ data: items }, { data: runs }, { data: verifications }] = await Promise.all([
    access.admin.from('dealer_import_items').select('id,source_url,canonical_source_url,sync_status,normalized_payload,field_confidence,parse_confidence,warnings,original_image_urls,last_seen_at,updated_at').eq('source_id', id).order('parse_confidence', { ascending: false, nullsFirst: false }).limit(10),
    access.admin.from('dealer_import_runs').select('id,status,trigger_type,current_step,started_at,completed_at,discovered_count,parsed_count,created_count,updated_count,unchanged_count,warning_count,error_count,last_error_code,last_error_message,summary,created_at').eq('source_id', id).order('created_at', { ascending: false }).limit(20),
    access.admin.from('dealer_site_verifications').select('id,method,status,domain,instructions,evidence,requested_at,checked_at,verified_at,expires_at').eq('source_id', id).order('created_at', { ascending: false }).limit(10),
  ])
  return NextResponse.json({ source, items: items || [], runs: runs || [], verifications: verifications || [] })
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const limit = checkRateLimit({ key: `dealer-import-source-action:${getClientIp(request)}`, limit: 40, windowMs: 60 * 60 * 1000 })
  if (limit.limited) return NextResponse.json({ error: 'RATE_LIMITED' }, { status: 429 })

  const access = await getDealerImportAccess()
  if (!access.allowed) return NextResponse.json({ error: access.error }, { status: access.status })
  if (!access.canManage) return NextResponse.json({ error: 'MANAGER_ROLE_REQUIRED' }, { status: 403 })
  const { id } = await context.params
  if (!uuidPattern.test(id)) return NextResponse.json({ error: 'INVALID_SOURCE_ID' }, { status: 400 })

  let body: Record<string, unknown>
  try { body = await request.json() as Record<string, unknown> } catch { return NextResponse.json({ error: 'INVALID_REQUEST' }, { status: 400 }) }
  const action = singleLine(body.action, 60)
  const allowedActions = new Set(['pause', 'resume', 'delete', 'rotate_verification_token', 'check_verification', 'start_analysis', 'start_sync', 'approve'])
  if (!allowedActions.has(action)) return NextResponse.json({ error: 'INVALID_ACTION' }, { status: 400 })

  const { data: source, error: sourceError } = await access.admin.from('dealer_import_sources').select('*').eq('id', id).eq('organization_id', access.organizationId).is('deleted_at', null).maybeSingle()
  if (sourceError) return NextResponse.json({ error: 'SOURCE_READ_FAILED' }, { status: 500 })
  if (!source) return NextResponse.json({ error: 'SOURCE_NOT_FOUND' }, { status: 404 })

  const now = new Date().toISOString()
  let runId: string | null = null
  let verificationToken = ''
  let eventMetadata: Record<string, unknown> = {}

  if (action === 'pause') {
    await updateSource(access.admin, id, { sync_status: 'paused', next_sync_at: null, updated_by: access.user.id })
  }
  if (action === 'resume') {
    const nextStatus = source.publication_approved_at ? 'active' : 'ready'
    await updateSource(access.admin, id, { sync_status: nextStatus, next_sync_at: source.publication_approved_at ? new Date(Date.now() + source.sync_interval_hours * 60 * 60 * 1000).toISOString() : null, updated_by: access.user.id })
  }
  if (action === 'delete') {
    await updateSource(access.admin, id, { sync_status: 'deleted', deleted_at: now, next_sync_at: null, updated_by: access.user.id })
  }
  if (action === 'approve') {
    const consents = Array.isArray(body.consents) ? body.consents : []
    if (consents.length !== 5 || !consents.every((value) => value === true)) {
      return NextResponse.json({ error: 'ALL_PUBLICATION_CONSENTS_REQUIRED' }, { status: 409 })
    }
    if (source.source_type === 'website' && source.verification_status !== 'verified') {
      return NextResponse.json({ error: 'SOURCE_VERIFICATION_REQUIRED' }, { status: 409 })
    }
    if (source.pilot_program_id && !access.pilot?.terms_accepted_at) {
      return NextResponse.json({ error: 'PILOT_TERMS_MUST_BE_RECORDED_BY_AUTORELL' }, { status: 409 })
    }
    const { data: previewRun, error: previewError } = await access.admin
      .from('dealer_import_runs')
      .select('id')
      .eq('source_id', id)
      .in('status', ['completed', 'completed_with_warnings'])
      .gt('parsed_count', 0)
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (previewError) return NextResponse.json({ error: 'SOURCE_READ_FAILED' }, { status: 500 })
    if (!previewRun) return NextResponse.json({ error: 'IMPORT_PREVIEW_REQUIRED' }, { status: 409 })
    if (!await isBusinessFeatureEnabled('dealer_inventory_sync', { organizationId: access.organizationId, pilotProgramId: access.pilot?.id || null, marketCode: access.profile?.country_code })) {
      return NextResponse.json({ error: 'INVENTORY_SYNC_FEATURE_DISABLED' }, { status: 404 })
    }
    runId = await queueRun(access.admin, {
      sourceId: id,
      userId: access.user.id,
      idempotencyKey: singleLine(body.idempotencyKey, 100),
      triggerType: 'manual',
      currentStep: source.source_type === 'website' ? 'discover_site' : 'validate_source',
      analysisOnly: false,
    })
    if (!runId) return NextResponse.json({ error: 'IMPORT_RUN_ALREADY_ACTIVE' }, { status: 409 })
    await updateSource(access.admin, id, {
      data_rights_accepted_at: now,
      image_rights_accepted_at: now,
      storage_display_accepted_at: now,
      automatic_sync_accepted_at: now,
      pilot_terms_accepted_at: now,
      terms_version: 'pilot-2026-08',
      publication_approved_at: now,
      sync_status: 'analyzing',
      last_started_at: now,
      updated_by: access.user.id,
    })
    eventMetadata = { run_id: runId, publication_approved: true, analysis_only: false }
  }
  if (action === 'rotate_verification_token') {
    if (source.source_type !== 'website') {
      return NextResponse.json({ error: 'WEBSITE_VERIFICATION_NOT_APPLICABLE' }, { status: 409 })
    }
    if (source.verification_status === 'verified') {
      return NextResponse.json({ error: 'SOURCE_ALREADY_VERIFIED' }, { status: 409 })
    }
    const requestedMethod = singleLine(body.verificationMethod, 30)
    const method = verificationMethods.has(requestedMethod) ? requestedMethod : 'meta_tag'
    verificationToken = crypto.randomBytes(24).toString('base64url')
    const tokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex')
    const { data: pendingVerification, error: pendingError } = await access.admin
      .from('dealer_site_verifications')
      .select('id')
      .eq('source_id', id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (pendingError) return NextResponse.json({ error: 'VERIFICATION_SETUP_FAILED' }, { status: 500 })
    const verificationPatch = {
      method,
      token_hash: tokenHash,
      instructions: verificationInstructions(method, source.verified_domain),
      evidence: {},
      requested_at: now,
      checked_at: null,
      verified_at: null,
      expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    }
    const verificationResult = pendingVerification
      ? await access.admin.from('dealer_site_verifications').update(verificationPatch).eq('id', pendingVerification.id)
      : await access.admin.from('dealer_site_verifications').insert({
        organization_id: access.organizationId,
        source_id: id,
        status: 'pending',
        domain: source.verified_domain,
        ...verificationPatch,
      })
    if (verificationResult.error) return NextResponse.json({ error: 'VERIFICATION_SETUP_FAILED' }, { status: 500 })
    await updateSource(access.admin, id, { verification_status: 'pending', sync_status: 'draft', last_error: null, updated_by: access.user.id })
    eventMetadata = { verification_method: method, token_rotated: true }
  }
  if (action === 'check_verification') {
    if (source.source_type !== 'website') {
      return NextResponse.json({ error: 'WEBSITE_VERIFICATION_NOT_APPLICABLE' }, { status: 409 })
    }
    if (source.verification_status === 'verified') {
      eventMetadata = { already_verified: true }
    } else {
      const method = verificationMethods.has(singleLine(body.verificationMethod, 30)) ? singleLine(body.verificationMethod, 30) : null
      if (method) {
        await access.admin.from('dealer_site_verifications').update({ method }).eq('source_id', id).eq('status', 'pending')
      }
      runId = await queueRun(access.admin, {
        sourceId: id,
        userId: access.user.id,
        idempotencyKey: singleLine(body.idempotencyKey, 100),
        triggerType: 'manual',
        currentStep: 'verify_source',
        analysisOnly: true,
      })
      if (!runId) return NextResponse.json({ error: 'IMPORT_RUN_ALREADY_ACTIVE' }, { status: 409 })
      await updateSource(access.admin, id, { sync_status: 'analyzing', updated_by: access.user.id })
      eventMetadata = { run_id: runId, verification_method: method }
    }
  }
  if (action === 'start_analysis' || action === 'start_sync') {
    if (source.source_type === 'website' && source.verification_status !== 'verified') {
      return NextResponse.json({ error: 'SOURCE_VERIFICATION_REQUIRED' }, { status: 409 })
    }
    if (action === 'start_sync' && !source.publication_approved_at) {
      return NextResponse.json({ error: 'PUBLICATION_APPROVAL_REQUIRED' }, { status: 409 })
    }
    if (action === 'start_sync' && !await isBusinessFeatureEnabled('dealer_inventory_sync', { organizationId: access.organizationId, pilotProgramId: access.pilot?.id || null, marketCode: access.profile?.country_code })) {
      return NextResponse.json({ error: 'INVENTORY_SYNC_FEATURE_DISABLED' }, { status: 404 })
    }
    if (source.sync_status === 'paused' && action === 'start_sync') {
      return NextResponse.json({ error: 'SOURCE_IS_PAUSED' }, { status: 409 })
    }
    runId = await queueRun(access.admin, {
      sourceId: id,
      userId: access.user.id,
      idempotencyKey: singleLine(body.idempotencyKey, 100),
      triggerType: 'manual',
      currentStep: source.source_type === 'website' ? 'discover_site' : 'validate_source',
      analysisOnly: action === 'start_analysis',
    })
    if (!runId) return NextResponse.json({ error: 'IMPORT_RUN_ALREADY_ACTIVE' }, { status: 409 })
    await updateSource(access.admin, id, { sync_status: 'analyzing', last_started_at: now, updated_by: access.user.id })
    eventMetadata = { run_id: runId, analysis_only: action === 'start_analysis' }
  }

  await access.admin.from('dealer_import_source_events').insert({
    organization_id: access.organizationId,
    source_id: id,
    actor_user_id: access.user.id,
    event_type: `company_${action}`,
    metadata: eventMetadata,
  })

  if (runId) {
    after(async () => {
      try {
        await processDealerImportRun(runId!, 1)
      } catch (workerError) {
        console.error('[dealer-import] immediate company run failed', { runId, error: workerError instanceof Error ? workerError.message : String(workerError) })
      }
    })
  }

  const { data: updatedSource } = await access.admin.from('dealer_import_sources').select(sourceSelect).eq('id', id).single()
  return NextResponse.json({ success: true, source: updatedSource, runId, verificationToken })
}

async function updateSource(admin: ReturnType<typeof import('@/lib/supabase/admin').createAdminClient>, id: string, patch: Record<string, unknown>) {
  const { error } = await admin.from('dealer_import_sources').update(patch).eq('id', id)
  if (error) throw error
}

async function queueRun(admin: ReturnType<typeof import('@/lib/supabase/admin').createAdminClient>, input: { sourceId: string; userId: string; idempotencyKey: string; triggerType: string; currentStep: string; analysisOnly: boolean }) {
  const safeKey = uuidPattern.test(input.idempotencyKey) ? input.idempotencyKey : crypto.randomUUID()
  const jobKey = `dealer-source:${input.sourceId}:${safeKey}`
  const { data: idempotentRun, error: idempotentError } = await admin.from('dealer_import_runs').select('id').eq('job_key', jobKey).maybeSingle()
  if (idempotentError) throw idempotentError
  if (idempotentRun) return String(idempotentRun.id)
  const { data: activeRun, error: activeError } = await admin.from('dealer_import_runs').select('id').eq('source_id', input.sourceId).in('status', ['queued', 'running', 'failed']).is('completed_at', null).limit(1).maybeSingle()
  if (activeError) throw activeError
  if (activeRun) return null
  const { data, error } = await admin.from('dealer_import_runs').insert({
    source_id: input.sourceId,
    job_key: jobKey,
    status: 'queued',
    trigger_type: input.triggerType,
    current_step: input.currentStep,
    created_by: input.userId,
    summary: { analysis_only: input.analysisOnly },
  }).select('id').single()
  if (!error && data) return String(data.id)
  if (error?.code === '23505') {
    const { data: existing } = await admin.from('dealer_import_runs').select('id').eq('job_key', jobKey).single()
    if (existing) return String(existing.id)
    return null
  }
  throw error || new Error('RUN_QUEUE_FAILED')
}

function singleLine(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().replace(/[\r\n\t]+/g, ' ').slice(0, maxLength) : ''
}

function verificationInstructions(method: string, domain: string | null) {
  if (method === 'dns') return { record_type: 'TXT', record_name: domain ? `_autorell-verification.${domain}` : null }
  if (method === 'html_file') return { path: '/.well-known/autorell-verification.txt' }
  if (method === 'meta_tag') return { name: 'autorell-site-verification' }
  return { review: 'manual_admin' }
}
