import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { euBuyerMarkets } from '@/lib/eu-buyer-markets'
import {
  isPublicLanguage,
  type PublicLanguage,
} from '@/lib/public-i18n'
import { isSeoVehiclePath } from '@/lib/seo-routes'

const CANONICAL_HOSTS: Record<string, string> = {
  'autorell.com': 'www.autorell.com',
  'autorell.de': 'www.autorell.com',
  'www.autorell.de': 'www.autorell.com',
  'autorell.eu': 'www.autorell.com',
  'www.autorell.eu': 'www.autorell.com',
  'autorell.se': 'www.autorell.com',
  'www.autorell.se': 'www.autorell.com',
}

const CANONICAL_MARKET_PATHS: Record<string, string> = {
  'autorell.de': '/de',
  'www.autorell.de': '/de',
  'autorell.se': '/se',
  'www.autorell.se': '/se',
}

const MARKET_HOSTS = {
  sv: 'www.autorell.com',
  de: 'www.autorell.com',
  en: 'www.autorell.com',
} as const

type Market = keyof typeof MARKET_HOSTS

const MARKET_BY_HOST: Record<string, Market> = {
  'www.autorell.com': 'en',
}

const SEARCH_CRAWLER_PATTERN =
  /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|applebot/i
const EU_BUYER_MARKET_CODES = new Set(
  euBuyerMarkets.map((market) => market.code),
)
const LOCALIZED_PUBLIC_ALIASES = new Map([
  ['cookie-policy', 'cookies'],
  ['privacy', 'privacy'],
  ['privacy-policy', 'privacy'],
  ['integritet', 'privacy'],
  ['datenschutz', 'privacy'],
  ['terms-and-conditions', 'terms'],
  ['terms', 'terms'],
  ['nutzungsbedingungen', 'terms'],
  ['villkor', 'terms'],
  ['refund-policy', 'refund-policy'],
  ['aterbetalningspolicy', 'refund-policy'],
  ['report', 'report'],
  ['rapportera', 'report'],
  ['contact', 'contact'],
  ['kontakt', 'contact'],
  ['help-center', 'help-center'],
  ['help-centre', 'help-center'],
  ['hjalpcenter', 'help-center'],
  ['hilfe', 'help-center'],
  ['faq', 'vanliga-fragor'],
  ['vanliga-fragor', 'vanliga-fragor'],
  ['register', 'register'],
  ['registrera', 'register'],
  ['salj-fordon', 'sell-vehicle'],
  ['foretag', 'business'],
  ['om-oss', 'about'],
  ['trygg-affar', 'buying-guide'],
  ['sparade', 'saved'],
  ['saved', 'saved'],
  ['sell-vehicle', 'sell-vehicle'],
  ['how-selling-works', 'how-selling-works'],
  ['pricing', 'pricing'],
  ['business', 'business'],
  ['dealer-solutions', 'dealer-solutions'],
  ['saved-searches', 'saved-searches'],
  ['compare-vehicles', 'compare-vehicles'],
  ['vehicle-history', 'vehicle-history'],
  ['buying-guide', 'buying-guide'],
  ['careers', 'careers'],
  ['press', 'press'],
  ['partners', 'partners'],
  ['safety-tips', 'safety-tips'],
  ['payments', 'payments'],
  ['shipping-delivery', 'shipping-delivery'],
  ['annons', 'annons'],
  ['anzeige', 'annons'],
  ['anuncio', 'annons'],
  ['annonce', 'annons'],
  ['annuncio', 'annons'],
  ['advertentie', 'annons'],
  ['ogloszenie', 'annons'],
  ['ilmoitus', 'annons'],
])
const LOCALIZED_AD_SEGMENTS = new Set([
  'annons',
  'anzeige',
  'anuncio',
  'annonce',
  'annuncio',
  'advertentie',
  'ogloszenie',
  'ilmoitus',
])
const CANONICAL_LOCALIZED_SLUGS = new Map([
  ['kontakt', 'contact'],
  ['hjalpcenter', 'help-center'],
  ['integritet', 'privacy'],
  ['villkor', 'terms'],
  ['aterbetalningspolicy', 'refund-policy'],
  ['rapportera', 'report'],
  ['salj-fordon', 'sell-vehicle'],
  ['foretag', 'business'],
  ['om-oss', 'about'],
  ['trygg-affar', 'buying-guide'],
  ['sparade', 'saved'],
])
const PUBLIC_LANGUAGE_PAGES = new Map([
  ['find-cars', '/find-cars'],
  ['vehicles', '/dealer-market/__locale__/vehicles'],
  ['how-it-works', '/dealer-market/__locale__/process'],
  ['benefits', '/dealer-market/__locale__/benefits'],
  ['about', '/about'],
  ['faq', '/dealer-market/__locale__/faq'],
  ['contact', '/contact'],
  ['privacy', '/privacy'],
  ['cookies', '/cookies'],
  ['terms', '/terms'],
  ['refund-policy', '/refund-policy'],
  ['help-center', '/help-center'],
  ['report', '/report'],
  ['sell-vehicle', '/sell-vehicle'],
  ['how-selling-works', '/how-selling-works'],
  ['pricing', '/pricing'],
  ['business', '/business'],
  ['dealer-solutions', '/dealer-solutions'],
  ['saved-searches', '/saved-searches'],
  ['compare-vehicles', '/compare-vehicles'],
  ['vehicle-history', '/vehicle-history'],
  ['buying-guide', '/buying-guide'],
  ['careers', '/careers'],
  ['press', '/press'],
  ['partners', '/partners'],
  ['safety-tips', '/safety-tips'],
  ['payments', '/payments'],
  ['shipping-delivery', '/shipping-delivery'],
  ['login', '/login'],
  ['register', '/register'],
])

const RETIRED_CATEGORY_ROUTES = new Map([
  ['/cars', '/marketplace/cars'],
  ['/car', '/marketplace/cars'],
  ['/vans', '/marketplace/vans'],
  ['/van', '/marketplace/vans'],
  ['/trucks', '/marketplace/trucks'],
  ['/truck', '/marketplace/trucks'],
  ['/motorcycles', '/marketplace/motorcycles'],
  ['/motorcycle', '/marketplace/motorcycles'],
  ['/bikes', '/marketplace/motorcycles'],
  ['/motorhomes', '/marketplace/motorhomes'],
  ['/motorhome', '/marketplace/motorhomes'],
  ['/caravans', '/marketplace/caravans'],
  ['/caravan', '/marketplace/caravans'],
  ['/farm', '/marketplace/agriculture'],
  ['/agriculture', '/marketplace/agriculture'],
  ['/plant', '/marketplace/construction'],
  ['/construction', '/marketplace/construction'],
  ['/electric-bikes', '/marketplace/electric-bikes'],
  ['/e-bikes', '/marketplace/electric-bikes'],
  ['/e-scooters', '/marketplace/e-scooters'],
  ['/electric-scooters', '/marketplace/e-scooters'],
])

const LANGUAGE_BY_COUNTRY: Record<string, PublicLanguage | 'sv' | 'de'> = {
  SE: 'sv',
  DE: 'de',
  AT: 'at',
  FR: 'fr',
  ES: 'es',
  IT: 'it',
  PL: 'pl',
  NL: 'nl',
  FI: 'fi',
  DK: 'da',
  BE: 'be',
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
  ['/salj-bil', '/sell-vehicle'],
  ['/salj-lagerbil', '/sell-vehicle'],
  ['/salj-fordon', '/sell-vehicle'],
  ['/sell-stock', '/sell-vehicle'],
  ['/fahrzeugbestand-verkaufen', '/sell-vehicle'],
  ['/for-handlare', '/business'],
  ['/foretag', '/business'],
  ['/om-oss', '/about'],
  ['/trygg-affar', '/buying-guide'],
  ['/kontakt', '/contact'],
  ['/hjalpcenter', '/help-center'],
  ['/rapportera', '/report'],
  ['/villkor', '/terms'],
  ['/integritet', '/privacy'],
  ['/aterbetalningspolicy', '/refund-policy'],
  ['/dealer-apply', '/register'],
  ['/bli-bilhandlare', '/register'],
  ['/haendlerzugang', '/register'],
  ['/dealer-terms', '/terms'],
  ['/dealer-benefits', '/benefits'],
  ['/handlarvillkor', '/terms'],
  ['/haendlerbedingungen', '/terms'],
])

const LEGACY_ACCOUNT_ROUTES = new Map([
  ['/konto', '/account'],
  ['/konto/annonser', '/account/listings'],
  ['/konto/annonser/ny', '/account/listings/new'],
  ['/konto/meddelanden', '/account/messages'],
  ['/konto/betalningar', '/account/payments'],
])

function getLegacyAccountTarget(pathname: string) {
  const directTarget = LEGACY_ACCOUNT_ROUTES.get(pathname)
  if (directTarget) return directTarget

  const withoutMarketPrefix = `/${pathname
    .split('/')
    .filter(Boolean)
    .slice(1)
    .join('/')}`
  const prefixedTarget = LEGACY_ACCOUNT_ROUTES.get(withoutMarketPrefix)
  if (prefixedTarget) return prefixedTarget

  const editMatch = pathname.match(
    /^(?:\/(se|de|[a-z]{2}))?\/(?:konto\/annonser|account\/listings)\/([^/]+)\/(?:redigera|edit)\/?$/,
  )

  if (editMatch?.[2]) {
    return `/account/listings/${editMatch[2]}/edit`
  }

  return null
}

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
  ]),
  en: new Map([
    ['/vehicles', 'vehicles'],
    ['/how-it-works', 'process'],
    ['/benefits', 'benefits'],
    ['/about', 'about'],
    ['/faq', 'faq'],
    ['/contact', 'contact'],
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
  pathname?: string,
) {
  const url = request.nextUrl.clone()
  url.protocol = 'https:'
  url.hostname = hostname
  url.port = ''
  if (pathname) {
    url.pathname = pathname
  }

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
  const isLocalizedMarket =
    market === 'sv' || market === 'de' || EU_BUYER_MARKET_CODES.has(market)
  const targetHostname = MARKET_HOSTS.en
  const url = request.nextUrl.clone()
  url.protocol = 'https:'
  url.hostname = targetHostname
  url.port = ''
  url.pathname = isLocalizedMarket ? `/${market === 'sv' ? 'se' : market}` : '/'

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
    return market === 'en' ? withLanguageCookie(response, 'en') : response
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

  return market === 'en' ? withLanguageCookie(response, 'en') : response
}

function getPreferredMarket(request: NextRequest): string | null {
  const preferredMarket = request.cookies.get('autorell-market')?.value

  return isMarketSelection(preferredMarket || null) ? preferredMarket! : null
}

function getCountryMarket(request: NextRequest): string | null {
  const country = request.headers.get('x-vercel-ip-country')?.toUpperCase()

  if (!country) return null
  if (country === 'SE') return 'sv'
  if (country === 'DE') return 'de'
  const euMarketCode = country.toLowerCase()
  if (EU_BUYER_MARKET_CODES.has(euMarketCode)) return euMarketCode
  return LANGUAGE_BY_COUNTRY[country] || 'en'
}

function getLocaleFromPathMarket(marketCode: string): {
  language: string
  market: string
  marketHeader: string
} | null {
  if (marketCode === 'se') {
    return { language: 'sv', market: 'sv', marketHeader: 'SE' }
  }
  if (marketCode === 'de') {
    return { language: 'de', market: 'de', marketHeader: 'DE' }
  }
  const market = euBuyerMarkets.find((item) => item.code === marketCode)
  if (!market) return null
  return {
    language: market.language,
    market: market.code,
    marketHeader: market.code.toUpperCase(),
  }
}

function internalPathFromLocalizedSegments(segments: string[]) {
  if (segments.length === 0) return null
  const normalized = segments.map((segment, index) =>
    index === 0 ? LOCALIZED_PUBLIC_ALIASES.get(segment) || segment : segment,
  )
  return `/${normalized.join('/')}`
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

export async function proxy(request: NextRequest) {
  const hostname = getHostname(request)
  const methodCanRedirect = request.method === 'GET' || request.method === 'HEAD'
  const selectedMarket = request.nextUrl.searchParams.get('market')
  const selectedLanguage = request.nextUrl.searchParams.get('language')
  const pathname = request.nextUrl.pathname

  if (methodCanRedirect) {
    const goneListingResponse = await responseForPermanentlyRemovedListing(request)
    if (goneListingResponse) return goneListingResponse

    const retiredCategoryTarget = RETIRED_CATEGORY_ROUTES.get(pathname)
    if (retiredCategoryTarget) {
      const url = request.nextUrl.clone()
      url.pathname = retiredCategoryTarget
      url.search = ''
      return NextResponse.redirect(url, 308)
    }

    const legacyAccountTarget = getLegacyAccountTarget(pathname)
    if (
      legacyAccountTarget &&
      (pathname.startsWith('/konto') ||
        pathname.startsWith('/account') ||
        /^\/(se|de|[a-z]{2})\/(?:konto|account)(\/|$)/.test(pathname))
    ) {
      const segments = pathname.split('/').filter(Boolean)
      const hasMarketPrefix = segments[0] !== 'konto' && segments[0] !== 'account'
      const marketPrefix = hasMarketPrefix ? `/${segments[0]}` : ''
      const url = request.nextUrl.clone()
      url.pathname = `${marketPrefix}${legacyAccountTarget}`
      if (url.pathname !== pathname) {
        return NextResponse.redirect(url, 308)
      }
    }

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
      url.pathname = pathname.startsWith('/admin') ? '/admin' : '/account'
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
    const marketPath = CANONICAL_MARKET_PATHS[hostname]
    const shouldUseMarketPath = marketPath && (pathname === '/' || pathname === '')
    return redirectToHost(
      request,
      CANONICAL_HOSTS[hostname],
      308,
      shouldUseMarketPath ? marketPath : undefined,
    )
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

  if (
    hostname === MARKET_HOSTS.en ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1'
  ) {
    const segments = pathname.split('/').filter(Boolean)
    const pathMarket = segments[0]
    const localeContext = pathMarket
      ? getLocaleFromPathMarket(pathMarket)
      : null

    if (localeContext) {
      const retiredLocalizedCategoryTarget = segments[1]
        ? RETIRED_CATEGORY_ROUTES.get(`/${segments[1]}`)
        : null
      if (methodCanRedirect && retiredLocalizedCategoryTarget) {
        const url = request.nextUrl.clone()
        url.pathname = `/${pathMarket}${retiredLocalizedCategoryTarget}`
        url.search = ''
        return NextResponse.redirect(url, 308)
      }

      const canonicalSlug = segments[1]
        ? CANONICAL_LOCALIZED_SLUGS.get(segments[1])
        : null
      if (methodCanRedirect && canonicalSlug) {
        const url = request.nextUrl.clone()
        url.pathname = `/${pathMarket}/${[
          canonicalSlug,
          ...segments.slice(2),
        ].join('/')}`
        return NextResponse.redirect(url, 308)
      }

      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-autorell-language', localeContext.language)
      requestHeaders.set('x-autorell-market', localeContext.marketHeader)
      requestHeaders.set('x-autorell-pathname', pathname)

      // Vehicle news owns market-prefixed App Router routes because its CMS
      // queries and canonical URLs are market-specific. Do not strip the
      // market segment through the legacy localized-page rewrite below.
      if (segments[1] === 'vehicle-news' || segments[1] === 'fordonsnyheter') {
        return withMarketCookie(
          withLanguageCookie(
            NextResponse.next({ request: { headers: requestHeaders } }),
            localeContext.language,
          ),
          localeContext.market,
        )
      }

      if (isSeoVehiclePath(pathMarket, segments.slice(1))) {
        const seoUrl = request.nextUrl.clone()
        seoUrl.pathname = `/seo/${pathMarket}/${segments.slice(1).join('/')}`
        requestHeaders.set('x-autorell-internal-seo', '1')
        return withMarketCookie(
          withLanguageCookie(
            NextResponse.rewrite(seoUrl, {
              request: { headers: requestHeaders },
            }),
            localeContext.language,
          ),
          localeContext.market,
        )
      }

      if (segments.length === 1) {
        return withMarketCookie(
          withLanguageCookie(
            NextResponse.next({ request: { headers: requestHeaders } }),
            localeContext.language,
          ),
          localeContext.market,
        )
      }

      const localizedUrl = request.nextUrl.clone()
      localizedUrl.pathname = internalPathFromLocalizedSegments(
        segments.slice(1),
      ) || '/'

      return withMarketCookie(
        withLanguageCookie(
          NextResponse.rewrite(localizedUrl, {
            request: { headers: requestHeaders },
          }),
          localeContext.language,
        ),
        localeContext.market,
      )
    }
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
  const isAccountRoute =
    pathname === '/account' ||
    pathname.startsWith('/account/') ||
    /^\/(se|de|[a-z]{2})\/account(\/|$)/.test(pathname)
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/')

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
      !EU_BUYER_MARKET_CODES.has(language) &&
      (segments.length === 1 ||
        (segments.length === 2 && PUBLIC_LANGUAGE_PAGES.has(page)))
    ) {
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-autorell-language', language)
      requestHeaders.set('x-autorell-pathname', pathname)
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
      if (targetMarket === 'sv') {
        const url = request.nextUrl.clone()
        url.protocol = 'https:'
        url.hostname = MARKET_HOSTS.en
        url.port = ''
        url.pathname = '/se'
        return withMarketCookie(
          withLanguageCookie(NextResponse.redirect(url, 307), 'sv'),
          'sv',
        )
      }
      if (targetMarket === 'de') {
        const url = request.nextUrl.clone()
        url.protocol = 'https:'
        url.hostname = MARKET_HOSTS.en
        url.port = ''
        url.pathname = '/de'
        return withMarketCookie(
          withLanguageCookie(NextResponse.redirect(url, 307), 'de'),
          'de',
        )
      }
      if (targetMarket && EU_BUYER_MARKET_CODES.has(targetMarket)) {
        const url = request.nextUrl.clone()
        url.pathname = `/${targetMarket}`
        const market = euBuyerMarkets.find((item) => item.code === targetMarket)
        return withMarketCookie(
          withLanguageCookie(
            NextResponse.redirect(url, 307),
            market?.language || 'en',
          ),
          targetMarket,
        )
      }
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-autorell-language', 'en')
      requestHeaders.set('x-autorell-pathname', pathname)
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
      targetMarket !== 'en' &&
      (pathname === '/find-cars' ||
        [...PUBLIC_LANGUAGE_PAGES.keys()].some(
          (pageName) => pathname === `/${pageName}`,
        ))
    ) {
      const url = request.nextUrl.clone()
      const marketPrefix = targetMarket === 'sv' ? 'se' : targetMarket
      url.pathname = `/${marketPrefix}${pathname}`
      return NextResponse.redirect(url, 307)
    }
  }

  if (
    methodCanRedirect &&
    targetMarket &&
    EU_BUYER_MARKET_CODES.has(targetMarket) &&
    !isAccountRoute &&
    !isAdminRoute &&
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
    hostname === 'www.autorell.com'
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/se'
    return NextResponse.redirect(url, 308)
  }

  if (
    methodCanRedirect &&
    hostname === 'www.autorell.com'
  ) {
    const locale = 'en'
    const dealerSeoBase = '/dealers'

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
        requestHeaders.set('x-autorell-pathname', pathname)
        const isMarketHub = segments.length === 1
        const isMarketCity =
          segments.length === 3 && segments[1] === 'dealers'
        const isMarketGuide =
          segments.length === 3 &&
          segments[1] === 'guides' &&
          segments[2] === 'import-from-sweden'

        if (isMarketHub) {
          const marketLanguage = market?.language ?? 'en'
          if (
            request.cookies.get('autorell-market')?.value !== marketCode ||
            request.cookies.get('autorell-language')?.value !== marketLanguage
          ) {
            return withMarketCookie(
              withLanguageCookie(
                NextResponse.redirect(request.nextUrl, 307),
                marketLanguage,
              ),
              marketCode,
            )
          }
          const localizedUrl = request.nextUrl.clone()
          return withMarketCookie(
            withLanguageCookie(
              NextResponse.rewrite(localizedUrl, {
                request: { headers: requestHeaders },
              }),
              marketLanguage,
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

        const localizedUrl = request.nextUrl.clone()
        return withMarketCookie(
          withLanguageCookie(
            NextResponse.rewrite(localizedUrl, {
              request: { headers: requestHeaders },
            }),
            market?.language ?? 'en',
          ),
          marketCode,
        )
      }
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

  if (
    hostname === MARKET_HOSTS.en &&
    (pathname === '/se' || pathname === '/de')
  ) {
    const language = pathname === '/se' ? 'sv' : 'de'
    const market = pathname === '/se' ? 'sv' : 'de'
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-autorell-language', language)
    requestHeaders.set('x-autorell-market', pathname === '/se' ? 'SE' : 'DE')
    requestHeaders.set('x-autorell-pathname', pathname)
    return withMarketCookie(
      withLanguageCookie(
        NextResponse.next({ request: { headers: requestHeaders } }),
        language,
      ),
      market,
    )
  }

  if (pathname !== '/') {
    if (
      hostname === MARKET_HOSTS.en &&
      isPublicLanguage(preferredLanguage || '')
    ) {
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-autorell-language', preferredLanguage!)
      requestHeaders.set('x-autorell-pathname', pathname)
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

  return NextResponse.next()
}

async function responseForPermanentlyRemovedListing(request: NextRequest) {
  const listingId = listingIdFromPathname(request.nextUrl.pathname)
  if (!listingId) return null

  const state = await getListingPublicLifecycleState(listingId)
  if (!state?.gone) return null

  return new Response(goneListingHtml(), {
    status: 410,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  })
}

function listingIdFromPathname(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

  if (segments[0] === 'listings') {
    return segments[1]?.match(/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}/i)?.[0] || null
  }

  if (LOCALIZED_AD_SEGMENTS.has(segments[0]) && uuidPattern.test(segments[1] || '')) {
    return segments[1]
  }

  if (segments.length >= 3 && LOCALIZED_AD_SEGMENTS.has(segments[1]) && uuidPattern.test(segments[2] || '')) {
    return segments[2]
  }

  return null
}

async function getListingPublicLifecycleState(id: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) return null

  const url = new URL('/rest/v1/marketplace_listings', supabaseUrl)
  url.searchParams.set('id', `eq.${id}`)
  url.searchParams.set('select', 'status,published_at,sold_at,deleted_at,removed_by_admin')
  url.searchParams.set('limit', '1')

  try {
    const response = await fetch(url, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    })
    if (!response.ok) return null
    const rows = (await response.json()) as Array<{
      status?: string | null
      published_at?: string | null
      sold_at?: string | null
      deleted_at?: string | null
      removed_by_admin?: boolean | null
    }>
    const row = rows[0]
    if (!row) return null
    const wasPublic = Boolean(row.published_at || row.sold_at)
    const permanentlyRemoved =
      row.status === 'deleted' ||
      Boolean(row.deleted_at) ||
      row.removed_by_admin === true
    return { gone: wasPublic && permanentlyRemoved }
  } catch {
    return null
  }
}

function goneListingHtml() {
  return [
    '<!doctype html>',
    '<html lang="sv">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="robots" content="noindex,nofollow">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<title>Annonsen ar borttagen | Autorell</title>',
    '</head>',
    '<body>',
    '<main style="font-family:system-ui,sans-serif;max-width:680px;margin:12vh auto;padding:0 24px;line-height:1.5">',
    '<h1>Annonsen ar permanent borttagen</h1>',
    '<p>Den har annonsen finns inte langre pa Autorell.</p>',
    '<p><a href="/marketplace">Visa aktuella annonser</a></p>',
    '</main>',
    '</body>',
    '</html>',
  ].join('')
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|favicon-.*\\.png|icon.*\\.png|apple-icon.png|manifest.webmanifest|.*\\..*).*)',
  ],
}
