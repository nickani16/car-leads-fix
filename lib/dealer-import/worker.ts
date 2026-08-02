import 'server-only'

import crypto from 'node:crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/admin'
import { analyzeDealerWebsite, verifyDealerWebsite } from '@/lib/dealer-import/website-discovery'
import type { ParsedVehicle } from '@/lib/dealer-import/vehicle-parser'
import { loadDealerListingContext, synchronizeImportedVehicle } from '@/lib/dealer-import/listing-sync'
import { sendDealerImportEmail } from '@/lib/email/dealer-import'
import { isBusinessFeatureEnabled } from '@/lib/business-feature-flags'

type ImportRun = {
  id: string
  source_id: string
  current_step: string
  attempt_count: number
  max_attempts: number
  started_at: string | null
  summary: Record<string, unknown> | null
}

type ImportSource = {
  id: string
  organization_id: string
  pilot_program_id: string | null
  location_id: string | null
  source_type: string
  website_url: string | null
  inventory_url: string | null
  verified_domain: string | null
  verification_status: string
  sync_status: string
  sync_interval_hours: number
  inventory_limit: number
  missing_confirmation_threshold: number
  publication_approved_at: string | null
  configuration: Record<string, unknown> | null
  deleted_at: string | null
}

type ExistingItem = {
  id: string
  source_id: string
  vehicle_id: string | null
  content_hash: string | null
}

export async function processDealerImportQueue(limit = 2) {
  const admin = createAdminClient()
  const { data, error } = await admin.rpc('claim_dealer_import_runs', { p_limit: Math.max(1, Math.min(limit, 10)) })
  if (error) throw error

  const results: Array<{ runId: string; status: string; error?: string }> = []
  for (const run of (data || []) as ImportRun[]) {
    try {
      const status = await processRun(admin, run)
      results.push({ runId: run.id, status })
    } catch (runError) {
      const code = errorCode(runError)
      await failRun(admin, run, code)
      results.push({ runId: run.id, status: 'failed', error: code })
    }
  }
  return results
}

export async function processDealerImportRun(runId: string, maxBatches = 2) {
  const admin = createAdminClient()
  const results: Array<{ runId: string; status: string; error?: string }> = []
  for (let batch = 0; batch < Math.max(1, Math.min(maxBatches, 4)); batch += 1) {
    const { data, error } = await admin.rpc('claim_dealer_import_run', { p_run_id: runId })
    if (error) throw error
    const run = (data?.[0] || null) as ImportRun | null
    if (!run) break
    try {
      const status = await processRun(admin, run)
      results.push({ runId: run.id, status })
      if (status !== 'queued') break
    } catch (runError) {
      const code = errorCode(runError)
      await failRun(admin, run, code)
      results.push({ runId: run.id, status: 'failed', error: code })
      break
    }
  }
  return results
}

export async function scheduleDueDealerImportRuns(limit = 50) {
  const admin = createAdminClient()
  const now = new Date().toISOString()
  const { data, error } = await admin.from('dealer_import_sources').select('id,organization_id,pilot_program_id,source_type,next_sync_at').eq('sync_status', 'active').is('deleted_at', null).not('publication_approved_at', 'is', null).lte('next_sync_at', now).order('next_sync_at').limit(Math.max(1, Math.min(limit, 200)))
  if (error) throw error
  let queued = 0
  for (const source of data || []) {
    const enabled = await isBusinessFeatureEnabled('dealer_inventory_sync', { organizationId: source.organization_id, pilotProgramId: source.pilot_program_id })
    if (!enabled) continue
    const scheduledAt = String(source.next_sync_at || now)
    const jobKey = `dealer-source:${source.id}:scheduled:${Date.parse(scheduledAt) || scheduledAt}`
    const { error: insertError } = await admin.from('dealer_import_runs').insert({ source_id: source.id, job_key: jobKey, status: 'queued', trigger_type: 'scheduled', current_step: source.source_type === 'website' ? 'discover_site' : 'validate_source', summary: { analysis_only: false, scheduled_at: scheduledAt } })
    if (!insertError) queued += 1
    else if (insertError.code !== '23505') throw insertError
  }
  return queued
}

async function processRun(admin: SupabaseClient, run: ImportRun) {
  const { data, error } = await admin.from('dealer_import_sources').select('*').eq('id', run.source_id).maybeSingle()
  if (error) throw error
  const source = data as ImportSource | null
  if (!source || source.deleted_at || ['deleted', 'disabled'].includes(source.sync_status)) {
    await admin.from('dealer_import_runs').update({ status: 'cancelled', completed_at: new Date().toISOString(), last_error_code: 'SOURCE_NOT_AVAILABLE' }).eq('id', run.id)
    return 'cancelled'
  }

  const scope = { organizationId: source.organization_id, pilotProgramId: source.pilot_program_id }
  const analysisOnly = run.summary?.analysis_only !== false
  const importEnabled = await isBusinessFeatureEnabled('dealer_inventory_import', scope)
  const sourceEnabled = source.source_type !== 'website' || await isBusinessFeatureEnabled('dealer_website_import', scope)
  const syncEnabled = analysisOnly || await isBusinessFeatureEnabled('dealer_inventory_sync', scope)
  if (!importEnabled || !sourceEnabled || !syncEnabled) {
    await admin.from('dealer_import_runs').update({ status: 'cancelled', completed_at: new Date().toISOString(), last_error_code: 'FEATURE_DISABLED' }).eq('id', run.id)
    return 'cancelled'
  }

  if (run.current_step === 'verify_source') {
    return processVerification(admin, run, source)
  }

  if (source.source_type !== 'website') {
    await admin.from('dealer_import_runs').update({
      status: 'completed_with_warnings',
      completed_at: new Date().toISOString(),
      warning_count: 1,
      last_error_code: 'SOURCE_ADAPTER_NOT_ENABLED',
      summary: { ...(run.summary || {}), adapter_status: 'onboarding_required' },
    }).eq('id', run.id)
    await admin.from('dealer_import_sources').update({ sync_status: 'draft', last_error: 'SOURCE_ADAPTER_NOT_ENABLED' }).eq('id', source.id)
    return 'completed_with_warnings'
  }

  if (source.verification_status !== 'verified') throw new Error('SOURCE_VERIFICATION_REQUIRED')
  await admin.from('dealer_import_runs').update({ current_step: 'discover_site' }).eq('id', run.id)
  const previousSummary = run.summary || {}
  const previousDiscoveredUrls = stringArray(previousSummary.discovered_urls)
  const analysis = await analyzeDealerWebsite(source, previousDiscoveredUrls.length ? {
    discoveredUrls: previousDiscoveredUrls,
    offset: nonNegativeInteger(previousSummary.next_offset),
    sitemapFound: previousSummary.sitemap_found === true,
    sitemapCount: nonNegativeInteger(previousSummary.sitemap_count),
    batchSize: analysisOnly ? 25 : 5,
  } : { batchSize: analysisOnly ? 25 : 5 })
  if (!analysis.sourceAvailable) throw new Error(analysis.failedUrls[0]?.code || 'SOURCE_UNAVAILABLE')

  await admin.from('dealer_import_runs').update({ current_step: 'parse_listing_batch', source_available: true }).eq('id', run.id)
  let createdCount = nonNegativeInteger(previousSummary.created_count)
  let updatedCount = nonNegativeInteger(previousSummary.updated_count)
  let unchangedCount = nonNegativeInteger(previousSummary.unchanged_count)
  let warningCount = nonNegativeInteger(previousSummary.warning_count) + analysis.warnings.length
  let syncErrorCount = nonNegativeInteger(previousSummary.listing_sync_error_count)
  let listingCreatedCount = nonNegativeInteger(previousSummary.listing_created_count)
  let listingUpdatedCount = nonNegativeInteger(previousSummary.listing_updated_count)
  let imageImportedCount = nonNegativeInteger(previousSummary.image_imported_count)
  let parsedCount = nonNegativeInteger(previousSummary.parsed_count)
  const listingContext = !analysisOnly && source.publication_approved_at
    ? await loadDealerListingContext(admin, source)
    : null

  for (const parsed of analysis.parsed) {
    const result = await upsertParsedVehicle(admin, source, parsed.sourceUrl, parsed.vehicle)
    parsedCount += 1
    if (result.change === 'created') createdCount += 1
    if (result.change === 'updated') updatedCount += 1
    if (result.change === 'unchanged') unchangedCount += 1
    warningCount += parsed.vehicle.warnings.length
    if (listingContext) {
      try {
        const synced = await synchronizeImportedVehicle(admin, {
          source,
          context: listingContext,
          itemId: result.itemId,
          sourceUrl: parsed.sourceUrl,
          vehicle: parsed.vehicle,
          change: result.change,
        })
        if (synced.status === 'created') listingCreatedCount += 1
        if (synced.status === 'updated') listingUpdatedCount += 1
        imageImportedCount += synced.imagesImported
      } catch (syncError) {
        const code = errorCode(syncError)
        syncErrorCount += 1
        warningCount += 1
        await admin.from('dealer_import_items').update({ sync_status: 'import_error', warnings: [...new Set([...parsed.vehicle.warnings, code])] }).eq('id', result.itemId)
        await admin.from('dealer_import_source_events').insert({ organization_id: source.organization_id, source_id: source.id, event_type: 'listing_sync_failed', metadata: { run_id: run.id, item_id: result.itemId, source_url: parsed.sourceUrl, code } })
      }
    }
  }

  const failedUrls = [
    ...failedUrlArray(previousSummary.failed_urls),
    ...analysis.failedUrls,
  ].slice(0, 500)
  const warnings = [...new Set([
    ...stringArray(previousSummary.warnings),
    ...analysis.warnings,
  ])]
  const discoveryComplete = !analysis.hasMore && analysis.sitemapFound && failedUrls.length === 0

  if (!analysisOnly && discoveryComplete && run.started_at) {
    const { data: seenItems, error: seenItemsError } = await admin
      .from('dealer_import_items')
      .select('id')
      .eq('source_id', source.id)
      .gte('last_seen_at', run.started_at)
      .limit(1000)
    if (seenItemsError) throw seenItemsError
    const seenItemIds = (seenItems || []).map((item) => String(item.id))
    if (seenItemIds.length) await markConfirmedMissingItems(admin, source, seenItemIds)
  }

  const [{ count: importedCount }, { count: publishedCount }, { count: reviewCount }, { count: errorCount }] = await Promise.all([
    admin.from('dealer_import_items').select('id', { count: 'exact', head: true }).eq('source_id', source.id).not('sync_status', 'eq', 'deleted'),
    admin.from('dealer_import_items').select('id', { count: 'exact', head: true }).eq('source_id', source.id).eq('sync_status', 'active'),
    admin.from('dealer_import_items').select('id', { count: 'exact', head: true }).eq('source_id', source.id).eq('sync_status', 'import_review'),
    admin.from('dealer_import_items').select('id', { count: 'exact', head: true }).eq('source_id', source.id).eq('sync_status', 'import_error'),
  ])

  const now = new Date()
  const summary = {
    ...previousSummary,
    discovered_urls: analysis.discoveredUrls,
    next_offset: analysis.nextOffset,
    sitemap_found: analysis.sitemapFound,
    sitemap_count: analysis.sitemapCount,
    failed_urls: failedUrls,
    warnings,
    parsed_count: parsedCount,
    created_count: createdCount,
    updated_count: updatedCount,
    unchanged_count: unchangedCount,
    warning_count: warningCount,
    listing_created_count: listingCreatedCount,
    listing_updated_count: listingUpdatedCount,
    image_imported_count: imageImportedCount,
    listing_sync_error_count: syncErrorCount,
    publication_performed: !analysisOnly && Boolean(listingContext),
    preview_truncated: analysisOnly && analysis.hasMore,
  }

  if (analysis.hasMore && !analysisOnly) {
    await admin.from('dealer_import_sources').update({
      sync_status: 'analyzing',
      discovered_count: analysis.discoveredUrls.length,
      imported_count: importedCount || 0,
      published_count: publishedCount || 0,
      review_count: reviewCount || 0,
      error_count: errorCount || 0,
      last_error: null,
    }).eq('id', source.id)
    const { error: requeueError } = await admin.from('dealer_import_runs').update({
      status: 'queued',
      current_step: 'parse_listing_batch',
      completed_at: null,
      source_available: true,
      discovery_complete: false,
      discovered_count: analysis.discoveredUrls.length,
      parsed_count: parsedCount,
      created_count: createdCount,
      updated_count: updatedCount,
      unchanged_count: unchangedCount,
      warning_count: warningCount,
      error_count: failedUrls.length + syncErrorCount,
      summary,
    }).eq('id', run.id)
    if (requeueError) throw requeueError
    return 'queued'
  }

  const nextStatus = source.publication_approved_at ? 'active' : 'ready'
  const nextSync = source.publication_approved_at
    ? new Date(now.getTime() + source.sync_interval_hours * 60 * 60 * 1000).toISOString()
    : null
  await admin.from('dealer_import_sources').update({
    sync_status: nextStatus,
    discovered_count: analysis.discoveredUrls.length,
    imported_count: importedCount || 0,
    published_count: publishedCount || 0,
    review_count: reviewCount || 0,
    error_count: errorCount || 0,
    last_completed_at: now.toISOString(),
    last_success_at: now.toISOString(),
    next_sync_at: nextSync,
    consecutive_failures: 0,
    last_error: null,
  }).eq('id', source.id)

  const runStatus = warningCount || failedUrls.length || syncErrorCount ? 'completed_with_warnings' : 'completed'
  await admin.from('dealer_import_runs').update({
    status: runStatus,
    current_step: 'finalize_import',
    completed_at: now.toISOString(),
    source_available: true,
    discovery_complete: discoveryComplete,
    discovered_count: analysis.discoveredUrls.length,
    parsed_count: parsedCount,
    created_count: createdCount,
    updated_count: updatedCount,
    unchanged_count: unchangedCount,
    warning_count: warningCount,
    error_count: failedUrls.length + syncErrorCount,
    summary,
  }).eq('id', run.id)

  await admin.from('dealer_import_source_events').insert({
    organization_id: source.organization_id,
    source_id: source.id,
    event_type: 'analysis_completed',
    metadata: { run_id: run.id, discovered: analysis.discoveredUrls.length, parsed: parsedCount, created: createdCount, updated: updatedCount, unchanged: unchangedCount, listings_created: listingCreatedCount, listings_updated: listingUpdatedCount, images_imported: imageImportedCount, publication_performed: !analysisOnly && Boolean(listingContext) },
  })
  await sendDealerImportEmail(admin, { sourceId: source.id, runId: run.id, kind: 'analysis_completed' }).catch((emailError) => {
    console.error('[dealer-import] analysis email failed', { sourceId: source.id, runId: run.id, error: emailError instanceof Error ? emailError.message : String(emailError) })
  })
  if (!analysisOnly && listingCreatedCount > 0) {
    await sendDealerImportEmail(admin, { sourceId: source.id, runId: run.id, kind: 'first_import_completed' }).catch((emailError) => {
      console.error('[dealer-import] first import email failed', { sourceId: source.id, runId: run.id, error: emailError instanceof Error ? emailError.message : String(emailError) })
    })
  }
  return runStatus
}

async function processVerification(admin: SupabaseClient, run: ImportRun, source: ImportSource) {
  const { data: verification, error } = await admin
    .from('dealer_site_verifications')
    .select('id,method,status,domain,token_hash,expires_at')
    .eq('source_id', source.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  if (!verification) throw new Error('PENDING_VERIFICATION_NOT_FOUND')

  const now = new Date().toISOString()
  if (verification.expires_at && Date.parse(verification.expires_at) <= Date.now()) {
    await admin.from('dealer_site_verifications').update({ status: 'expired', checked_at: now }).eq('id', verification.id)
    await admin.from('dealer_import_sources').update({ verification_status: 'pending', sync_status: 'draft', last_error: 'VERIFICATION_TOKEN_EXPIRED' }).eq('id', source.id)
    await admin.from('dealer_import_runs').update({ status: 'completed_with_warnings', current_step: 'verify_source', completed_at: now, warning_count: 1, summary: { ...(run.summary || {}), verified: false, evidence: { code: 'VERIFICATION_TOKEN_EXPIRED' } } }).eq('id', run.id)
    return 'completed_with_warnings'
  }

  const result = await verifyDealerWebsite(source, verification)
  await admin.from('dealer_site_verifications').update({
    status: result.verified ? 'verified' : 'pending',
    checked_at: now,
    verified_at: result.verified ? now : null,
    evidence: result.evidence,
  }).eq('id', verification.id)
  await admin.from('dealer_import_sources').update({
    verification_status: result.verified ? 'verified' : 'pending',
    sync_status: 'draft',
    last_error: result.verified ? null : String(result.evidence.code || 'VERIFICATION_NOT_FOUND'),
  }).eq('id', source.id)
  await admin.from('dealer_import_runs').update({
    status: result.verified ? 'completed' : 'completed_with_warnings',
    current_step: 'verify_source',
    completed_at: now,
    warning_count: result.verified ? 0 : 1,
    summary: { ...(run.summary || {}), verified: result.verified, evidence: result.evidence },
  }).eq('id', run.id)
  await admin.from('dealer_import_source_events').insert({
    organization_id: source.organization_id,
    source_id: source.id,
    event_type: result.verified ? 'domain_verified' : 'domain_verification_checked',
    metadata: { run_id: run.id, method: verification.method, evidence: result.evidence },
  })
  if (result.verified) {
    await sendDealerImportEmail(admin, { sourceId: source.id, runId: run.id, kind: 'domain_verified' }).catch((emailError) => {
      console.error('[dealer-import] verification email failed', { sourceId: source.id, runId: run.id, error: emailError instanceof Error ? emailError.message : String(emailError) })
    })
  }
  return result.verified ? 'completed' : 'completed_with_warnings'
}

async function upsertParsedVehicle(admin: SupabaseClient, source: ImportSource, sourceUrl: string, vehicle: ParsedVehicle) {
  const matchFingerprint = vehicleMatchFingerprint(vehicle.normalizedPayload)
  const match = await findExistingItem(admin, source, vehicle, matchFingerprint)
  const now = new Date().toISOString()
  const syncStatus = vehicle.sourceStatus === 'sold'
    ? 'sold'
    : vehicle.parseConfidence >= 0.82 && !vehicle.warnings.some((warning) => ['MAKE_MISSING', 'MODEL_MISSING', 'PRICE_MISSING', 'LOW_PARSE_CONFIDENCE'].includes(warning))
      ? 'import_pending'
      : 'import_review'
  const common = {
    source_external_id: vehicle.sourceExternalId,
    source_url: sourceUrl,
    canonical_source_url: vehicle.canonicalUrl,
    source_status: vehicle.sourceStatus,
    sync_status: syncStatus,
    content_hash: vehicle.contentHash,
    vin_fingerprint: vehicle.vinFingerprint,
    registration_fingerprint: vehicle.registrationFingerprint,
    match_fingerprint: matchFingerprint,
    raw_payload: vehicle.rawPayload,
    normalized_payload: vehicle.normalizedPayload,
    field_confidence: vehicle.fieldConfidence,
    parse_confidence: vehicle.parseConfidence,
    warnings: vehicle.warnings,
    original_image_urls: vehicle.originalImageUrls,
    missing_confirmations: 0,
    missing_since: null,
    last_seen_at: now,
    last_synced_at: now,
  }

  if (match && match.source_id === source.id) {
    const unchanged = match.content_hash === vehicle.contentHash
    const patch: Record<string, unknown> = unchanged
      ? { source_url: sourceUrl, canonical_source_url: vehicle.canonicalUrl, source_status: vehicle.sourceStatus, missing_confirmations: 0, missing_since: null, last_seen_at: now, last_synced_at: now }
      : common
    if (unchanged && vehicle.sourceStatus === 'sold') patch.sync_status = 'sold'
    const { data, error } = await admin.from('dealer_import_items').update(patch).eq('id', match.id).select('id').single()
    if (error) throw error
    return { itemId: String(data.id), change: unchanged ? 'unchanged' as const : 'updated' as const }
  }

  const { data, error } = await admin.from('dealer_import_items').insert({
    organization_id: source.organization_id,
    source_id: source.id,
    duplicate_of_item_id: match?.id || null,
    vehicle_id: match?.vehicle_id || null,
    ...common,
  }).select('id').single()
  if (error) throw error
  return { itemId: String(data.id), change: 'created' as const }
}

async function findExistingItem(admin: SupabaseClient, source: ImportSource, vehicle: ParsedVehicle, matchFingerprint: string | null): Promise<ExistingItem | null> {
  const select = 'id,source_id,vehicle_id,content_hash'
  if (vehicle.sourceExternalId) {
    const { data } = await admin.from('dealer_import_items').select(select).eq('source_id', source.id).eq('source_external_id', vehicle.sourceExternalId).limit(1).maybeSingle()
    if (data) return data as ExistingItem
  }
  if (vehicle.vinFingerprint) {
    const { data } = await admin.from('dealer_import_items').select(select).eq('organization_id', source.organization_id).eq('vin_fingerprint', vehicle.vinFingerprint).order('created_at').limit(1).maybeSingle()
    if (data) return data as ExistingItem
  }
  if (vehicle.registrationFingerprint) {
    const { data } = await admin.from('dealer_import_items').select(select).eq('organization_id', source.organization_id).eq('registration_fingerprint', vehicle.registrationFingerprint).order('created_at').limit(1).maybeSingle()
    if (data) return data as ExistingItem
  }
  const { data: canonical } = await admin.from('dealer_import_items').select(select).eq('source_id', source.id).eq('canonical_source_url', vehicle.canonicalUrl).limit(1).maybeSingle()
  if (canonical) return canonical as ExistingItem
  if (matchFingerprint) {
    const { data } = await admin.from('dealer_import_items').select(select).eq('organization_id', source.organization_id).eq('match_fingerprint', matchFingerprint).order('created_at').limit(1).maybeSingle()
    if (data) return data as ExistingItem
  }
  return null
}

async function markConfirmedMissingItems(admin: SupabaseClient, source: ImportSource, seenItemIds: string[]) {
  const { data: missingItems } = await admin.from('dealer_import_items').select('id,vehicle_id,missing_confirmations').eq('source_id', source.id).not('id', 'in', `(${seenItemIds.join(',')})`).in('source_status', ['present', 'unknown', 'missing'])
  for (const item of missingItems || []) {
    const confirmations = Number(item.missing_confirmations || 0) + 1
    const confirmed = confirmations >= source.missing_confirmation_threshold
    await admin.from('dealer_import_items').update({
      source_status: 'missing',
      sync_status: confirmed ? 'source_missing' : 'paused',
      missing_confirmations: confirmations,
      missing_since: new Date().toISOString(),
    }).eq('id', item.id)
    if (confirmed && item.vehicle_id) {
      await admin.from('marketplace_listings').update({ import_status: 'source_missing', status: 'paused' }).eq('id', item.vehicle_id).eq('import_source_id', source.id)
    }
  }
}

async function failRun(admin: SupabaseClient, run: ImportRun, code: string) {
  const retryable = isRetryable(code) && run.attempt_count < run.max_attempts
  const delayMinutes = Math.min(12 * 60, Math.max(2, 2 ** Math.max(1, run.attempt_count)))
  const nextRetryAt = retryable ? new Date(Date.now() + delayMinutes * 60 * 1000).toISOString() : null
  await admin.from('dealer_import_runs').update({
    status: 'failed',
    completed_at: retryable ? null : new Date().toISOString(),
    next_retry_at: nextRetryAt,
    last_error_code: code,
    last_error_message: code,
    error_count: 1,
  }).eq('id', run.id)
  const { data: source } = await admin.from('dealer_import_sources').select('consecutive_failures,organization_id,last_success_at').eq('id', run.source_id).maybeSingle()
  if (source) {
    const failures = Number(source.consecutive_failures || 0) + 1
    await admin.from('dealer_import_sources').update({ sync_status: 'error', consecutive_failures: failures, last_error: code, next_sync_at: nextRetryAt }).eq('id', run.source_id)
    await admin.from('dealer_import_source_events').insert({ organization_id: source.organization_id, source_id: run.source_id, event_type: 'run_failed', metadata: { run_id: run.id, code, retryable, next_retry_at: nextRetryAt } })
    await sendDealerImportEmail(admin, { sourceId: run.source_id, runId: run.id, kind: source.last_success_at ? 'sync_problem' : 'import_failed', note: code }).catch((emailError) => {
      console.error('[dealer-import] failure email failed', { sourceId: run.source_id, runId: run.id, error: emailError instanceof Error ? emailError.message : String(emailError) })
    })
  }
}

function vehicleMatchFingerprint(payload: Record<string, unknown>) {
  const values = [payload.make, payload.model, payload.model_year, payload.price, payload.city].map((value) => String(value || '').trim().toLowerCase())
  if (!values[0] || !values[1] || !values[2]) return null
  return crypto.createHash('sha256').update(values.join('|')).digest('hex')
}

function nonNegativeInteger(value: unknown) {
  const number = Number(value)
  return Number.isInteger(number) && number >= 0 ? number : 0
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

function failedUrlArray(value: unknown) {
  if (!Array.isArray(value)) return []
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return []
    const entry = item as Record<string, unknown>
    return typeof entry.url === 'string' && typeof entry.code === 'string'
      ? [{ url: entry.url, code: entry.code }]
      : []
  })
}

function isRetryable(code: string) {
  return /TIMEOUT|ECONN|EAI_AGAIN|HTTP_429|HTTP_5\d\d|SOURCE_UNAVAILABLE|IMPORT_REQUEST_FAILED/.test(code)
}

function errorCode(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  return /^[A-Z0-9_]+$/.test(message) ? message : 'IMPORT_RUN_FAILED'
}
