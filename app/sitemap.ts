import type { MetadataRoute } from 'next'

const marketPages = [
  {
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
    ],
  },
  {
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
  },
  {
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
  },
] as const

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return marketPages.flatMap(({ host, paths }) =>
    paths.map((path) => ({
      url: `${host}${path}`,
      lastModified,
      changeFrequency: path === '' ? 'weekly' : 'monthly',
      priority:
        path === ''
          ? 1
          : path === '/salj-bil' ||
              path === '/fahrzeuge' ||
              path === '/vehicles'
            ? 0.9
            : 0.7,
    })),
  )
}
