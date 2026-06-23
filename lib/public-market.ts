import { marketplaceCategories } from '@/lib/marketplace'
import { categoryLandingConfigs } from '@/lib/category-landings'
import {
  publicLanguages,
  publicPagePaths,
} from '@/lib/public-i18n'

export type PublicMarket = 'sv' | 'de' | 'en'

const categoryPaths = marketplaceCategories.map(
  ({ slug }) => `/marketplace/${slug}`,
)
const categoryLandingPaths = categoryLandingConfigs.map(({ path }) => path)

const marketConfig = {
  sv: {
    host: 'https://www.autorell.se',
    paths: [
      '',
      '/hitta-bilar',
      '/salj-fordon',
      '/foretag',
      '/trygg-affar',
      '/vanliga-fragor',
      '/om-oss',
      '/kontakt',
      '/registrera',
      '/login',
      '/integritet',
      '/cookies',
      '/villkor',
      ...categoryPaths,
      ...categoryLandingPaths,
    ],
    priorityPath: '/cars',
  },
  de: {
    host: 'https://www.autorell.de',
    paths: [
      '',
      '/fahrzeuge-finden',
      '/registrera',
      '/login',
      '/faq',
      '/kontakt',
      '/datenschutz',
      '/cookies',
      '/nutzungsbedingungen',
      ...categoryPaths,
      ...categoryLandingPaths,
    ],
    priorityPath: '/cars',
  },
  en: {
    host: 'https://www.autorell.com',
    paths: [
      ...publicLanguages.flatMap((locale) =>
        publicPagePaths.map((path) => `/${locale}${path}`),
      ),
      ...categoryPaths,
      ...categoryLandingPaths,
    ],
    priorityPath: '/cars',
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
