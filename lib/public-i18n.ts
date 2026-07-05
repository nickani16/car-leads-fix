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

const localePathPrefixes: Record<PublicLocale, string> = {
  sv: '/se',
  de: '/de',
  en: '',
  fr: '/fr',
  es: '/es',
  it: '/it',
  pl: '/pl',
  nl: '/nl',
  pt: '/pt',
  fi: '/fi',
  da: '/dk',
  cs: '/cz',
  ro: '/ro',
  bg: '/bg',
  hr: '/hr',
  el: '/gr',
  hu: '/hu',
  sk: '/sk',
  sl: '/si',
  et: '/ee',
  lv: '/lv',
  lt: '/lt',
}

const localePrefixes = new Set(
  Object.values(localePathPrefixes).filter(Boolean).map((value) => value.slice(1)),
)

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
  if (/^(https?:|mailto:|tel:)/.test(href)) return href
  if (href.startsWith('#')) return href

  const [beforeHash, hash = ''] = href.split('#')
  const [rawPathname, query = ''] = beforeHash.split('?')
  const normalizedPath = rawPathname || '/'
  if (
    normalizedPath.startsWith('/api/') ||
    normalizedPath.startsWith('/_next/') ||
    normalizedPath.startsWith('/admin')
  ) {
    return href
  }

  const strippedPath = stripLocalePrefix(normalizedPath)
  const prefix = localePathPrefix(locale)
  const localized =
    prefix === ''
      ? strippedPath
      : strippedPath === '/'
        ? prefix
        : `${prefix}${strippedPath}`
  const withQuery = query ? `${localized}?${query}` : localized

  return hash ? `${withQuery}#${hash}` : withQuery
}

export function localePathPrefix(locale: PublicLocale) {
  return localePathPrefixes[locale]
}

export function stripLocalePrefix(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  const first = segments[0]
  if (!first) return '/'
  if (
    localePrefixes.has(first) ||
    publicLanguages.includes(first as PublicLanguage)
  ) {
    const rest = segments.slice(1).join('/')
    return rest ? `/${rest}` : '/'
  }
  return pathname
}

export function switchLocaleHref(locale: PublicLocale, currentHref: string) {
  return localizePublicHref(locale, currentHref || '/')
}

export const publicPagePaths = [
  '',
  '/find-cars',
  '/vehicles',
  '/how-it-works',
  '/benefits',
  '/about',
  '/faq',
  '/help-center',
  '/contact',
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
  '/privacy',
  '/cookies',
  '/terms',
  '/refund-policy',
  '/report',
  '/login',
  '/register',
] as const

export function getPublicAlternates(pathname: string) {
  const normalized = pathname === '/' ? '' : pathname
  const domainAlternates: Array<[string, string]> =
    normalized === ''
      ? [
          ['sv-SE', 'https://www.autorell.com/se'],
          ['de-DE', 'https://www.autorell.com/de'],
        ]
      : normalized === '/find-cars'
        ? [
            ['sv-SE', 'https://www.autorell.com/se/hitta-bilar'],
            ['de-DE', 'https://www.autorell.com/de/fahrzeuge-finden'],
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
