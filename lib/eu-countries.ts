export const EU_COUNTRIES = [
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

export const euCountries = EU_COUNTRIES

export type EuCountryCode = (typeof EU_COUNTRIES)[number][0]

export const euCountryCodes = new Set<string>(EU_COUNTRIES.map(([code]) => code))

export function getEuCountryName(code: string, locale = 'sv') {
  const normalizedCode = code.toUpperCase()

  try {
    return (
      new Intl.DisplayNames([locale], { type: 'region' }).of(normalizedCode) ||
      normalizedCode
    )
  } catch {
    return (
      EU_COUNTRIES.find(([countryCode]) => countryCode === normalizedCode)?.[1] ||
      normalizedCode
    )
  }
}
