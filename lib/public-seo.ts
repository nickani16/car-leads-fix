import type { Metadata } from 'next'
import { cleanSeoText } from './market-seo'
import { localePathPrefix, type PublicLocale } from './public-i18n'

const siteHost = 'https://www.autorell.com'

const hreflangByLocale: Record<PublicLocale, string> = {
  sv: 'sv-SE',
  de: 'de-DE',
  en: 'en',
  at: 'de-AT',
  be: 'nl-BE',
  fr: 'fr-FR',
  es: 'es-ES',
  it: 'it-IT',
  pl: 'pl-PL',
  nl: 'nl-NL',
  fi: 'fi-FI',
  da: 'da-DK',
}

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
  const canonical = `${siteHost}${localePathPrefix(locale)}${normalizedPath}`
  const seoTitle = cleanSeoText(title, 65)
  const seoDescription = cleanSeoText(description, 150)
  const localizedHref = (targetLocale: PublicLocale) => {
    const targetPath = languagePaths?.[targetLocale] ?? normalizedPath
    const pathPart = targetPath === '/' ? '' : targetPath
    return `${siteHost}${localePathPrefix(targetLocale)}${pathPart}`
  }
  const alternates = Object.fromEntries(
    (Object.keys(hreflangByLocale) as PublicLocale[]).map((targetLocale) => [
      hreflangByLocale[targetLocale],
      localizedHref(targetLocale),
    ]),
  )

  return {
    title: { absolute: seoTitle },
    description: seoDescription,
    keywords,
    alternates: {
      canonical,
      languages: {
        ...alternates,
        'x-default': localizedHref('en'),
      },
    },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: canonical,
      siteName: 'Autorell',
      locale: hreflangByLocale[locale].replace('-', '_'),
      type: 'website',
    },
  }
}
