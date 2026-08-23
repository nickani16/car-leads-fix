import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const tokenHash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')
  const mode = requestUrl.searchParams.get('mode') === 'register' ? 'register' : 'login'
  const oauthError = requestUrl.searchParams.get('error')
  const oauthErrorCode = requestUrl.searchParams.get('error_code')
  const next = requestUrl.searchParams.get('next') || '/account'
  const safeNext =
    next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/api/')
      ? next
      : '/account'

  if (oauthError || oauthErrorCode) {
    const destination = new URL('/', requestUrl.origin)
    destination.searchParams.set('auth', mode)
    destination.searchParams.set(
      'status',
      oauthError === 'access_denied' || oauthErrorCode === 'access_denied'
        ? 'oauth-cancelled'
        : 'oauth-error',
    )
    destination.searchParams.set('next', safeNext)
    return NextResponse.redirect(destination)
  }

  const supabase = await createClient()

  if (tokenHash && type === 'recovery') {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: 'recovery',
    })

    if (!error) {
      return NextResponse.redirect(new URL(safeNext, requestUrl.origin))
    }
  }

  if (tokenHash && type === 'signup') {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: 'signup',
    })

    if (!error) {
      return NextResponse.redirect(new URL(safeNext, requestUrl.origin))
    }
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(new URL(safeNext, requestUrl.origin))
    }

    const destination = new URL('/', requestUrl.origin)
    destination.searchParams.set('auth', mode)
    destination.searchParams.set('status', 'oauth-error')
    destination.searchParams.set('next', safeNext)
    return NextResponse.redirect(destination)
  }

  return NextResponse.redirect(
    new URL('/?auth=forgot-password&status=invalid-link', requestUrl.origin)
  )
}
