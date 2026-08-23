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
  const isOauthFlow = requestUrl.searchParams.get('flow') === 'oauth'
  const next = requestUrl.searchParams.get('next') || '/account'
  const safeNext =
    next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/api/')
      ? next
      : '/account'
  const localePrefix = safeNext.match(/^\/(at|be|fr|es|it|pl|nl|fi|dk)(?:\/|$)/)?.[1]
  const authEntryPath = localePrefix ? `/${localePrefix}` : '/'

  const oauthFailureRedirect = (status: 'oauth-cancelled' | 'oauth-error') => {
    const destination = new URL(authEntryPath, requestUrl.origin)
    destination.searchParams.set('auth', mode)
    destination.searchParams.set('status', status)
    destination.searchParams.set('next', safeNext)
    return NextResponse.redirect(destination)
  }

  if (oauthError || oauthErrorCode) {
    return oauthFailureRedirect(
      oauthError === 'access_denied' || oauthErrorCode === 'access_denied'
        ? 'oauth-cancelled'
        : 'oauth-error',
    )
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
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        return NextResponse.redirect(new URL(safeNext, requestUrl.origin))
      }
      await supabase.auth.signOut()
    }

    if (error) {
      console.error('OAuth callback exchange failed', {
        name: error.name,
        code: error.code,
        status: error.status,
        message: error.message,
      })
    }

    return oauthFailureRedirect('oauth-error')
  }

  if (isOauthFlow) return oauthFailureRedirect('oauth-error')

  return NextResponse.redirect(
    new URL('/?auth=forgot-password&status=invalid-link', requestUrl.origin)
  )
}
