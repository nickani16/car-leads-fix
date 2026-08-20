import type { Metadata } from 'next'
import { cleanSeoText } from './market-seo'
import { localePathPrefix, type PublicLocale } from './public-i18n'

const defaultSiteHost = 'https://www.autorell.com'

export function publicHostForLocale(locale: PublicLocale) {
  if (locale === 'sv') return 'https://www.autorell.se'
  if (locale === 'de') return 'https://www.autorell.de'
  return defaultSiteHost
}

export function publicUrlForLocale(locale: PublicLocale, path = '/') {
  const normalizedPath = path === '/' ? '' : path
  return `${publicHostForLocale(locale)}${localePathPrefix(locale)}${normalizedPath}`
}

export function publicUrlForPath(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const market = normalizedPath.split('/').filter(Boolean)[0]
  const host =
    market === 'se'
      ? 'https://www.autorell.se'
      : market === 'de'
        ? 'https://www.autorell.de'
        : defaultSiteHost
  return `${host}${normalizedPath === '/' ? '' : normalizedPath}`
}

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

export function getPublicLanguageAlternates(path: string, languagePaths?: Partial<Record<PublicLocale, string>>) {
  const normalizedPath = path === '/' ? '' : path
  const localizedHref = (targetLocale: PublicLocale) => {
    const targetPath = languagePaths?.[targetLocale] ?? normalizedPath
    const pathPart = targetPath === '/' ? '' : targetPath
    return publicUrlForLocale(targetLocale, pathPart)
  }
  const alternates = Object.fromEntries(
    (Object.keys(hreflangByLocale) as PublicLocale[]).map((targetLocale) => [
      hreflangByLocale[targetLocale],
      localizedHref(targetLocale),
    ]),
  )
  return { ...alternates, 'x-default': localizedHref('en') }
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
  const canonical = publicUrlForLocale(locale, normalizedPath)
  const seoTitle = cleanSeoText(title, 65)
  const seoDescription = cleanSeoText(description, 150)
  const alternates = getPublicLanguageAlternates(normalizedPath, languagePaths)

  return {
    title: { absolute: seoTitle },
    description: seoDescription,
    keywords,
    alternates: {
      canonical,
      languages: alternates,
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
