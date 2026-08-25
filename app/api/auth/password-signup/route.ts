import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { authOrigin, localeFromRequest, localizedAuthPath } from '@/lib/auth-locale'
import { getAuthApiCopy } from '@/lib/auth-copy'
import { authEmailHtml, getSignupConfirmationEmailCopy } from '@/lib/email/auth-emails'
import { isStrongPassword } from '@/lib/password-policy'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { createAdminClient } from '@/lib/supabase/admin'

function safeNext(value: unknown, locale: ReturnType<typeof localeFromRequest>) {
  const next = String(value || localizedAuthPath(locale, '/account'))
  if (!next.startsWith('/') || next.startsWith('//') || next.startsWith('/api/')) {
    return localizedAuthPath(locale, '/account')
  }
  return next
}

export async function POST(request: Request) {
  let locale = localeFromRequest(request)
  try {
    const body = (await request.json()) as {
      email?: string
      password?: string
      confirmPassword?: string
      locale?: string
      next?: string
      accountType?: string
      companyName?: string
      registrationNumber?: string
    }
    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')
    const confirmPassword = String(body.confirmPassword || '')
    const accountType = body.accountType === 'business' ? 'business' : 'private'
    const companyName = String(body.companyName || '').trim()
    const registrationNumber = String(body.registrationNumber || '').trim()
    locale = localeFromRequest(request, body.locale)
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
    if (accountType === 'business' && (!companyName || !registrationNumber)) {
      return NextResponse.json({ error: copy.signupError }, { status: 400 })
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
    const destination = safeNext(body.next, locale)
    const resendKey = process.env.RESEND_API_KEY
    if (!resendKey) {
      return NextResponse.json({ error: copy.emailUnavailable }, { status: 503 })
    }

    const admin = createAdminClient()
    const link = await admin.auth.admin.generateLink({
      type: 'signup',
      email,
      password,
      options: {
        data: {
          preferred_locale: locale,
          autorell_account_type: accountType,
          autorell_company_name: accountType === 'business' ? companyName : '',
          autorell_registration_number: accountType === 'business' ? registrationNumber : '',
        },
      },
    })

    if (link.error) {
      const reason = `${link.error.code || ''} ${link.error.message || ''}`.toLowerCase()
      if (reason.includes('already') || reason.includes('exists') || reason.includes('registered')) {
        return NextResponse.json(
          { code: 'auth_account_exists', accountExists: true, error: copy.accountAlreadyExists },
          { status: 409 },
        )
      }
      return NextResponse.json(
        { error: copy.signupError },
        { status: 400 },
      )
    }
    if (!link.data.properties?.hashed_token) {
      return NextResponse.json({ error: copy.signupError }, { status: 400 })
    }

    const confirmationUrl = new URL('/auth/callback', origin)
    confirmationUrl.searchParams.set('token_hash', link.data.properties.hashed_token)
    confirmationUrl.searchParams.set('type', 'signup')
    confirmationUrl.searchParams.set('next', destination)
    const confirmationCopy = getSignupConfirmationEmailCopy(locale)
    const { error: sendError } = await new Resend(resendKey).emails.send({
      from: 'Autorell <noreply@autorell.com>',
      to: email,
      subject: confirmationCopy.subject,
      text: [
        confirmationCopy.heading,
        '',
        confirmationCopy.intro,
        `${confirmationCopy.cta}: ${confirmationUrl.toString()}`,
        '',
        confirmationCopy.expiry,
        confirmationCopy.ignore,
        '',
        'Autorell marketplace',
      ].join('\n'),
      html: authEmailHtml(confirmationCopy, {
        href: confirmationUrl.toString(),
        label: confirmationCopy.cta,
      }),
    })
    if (sendError) {
      const generatedUser = link.data.user
      if (generatedUser?.id && !generatedUser.email_confirmed_at) {
        const { error: cleanupError } = await admin.auth.admin.deleteUser(generatedUser.id)
        if (cleanupError) {
          console.error('Password signup cleanup failed', cleanupError)
        }
      }
      throw sendError
    }

    return NextResponse.json({
      success: true,
      sessionReady: false,
      destination,
    })
  } catch (error) {
    console.error('Password signup failed', error)
    return NextResponse.json(
      { error: getAuthApiCopy(locale).signupError },
      { status: 500 },
    )
  }
}
