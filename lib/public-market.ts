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
    host: 'https://www.autorell.com/se',
    paths: [
      '',
      '/hitta-bilar',
      '/sell-vehicle',
      '/how-selling-works',
      '/pricing',
      '/business',
      '/dealer-solutions',
      '/saved-searches',
      '/compare-vehicles',
      '/vehicle-history',
      '/buying-guide',
      '/careers',
      '/press',
      '/partners',
      '/safety-tips',
      '/payments',
      '/shipping-delivery',
      '/vanliga-fragor',
      '/about',
      '/contact',
      '/register',
      '/login',
      '/privacy',
      '/cookies',
      '/terms',
      ...categoryPaths,
      ...categoryLandingPaths,
    ],
    priorityPath: '/cars',
  },
  de: {
    host: 'https://www.autorell.com/de',
    paths: [
      '',
      '/fahrzeuge-finden',
      '/sell-vehicle',
      '/how-selling-works',
      '/pricing',
      '/business',
      '/dealer-solutions',
      '/saved-searches',
      '/compare-vehicles',
      '/vehicle-history',
      '/buying-guide',
      '/about',
      '/careers',
      '/press',
      '/partners',
      '/safety-tips',
      '/payments',
      '/shipping-delivery',
      '/register',
      '/login',
      '/faq',
      '/contact',
      '/privacy',
      '/cookies',
      '/terms',
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
