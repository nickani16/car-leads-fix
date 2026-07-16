import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  codeExpiresAt,
  codeHash,
  emailHash,
  generateEmailCode,
  isValidEmail,
  normalizeEmail,
} from '@/lib/email-code-auth'
import { getAuthApiCopy } from '@/lib/auth-copy'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { localeFromRequest } from '@/lib/auth-locale'
import { authEmailHtml, getOtpEmailCopy } from '@/lib/email/auth-emails'

const requestWindow = new Map<string, number>()
const REQUEST_COOLDOWN_MS = 20_000

function clientKey(request: Request, email: string) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  return `${ip}:${email}`
}

function isRateLimited(key: string) {
  const now = Date.now()
  const previous = requestWindow.get(key)
  if (previous && now - previous < REQUEST_COOLDOWN_MS) return true
  requestWindow.set(key, now)
  return false
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; locale?: string }
    const email = normalizeEmail(body.email)
    const locale = localeFromRequest(request, body.locale)
    const copy = getAuthApiCopy(locale)

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: copy.emailRequired }, { status: 400 })
    }

    const requestLimit = checkRateLimit({
      key: `email-code-request:${getClientIp(request)}:${email}`,
      limit: 5,
      windowMs: 10 * 60 * 1000,
    })
    if (requestLimit.limited) {
      return NextResponse.json(
        { error: copy.rateLimited },
        {
          status: 429,
          headers: { 'Retry-After': String(requestLimit.retryAfter) },
        },
      )
    }

    if (isRateLimited(clientKey(request, email))) {
      return NextResponse.json({ error: copy.waitBeforeNewCode }, { status: 429 })
    }

    const resendKey = process.env.RESEND_API_KEY
    if (!resendKey) {
      return NextResponse.json({ error: copy.emailUnavailable }, { status: 503 })
    }

    const admin = createAdminClient()
    const hashedEmail = emailHash(email)
    const since = new Date(Date.now() - REQUEST_COOLDOWN_MS).toISOString()
    const { count } = await admin
      .from('auth_email_codes')
      .select('id', { count: 'exact', head: true })
      .eq('email_hash', hashedEmail)
      .gte('created_at', since)
    if (count) {
      return NextResponse.json({ error: copy.waitBeforeNewCode }, { status: 429 })
    }

    const code = generateEmailCode()
    const { error: insertError } = await admin.from('auth_email_codes').insert({
      email,
      email_hash: hashedEmail,
      code_hash: codeHash(email, code),
      expires_at: codeExpiresAt(),
    })
    if (insertError) throw insertError

    const emailCopy = getOtpEmailCopy(locale, code)
    const resend = new Resend(resendKey)
    const { error: sendError } = await resend.emails.send({
      from: 'Autorell <noreply@autorell.com>',
      to: email,
      subject: emailCopy.subject,
      text: [
        emailCopy.heading,
        '',
        code,
        '',
        emailCopy.intro,
        emailCopy.expiry,
        emailCopy.ignore,
        '',
        'Autorell marketplace',
      ].join('\n'),
      html: authEmailHtml(emailCopy, undefined, code),
    })
    if (sendError) throw sendError

    return NextResponse.json({ success: true, retryAfter: 20 })
  } catch (error) {
    console.error('Email code request failed', error)
    return NextResponse.json(
      { error: 'The code could not be sent. Try again in a moment.' },
      { status: 500 },
    )
  }
}
