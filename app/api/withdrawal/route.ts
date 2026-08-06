import { NextResponse } from 'next/server'
import { resolveEmailLocale } from '@/lib/email/localization'
import { sendWithdrawalRequestEmails } from '@/lib/email/withdrawal-request'
import { checkRateLimit, getClientIp, rateLimitJson } from '@/lib/rate-limit'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export async function POST(request: Request) {
  const limit = checkRateLimit({
    key: `withdrawal:${getClientIp(request)}`,
    limit: 4,
    windowMs: 10 * 60 * 1000,
  })
  if (limit.limited) return rateLimitJson(limit.retryAfter)

  const body = await request.json().catch(() => null) as Record<string, unknown> | null
  if (!body) return NextResponse.json({ error: 'INVALID_BODY' }, { status: 400 })
  if (String(body.website || '').trim()) {
    return NextResponse.json({ success: true, reference: 'AR-W-RECEIVED' })
  }

  const fullName = clean(body.fullName, 160)
  const email = clean(body.email, 180).toLowerCase()
  const orderReference = clean(body.orderReference, 180)
  const contractDate = clean(body.contractDate, 10)
  const message = clean(body.message, 3000)
  const sourcePath = clean(body.sourcePath, 500)
  const locale = resolveEmailLocale({ locale: clean(body.locale, 10) })

  if (!fullName || !EMAIL_PATTERN.test(email) || !orderReference || body.confirmed !== true) {
    return NextResponse.json({ error: 'MISSING_REQUIRED_FIELDS' }, { status: 400 })
  }
  if (contractDate && !DATE_PATTERN.test(contractDate)) {
    return NextResponse.json({ error: 'INVALID_CONTRACT_DATE' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const reference = createReference()
  const admin = createAdminClient()
  const { data: saved, error } = await admin
    .from('marketplace_withdrawal_requests')
    .insert({
      reference,
      user_id: user?.id || null,
      full_name: fullName,
      email,
      order_reference: orderReference,
      contract_date: contractDate || null,
      message: message || null,
      locale,
      source_path: sourcePath || null,
    })
    .select('id')
    .single()

  if (error || !saved) {
    console.error('withdrawal request insert failed', error)
    return NextResponse.json({ error: 'SAVE_FAILED' }, { status: 500 })
  }

  const delivery = await sendWithdrawalRequestEmails({
    reference,
    fullName,
    email,
    orderReference,
    contractDate: contractDate || null,
    message: message || null,
    locale,
  }).catch((deliveryError) => {
    console.error('withdrawal request email failed', deliveryError)
    return { confirmation: 'failed' as const, internal: 'failed' as const }
  })

  await admin
    .from('marketplace_withdrawal_requests')
    .update({
      confirmation_email_status: delivery.confirmation,
      internal_email_status: delivery.internal,
      updated_at: new Date().toISOString(),
    })
    .eq('id', saved.id)

  return NextResponse.json({
    success: true,
    reference,
    confirmationEmailSent: delivery.confirmation === 'sent',
  }, { status: 201 })
}

function clean(value: unknown, maxLength: number) {
  return String(value || '').trim().slice(0, maxLength)
}

function createReference() {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '')
  const suffix = crypto.randomUUID().replaceAll('-', '').slice(0, 8).toUpperCase()
  return `AR-W-${date}-${suffix}`
}
