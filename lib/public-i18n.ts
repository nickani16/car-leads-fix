import translations from './generated-public-translations.json'

export const publicLanguages = [
  'en',
  'fr',
  'es',
  'it',
  'pl',
  'nl',
  'pt',
  'fi',
  'da',
  'cs',
  'ro',
  'bg',
  'hr',
  'el',
  'hu',
  'sk',
  'sl',
  'et',
  'lv',
  'lt',
] as const

export type PublicLanguage = (typeof publicLanguages)[number]
export type PublicLocale = 'sv' | 'de' | PublicLanguage

const localizedPublicPaths = new Set([
  '/',
  '/find-cars',
  '/vehicles',
  '/how-it-works',
  '/benefits',
  '/about',
  '/faq',
  '/contact',
  '/privacy',
  '/cookies',
  '/terms',
  '/login',
  '/register',
])

const structuralKeys = new Set([
  'href',
  'src',
  'path',
  'primaryHref',
  'browseHref',
  'state',
  'status',
  'type',
  'value',
  'locale',
  'code',
  'id',
  'slug',
])

export function isPublicLanguage(value: string): value is PublicLanguage {
  return publicLanguages.includes(value as PublicLanguage)
}

export function translatePublic(locale: PublicLocale, value: string) {
  if (locale === 'sv' || locale === 'de' || locale === 'en') return value
  const dictionary = translations[locale] as Record<string, string>
  return dictionary[value] || value
}

export function translatePublicObject<T>(
  locale: PublicLocale,
  value: T,
  parentKey = '',
): T {
  if (typeof value === 'string') {
    return (
      structuralKeys.has(parentKey)
        ? value
        : translatePublic(locale, value)
    ) as T
  }

  if (Array.isArray(value)) {
    return value.map((item) =>
      translatePublicObject(locale, item, parentKey),
    ) as T
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        translatePublicObject(locale, item, key),
      ]),
    ) as T
  }

  return value
}

export function localizePublicHref(locale: PublicLocale, href: string) {
  if (locale === 'sv' || locale === 'de' || locale === 'en') return href
  if (/^(https?:|mailto:|tel:)/.test(href)) return href

  const [pathname, hash = ''] = href.split('#')
  const normalizedPath = pathname || '/'
  if (!localizedPublicPaths.has(normalizedPath)) return href

  const localized =
    normalizedPath === '/'
      ? `/${locale}`
      : `/${locale}${normalizedPath}`
  return hash ? `${localized}#${hash}` : localized
}

export const publicPagePaths = [
  '',
  '/find-cars',
  '/vehicles',
  '/how-it-works',
  '/benefits',
  '/about',
  '/faq',
  '/contact',
  '/privacy',
  '/cookies',
  '/terms',
  '/login',
  '/register',
] as const

export function getPublicAlternates(pathname: string) {
  const normalized = pathname === '/' ? '' : pathname
  const domainAlternates: Array<[string, string]> =
    normalized === ''
      ? [
          ['sv-SE', 'https://www.autorell.se/'],
          ['de-DE', 'https://www.autorell.de/'],
        ]
      : normalized === '/find-cars'
        ? [
            ['sv-SE', 'https://www.autorell.se/hitta-bilar'],
            ['de-DE', 'https://www.autorell.de/fahrzeuge-finden'],
          ]
        : []

  return Object.fromEntries([
    ...publicLanguages.map((locale) => [
      locale,
      locale === 'en'
        ? `https://www.autorell.com${normalized || '/'}`
        : `https://www.autorell.com/${locale}${normalized}`,
    ]),
    ...domainAlternates,
    ['x-default', `https://www.autorell.com${normalized || '/'}`],
  ])
}
