import crypto from 'node:crypto'
import { NextResponse } from 'next/server'
import { getDealerImportAccess } from '@/lib/dealer-import-access'
import { isBusinessFeatureEnabled } from '@/lib/business-feature-flags'
import { normalizePublicWebsiteUrl } from '@/lib/business-pilot'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

const sourceTypes = new Set(['website', 'xml', 'csv', 'api', 'dms'])
const verificationMethods = new Set(['dns', 'html_file', 'meta_tag', 'manual_admin'])

export async function GET() {
  const access = await getDealerImportAccess()
  if (!access.allowed) return NextResponse.json({ error: access.error }, { status: access.status })
  const { data, error } = await access.admin
    .from('dealer_import_sources')
    .select('id,name,source_type,website_url,inventory_url,feed_url,verified_domain,verification_status,sync_status,sync_interval_hours,discovered_count,imported_count,published_count,review_count,error_count,last_success_at,next_sync_at,last_error')
    .eq('organization_id', access.organizationId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: 'INVENTORY_SOURCE_READ_FAILED' }, { status: 500 })
  return NextResponse.json({ sources: data || [] })
}

export async function POST(request: Request) {
  const limit = checkRateLimit({ key: `dealer-import-source:${getClientIp(request)}`, limit: 10, windowMs: 60 * 60 * 1000 })
  if (limit.limited) return NextResponse.json({ error: 'RATE_LIMITED' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } })

  const access = await getDealerImportAccess()
  if (!access.allowed) return NextResponse.json({ error: access.error }, { status: access.status })
  if (!access.canManage) return NextResponse.json({ error: 'MANAGER_ROLE_REQUIRED' }, { status: 403 })

  let body: Record<string, unknown>
  try { body = await request.json() as Record<string, unknown> } catch { return NextResponse.json({ error: 'INVALID_REQUEST' }, { status: 400 }) }

  const sourceType = singleLine(body.sourceType, 20)
  const name = singleLine(body.name, 160)
  const websiteUrl = normalizePublicWebsiteUrl(body.websiteUrl)
  const inventoryUrl = normalizePublicWebsiteUrl(body.inventoryUrl)
  const feedUrl = normalizePublicWebsiteUrl(body.feedUrl)
  const documentationUrl = normalizePublicWebsiteUrl(body.documentationUrl)
  const verificationMethod = verificationMethods.has(singleLine(body.verificationMethod, 30)) ? singleLine(body.verificationMethod, 30) : 'meta_tag'
  const syncIntervalHours = integer(body.syncIntervalHours, 24)
  const provider = singleLine(body.provider, 160)
  const technicalContact = singleLine(body.technicalContact, 240)
  const authenticationMethod = singleLine(body.authenticationMethod, 80) || 'none'

  if (!sourceTypes.has(sourceType) || name.length < 2 || syncIntervalHours < 1 || syncIntervalHours > 720) {
    return NextResponse.json({ error: 'INVALID_SOURCE_DETAILS' }, { status: 400 })
  }
  if (sourceType === 'website' && !websiteUrl) return NextResponse.json({ error: 'VALID_PUBLIC_WEBSITE_URL_REQUIRED' }, { status: 400 })
  if (sourceType === 'website' && inventoryUrl && !isSameOrSubdomain(inventoryUrl, websiteUrl!)) {
    return NextResponse.json({ error: 'INVENTORY_URL_MUST_MATCH_VERIFIED_DOMAIN' }, { status: 400 })
  }
  if (sourceType === 'xml' && !feedUrl) return NextResponse.json({ error: 'VALID_PUBLIC_FEED_URL_REQUIRED' }, { status: 400 })
  if (sourceType === 'dms' && (!provider || !technicalContact)) return NextResponse.json({ error: 'DMS_PROVIDER_AND_CONTACT_REQUIRED' }, { status: 400 })

  const flag = sourceType === 'website'
    ? 'dealer_website_import'
    : sourceType === 'xml' || sourceType === 'csv'
      ? 'dealer_feed_import'
      : sourceType === 'api'
        ? 'dealer_api_import'
        : sourceType === 'dms'
          ? 'dealer_dms_onboarding'
          : 'dealer_inventory_import'
  if (!await isBusinessFeatureEnabled(flag, { organizationId: access.organizationId, pilotProgramId: access.pilot?.id || null, marketCode: access.profile?.country_code })) {
    return NextResponse.json({ error: 'SOURCE_METHOD_NOT_ENABLED', code: 'FEATURE_DISABLED' }, { status: 409 })
  }

  const primaryUrl = websiteUrl || feedUrl
  const verifiedDomain = primaryUrl ? new URL(primaryUrl).hostname.toLowerCase() : null
  const allowedSubdomains = singleLine(body.allowedSubdomains, 1000)
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter((value) => value && verifiedDomain && (value === verifiedDomain || value.endsWith(`.${verifiedDomain}`)))
    .slice(0, 20)
  const configuration = {
    allowed_subdomains: allowedSubdomains,
    provider: provider || null,
    technical_contact: technicalContact || null,
    authentication_method: authenticationMethod,
    onboarding_only: sourceType === 'dms',
  }
  const verificationStatus = sourceType === 'csv' ? 'verified' : sourceType === 'website' ? 'pending' : 'manual_review'
  const syncStatus = 'draft'
  const { data: source, error } = await access.admin.from('dealer_import_sources').insert({
    organization_id: access.organizationId,
    pilot_program_id: access.pilot?.id || null,
    name,
    source_type: sourceType,
    website_url: websiteUrl,
    inventory_url: inventoryUrl,
    feed_url: feedUrl,
    documentation_url: documentationUrl,
    verified_domain: verifiedDomain,
    verification_status: verificationStatus,
    sync_status: syncStatus,
    sync_interval_hours: syncIntervalHours,
    inventory_limit: 500,
    configuration,
    created_by: access.user.id,
    updated_by: access.user.id,
  }).select('id,name,source_type,website_url,inventory_url,feed_url,verified_domain,verification_status,sync_status,sync_interval_hours,discovered_count,imported_count,published_count,review_count,error_count,last_success_at,next_sync_at,last_error').single()

  if (error || !source) {
    const status = error?.code === '23505' ? 409 : 400
    return NextResponse.json({ error: error?.code === '23505' ? 'SOURCE_NAME_ALREADY_EXISTS' : 'SOURCE_CREATION_FAILED' }, { status })
  }

  let verificationToken = ''
  if (sourceType === 'website' && verifiedDomain) {
    verificationToken = crypto.randomBytes(24).toString('base64url')
    const tokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex')
    const { error: verificationError } = await access.admin.from('dealer_site_verifications').insert({
      organization_id: access.organizationId,
      source_id: source.id,
      method: verificationMethod,
      status: 'pending',
      domain: verifiedDomain,
      token_hash: tokenHash,
      instructions: verificationInstructions(verificationMethod, verifiedDomain),
      expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    })
    if (verificationError) {
      await access.admin.from('dealer_import_sources').update({ sync_status: 'error', last_error: 'VERIFICATION_SETUP_FAILED' }).eq('id', source.id)
      return NextResponse.json({ error: 'VERIFICATION_SETUP_FAILED' }, { status: 500 })
    }
  }

  await access.admin.from('dealer_import_source_events').insert({
    organization_id: access.organizationId,
    source_id: source.id,
    actor_user_id: access.user.id,
    event_type: 'source_created',
    metadata: { source_type: sourceType, verification_method: verificationMethod },
  })

  if (sourceType === 'dms') {
    await access.admin.from('admin_notifications').insert({
      notification_type: 'dealer_dms_onboarding',
      title: 'Nytt DMS-onboardingärende',
      body: `${access.company.name}: ${provider}`,
      priority: 'high',
      resource_type: 'dealer_import_source',
      resource_id: source.id,
      action_url: `/admin/inventory-imports/${source.id}`,
      created_by_event: `dealer_dms_onboarding:${source.id}`,
      metadata: { organization_id: access.organizationId, technical_contact: technicalContact },
    })
  }

  return NextResponse.json({ source, verificationToken }, { status: 201 })
}

function verificationInstructions(method: string, domain: string) {
  if (method === 'dns') return { record_type: 'TXT', record_name: `_autorell-verification.${domain}` }
  if (method === 'html_file') return { path: '/.well-known/autorell-verification.txt' }
  if (method === 'meta_tag') return { name: 'autorell-site-verification' }
  return { review: 'manual_admin' }
}

function singleLine(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().replace(/[\r\n\t]+/g, ' ').slice(0, maxLength) : ''
}

function integer(value: unknown, fallback: number) {
  const number = Number(value)
  return Number.isInteger(number) ? number : fallback
}

function isSameOrSubdomain(candidateUrl: string, verifiedUrl: string) {
  const candidateHost = new URL(candidateUrl).hostname.toLowerCase()
  const verifiedHost = new URL(verifiedUrl).hostname.toLowerCase()
  return candidateHost === verifiedHost || candidateHost.endsWith(`.${verifiedHost}`)
}
