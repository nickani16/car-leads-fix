import type { Metadata } from 'next'
import { cleanSeoText } from './market-seo'

type PublicLocale = 'sv' | 'de' | 'en'

const hosts = {
  sv: 'https://www.autorell.com/se',
  de: 'https://www.autorell.com/de',
  en: 'https://www.autorell.com',
} as const

export function createPublicMetadata({
  title,
  description,
  path,
  locale = 'sv',
  keywords,
  languagePaths,
}: {
  title: string
  description: string
  path: string
  locale?: PublicLocale
  keywords?: string[]
  languagePaths?: Partial<Record<PublicLocale, string>>
}): Metadata {
  const normalizedPath = path === '/' ? '' : path
  const canonical = `${hosts[locale]}${normalizedPath}`
  const seoTitle = cleanSeoText(title, 65)
  const seoDescription = cleanSeoText(description, 150)
  const localizedPath = (targetLocale: PublicLocale) => {
    const targetPath = languagePaths?.[targetLocale] ?? normalizedPath
    return targetPath === '/' ? '' : targetPath
  }

  return {
    title: { absolute: seoTitle },
    description: seoDescription,
    keywords,
    alternates: {
      canonical,
      languages: {
        'sv-SE': `${hosts.sv}${localizedPath('sv')}`,
        'de-DE': `${hosts.de}${localizedPath('de')}`,
        en: `${hosts.en}${localizedPath('en')}`,
        'x-default': `${hosts.en}${localizedPath('en')}`,
      },
    },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: canonical,
      siteName: 'Autorell',
      locale: locale === 'sv' ? 'sv_SE' : locale === 'de' ? 'de_DE' : 'en_GB',
      type: 'website',
    },
  }
}
