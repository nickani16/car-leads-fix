import { NextResponse } from 'next/server'
import { authOrigin, localeFromRequest, localizedAuthPath } from '@/lib/auth-locale'
import { getAuthApiCopy } from '@/lib/auth-copy'
import { isStrongPassword } from '@/lib/password-policy'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { createClient } from '@/lib/supabase/server'

function safeNext(value: unknown, locale: ReturnType<typeof localeFromRequest>) {
  const next = String(value || localizedAuthPath(locale, '/register?onboarding=1'))
  if (!next.startsWith('/') || next.startsWith('//') || next.startsWith('/api/')) {
    return localizedAuthPath(locale, '/register?onboarding=1')
  }
  return next
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string
      password?: string
      confirmPassword?: string
      locale?: string
      next?: string
    }
    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')
    const confirmPassword = String(body.confirmPassword || '')
    const locale = localeFromRequest(request, body.locale)
    const copy = getAuthApiCopy(locale)

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: copy.emailRequired }, { status: 400 })
    }
    if (!isStrongPassword(password)) {
      return NextResponse.json({ error: copy.passwordRequirement }, { status: 400 })
    }
    if (password !== confirmPassword) {
      return NextResponse.json({ error: copy.passwordMismatch }, { status: 400 })
    }

    const signupLimit = checkRateLimit({
      key: `password-signup:${getClientIp(request)}:${email}`,
      limit: 5,
      windowMs: 15 * 60 * 1000,
    })
    if (signupLimit.limited) {
      return NextResponse.json(
        { error: copy.tooManyAttempts },
        { status: 429, headers: { 'Retry-After': String(signupLimit.retryAfter) } },
      )
    }

    const origin = authOrigin(request)
    const redirectTo = new URL('/auth/callback', origin)
    redirectTo.searchParams.set('next', safeNext(body.next, locale))

    const supabase = await createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo.toString(),
        data: { preferred_locale: locale },
      },
    })

    if (error) {
      return NextResponse.json(
        { error: copy.signupError },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      sessionReady: Boolean(data.session),
      destination: safeNext(body.next, locale),
    })
  } catch (error) {
    console.error('Password signup failed', error)
    return NextResponse.json(
      { error: 'The account could not be created right now.' },
      { status: 500 },
    )
  }
}
