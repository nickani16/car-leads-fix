import type { Metadata } from 'next'

type PublicLocale = 'sv' | 'de' | 'en'

const hosts = {
  sv: 'https://www.autorell.se',
  de: 'https://www.autorell.de',
  en: 'https://www.autorell.com',
} as const

export function createPublicMetadata({
  title,
  description,
  path,
  locale = 'sv',
}: {
  title: string
  description: string
  path: string
  locale?: PublicLocale
}): Metadata {
  const normalizedPath = path === '/' ? '' : path
  const canonical = `${hosts[locale]}${normalizedPath}`

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical,
      languages: {
        'sv-SE': `${hosts.sv}${normalizedPath}`,
        'de-DE': `${hosts.de}${normalizedPath}`,
        en: `${hosts.en}${normalizedPath}`,
        'x-default': `${hosts.en}${normalizedPath}`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Autorell',
      locale: locale === 'sv' ? 'sv_SE' : locale === 'de' ? 'de_DE' : 'en_GB',
      type: 'website',
    },
  }
}
