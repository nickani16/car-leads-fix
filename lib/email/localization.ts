import 'server-only'

export type EmailLocale = 'en' | 'sv' | 'da' | 'fi' | 'de' | 'fr' | 'it' | 'es' | 'nl' | 'pl'

const countryLocale: Record<string, EmailLocale> = {
  SE: 'sv',
  DK: 'da',
  FI: 'fi',
  DE: 'de',
  AT: 'de',
  FR: 'fr',
  IT: 'it',
  ES: 'es',
  NL: 'nl',
  BE: 'nl',
  PL: 'pl',
}

const languageLocale: Record<string, EmailLocale> = {
  en: 'en',
  sv: 'sv',
  da: 'da',
  fi: 'fi',
  de: 'de',
  fr: 'fr',
  it: 'it',
  es: 'es',
  nl: 'nl',
  pl: 'pl',
}

export const emailLocaleTags: Record<EmailLocale, string> = {
  en: 'en-GB',
  sv: 'sv-SE',
  da: 'da-DK',
  fi: 'fi-FI',
  de: 'de-DE',
  fr: 'fr-FR',
  it: 'it-IT',
  es: 'es-ES',
  nl: 'nl-NL',
  pl: 'pl-PL',
}

export function resolveEmailLocale(input: {
  locale?: string | null
  market?: string | null
  countryCode?: string | null
  host?: string | null
  acceptLanguage?: string | null
} = {}): EmailLocale {
  const explicit = localeFromLanguage(input.locale)
  if (explicit) return explicit

  const market = String(input.market || '').trim().toUpperCase()
  if (countryLocale[market]) return countryLocale[market]

  const country = String(input.countryCode || '').trim().toUpperCase()
  if (countryLocale[country]) return countryLocale[country]

  const host = String(input.host || '').toLowerCase()
  if (host.endsWith('.se')) return 'sv'
  if (host.endsWith('.de')) return 'de'
  if (host.endsWith('.dk')) return 'da'
  if (host.endsWith('.fi')) return 'fi'
  if (host.endsWith('.fr')) return 'fr'
  if (host.endsWith('.it')) return 'it'
  if (host.endsWith('.es')) return 'es'
  if (host.endsWith('.nl')) return 'nl'
  if (host.endsWith('.pl')) return 'pl'

  return localeFromAcceptLanguage(input.acceptLanguage) || 'en'
}

export function localizedAccountUrl(path: string, locale: EmailLocale) {
  const market = locale === 'en' ? '' : locale === 'sv' ? '/se' : `/${locale === 'da' ? 'dk' : locale}`
  return `https://www.autorell.com${market}${path}`
}

export function formatEmailDate(value: string | Date, locale: EmailLocale) {
  return new Intl.DateTimeFormat(emailLocaleTags[locale], { dateStyle: 'medium' }).format(new Date(value))
}

export function formatEmailDateTime(value: string | Date, locale: EmailLocale) {
  return new Intl.DateTimeFormat(emailLocaleTags[locale], {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Stockholm',
  }).format(new Date(value))
}

export function formatEmailMoney(amountMinor?: number | null, currency?: string | null, locale: EmailLocale = 'en') {
  const amount = Number(amountMinor || 0) / 100
  return new Intl.NumberFormat(emailLocaleTags[locale], {
    style: 'currency',
    currency: String(currency || 'sek').toUpperCase(),
  }).format(amount)
}

export function escapeEmailHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character] || character)
}

function localeFromLanguage(value?: string | null): EmailLocale | null {
  const normalized = String(value || '').trim().toLowerCase()
  if (!normalized) return null
  const country = normalized.split(/[-_]/)[1]?.toUpperCase()
  if (country && countryLocale[country]) return countryLocale[country]
  return languageLocale[normalized.slice(0, 2)] || null
}

function localeFromAcceptLanguage(value?: string | null): EmailLocale | null {
  const first = String(value || '').split(',')[0]?.trim()
  return localeFromLanguage(first)
}
