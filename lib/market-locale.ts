import { currencyForCountry, type SupportedCurrency } from './marketplace'
import { activeMarketCountryCodes } from './eu-countries'
import type { PublicLocale } from './public-i18n'

export type LocaleMarket = {
  locale: PublicLocale
  countryCode: string
  countryName: string
  languageName: string
  pathCode: string
  currency: SupportedCurrency
}

const localeMarketData = [
  ['sv', 'SE', 'Sverige', 'Svenska', 'se'],
  ['de', 'DE', 'Deutschland', 'Deutsch', 'de'],
  ['en', 'EU', 'Europe', 'English', ''],
  ['fr', 'FR', 'France', 'Francais', 'fr'],
  ['es', 'ES', 'Espana', 'Espanol', 'es'],
  ['it', 'IT', 'Italia', 'Italiano', 'it'],
  ['pl', 'PL', 'Polska', 'Polski', 'pl'],
  ['nl', 'NL', 'Nederland', 'Nederlands', 'nl'],
  ['pt', 'PT', 'Portugal', 'Portugues', 'pt'],
  ['fi', 'FI', 'Suomi', 'Suomi', 'fi'],
  ['da', 'DK', 'Danmark', 'Dansk', 'dk'],
  ['cs', 'CZ', 'Cesko', 'Cestina', 'cz'],
  ['ro', 'RO', 'Romania', 'Romana', 'ro'],
  ['bg', 'BG', 'Bulgaria', 'Bulgarski', 'bg'],
  ['hr', 'HR', 'Hrvatska', 'Hrvatski', 'hr'],
  ['el', 'GR', 'Greece', 'Ellinika', 'gr'],
  ['hu', 'HU', 'Magyarorszag', 'Magyar', 'hu'],
  ['sk', 'SK', 'Slovensko', 'Slovencina', 'sk'],
  ['sl', 'SI', 'Slovenija', 'Slovenscina', 'si'],
  ['et', 'EE', 'Eesti', 'Eesti', 'ee'],
  ['lv', 'LV', 'Latvija', 'Latviesu', 'lv'],
  ['lt', 'LT', 'Lietuva', 'Lietuviu', 'lt'],
] as const

export const localeMarkets: LocaleMarket[] = localeMarketData.map(
  ([locale, countryCode, countryName, languageName, pathCode]) => ({
    locale,
    countryCode,
    countryName,
    languageName,
    pathCode,
    currency: countryCode === 'EU' ? 'EUR' : currencyForCountry(countryCode),
  }),
)

export function marketForLocale(locale: PublicLocale): LocaleMarket {
  return (
    localeMarkets.find((market) => market.locale === locale) ||
    localeMarkets.find((market) => market.locale === 'en')!
  )
}

export function marketForPathCode(pathCode?: string | null): LocaleMarket | null {
  const normalized = (pathCode || '').toLowerCase()
  if (!normalized) return marketForLocale('en')
  return localeMarkets.find((market) => market.pathCode === normalized) || null
}

export function countryForLocale(locale: PublicLocale): string {
  return marketForLocale(locale).countryCode
}

export function defaultSearchCountryForLocale(locale: PublicLocale): string {
  const countryCode = countryForLocale(locale)
  return activeMarketCountryCodes.has(countryCode) ? countryCode : ''
}

export function currencyForLocale(locale: PublicLocale): SupportedCurrency {
  return marketForLocale(locale).currency
}

export function marketPathForLocale(locale: PublicLocale): string {
  const pathCode = marketForLocale(locale).pathCode
  return pathCode ? `/${pathCode}` : '/'
}
