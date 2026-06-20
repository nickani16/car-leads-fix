import { swedishLocalSeoLocations } from '@/lib/swedish-local-seo'
import { swedishCounties } from '@/lib/swedish-regions.generated'
import {
  europeanDealerCountries,
  germanDealerCities,
} from '@/lib/international-dealer-seo'
import {
  euBuyerMarkets,
  getAllEuBuyerPaths,
} from '@/lib/eu-buyer-markets'
import { getImportGuidePaths } from '@/lib/import-guides'
import { internationalPageKeys } from '@/lib/international-public-site'
import {
  customerLocales,
  customerPageKeys,
  isCustomerLocale,
} from '@/lib/customer-i18n'

export type PublicMarket = 'sv' | 'de' | 'en'

const swedishLocalSeoPaths = swedishLocalSeoLocations.map(
  ({ slug }) => `/salj-bil/${slug}`
)
const swedishCountySeoPaths = swedishCounties.map(
  ({ slug }) => `/salj-bil/lan/${slug}`
)
const germanDealerSeoPaths = germanDealerCities.map(
  ({ slug }) => `/haendler/${slug}`
)
const europeanDealerSeoPaths = europeanDealerCountries.map(
  ({ slug }) => `/dealers/${slug}`
)
const localizedEuBuyerPaths = getAllEuBuyerPaths()
const localizedEuPublicSitePaths = euBuyerMarkets
  .filter((market) => !isCustomerLocale(market.code))
  .flatMap((market) =>
    internationalPageKeys.map((page) => `/${market.code}/${page}`),
  )
const localizedCustomerPaths = customerLocales.flatMap((locale) => [
  `/${locale}`,
  ...customerPageKeys.map((page) => `/${locale}/${page}`),
])
const germanImportGuidePaths = getImportGuidePaths('de')
const europeanImportGuidePaths = getImportGuidePaths('en')

const marketConfig = {
  sv: {
    host: 'https://www.autorell.se',
    paths: [
      '',
      '/hitta-bilar',
      '/salj-bil',
      '/trygg-affar',
      '/vanliga-fragor',
      '/foretag',
      '/for-handlare',
      '/om-oss',
      '/kontakt',
      '/bli-bilhandlare',
      '/handlarvillkor',
      '/integritet',
      '/cookies',
      '/villkor',
      ...swedishCountySeoPaths,
      ...swedishLocalSeoPaths,
    ],
    priorityPath: '/salj-bil',
  },
  de: {
    host: 'https://www.autorell.de',
    paths: [
      '',
      '/fahrzeuge-finden',
      '/fahrzeuge',
      '/so-funktionierts',
      '/vorteile',
      '/ueber-autorell',
      '/faq',
      '/kontakt',
      '/haendlerzugang',
      '/haendlerbedingungen',
      '/datenschutz',
      '/cookies',
      '/nutzungsbedingungen',
      '/haendler',
      ...germanDealerSeoPaths,
      ...germanImportGuidePaths,
    ],
    priorityPath: '/fahrzeuge',
  },
  en: {
    host: 'https://www.autorell.com',
    paths: [
      '',
      '/find-cars',
      '/vehicles',
      '/how-it-works',
      '/dealer-benefits',
      '/about',
      '/faq',
      '/contact',
      '/dealer-apply',
      '/dealer-terms',
      '/privacy',
      '/cookies',
      '/terms',
      '/dealers',
      ...europeanDealerSeoPaths,
      ...localizedEuBuyerPaths,
      ...localizedEuPublicSitePaths,
      ...localizedCustomerPaths,
      ...europeanImportGuidePaths,
    ],
    priorityPath: '/vehicles',
  },
} as const

export function getPublicMarket(request: Request): PublicMarket {
  const hostname = (
    request.headers.get('host') ||
    request.headers.get('x-forwarded-host') ||
    ''
  )
    .split(',')[0]
    .trim()
    .split(':')[0]
    .toLowerCase()

  if (hostname.endsWith('autorell.de')) return 'de'
  if (hostname.endsWith('autorell.com')) return 'en'
  return 'sv'
}

export function getPublicMarketConfig(market: PublicMarket) {
  return marketConfig[market]
}
