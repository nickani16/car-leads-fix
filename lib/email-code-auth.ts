import { createHmac, randomInt, timingSafeEqual } from 'node:crypto'

const CODE_LIFETIME_MINUTES = 10

function secret() {
  const value =
    process.env.AUTH_EMAIL_CODE_SECRET ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!value) throw new Error('Email-code authentication secret is missing.')
  return value
}

export function normalizeEmail(value: unknown) {
  return String(value || '').trim().toLowerCase()
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function generateEmailCode() {
  return String(randomInt(100000, 1000000))
}

export function emailHash(email: string) {
  return createHmac('sha256', secret()).update(`email:${email}`).digest('hex')
}

export function codeHash(email: string, code: string) {
  return createHmac('sha256', secret())
    .update(`code:${email}:${code}`)
    .digest('hex')
}

export function matchesCode(expectedHash: string, email: string, code: string) {
  const received = Buffer.from(codeHash(email, code), 'hex')
  const expected = Buffer.from(expectedHash, 'hex')
  return received.length === expected.length && timingSafeEqual(received, expected)
}

export function codeExpiresAt() {
  return new Date(Date.now() + CODE_LIFETIME_MINUTES * 60_000).toISOString()
}

export function safeAuthDestination(value: unknown) {
  const destination = String(value || '')
  if (!destination || !destination.startsWith('/') || destination.startsWith('//')) {
    return '/account'
  }
  if (destination.startsWith('/api/') || destination.startsWith('/_next/')) {
    return '/account'
  }
  if (destination === '/konto') return '/account'
  if (destination.startsWith('/konto/meddelanden')) {
    return destination.replace('/konto/meddelanden', '/account/messages')
  }
  if (destination.startsWith('/konto/annonser/ny')) {
    return destination.replace('/konto/annonser/ny', '/account/listings/new')
  }
  if (destination.startsWith('/konto/annonser')) {
    return destination.replace('/konto/annonser', '/account/listings')
  }
  if (destination.startsWith('/konto')) {
    return destination.replace('/konto', '/account')
  }
  if (destination) {
    return destination
  }
  return '/account'
}
