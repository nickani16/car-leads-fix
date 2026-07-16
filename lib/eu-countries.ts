export const ALL_EU_COUNTRIES = [
  ['AT', 'Austria'],
  ['BE', 'Belgium'],
  ['BG', 'Bulgaria'],
  ['HR', 'Croatia'],
  ['CY', 'Cyprus'],
  ['CZ', 'Czechia'],
  ['DE', 'Germany'],
  ['DK', 'Denmark'],
  ['EE', 'Estonia'],
  ['ES', 'Spain'],
  ['FI', 'Finland'],
  ['FR', 'France'],
  ['GR', 'Greece'],
  ['HU', 'Hungary'],
  ['IE', 'Ireland'],
  ['IT', 'Italy'],
  ['LT', 'Lithuania'],
  ['LU', 'Luxembourg'],
  ['LV', 'Latvia'],
  ['MT', 'Malta'],
  ['NL', 'Netherlands'],
  ['PL', 'Poland'],
  ['PT', 'Portugal'],
  ['RO', 'Romania'],
  ['SE', 'Sweden'],
  ['SI', 'Slovenia'],
  ['SK', 'Slovakia'],
] as const

export const ACTIVE_MARKET_COUNTRIES = [
  ['DE', 'Germany'],
  ['FR', 'France'],
  ['IT', 'Italy'],
  ['ES', 'Spain'],
  ['NL', 'Netherlands'],
  ['BE', 'Belgium'],
  ['SE', 'Sweden'],
  ['PL', 'Poland'],
  ['AT', 'Austria'],
  ['DK', 'Denmark'],
  ['FI', 'Finland'],
] as const

export const activeMarketCountries = ACTIVE_MARKET_COUNTRIES

export type ActiveMarketCountryCode = (typeof ACTIVE_MARKET_COUNTRIES)[number][0]

export const activeMarketCountryCodes = new Set<string>(
  ACTIVE_MARKET_COUNTRIES.map(([code]) => code),
)

export function isActiveMarketCountryCode(
  value: string | null | undefined,
): value is ActiveMarketCountryCode {
  return Boolean(value && activeMarketCountryCodes.has(value.toUpperCase()))
}

export const EU_COUNTRIES = ACTIVE_MARKET_COUNTRIES

export const euCountries = EU_COUNTRIES

export type EuCountryCode = ActiveMarketCountryCode

export const euCountryCodes = activeMarketCountryCodes

export function getEuCountryName(code: string, locale = 'sv') {
  const normalizedCode = code.toUpperCase()
  const displayLocale = locale === 'at' ? 'de' : locale === 'be' ? 'nl' : locale

  try {
    return (
      new Intl.DisplayNames([displayLocale], { type: 'region' }).of(normalizedCode) ||
      normalizedCode
    )
  } catch {
    return (
      ALL_EU_COUNTRIES.find(([countryCode]) => countryCode === normalizedCode)?.[1] ||
      normalizedCode
    )
  }
}
