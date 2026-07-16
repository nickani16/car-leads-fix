import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { authOrigin, localeFromRequest, localizedAuthPath } from '@/lib/auth-locale'
import { authEmailHtml, getPasswordResetEmailCopy } from '@/lib/email/auth-emails'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { createAdminClient } from '@/lib/supabase/admin'

const requestWindow = new Map<string, number>()
const REQUEST_COOLDOWN_MS = 60_000

function getClientKey(request: Request, email: string) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'

  return `${ip}:${email}`
}

function isRateLimited(key: string) {
  const now = Date.now()
  const previousRequest = requestWindow.get(key)

  if (requestWindow.size > 500) {
    for (const [storedKey, requestedAt] of requestWindow) {
      if (now - requestedAt >= REQUEST_COOLDOWN_MS) requestWindow.delete(storedKey)
    }
  }

  if (previousRequest && now - previousRequest < REQUEST_COOLDOWN_MS) return true
  requestWindow.set(key, now)
  return false
}

export async function POST(request: Request) {
  const genericResponse = NextResponse.json({ success: true })

  try {
    const body = (await request.json()) as { email?: string; locale?: string }
    const email = body.email?.trim().toLowerCase() || ''
    const locale = localeFromRequest(request, body.locale)

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
    }

    const recoveryLimit = checkRateLimit({
      key: `password-recovery:${getClientIp(request)}:${email}`,
      limit: 5,
      windowMs: 15 * 60 * 1000,
    })
    if (recoveryLimit.limited || isRateLimited(getClientKey(request, email))) {
      return genericResponse
    }

    const resendKey = process.env.RESEND_API_KEY
    if (!resendKey) {
      console.error('Password recovery email is missing RESEND_API_KEY.')
      return NextResponse.json(
        { error: 'Password recovery is temporarily unavailable.' },
        { status: 503 },
      )
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email,
    })
    const tokenHash = data.properties?.hashed_token
    if (error || !tokenHash) return genericResponse

    const origin = authOrigin(request)
    const recoveryUrl = new URL('/auth/callback', origin)
    recoveryUrl.searchParams.set('token_hash', tokenHash)
    recoveryUrl.searchParams.set('type', 'recovery')
    recoveryUrl.searchParams.set('next', localizedAuthPath(locale, '/reset-password'))

    const copy = getPasswordResetEmailCopy(locale)
    const recoveryLink = recoveryUrl.toString()
    const resend = new Resend(resendKey)
    const { error: sendError } = await resend.emails.send({
      from: 'Autorell <noreply@autorell.com>',
      to: email,
      subject: copy.subject,
      text: [
        copy.heading,
        '',
        copy.intro,
        `${copy.cta}: ${recoveryLink}`,
        '',
        copy.expiry,
        copy.ignore,
        '',
        'Autorell marketplace',
      ].join('\n'),
      html: authEmailHtml(copy, { href: recoveryLink, label: copy.cta }),
    })

    if (sendError) {
      console.error('Password recovery Resend error:', sendError)
      return genericResponse
    }

    return genericResponse
  } catch (error) {
    console.error('Password recovery route error:', error)
    return NextResponse.json(
      { error: 'Password recovery is temporarily unavailable.' },
      { status: 500 },
    )
  }
}
