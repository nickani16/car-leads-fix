import {
  isPublicLanguage,
  stripLocalePrefix,
  type PublicLocale,
} from './public-i18n'

const localeAliases: Record<string, PublicLocale> = {
  se: 'sv',
  sv: 'sv',
  de: 'de',
  at: 'at',
  be: 'be',
  dk: 'da',
  da: 'da',
  en: 'en',
  fr: 'fr',
  es: 'es',
  it: 'it',
  pl: 'pl',
  nl: 'nl',
  fi: 'fi',
}

export function normalizeAuthLocale(value: unknown): PublicLocale {
  const normalized = String(value || '').trim().toLowerCase()
  if (normalized === 'sv' || normalized === 'de') return normalized
  if (isPublicLanguage(normalized)) return normalized
  return localeAliases[normalized] || 'en'
}

export function localeFromPath(pathname: string): PublicLocale {
  const first = pathname.split('?')[0]?.split('/').filter(Boolean)[0] || ''
  return localeAliases[first.toLowerCase()] || 'en'
}

export function localeFromRequest(request: Request, fallback?: unknown): PublicLocale {
  const bodyLocale = normalizeAuthLocale(fallback)
  if (bodyLocale !== 'en') return bodyLocale

  const url = new URL(request.url)
  const pathLocale = localeFromPath(url.pathname)
  if (pathLocale !== 'en') return pathLocale

  const referer = request.headers.get('referer')
  if (referer) {
    try {
      const refererLocale = localeFromPath(new URL(referer).pathname)
      if (refererLocale !== 'en') return refererLocale
    } catch {
      // Ignore malformed referers. English remains the safe fallback.
    }
  }

  const market = request.headers.get('x-autorell-market')
  const language = request.headers.get('x-autorell-language')
  return normalizeAuthLocale(language || market || 'en')
}

export function localizedAuthPath(locale: PublicLocale, path: string) {
  const cleanPath = stripLocalePrefix(path || '/')
  if (locale === 'sv') return `/se${cleanPath === '/' ? '' : cleanPath}`
  if (locale === 'da') return `/dk${cleanPath === '/' ? '' : cleanPath}`
  if (locale === 'en') return cleanPath
  return `/${locale}${cleanPath === '/' ? '' : cleanPath}`
}

export function authOrigin(request: Request) {
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https'
  const forwardedHost = request.headers.get('x-forwarded-host') || request.headers.get('host')
  if (forwardedHost) return `${forwardedProto}://${forwardedHost.split(',')[0].trim()}`
  return new URL(request.url).origin
}
