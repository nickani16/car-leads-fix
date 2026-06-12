import { swedishLocalSeoLocations } from '@/lib/swedish-local-seo'

export type PublicMarket = 'sv' | 'de' | 'en'

const swedishLocalSeoPaths = swedishLocalSeoLocations.map(
  ({ slug }) => `/salj-bil/${slug}`
)

const marketConfig = {
  sv: {
    host: 'https://www.autorell.se',
    paths: [
      '',
      '/salj-bil',
      '/trygg-affar',
      '/vanliga-fragor',
      '/foretag',
      '/for-handlare',
      '/om-oss',
      '/kontakt',
      '/dealer-apply',
      '/dealer-terms',
      '/integritet',
      '/cookies',
      '/villkor',
      ...swedishLocalSeoPaths,
    ],
    priorityPath: '/salj-bil',
  },
  de: {
    host: 'https://www.autorell.de',
    paths: [
      '',
      '/fahrzeuge',
      '/so-funktionierts',
      '/vorteile',
      '/ueber-autorell',
      '/faq',
      '/kontakt',
      '/dealer-apply',
      '/dealer-terms',
      '/datenschutz',
      '/cookies',
      '/nutzungsbedingungen',
    ],
    priorityPath: '/fahrzeuge',
  },
  en: {
    host: 'https://www.autorell.com',
    paths: [
      '',
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
