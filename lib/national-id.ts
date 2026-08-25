export type NationalIdReview = {
  status: 'passed' | 'needs_review' | 'invalid'
}

export function normalizeNationalId(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

function passesSwedishPersonalNumber(value: string) {
  const digits = value.replace(/\D/g, '').slice(-10)
  if (digits.length !== 10) return false

  const sum = digits
    .slice(0, 9)
    .split('')
    .reduce((total, digit, index) => {
      const product = Number(digit) * (index % 2 === 0 ? 2 : 1)
      return total + Math.floor(product / 10) + (product % 10)
    }, 0)

  return (10 - (sum % 10)) % 10 === Number(digits[9])
}

export function reviewNationalId(countryCode: string, value: string): NationalIdReview {
  const normalized = normalizeNationalId(value)
  if (normalized.length < 6 || normalized.length > 24) return { status: 'invalid' }
  if (countryCode === 'SE') {
    return { status: passesSwedishPersonalNumber(normalized) ? 'passed' : 'invalid' }
  }
  return { status: /\d/.test(normalized) ? 'needs_review' : 'invalid' }
}
