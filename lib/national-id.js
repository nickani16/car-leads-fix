const FINNISH_CHECK_CHARACTERS = '0123456789ABCDEFHJKLMNPRSTUVWXY'
const SPANISH_CHECK_LETTERS = 'TRWAGMYFPDXBNJZSQVHLCKE'

/** @typedef {'invalid' | 'needs_review' | 'passed'} NationalIdReviewStatus */

export function normalizeNationalId(value) {
  return String(value || '')
    .normalize('NFKC')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
}

function isValidDateParts(day, month, year = 2000) {
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

function passesLuhn(value) {
  if (!/^\d{10}$/.test(value)) return false
  const sum = value.slice(0, 9).split('').reduce((total, digit, index) => {
    const product = Number(digit) * (index % 2 === 0 ? 2 : 1)
    return total + Math.floor(product / 10) + (product % 10)
  }, 0)
  return (10 - (sum % 10)) % 10 === Number(value[9])
}

function reviewBelgianId(value) {
  if (!/^\d{11}$/.test(value)) return 'invalid'
  const base = Number(value.slice(0, 9))
  const check = Number(value.slice(9))
  const legacyCheck = 97 - (base % 97)
  const post2000Check = 97 - (Number(`2${value.slice(0, 9)}`) % 97)
  return check === legacyCheck || check === post2000Check ? 'passed' : 'needs_review'
}

function reviewSpanishId(value) {
  const dni = value.match(/^(\d{8})([A-Z])$/)
  if (dni) return SPANISH_CHECK_LETTERS[Number(dni[1]) % 23] === dni[2] ? 'passed' : 'invalid'
  const nie = value.match(/^([XYZ])(\d{7})([A-Z])$/)
  if (!nie) return 'invalid'
  const prefix = { X: '0', Y: '1', Z: '2' }[nie[1]]
  return SPANISH_CHECK_LETTERS[Number(`${prefix}${nie[2]}`) % 23] === nie[3] ? 'passed' : 'invalid'
}

function reviewFinnishId(rawValue) {
  const compact = String(rawValue || '').normalize('NFKC').toUpperCase().replace(/\s/g, '')
  const match = compact.match(/^(\d{2})(\d{2})(\d{2})([-+A-FYXWVU])(\d{3})([0-9A-Z])$/)
  if (!match || !isValidDateParts(Number(match[1]), Number(match[2]))) return 'invalid'
  const checkIndex = Number(`${match[1]}${match[2]}${match[3]}${match[5]}`) % 31
  return FINNISH_CHECK_CHARACTERS[checkIndex] === match[6] ? 'passed' : 'needs_review'
}

function reviewDutchBsn(value) {
  if (!/^\d{9}$/.test(value)) return 'invalid'
  const digits = value.split('').map(Number)
  const sum = digits.reduce((total, digit, index) => total + digit * (index === 8 ? -1 : 9 - index), 0)
  return sum !== 0 && sum % 11 === 0 ? 'passed' : 'needs_review'
}

function reviewPolishPesel(value) {
  if (!/^\d{11}$/.test(value)) return 'invalid'
  const weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3]
  const sum = weights.reduce((total, weight, index) => total + Number(value[index]) * weight, 0)
  return (10 - (sum % 10)) % 10 === Number(value[10]) ? 'passed' : 'invalid'
}

/**
 * Validates official structure where it is deterministic. `needs_review` is accepted
 * by registration for documents that require an external or manual check.
 * @param {string} countryCode
 * @param {string} value
 * @returns {{ normalized: string, status: NationalIdReviewStatus }}
 */
export function reviewNationalId(countryCode, value) {
  const country = String(countryCode || '').toUpperCase()
  const normalized = normalizeNationalId(value)
  if (normalized.length < 6 || normalized.length > 24 || !/\d/.test(normalized)) {
    return { normalized, status: 'invalid' }
  }

  /** @type {NationalIdReviewStatus} */
  let status = 'needs_review'
  switch (country) {
    case 'AT':
      status = /^[A-Z0-9]{6,12}$/.test(normalized) ? 'needs_review' : 'invalid'
      break
    case 'BE':
      status = reviewBelgianId(normalized)
      break
    case 'DE':
      status = /^[A-Z0-9]{8,12}$/.test(normalized) ? 'needs_review' : 'invalid'
      break
    case 'DK': {
      if (!/^\d{10}$/.test(normalized)) {
        status = 'invalid'
        break
      }
      status = isValidDateParts(Number(normalized.slice(0, 2)), Number(normalized.slice(2, 4)))
        ? 'needs_review'
        : 'invalid'
      break
    }
    case 'ES':
      status = reviewSpanishId(normalized)
      break
    case 'FI':
      status = reviewFinnishId(value)
      break
    case 'FR':
      status = /^(?:[12]\d{14}|[12]\d{4}2[AB]\d{7})$/.test(normalized) ? 'needs_review' : 'invalid'
      break
    case 'IT':
      status = /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/.test(normalized)
        ? 'passed'
        : /^[A-Z0-9]{16}$/.test(normalized) ? 'needs_review' : 'invalid'
      break
    case 'NL':
      status = reviewDutchBsn(normalized)
      break
    case 'PL':
      status = reviewPolishPesel(normalized)
      break
    case 'SE': {
      const tenDigits = normalized.slice(-10)
      status = /^(?:\d{10}|\d{12})$/.test(normalized)
        ? passesLuhn(tenDigits) ? 'passed' : 'needs_review'
        : 'invalid'
      break
    }
    default:
      status = 'needs_review'
  }

  return { normalized, status }
}
