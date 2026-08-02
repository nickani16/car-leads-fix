import crypto from 'node:crypto'
import { after, NextResponse } from 'next/server'
import { requireAdminRoute, writeAdminAuditLog } from '@/lib/admin-route-auth'
import { isBusinessFeatureEnabled } from '@/lib/business-feature-flags'
import { processDealerImportRun } from '@/lib/dealer-import/worker'

export const runtime = 'nodejs'
export const maxDuration = 300

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const profileKinds = new Set(['json_ld', 'domain_adapter', 'generic_html'])
const targetFields = new Set(['title', 'make', 'model', 'variant', 'model_year', 'price', 'currency', 'mileage_km', 'fuel', 'transmission', 'body_type', 'color', 'description', 'city', 'region', 'country_code'])
const allowedActions = new Set(['pause', 'resume', 'start_analysis', 'start_sync', 'manual_verify_domain', 'set_limit', 'stop', 'link_parser_profile', 'create_parser_profile', 'upsert_mapping', 'review_item', 'unpublish_item'])

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminRoute('inventory_imports.manage')
  if ('error' in auth) return auth.error
  const { id } = await context.params
  if (!uuidPattern.test(id)) return NextResponse.json({ error: 'Ogiltigt käll-ID.' }, { status: 400 })

  let body: Record<string, unknown>
  try { body = await request.json() as Record<string, unknown> } catch { return NextResponse.json({ error: 'Ogiltig begäran.' }, { status: 400 }) }
  const action = text(body.action, 80)
  const reason = multiline(body.reason, 4000)
  if (!allowedActions.has(action)) return NextResponse.json({ error: 'Ogiltig åtgärd.' }, { status: 400 })
  if (reason.length < 8) return NextResponse.json({ error: 'Ange en beslutsgrund på minst 8 tecken.' }, { status: 400 })

  const admin = auth.adminClient
  const { data: before, error: readError } = await admin.from('dealer_import_sources').select('*').eq('id', id).maybeSingle()
  if (readError) return NextResponse.json({ error: readError.message }, { status: 400 })
  if (!before) return NextResponse.json({ error: 'Importkällan hittades inte.' }, { status: 404 })

  let parserProfileId: string | null = before.parser_profile_id || null
  let runId: string | null = null
  let targetId = id
  const metadata: Record<string, unknown> = {}
  const now = new Date().toISOString()

  try {
    if (action === 'pause') {
      await updateSource(admin, id, { sync_status: 'paused', next_sync_at: null, updated_by: auth.user.id })
    }

    if (action === 'resume') {
      const active = Boolean(before.publication_approved_at)
      await updateSource(admin, id, {
        sync_status: active ? 'active' : 'ready',
        next_sync_at: active ? new Date(Date.now() + Number(before.sync_interval_hours || 24) * 60 * 60 * 1000).toISOString() : null,
        updated_by: auth.user.id,
      })
    }

    if (action === 'start_analysis' || action === 'start_sync') {
      if (before.source_type === 'website' && before.verification_status !== 'verified') throw new Error('Domänen måste vara verifierad först.')
      if (action === 'start_sync' && !before.publication_approved_at) throw new Error('Företagets publiceringsgodkännande saknas.')
      if (action === 'start_sync' && !await isBusinessFeatureEnabled('dealer_inventory_sync', { organizationId: before.organization_id, pilotProgramId: before.pilot_program_id })) throw new Error('Synkfunktionen är avstängd för denna miljö eller pilot.')
      if (before.sync_status === 'disabled' || before.sync_status === 'deleted') throw new Error('Importen är stoppad och måste återaktiveras först.')
      const { data: run, error } = await admin.from('dealer_import_runs').insert({
        source_id: id,
        job_key: `dealer-source:${id}:admin:${crypto.randomUUID()}`,
        status: 'queued',
        trigger_type: 'admin',
        current_step: before.source_type === 'website' ? 'discover_site' : 'validate_source',
        created_by: auth.user.id,
        summary: { analysis_only: action === 'start_analysis' },
      }).select('id').single()
      if (error || !run) throw error || new Error('Körningen kunde inte köas.')
      await updateSource(admin, id, { sync_status: 'analyzing', last_started_at: now, updated_by: auth.user.id })
      runId = String(run.id)
      metadata.run_id = runId
      metadata.analysis_only = action === 'start_analysis'
    }

    if (action === 'manual_verify_domain') {
      if (before.source_type !== 'website') throw new Error('Manuell domänverifiering gäller endast webbplatskällor.')
      const domain = normalizeDomain(String(before.verified_domain || before.website_url || ''))
      if (!domain) throw new Error('Källan saknar en giltig webbplatsdomän.')
      const { error: revokeError } = await admin.from('dealer_site_verifications').update({ status: 'revoked', checked_at: now }).eq('source_id', id).eq('status', 'pending')
      if (revokeError) throw revokeError
      const { error: verificationError } = await admin.from('dealer_site_verifications').insert({
        organization_id: before.organization_id,
        source_id: id,
        method: 'manual_admin',
        status: 'verified',
        domain,
        instructions: {},
        evidence: { reason, verified_by_admin: true },
        checked_at: now,
        verified_at: now,
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        verified_by: auth.user.id,
      })
      if (verificationError) throw verificationError
      await updateSource(admin, id, { verified_domain: domain, verification_status: 'verified', last_error: null, updated_by: auth.user.id })
      metadata.domain = domain
    }

    if (action === 'set_limit') {
      const inventoryLimit = Number(body.inventoryLimit)
      if (!Number.isInteger(inventoryLimit) || inventoryLimit < 1 || inventoryLimit > 1_000_000) throw new Error('Importgränsen måste vara mellan 1 och 1 000 000.')
      await updateSource(admin, id, { inventory_limit: inventoryLimit, updated_by: auth.user.id })
      metadata.inventory_limit = inventoryLimit
    }

    if (action === 'stop') {
      await updateSource(admin, id, { sync_status: 'disabled', next_sync_at: null, updated_by: auth.user.id })
      const { error } = await admin.from('dealer_import_runs').update({ status: 'cancelled', completed_at: now, last_error_code: 'STOPPED_BY_ADMIN', last_error_message: reason }).eq('source_id', id).in('status', ['queued', 'running'])
      if (error) throw error
    }

    if (action === 'link_parser_profile') {
      const profileId = text(body.parserProfileId, 80)
      if (profileId && !uuidPattern.test(profileId)) throw new Error('Parserprofilens ID måste vara ett giltigt UUID.')
      if (profileId) {
        const { data: profile, error } = await admin.from('dealer_parser_profiles').select('id,status').eq('id', profileId).maybeSingle()
        if (error || !profile) throw error || new Error('Parserprofilen hittades inte.')
        if (profile.status === 'disabled') throw new Error('En inaktiverad parserprofil kan inte kopplas.')
      }
      parserProfileId = profileId || null
      await updateSource(admin, id, { parser_profile_id: parserProfileId, updated_by: auth.user.id })
      metadata.parser_profile_id = parserProfileId
    }

    if (action === 'create_parser_profile') {
      const profileName = text(body.profileName, 160)
      const domainPattern = normalizeDomainPattern(text(body.domainPattern, 255))
      const parserKind = text(body.parserKind, 40)
      if (profileName.length < 2) throw new Error('Ange ett namn för parserprofilen.')
      if (!domainPattern) throw new Error('Ange ett giltigt domänmönster utan protokoll eller sökväg.')
      if (!profileKinds.has(parserKind)) throw new Error('Ogiltig parsertyp.')
      const { data: profile, error } = await admin.from('dealer_parser_profiles').insert({
        name: profileName,
        domain_pattern: domainPattern,
        parser_kind: parserKind,
        status: 'draft',
        selectors: {},
        mapping: {},
        test_fixtures: [],
        created_by: auth.user.id,
        updated_by: auth.user.id,
      }).select('id').single()
      if (error || !profile) throw error || new Error('Parserprofilen kunde inte skapas.')
      parserProfileId = String(profile.id)
      await updateSource(admin, id, { parser_profile_id: parserProfileId, updated_by: auth.user.id })
      metadata.parser_profile_id = parserProfileId
      metadata.domain_pattern = domainPattern
    }

    if (action === 'upsert_mapping') {
      const externalField = text(body.externalField, 180)
      const targetField = text(body.targetField, 80)
      const transformKey = text(body.transformKey, 120)
      if (externalField.length < 1) throw new Error('Ange källfältet.')
      if (!targetFields.has(targetField)) throw new Error('Välj ett tillåtet Autorell-fält.')
      const { error } = await admin.from('dealer_source_mappings').upsert({
        organization_id: before.organization_id,
        source_id: id,
        external_field: externalField,
        target_field: targetField,
        transform_key: transformKey || null,
        transform_configuration: {},
        approved_at: now,
        approved_by: auth.user.id,
        updated_at: now,
      }, { onConflict: 'source_id,external_field,target_field' })
      if (error) throw error
      metadata.external_field = externalField
      metadata.target_field = targetField
    }

    if (action === 'review_item' || action === 'unpublish_item') {
      const itemId = text(body.itemId, 80)
      if (!uuidPattern.test(itemId)) throw new Error('Ogiltigt importobjekt.')
      const { data: item, error } = await admin.from('dealer_import_items').select('id,vehicle_id,sync_status').eq('id', itemId).eq('source_id', id).maybeSingle()
      if (error || !item) throw error || new Error('Importobjektet hittades inte.')
      targetId = itemId
      if (action === 'review_item') {
        const decision = text(body.decision, 20)
        if (!['approve', 'reject'].includes(decision)) throw new Error('Ogiltigt granskningsbeslut.')
        const { error: itemError } = await admin.from('dealer_import_items').update({ sync_status: decision === 'approve' ? 'import_pending' : 'paused', updated_at: now }).eq('id', itemId)
        if (itemError) throw itemError
        metadata.decision = decision
      } else {
        if (!item.vehicle_id) throw new Error('Importobjektet saknar en publicerad annons.')
        const { error: listingError } = await admin.from('marketplace_listings').update({ status: 'paused', import_status: 'paused', updated_at: now }).eq('id', item.vehicle_id).eq('import_source_id', id)
        if (listingError) throw listingError
        const { error: itemError } = await admin.from('dealer_import_items').update({ sync_status: 'paused', updated_at: now }).eq('id', itemId)
        if (itemError) throw itemError
        metadata.listing_id = item.vehicle_id
      }
    }

    await admin.from('dealer_import_source_events').insert({ organization_id: before.organization_id, source_id: id, actor_user_id: auth.user.id, event_type: `admin_${action}`, note: reason, metadata })
    const { data: afterSource } = await admin.from('dealer_import_sources').select('*').eq('id', id).single()
    await writeAdminAuditLog({
      adminClient: admin,
      actorUserId: auth.user.id,
      actorRole: auth.primaryRole,
      permission: 'inventory_imports.manage',
      action: `inventory_import_${action}`,
      targetType: action.includes('item') ? 'dealer_import_item' : action.includes('parser') ? 'dealer_parser_profile' : 'dealer_import_source',
      targetId,
      reason,
      beforeData: before,
      afterData: { source: afterSource, ...metadata },
    })
    if (runId) {
      after(async () => {
        try {
          await processDealerImportRun(runId!, 1)
        } catch (workerError) {
          console.error('[dealer-import] immediate admin run failed', { runId, error: workerError instanceof Error ? workerError.message : String(workerError) })
        }
      })
    }
    return NextResponse.json({ success: true, parserProfileId, runId })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Åtgärden kunde inte genomföras.'
    await writeAdminAuditLog({
      adminClient: admin,
      actorUserId: auth.user.id,
      actorRole: auth.primaryRole,
      permission: 'inventory_imports.manage',
      action: `inventory_import_${action}`,
      targetType: 'dealer_import_source',
      targetId: id,
      reason,
      beforeData: before,
      success: false,
      errorCode: 'INVENTORY_IMPORT_ACTION_FAILED',
      metadata: { message },
    })
    return NextResponse.json({ error: message }, { status: 409 })
  }
}

async function updateSource(admin: ReturnType<typeof import('@/lib/supabase/admin').createAdminClient>, id: string, patch: Record<string, unknown>) {
  const { error } = await admin.from('dealer_import_sources').update(patch).eq('id', id)
  if (error) throw error
}

function text(value: unknown, maxLength: number) { return typeof value === 'string' ? value.trim().replace(/[\r\n\t]+/g, ' ').slice(0, maxLength) : '' }
function multiline(value: unknown, maxLength: number) { return typeof value === 'string' ? value.trim().slice(0, maxLength) : '' }
function normalizeDomain(value: string) { try { const url = new URL(value.includes('://') ? value : `https://${value}`); return url.hostname.toLowerCase().replace(/\.$/, '') } catch { return '' } }
function normalizeDomainPattern(value: string) { const normalized = value.trim().toLowerCase().replace(/\.$/, ''); return /^(\*\.)?[a-z0-9](?:[a-z0-9.-]{1,251}[a-z0-9])?$/.test(normalized) && normalized.includes('.') ? normalized : '' }
