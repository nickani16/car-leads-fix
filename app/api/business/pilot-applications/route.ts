import crypto from 'node:crypto'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  looksLikeAutomatedPilotSubmission,
  parseBusinessPilotApplication,
} from '@/lib/business-pilot'
import { isBusinessFeatureEnabled } from '@/lib/business-feature-flags'
import { sendBusinessPilotEmail } from '@/lib/email/business-pilot'
import { sendAdminNotificationEmail } from '@/lib/email/admin-notifications'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const ip = getClientIp(request)
  const rate = checkRateLimit({
    key: `business-pilot-application:${ip}`,
    limit: 5,
    windowMs: 60 * 60 * 1000,
  })
  if (rate.limited) {
    return NextResponse.json(
      { error: 'Too many applications.', code: 'RATE_LIMITED' },
      { status: 429, headers: { 'Retry-After': String(Math.max(rate.retryAfter, 1)) } },
    )
  }

  const admin = createAdminClient()
  const rateLimitKey = crypto
    .createHmac('sha256', fingerprintSecret())
    .update(`business-pilot-application:${ip}`)
    .digest('hex')
  const { data: databaseRateAllowed, error: databaseRateError } = await admin.rpc(
    'consume_business_pilot_rate_limit',
    { p_key_hash: rateLimitKey, p_limit: 5, p_window_seconds: 60 * 60 },
  )
  if (databaseRateError) {
    if (process.env.VERCEL_ENV === 'production') {
      console.error('[business-pilot] database rate limit failed', databaseRateError)
      return NextResponse.json({ error: 'Application service is unavailable.', code: 'RATE_LIMIT_UNAVAILABLE' }, { status: 503 })
    }
  } else if (databaseRateAllowed !== true) {
    return NextResponse.json(
      { error: 'Too many applications.', code: 'RATE_LIMITED' },
      { status: 429, headers: { 'Retry-After': '3600' } },
    )
  }

  const contentLength = Number(request.headers.get('content-length') || 0)
  if (contentLength > 32_768) {
    return NextResponse.json({ error: 'Invalid application.', code: 'INVALID_APPLICATION' }, { status: 413 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid application.', code: 'INVALID_APPLICATION' }, { status: 400 })
  }

  if (looksLikeAutomatedPilotSubmission(body)) {
    return NextResponse.json({ id: crypto.randomUUID(), accepted: true }, { status: 202 })
  }

  const parsed = parseBusinessPilotApplication(body, {
    ip,
    userAgent: request.headers.get('user-agent') || '',
  })
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid application.', code: parsed.code }, { status: 400 })
  }

  if (!await isBusinessFeatureEnabled('business_pilot_program', { marketCode: parsed.data.market_code })) {
    return NextResponse.json({ error: 'Pilot applications are not available.', code: 'FEATURE_DISABLED' }, { status: 404 })
  }

  try {
    const duplicateSince = new Date(Date.now() - 30 * 60 * 1000).toISOString()
    const { data: duplicate, error: duplicateError } = await admin
      .from('business_pilot_applications')
      .select('id')
      .eq('contact_email', parsed.data.contact_email)
      .gte('submitted_at', duplicateSince)
      .limit(1)
      .maybeSingle()

    if (duplicateError) throw duplicateError
    if (duplicate) {
      return NextResponse.json(
        { error: 'A recent application already exists.', code: 'DUPLICATE_APPLICATION' },
        { status: 409 },
      )
    }

    const { data: application, error: insertError } = await admin
      .from('business_pilot_applications')
      .insert(parsed.data)
      .select('id,company_name,contact_email,locale,country_code')
      .single()

    if (insertError || !application) throw insertError || new Error('Application insert returned no row.')

    const actionUrl = `/admin/business-pilots/${application.id}`
    const origin = new URL(request.url).origin
    const eventResult = await admin.from('business_pilot_application_events').insert({
      application_id: application.id,
      event_type: 'application_submitted',
      to_status: 'submitted',
      metadata: { market_code: parsed.data.market_code, integration_method: parsed.data.preferred_integration_method },
    })
    if (eventResult.error) console.error('[business-pilot] event insert failed', eventResult.error)

    const notificationResult = await admin.from('admin_notifications').insert({
      notification_type: 'business_pilot_application',
      title: 'Ny ansökan till företagspiloten',
      body: `${application.company_name} har skickat in en ansökan.`,
      priority: 'high',
      resource_type: 'business_pilot_application',
      resource_id: application.id,
      action_url: actionUrl,
      created_by_event: `business_pilot_application:${application.id}`,
      metadata: {
        country_code: parsed.data.country_code,
        inventory_size_range: parsed.data.inventory_size_range,
        integration_method: parsed.data.preferred_integration_method,
      },
    })
    if (notificationResult.error) console.error('[business-pilot] admin notification insert failed', notificationResult.error)

    const deliveries = await Promise.allSettled([
      sendBusinessPilotEmail(admin, {
        applicationId: application.id,
        kind: 'received',
        recipientEmail: application.contact_email,
        companyName: application.company_name,
        locale: application.locale,
        countryCode: application.country_code,
      }),
      sendAdminNotificationEmail({
        admin,
        notificationType: 'business_pilot_application',
        title: 'Ny ansökan till företagspiloten',
        body: `${application.company_name} (${application.country_code}) vill ansluta sitt fordonslager.`,
        actionUrl,
        origin,
      }),
    ])
    for (const delivery of deliveries) {
      if (delivery.status === 'rejected') console.error('[business-pilot] email delivery failed', delivery.reason)
    }

    return NextResponse.json({ id: application.id, accepted: true }, { status: 201 })
  } catch (error) {
    console.error('[business-pilot] application failed', error)
    return NextResponse.json(
      { error: 'Application could not be saved.', code: 'APPLICATION_FAILED' },
      { status: 503 },
    )
  }
}

function fingerprintSecret() {
  const secret = process.env.AUTORELL_FINGERPRINT_SECRET || process.env.AUTH_SECRET || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!secret) throw new Error('SERVER_FINGERPRINT_SECRET_MISSING')
  return secret
}
