import { NextRequest } from 'next/server'
import {
  getPublicMarketConfig,
  type PublicMarket,
} from '@/lib/public-market'
import {
  isPublicLanguage,
  publicPagePaths,
  translatePublic,
  type PublicLocale,
} from '@/lib/public-i18n'
import { euBuyerMarkets } from '@/lib/eu-buyer-markets'
import { importGuides } from '@/lib/import-guides'

const pageNames = {
  sv: {
    '': 'Startsida',
    '/hitta-bilar': 'Köp bil',
    '/salj-bil': 'Sälj din bil',
    '/trygg-affar': 'En trygg affär',
    '/vanliga-fragor': 'Vanliga frågor',
    '/foretag': 'Företag',
    '/for-handlare': 'För bilhandlare',
    '/om-oss': 'Om Autorell',
    '/kontakt': 'Kontakt',
    '/bli-bilhandlare': 'Bli bilhandlare',
    '/handlarvillkor': 'Handlarvillkor',
    '/integritet': 'Integritet',
    '/cookies': 'Cookies',
    '/villkor': 'Villkor',
  },
  de: {
    '': 'Startseite',
    '/fahrzeuge-finden': 'Fahrzeuge kaufen',
    '/fahrzeuge': 'Fahrzeugangebot',
    '/so-funktionierts': 'So funktioniert es',
    '/vorteile': 'Vorteile',
    '/ueber-autorell': 'Über Autorell',
    '/faq': 'FAQ',
    '/kontakt': 'Kontakt',
    '/haendlerzugang': 'Händlerzugang',
    '/haendlerbedingungen': 'Händlerbedingungen',
    '/datenschutz': 'Datenschutz',
    '/cookies': 'Cookies',
    '/nutzungsbedingungen': 'Nutzungsbedingungen',
    '/haendler': 'Händlermärkte',
  },
  en: {
    '': 'Home',
    '/find-cars': 'Buy cars',
    '/vehicles': 'Vehicles',
    '/how-it-works': 'How it works',
    '/dealer-benefits': 'Dealer benefits',
    '/about': 'About Autorell',
    '/faq': 'FAQ',
    '/contact': 'Contact',
    '/dealer-apply': 'Dealer access',
    '/dealer-terms': 'Dealer terms',
    '/privacy': 'Privacy',
    '/cookies': 'Cookies',
    '/terms': 'Terms',
    '/dealers': 'European dealer markets',
  },
} as const

function humanize(path: string) {
  const value = path.split('/').filter(Boolean).at(-1) || 'Autorell'
  return value
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function getMarket(request: NextRequest): PublicMarket {
  const locale = request.nextUrl.searchParams.get('locale')
  if (locale === 'sv' || locale === 'de') return locale
  return 'en'
}

export function GET(request: NextRequest) {
  const market = getMarket(request)
  const requestedLocale = request.nextUrl.searchParams.get('locale') || market
  const locale: PublicLocale =
    requestedLocale === 'sv' ||
    requestedLocale === 'de' ||
    isPublicLanguage(requestedLocale)
      ? requestedLocale
      : 'en'
  const marketCode = request.nextUrl.searchParams.get('market')
  const config = getPublicMarketConfig(market)
  const selectedMarket = marketCode
    ? euBuyerMarkets.find((item) => item.code === marketCode)
    : null
  const localizedPrefix = selectedMarket
    ? `/${selectedMarket.code}`
    : market === 'en' && locale !== 'en'
      ? `/${locale}`
      : ''
  const sourcePaths = selectedMarket
    ? [
        '',
        '/vehicles',
        '/how-it-works',
        '/dealer-benefits',
        '/about',
        '/faq',
        '/contact',
        '/privacy',
        '/cookies',
        '/terms',
        ...selectedMarket.cities.map((city) => `/dealers/${city.slug}`),
      ]
    : market === 'en' && locale !== 'en'
      ? [...publicPagePaths]
      : [...config.paths]

  const entries = sourcePaths.map((path) => {
    const baseTitle =
      pageNames[market][path as keyof (typeof pageNames)[typeof market]] ||
      humanize(path)
    const title =
      locale !== 'sv' && locale !== 'de'
        ? translatePublic(locale, baseTitle)
        : baseTitle
    return {
      href: `${localizedPrefix}${path || '/'}`.replace(/\/+/g, '/'),
      title,
      description:
        path.includes('/salj-bil/')
          ? market === 'sv'
            ? `Sälj bil i ${humanize(path)}`
            : title
          : path.includes('/haendler/') || path.includes('/dealers/')
            ? `${title} · Autorell`
            : `${title} · Autorell`,
      keywords: `${path} ${title} vehicle car bil auto dealer handlare händler sell buy köp kaufen export`,
    }
  })

  if (selectedMarket) {
      entries.unshift({
        href: `/${selectedMarket.code}`,
        title: selectedMarket.countryLocal,
        description: selectedMarket.country,
        keywords: `${selectedMarket.country} ${selectedMarket.countryLocal} ${selectedMarket.demand.join(' ')}`,
      })
  }

  for (const guide of importGuides) {
    if (
      (market === 'de' && guide.host.endsWith('autorell.de')) ||
      (market === 'en' && guide.host.endsWith('autorell.com'))
    ) {
      entries.push({
        href: guide.publicPath,
        title: guide.title,
        description: guide.description,
        keywords: `${guide.country} import export guide dealer vehicle`,
      })
    }
  }

  return Response.json(
    entries.filter(
      (entry, index, all) =>
        all.findIndex((candidate) => candidate.href === entry.href) === index,
    ),
    {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=3600',
      },
    },
  )
}
