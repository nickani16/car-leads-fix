const euDialCodes: Record<string, string> = {
  AT: '+43',
  BE: '+32',
  BG: '+359',
  HR: '+385',
  CY: '+357',
  CZ: '+420',
  DE: '+49',
  DK: '+45',
  EE: '+372',
  ES: '+34',
  FI: '+358',
  FR: '+33',
  GR: '+30',
  HU: '+36',
  IE: '+353',
  IT: '+39',
  LT: '+370',
  LU: '+352',
  LV: '+371',
  MT: '+356',
  NL: '+31',
  PL: '+48',
  PT: '+351',
  RO: '+40',
  SE: '+46',
  SI: '+386',
  SK: '+421',
}

const sortedDialCodes = Object.entries(euDialCodes).sort(
  (a, b) => b[1].length - a[1].length,
)

export type PhoneValidation = {
  phone: string
  countryCode: string
  valid: boolean
  status: 'format_valid' | 'invalid_format' | 'country_mismatch'
  riskFlags: string[]
}

function clean(value: unknown) {
  return String(value || '').trim()
}

export function normalizePhone(value: unknown, countryCode: string) {
  let compact = clean(value).replace(/[\s().-]/g, '')
  if (compact.startsWith('00')) compact = `+${compact.slice(2)}`
  if (compact.startsWith('+')) return compact
  const dialCode = euDialCodes[countryCode] || ''
  return dialCode ? `${dialCode}${compact.replace(/^0+/, '')}` : compact
}

export function detectPhoneCountry(phone: string) {
  return sortedDialCodes.find(([, dialCode]) => phone.startsWith(dialCode))?.[0] || null
}

export function validatePhoneForCountry(value: unknown, countryCodeValue: unknown): PhoneValidation {
  const countryCode = clean(countryCodeValue).toUpperCase()
  const phone = normalizePhone(value, countryCode)
  const detectedCountry = detectPhoneCountry(phone)
  const riskFlags: string[] = []
  const validFormat = /^\+[1-9]\d{7,14}$/.test(phone)
  const nationalDigits = detectedCountry && euDialCodes[detectedCountry]
    ? phone.slice(euDialCodes[detectedCountry].length).replace(/\D/g, '')
    : phone.replace(/^\+/, '')
  const digitRuns = nationalDigits.replace(/^0+/, '')
  const hasRepeatedDigits = /(\d)\1{5,}/.test(digitRuns)
  const hasSequentialDigits =
    digitRuns.length >= 7 &&
    ('01234567890123456789'.includes(digitRuns.slice(0, 8)) ||
      '98765432109876543210'.includes(digitRuns.slice(0, 8)))
  const reservedTestNumber =
    /^5550{2,}/.test(digitRuns) ||
    /^12345/.test(digitRuns) ||
    /^0{6,}$/.test(nationalDigits)

  if (!validFormat) riskFlags.push('phone_format_invalid')
  if (validFormat && detectedCountry && detectedCountry !== countryCode) {
    riskFlags.push('phone_country_mismatch')
  }
  if (validFormat && hasRepeatedDigits) riskFlags.push('phone_repeated_digits')
  if (validFormat && hasSequentialDigits) riskFlags.push('phone_sequential_digits')
  if (validFormat && reservedTestNumber) riskFlags.push('phone_reserved_test_number')

  const status = !validFormat
    ? 'invalid_format'
    : riskFlags.length
      ? 'country_mismatch'
      : 'format_valid'

  return {
    phone,
    countryCode,
    valid: status === 'format_valid',
    status,
    riskFlags,
  }
}

export function phoneRiskStatus(riskFlags: string[]) {
  return riskFlags.length ? 'review' : 'standard'
}
