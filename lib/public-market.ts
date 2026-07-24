import { marketplaceCategories } from '@/lib/marketplace'
import {
  publicLanguages,
  publicPagePaths,
} from '@/lib/public-i18n'

export type PublicMarket = 'sv' | 'de' | 'en'

const categoryPaths = marketplaceCategories.map(
  ({ slug }) => `/marketplace/${slug}`,
)

const marketConfig = {
  sv: {
    host: 'https://www.autorell.com/se',
    paths: [
      '',
      '/hitta-bilar',
      '/pricing',
      '/business',
      '/dealer-solutions',
      '/saved-searches',
      '/vanliga-fragor',
      '/about',
      '/contact',
      '/register',
      '/login',
      '/privacy',
      '/cookies',
      '/terms',
      ...categoryPaths,
    ],
    priorityPath: '/marketplace/cars',
  },
  de: {
    host: 'https://www.autorell.com/de',
    paths: [
      '',
      '/fahrzeuge-finden',
      '/pricing',
      '/business',
      '/dealer-solutions',
      '/saved-searches',
      '/about',
      '/register',
      '/login',
      '/faq',
      '/contact',
      '/privacy',
      '/cookies',
      '/terms',
      ...categoryPaths,
    ],
    priorityPath: '/marketplace/cars',
  },
  en: {
    host: 'https://www.autorell.com',
    paths: [
      ...publicLanguages.flatMap((locale) =>
        publicPagePaths.map((path) => `/${locale}${path}`),
      ),
      ...categoryPaths,
    ],
    priorityPath: '/marketplace/cars',
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
