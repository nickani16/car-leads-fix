import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { euBuyerMarkets } from '@/lib/eu-buyer-markets'
import {
  isPublicLanguage,
  type PublicLanguage,
} from '@/lib/public-i18n'

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

const MARKET_BY_HOST: Record<string, Market> = {
  'www.autorell.se': 'sv',
  'www.autorell.de': 'de',
  'www.autorell.com': 'en',
}

const SEARCH_CRAWLER_PATTERN =
  /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|applebot/i
const EU_BUYER_MARKET_CODES = new Set(
  euBuyerMarkets.map((market) => market.code),
)
const GERMAN_IMPORT_GUIDE_PATH = '/ratgeber/fahrzeugimport-aus-schweden'
const PUBLIC_LANGUAGE_PAGES = new Map([
  ['find-cars', '/find-cars'],
  ['vehicles', '/dealer-market/__locale__/vehicles'],
  ['how-it-works', '/dealer-market/__locale__/process'],
  ['benefits', '/dealer-market/__locale__/benefits'],
  ['about', '/dealer-market/__locale__/about'],
  ['faq', '/dealer-market/__locale__/faq'],
  ['contact', '/dealer-market/__locale__/contact'],
  ['privacy', '/dealer-market/__locale__/privacy'],
  ['cookies', '/dealer-market/__locale__/cookies'],
  ['terms', '/dealer-market/__locale__/terms'],
  ['login', '/login'],
  ['register', '/registrera'],
])
const LANGUAGE_BY_COUNTRY: Record<string, PublicLanguage | 'sv' | 'de'> = {
  SE: 'sv',
  DE: 'de',
  AT: 'de',
  FR: 'fr',
  ES: 'es',
  IT: 'it',
  PL: 'pl',
  NL: 'nl',
  PT: 'pt',
  FI: 'fi',
  DK: 'da',
  CZ: 'cs',
  RO: 'ro',
  BG: 'bg',
  HR: 'hr',
  GR: 'el',
  CY: 'el',
  HU: 'hu',
  SK: 'sk',
  SI: 'sl',
  EE: 'et',
  LV: 'lv',
  LT: 'lt',
  IE: 'en',
  BE: 'nl',
  LU: 'fr',
  MT: 'en',
}

const LOCALIZED_CORE_ROUTES = {
  sv: new Map([
    ['/hitta-bilar', '/find-cars'],
    ['/bli-bilhandlare', '/dealer-apply'],
    ['/handlarvillkor', '/dealer-terms'],
  ]),
  de: new Map([
    ['/fahrzeuge-finden', '/find-cars'],
    ['/haendlerzugang', '/dealer-apply'],
    ['/haendlerbedingungen', '/dealer-terms'],
  ]),
} as const

const RETIRED_BUSINESS_MODEL_ROUTES = new Map([
  ['/salj-bil', '/salj-fordon'],
  ['/salj-lagerbil', '/salj-fordon'],
  ['/sell-stock', '/salj-fordon'],
  ['/fahrzeugbestand-verkaufen', '/salj-fordon'],
  ['/for-handlare', '/foretag'],
  ['/dealer-apply', '/registrera'],
  ['/bli-bilhandlare', '/registrera'],
  ['/haendlerzugang', '/registrera'],
  ['/dealer-terms', '/villkor'],
  ['/dealer-benefits', '/benefits'],
  ['/handlarvillkor', '/villkor'],
  ['/haendlerbedingungen', '/villkor'],
])

const LEGACY_CORE_ROUTES = {
  sv: new Map([
    ['/find-cars', '/hitta-bilar'],
    ['/dealer-apply', '/bli-bilhandlare'],
    ['/dealer-terms', '/handlarvillkor'],
  ]),
  de: new Map([
    ['/find-cars', '/fahrzeuge-finden'],
    ['/dealer-apply', '/haendlerzugang'],
    ['/dealer-terms', '/haendlerbedingungen'],
  ]),
} as const

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
    ['/benefits', 'benefits'],
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
    ['/for-handlare', '/vorteile'],
  ]),
  en: new Map([
    ['/salj-bil', '/vehicles'],
    ['/for-handlare', '/dealer-benefits'],
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

function isMarketSelection(value: string | null): value is string {
  return Boolean(
    value &&
      (value === 'sv' ||
        value === 'de' ||
        value === 'en' ||
        EU_BUYER_MARKET_CODES.has(value)),
  )
}

function redirectToMarket(request: NextRequest, market: string) {
  const hostname = getHostname(request)
  const isEuropeanCountry = EU_BUYER_MARKET_CODES.has(market)
  const targetHostname = isEuropeanCountry
    ? MARKET_HOSTS.en
    : MARKET_HOSTS[market as Market]
  const url = request.nextUrl.clone()
  url.protocol = 'https:'
  url.hostname = targetHostname
  url.port = ''
  url.pathname = isEuropeanCountry ? `/${market}` : '/'

  if (hostname !== targetHostname) {
    url.searchParams.set('market', market)
    return NextResponse.redirect(url, 307)
  }

  if (request.nextUrl.pathname !== url.pathname) {
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

function getPreferredMarket(request: NextRequest): string | null {
  const preferredMarket = request.cookies.get('autorell-market')?.value

  return isMarketSelection(preferredMarket || null) ? preferredMarket! : null
}

function getCountryMarket(request: NextRequest): string | null {
  const country = request.headers.get('x-vercel-ip-country')?.toUpperCase()

  if (!country) return null
  return LANGUAGE_BY_COUNTRY[country] || 'en'
}

function withLanguageCookie(response: NextResponse, language: string) {
  response.cookies.set('autorell-language', language, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
    sameSite: 'lax',
    secure: true,
  })
  return response
}

function withMarketCookie(response: NextResponse, market: string) {
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
  const selectedLanguage = request.nextUrl.searchParams.get('language')
  const pathname = request.nextUrl.pathname

  if (methodCanRedirect) {
    const retiredTarget = RETIRED_BUSINESS_MODEL_ROUTES.get(pathname)
    if (retiredTarget) {
      const url = request.nextUrl.clone()
      url.pathname = retiredTarget
      url.search = ''
      return NextResponse.redirect(url, 308)
    }
    if (
      pathname.startsWith('/dealer') ||
      pathname.startsWith('/sales') ||
      pathname.startsWith('/admin/leads') ||
      pathname.startsWith('/admin/dealers') ||
      pathname.startsWith('/admin/auctions') ||
      pathname.startsWith('/admin/deals') ||
      pathname.startsWith('/admin/contracts') ||
      pathname.startsWith('/saljarportal/')
    ) {
      const url = request.nextUrl.clone()
      url.pathname = pathname.startsWith('/admin') ? '/admin' : '/konto'
      url.search = ''
      return NextResponse.redirect(url, 308)
    }
    if (
      pathname === '/dealers' ||
      pathname.startsWith('/dealers/') ||
      pathname === '/haendler' ||
      pathname.startsWith('/haendler/') ||
      pathname.startsWith('/ratgeber/') ||
      /^\/[a-z]{2}\/(dealers|guides)\//.test(pathname)
    ) {
      const url = request.nextUrl.clone()
      url.pathname = '/marketplace/cars'
      url.search = ''
      return NextResponse.redirect(url, 308)
    }
  }

  if (methodCanRedirect && (hostname === 'autorell.eu' || hostname === 'www.autorell.eu')) {
    return redirectToHost(request, 'www.autorell.com', 308)
  }

  if (methodCanRedirect && CANONICAL_HOSTS[hostname]) {
    return redirectToHost(request, CANONICAL_HOSTS[hostname], 308)
  }

  if (
    methodCanRedirect &&
    hostname === MARKET_HOSTS.en &&
    (pathname === '/en' || pathname.startsWith('/en/'))
  ) {
    const url = request.nextUrl.clone()
    url.pathname = pathname === '/en' ? '/' : pathname.slice(3)
    return NextResponse.redirect(url, 308)
  }

  const isApplicationResource =
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname === '/manifest.webmanifest' ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    /\/[^/]+\.[^/]+$/.test(pathname)

  if (isApplicationResource) {
    return NextResponse.next()
  }

  if (methodCanRedirect && isPublicLanguage(selectedLanguage || '')) {
    const language = selectedLanguage as PublicLanguage
    const url = request.nextUrl.clone()
    url.protocol = 'https:'
    url.hostname = MARKET_HOSTS.en
    url.port = ''
    const currentSegments = pathname.split('/').filter(Boolean)
    const currentLanguage = currentSegments[0]
    const trailingPath = isPublicLanguage(currentLanguage)
      ? currentSegments.slice(1).join('/')
      : ''
    url.pathname =
      language === 'en'
        ? trailingPath
          ? `/${trailingPath}`
          : '/'
        : `/${language}${trailingPath ? `/${trailingPath}` : ''}`
    url.searchParams.delete('language')
    return withLanguageCookie(NextResponse.redirect(url, 307), language)
  }

  if (methodCanRedirect && isMarketSelection(selectedMarket)) {
    return redirectToMarket(request, selectedMarket)
  }

  const currentMarket = MARKET_BY_HOST[hostname]
  const preferredLanguage = request.cookies.get('autorell-language')?.value
  const preferredMarket = getPreferredMarket(request)
  const isSearchCrawler = SEARCH_CRAWLER_PATTERN.test(
    request.headers.get('user-agent') || '',
  )
  const countryMarket = isSearchCrawler ? null : getCountryMarket(request)
  const targetMarket =
    preferredMarket ||
    (isPublicLanguage(preferredLanguage || '') ? preferredLanguage! : null) ||
    countryMarket

  if (
    hostname === MARKET_HOSTS.en ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1'
  ) {
    const segments = pathname.split('/').filter(Boolean)
    const language = segments[0]
    const page = segments.slice(1).join('/')

    if (
      isPublicLanguage(language) &&
      (segments.length === 1 ||
        (segments.length === 2 && PUBLIC_LANGUAGE_PAGES.has(page)))
    ) {
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-autorell-language', language)
      const target =
        segments.length === 1
          ? '/eu'
          : PUBLIC_LANGUAGE_PAGES.get(page)!.replace('__locale__', language)
      const localizedUrl = request.nextUrl.clone()
      localizedUrl.pathname = target
      return withLanguageCookie(
        NextResponse.rewrite(localizedUrl, {
          request: { headers: requestHeaders },
        }),
        language,
      )
    }

    if (methodCanRedirect && pathname === '/') {
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-autorell-language', 'en')
      const localizedUrl = request.nextUrl.clone()
      localizedUrl.pathname = '/eu'
      return withLanguageCookie(
        NextResponse.rewrite(localizedUrl, {
          request: { headers: requestHeaders },
        }),
        'en',
      )
    }

    if (
      methodCanRedirect &&
      isPublicLanguage(targetMarket || '') &&
      (pathname === '/find-cars' ||
        [...PUBLIC_LANGUAGE_PAGES.keys()].some(
          (pageName) => pathname === `/${pageName}`,
        ))
    ) {
      const url = request.nextUrl.clone()
      url.pathname =
        targetMarket === 'en' ? pathname : `/${targetMarket}${pathname}`
      return NextResponse.redirect(url, 307)
    }
  }

  if (
    methodCanRedirect &&
    targetMarket &&
    EU_BUYER_MARKET_CODES.has(targetMarket) &&
    (hostname !== MARKET_HOSTS.en ||
      !pathname.startsWith(`/${targetMarket}`))
  ) {
    const url = request.nextUrl.clone()
    url.protocol = 'https:'
    url.hostname = MARKET_HOSTS.en
    url.port = ''
    url.pathname = `/${targetMarket}`
    url.search = ''
    return NextResponse.redirect(url, 307)
  }

  if (methodCanRedirect && (currentMarket === 'sv' || currentMarket === 'de')) {
    const legacyTarget = LEGACY_CORE_ROUTES[currentMarket].get(pathname)
    if (legacyTarget) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = legacyTarget
      return NextResponse.redirect(redirectUrl, 308)
    }

    const internalTarget = LOCALIZED_CORE_ROUTES[currentMarket].get(pathname)
    if (internalTarget) {
      const localizedUrl = request.nextUrl.clone()
      localizedUrl.pathname = internalTarget
      return NextResponse.rewrite(localizedUrl)
    }
  }

  if (
    methodCanRedirect &&
    pathname.startsWith('/salj-bil/') &&
    (hostname === 'www.autorell.de' || hostname === 'www.autorell.com')
  ) {
    return redirectToHost(request, MARKET_HOSTS.sv, 308)
  }

  if (
    methodCanRedirect &&
    (hostname === 'www.autorell.de' || hostname === 'www.autorell.com')
  ) {
    const locale = hostname === 'www.autorell.de' ? 'de' : 'en'
    const dealerSeoBase = locale === 'de' ? '/haendler' : '/dealers'

    if (locale === 'en') {
      const segments = pathname.split('/').filter(Boolean)
      const marketCode = segments[0]

      if (marketCode && EU_BUYER_MARKET_CODES.has(marketCode)) {
        const market = euBuyerMarkets.find(
          (item) => item.code === marketCode,
        )
        const requestHeaders = new Headers(request.headers)
        requestHeaders.set(
          'x-autorell-language',
          market?.language ?? 'en',
        )
        requestHeaders.set('x-autorell-market', marketCode)
        const isMarketHub = segments.length === 1
        const isMarketCity =
          segments.length === 3 && segments[1] === 'dealers'
        const isMarketGuide =
          segments.length === 3 &&
          segments[1] === 'guides' &&
          segments[2] === 'import-from-sweden'

        if (isMarketHub) {
          return withMarketCookie(
            withLanguageCookie(
              NextResponse.next({
                request: { headers: requestHeaders },
              }),
              market?.language ?? 'en',
            ),
            marketCode,
          )
        }

        if (isMarketCity || isMarketGuide) {
          const localizedUrl = request.nextUrl.clone()
          localizedUrl.pathname = isMarketGuide
            ? `/eu-guide/${marketCode}/${segments[2]}`
            : `/eu-buyer/${marketCode}/${segments[2]}`
          return NextResponse.rewrite(localizedUrl, {
            request: { headers: requestHeaders },
          })
        }

        return withMarketCookie(
          withLanguageCookie(
            NextResponse.next({
              request: { headers: requestHeaders },
            }),
            market?.language ?? 'en',
          ),
          marketCode,
        )
      }
    }

    if (locale === 'de' && pathname === GERMAN_IMPORT_GUIDE_PATH) {
      const localizedUrl = request.nextUrl.clone()
      localizedUrl.pathname = '/eu-guide/de/import-from-sweden'
      return NextResponse.rewrite(localizedUrl)
    }

    if (pathname === dealerSeoBase || pathname.startsWith(`${dealerSeoBase}/`)) {
      const slug = pathname === dealerSeoBase
        ? 'index'
        : pathname.slice(dealerSeoBase.length + 1)
      const localizedUrl = request.nextUrl.clone()
      localizedUrl.pathname = `/dealer-seo/${locale}/${slug}`
      return NextResponse.rewrite(localizedUrl)
    }

    const legacyTarget = LEGACY_DEALER_PATHS[locale].get(pathname)

    if (legacyTarget) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = legacyTarget
      return NextResponse.redirect(redirectUrl, 308)
    }

    const marketPage = DEALER_MARKET_ROUTES[locale].get(pathname)
    if (marketPage) {
      const localizedUrl = request.nextUrl.clone()
      localizedUrl.pathname = `/dealer-market/${locale}/${marketPage}`
      return NextResponse.rewrite(localizedUrl)
    }
  }

  if (pathname !== '/') {
    if (
      hostname === MARKET_HOSTS.en &&
      isPublicLanguage(preferredLanguage || '')
    ) {
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-autorell-language', preferredLanguage!)
      if (preferredMarket && EU_BUYER_MARKET_CODES.has(preferredMarket)) {
        requestHeaders.set('x-autorell-market', preferredMarket)
      }
      return NextResponse.next({ request: { headers: requestHeaders } })
    }
    return NextResponse.next()
  }

  if (hostname === 'www.autorell.com') {
    return NextResponse.rewrite(new URL('/eu', request.url))
  }

  if (hostname === 'www.autorell.de') {
    return NextResponse.rewrite(new URL('/de', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/:path*',
}
