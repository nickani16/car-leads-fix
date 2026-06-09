import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const CANONICAL_HOSTS: Record<string, string> = {
  'autorell.com': 'www.autorell.com',
  'autorell.de': 'www.autorell.de',
  'autorell.eu': 'www.autorell.eu',
  'autorell.se': 'www.autorell.se',
}

function getHostname(request: NextRequest) {
  const forwardedHost = request.headers.get('x-forwarded-host')
  const host = forwardedHost || request.headers.get('host') || ''

  return host.split(',')[0].trim().split(':')[0].toLowerCase()
}

function redirectToHost(
  request: NextRequest,
  hostname: string,
  status: 307 | 308,
) {
  const url = request.nextUrl.clone()
  url.protocol = 'https:'
  url.hostname = hostname
  url.port = ''

  return NextResponse.redirect(url, status)
}

export function proxy(request: NextRequest) {
  const hostname = getHostname(request)
  const methodCanRedirect = request.method === 'GET' || request.method === 'HEAD'

  if (methodCanRedirect && (hostname === 'autorell.eu' || hostname === 'www.autorell.eu')) {
    return redirectToHost(request, 'www.autorell.com', 308)
  }

  if (methodCanRedirect && CANONICAL_HOSTS[hostname]) {
    return redirectToHost(request, CANONICAL_HOSTS[hostname], 308)
  }

  if (request.nextUrl.pathname !== '/') {
    return NextResponse.next()
  }

  if (hostname === 'www.autorell.se') {
    return NextResponse.next()
  }

  if (hostname === 'www.autorell.de') {
    return NextResponse.rewrite(new URL('/de', request.url))
  }

  if (hostname === 'www.autorell.com') {
    const country = request.headers.get('x-vercel-ip-country')?.toUpperCase()

    if (country === 'SE') {
      return redirectToHost(request, 'www.autorell.se', 307)
    }

    if (country === 'DE') {
      return redirectToHost(request, 'www.autorell.de', 307)
    }

    return NextResponse.rewrite(new URL('/eu', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/:path*',
}
