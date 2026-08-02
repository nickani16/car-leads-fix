import 'server-only'

import crypto from 'node:crypto'
import { isActiveMarketCountryCode } from '@/lib/eu-countries'
import { localeMarkets } from '@/lib/market-locale'
import { normalizeBusinessPilotLocale } from '@/lib/business-pilot-i18n'

export const businessPilotStatuses = [
  'submitted',
  'under_review',
  'more_information_required',
  'contacted',
  'technical_review',
  'approved',
  'rejected',
  'onboarding',
  'pilot_active',
  'pilot_paused',
  'pilot_completed',
  'commercial_discussion',
  'commercial_customer',
  'closed',
] as const

export type BusinessPilotStatus = (typeof businessPilotStatuses)[number]

const inventorySizes = new Set(['1_25', '26_100', '101_500', '501_2000', '2000_plus'])
const integrationMethods = new Set(['website', 'xml', 'csv', 'api', 'dms', 'unknown'])
const marketCodes = new Set(localeMarkets.map((market) => market.pathCode || 'en'))
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const estimatedInventoryByRange: Record<string, number> = {
  '1_25': 13,
  '26_100': 63,
  '101_500': 300,
  '501_2000': 1250,
  '2000_plus': 2500,
}

export type ParsedBusinessPilotApplication = {
  company_name: string
  company_registration_number: string | null
  country_code: string
  market_code: string
  locale: string
  website_url: string
  contact_name: string
  contact_role: string | null
  contact_email: string
  contact_phone: string | null
  inventory_size_range: string
  estimated_inventory_count: number
  location_count: number
  current_inventory_system: string | null
  preferred_integration_method: string
  message: string | null
  privacy_consent_at: string
  contact_consent_at: string
  privacy_version: string
  source_fingerprint: string | null
}

export function parseBusinessPilotApplication(
  input: unknown,
  requestMetadata: { ip: string; userAgent: string },
): { success: true; data: ParsedBusinessPilotApplication } | { success: false; code: string } {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { success: false, code: 'INVALID_APPLICATION' }
  }

  const body = input as Record<string, unknown>
  const companyName = singleLine(body.companyName, 180)
  const registrationNumber = optionalSingleLine(body.registrationNumber, 100)
  const countryCode = singleLine(body.countryCode, 2).toUpperCase()
  const marketCodeValue = singleLine(body.marketCode, 2).toLowerCase()
  const marketCode = marketCodes.has(marketCodeValue) ? marketCodeValue : 'en'
  const locale = normalizeBusinessPilotLocale(singleLine(body.locale, 8) || 'en')
  const websiteUrl = normalizePublicWebsiteUrl(body.website)
  const contactName = singleLine(body.contactName, 160)
  const contactRole = optionalSingleLine(body.contactRole, 120)
  const email = singleLine(body.email, 320).toLowerCase()
  const phone = optionalSingleLine(body.phone, 60)
  const inventorySize = singleLine(body.inventorySize, 30)
  const locationCount = integerValue(body.locationCount)
  const currentSystem = optionalSingleLine(body.currentSystem, 160)
  const integrationMethod = singleLine(body.integrationMethod, 30)
  const message = optionalMultiline(body.message, 3000)

  if (
    companyName.length < 2 ||
    contactName.length < 2 ||
    !isActiveMarketCountryCode(countryCode) ||
    !websiteUrl ||
    !emailPattern.test(email) ||
    !inventorySizes.has(inventorySize) ||
    !integrationMethods.has(integrationMethod) ||
    locationCount === null ||
    locationCount < 1 ||
    locationCount > 10000 ||
    body.privacyConsent !== true ||
    body.contactConsent !== true
  ) {
    return { success: false, code: 'INVALID_APPLICATION' }
  }

  const now = new Date().toISOString()
  return {
    success: true,
    data: {
      company_name: companyName,
      company_registration_number: registrationNumber,
      country_code: countryCode,
      market_code: marketCode,
      locale,
      website_url: websiteUrl,
      contact_name: contactName,
      contact_role: contactRole,
      contact_email: email,
      contact_phone: phone,
      inventory_size_range: inventorySize,
      estimated_inventory_count: estimatedInventoryByRange[inventorySize],
      location_count: locationCount,
      current_inventory_system: currentSystem,
      preferred_integration_method: integrationMethod,
      message,
      privacy_consent_at: now,
      contact_consent_at: now,
      privacy_version: '2026-08',
      source_fingerprint: createSourceFingerprint({
        ...requestMetadata,
        email,
      }),
    },
  }
}

export function looksLikeAutomatedPilotSubmission(input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return false
  const body = input as Record<string, unknown>
  if (singleLine(body.companyUrl, 500)) return true

  const startedAt = Number(body.formStartedAt)
  const elapsed = Date.now() - startedAt
  return !Number.isFinite(startedAt) || elapsed < 1500 || elapsed > 24 * 60 * 60 * 1000
}

export function normalizePublicWebsiteUrl(value: unknown) {
  const input = singleLine(value, 1000)
  if (!input) return null

  try {
    const url = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`)
    if (!['http:', 'https:'].includes(url.protocol)) return null
    if (url.username || url.password || !url.hostname.includes('.')) return null
    if (!isPublicHostname(url.hostname)) return null
    url.hash = ''
    return url.toString()
  } catch {
    return null
  }
}

export function isPublicHostname(hostname: string) {
  const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, '')
  if (
    normalized === 'localhost' ||
    normalized.endsWith('.localhost') ||
    normalized.endsWith('.local') ||
    normalized.endsWith('.internal') ||
    normalized === '::1' ||
    normalized.startsWith('fe80:') ||
    normalized.startsWith('fc') ||
    normalized.startsWith('fd')
  ) return false

  const ipv4 = normalized.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  if (!ipv4) return true
  const octets = ipv4.slice(1).map(Number)
  if (octets.some((octet) => octet > 255)) return false
  const [first, second] = octets
  return !(
    first === 0 ||
    first === 10 ||
    first === 127 ||
    first >= 224 ||
    (first === 100 && second >= 64 && second <= 127) ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 0) ||
    (first === 192 && second === 168) ||
    (first === 198 && (second === 18 || second === 19))
  )
}

function createSourceFingerprint(input: { ip: string; userAgent: string; email: string }) {
  const secret = process.env.AUTORELL_FINGERPRINT_SECRET || process.env.AUTH_SECRET || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!secret) return null
  return crypto
    .createHmac('sha256', secret)
    .update(`${input.ip}|${input.userAgent.slice(0, 300)}|${input.email}`)
    .digest('hex')
}

function singleLine(value: unknown, maxLength: number) {
  return typeof value === 'string'
    ? value.trim().replace(/[\r\n\t]+/g, ' ').replace(/\s{2,}/g, ' ').slice(0, maxLength)
    : ''
}

function optionalSingleLine(value: unknown, maxLength: number) {
  return singleLine(value, maxLength) || null
}

function optionalMultiline(value: unknown, maxLength: number) {
  if (typeof value !== 'string') return null
  return value.trim().slice(0, maxLength) || null
}

function integerValue(value: unknown) {
  const parsed = typeof value === 'number' ? value : Number(String(value || ''))
  return Number.isInteger(parsed) ? parsed : null
}
