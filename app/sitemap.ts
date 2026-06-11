import type { MetadataRoute } from 'next'

const paths = [
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
]

const markets = [
  { host: 'https://www.autorell.se', language: 'sv-SE' },
  { host: 'https://www.autorell.de', language: 'de-DE' },
  { host: 'https://www.autorell.com', language: 'en' },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return markets.flatMap((market) =>
    paths.map((path) => ({
      url: `${market.host}${path}`,
      lastModified,
      changeFrequency: path === '' ? 'weekly' : 'monthly',
      priority: path === '' ? 1 : path === '/salj-bil' ? 0.9 : 0.7,
      alternates: {
        languages: Object.fromEntries(
          markets.map(({ host, language }) => [language, `${host}${path}`]),
        ),
      },
    })),
  )
}
