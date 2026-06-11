import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const CANONICAL_HOSTS: Record<string, string> = {
  'autorell.com': 'www.autorell.com',
  'autorell.de': 'www.autorell.de',
  'autorell.eu': 'www.autorell.eu',
  'autorell.se': 'www.autorell.se',
}

const MARKET_HOSTS = {
  sv: 'www.autorell.se',
  de: 'www.autorell.de',
  en: 'www.autorell.com',
} as const

type Market = keyof typeof MARKET_HOSTS

const DEALER_MARKET_ROUTES = {
  de: new Map([
    ['/fahrzeuge', 'vehicles'],
    ['/so-funktionierts', 'process'],
    ['/vorteile', 'benefits'],
    ['/ueber-autorell', 'about'],
    ['/faq', 'faq'],
    ['/kontakt', 'contact'],
    ['/datenschutz', 'privacy'],
    ['/nutzungsbedingungen', 'terms'],
    ['/cookies', 'cookies'],
  ]),
  en: new Map([
    ['/vehicles', 'vehicles'],
    ['/how-it-works', 'process'],
    ['/dealer-benefits', 'benefits'],
    ['/about', 'about'],
    ['/faq', 'faq'],
    ['/contact', 'contact'],
    ['/privacy', 'privacy'],
    ['/terms', 'terms'],
    ['/cookies', 'cookies'],
  ]),
} as const

const LEGACY_DEALER_PATHS = {
  de: new Map([
    ['/salj-bil', '/fahrzeuge'],
    ['/trygg-affar', '/vorteile'],
    ['/vanliga-fragor', '/faq'],
    ['/foretag', '/vorteile'],
    ['/for-handlare', '/vorteile'],
    ['/om-oss', '/ueber-autorell'],
    ['/integritet', '/datenschutz'],
    ['/villkor', '/nutzungsbedingungen'],
  ]),
  en: new Map([
    ['/salj-bil', '/vehicles'],
    ['/trygg-affar', '/dealer-benefits'],
    ['/vanliga-fragor', '/faq'],
    ['/foretag', '/dealer-benefits'],
    ['/for-handlare', '/dealer-benefits'],
    ['/om-oss', '/about'],
    ['/kontakt', '/contact'],
    ['/integritet', '/privacy'],
    ['/villkor', '/terms'],
  ]),
} as const

function getHostname(request: NextRequest) {
  const host =
    request.headers.get('host') ||
    request.headers.get('x-forwarded-host') ||
    ''

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

function redirectToMarket(request: NextRequest, market: Market) {
  const url = request.nextUrl.clone()
  url.protocol = 'https:'
  url.hostname = MARKET_HOSTS[market]
  url.port = ''
  url.searchParams.delete('market')

  const response = NextResponse.redirect(url, 307)
  response.cookies.set('autorell-market', market, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
    sameSite: 'lax',
    secure: true,
  })

  return response
}

export function proxy(request: NextRequest) {
  const hostname = getHostname(request)
  const methodCanRedirect = request.method === 'GET' || request.method === 'HEAD'
  const selectedMarket = request.nextUrl.searchParams.get('market')

  if (
    methodCanRedirect &&
    (selectedMarket === 'sv' ||
      selectedMarket === 'de' ||
      selectedMarket === 'en')
  ) {
    return redirectToMarket(request, selectedMarket)
  }

  if (methodCanRedirect && (hostname === 'autorell.eu' || hostname === 'www.autorell.eu')) {
    return redirectToHost(request, 'www.autorell.com', 308)
  }

  if (methodCanRedirect && CANONICAL_HOSTS[hostname]) {
    return redirectToHost(request, CANONICAL_HOSTS[hostname], 308)
  }

  const pathname = request.nextUrl.pathname

  if (
    methodCanRedirect &&
    (hostname === 'www.autorell.de' || hostname === 'www.autorell.com')
  ) {
    const locale = hostname === 'www.autorell.de' ? 'de' : 'en'
    const legacyTarget = LEGACY_DEALER_PATHS[locale].get(pathname)

    if (legacyTarget) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = legacyTarget
      return NextResponse.redirect(redirectUrl, 308)
    }

    const marketPage = DEALER_MARKET_ROUTES[locale].get(pathname)
    if (!marketPage) return NextResponse.next()

    const localizedUrl = request.nextUrl.clone()
    localizedUrl.pathname = `/dealer-market/${locale}/${marketPage}`
    return NextResponse.rewrite(localizedUrl)
  }

  if (pathname !== '/') {
    return NextResponse.next()
  }

  if (hostname === 'www.autorell.se') {
    return NextResponse.next()
  }

  if (hostname === 'www.autorell.de') {
    return NextResponse.rewrite(new URL('/de', request.url))
  }

  if (hostname === 'www.autorell.com') {
    const preferredMarket = request.cookies.get('autorell-market')?.value

    if (preferredMarket === 'sv' || preferredMarket === 'de') {
      return redirectToHost(request, MARKET_HOSTS[preferredMarket], 307)
    }

    if (preferredMarket === 'en') {
      return NextResponse.rewrite(new URL('/eu', request.url))
    }

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
