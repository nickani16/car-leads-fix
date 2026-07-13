const postalPatterns: Record<string, RegExp> = {
  AT: /^\d{4}$/,
  BE: /^\d{4}$/,
  BG: /^\d{4}$/,
  CH: /^\d{4}$/,
  CY: /^\d{4}$/,
  CZ: /^\d{3}\s?\d{2}$/,
  DE: /^\d{5}$/,
  DK: /^\d{4}$/,
  EE: /^\d{5}$/,
  ES: /^\d{5}$/,
  FI: /^\d{5}$/,
  FR: /^\d{5}$/,
  GR: /^\d{3}\s?\d{2}$/,
  HR: /^\d{5}$/,
  HU: /^\d{4}$/,
  IE: /^[A-Z0-9]{3}\s?[A-Z0-9]{4}$/,
  IT: /^\d{5}$/,
  LT: /^(LT-?)?\d{5}$/,
  LU: /^\d{4}$/,
  LV: /^(LV-?)?\d{4}$/,
  NL: /^\d{4}\s?[A-Z]{2}$/,
  NO: /^\d{4}$/,
  PL: /^\d{2}-?\d{3}$/,
  PT: /^\d{4}-?\d{3}$/,
  RO: /^\d{6}$/,
  SE: /^\d{3}\s?\d{2}$/,
  SI: /^\d{4}$/,
  SK: /^\d{3}\s?\d{2}$/,
}

const numericPostalCountries = new Set(
  Object.entries(postalPatterns)
    .filter(([, pattern]) => !pattern.source.includes('A-Z'))
    .map(([country]) => country),
)

export function normalizePostalCode(value: string, countryCode: string) {
  const country = countryCode.toUpperCase()
  const upper = value.toUpperCase().trim().replace(/\s+/g, ' ')
  if (numericPostalCountries.has(country)) {
    return upper.replace(/[^\d-]/g, '')
  }
  return upper.replace(/[^A-Z0-9 -]/g, '')
}

export function validatePostalCode(value: string, countryCode: string) {
  const country = countryCode.toUpperCase()
  const pattern = postalPatterns[country]
  if (!pattern) return value.trim().length >= 3
  return pattern.test(normalizePostalCode(value, country))
}
