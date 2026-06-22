import { createHmac } from 'node:crypto'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { euCountryCodes } from '@/lib/eu-countries'

const TERMS_VERSION = 'marketplace-terms-v1.1-2026-06-22'
const PRIVACY_VERSION = 'marketplace-privacy-v1.1-2026-06-22'

function clean(value: unknown) {
  return String(value || '').trim()
}

function normalizeIdentifier(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

function isAdult(dateValue: string) {
  const birthDate = new Date(`${dateValue}T00:00:00Z`)
  if (Number.isNaN(birthDate.getTime())) return false
  const today = new Date()
  const adultDate = new Date(Date.UTC(
    today.getUTCFullYear() - 18,
    today.getUTCMonth(),
    today.getUTCDate(),
  ))
  return birthDate <= adultDate && birthDate.getUTCFullYear() >= 1900
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

function validateNationalId(countryCode: string, value: string) {
  const normalized = normalizeIdentifier(value)
  if (normalized.length < 6 || normalized.length > 24) return false
  if (countryCode === 'SE') return passesSwedishPersonalNumber(normalized)
  return /[0-9]/.test(normalized)
}

async function validateVat(countryCode: string, vatNumber: string) {
  const normalized = normalizeIdentifier(vatNumber).replace(new RegExp(`^${countryCode}`), '')
  if (!normalized) return { status: 'pending' as const, reference: null }
  const envelope = `<?xml version="1.0" encoding="UTF-8"?>
    <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns1="urn:ec.europa.eu:taxud:vies:services:checkVat:types">
      <soap:Body><tns1:checkVat><tns1:countryCode>${countryCode}</tns1:countryCode><tns1:vatNumber>${normalized}</tns1:vatNumber></tns1:checkVat></soap:Body>
    </soap:Envelope>`
  try {
    const response = await fetch(
      'https://ec.europa.eu/taxation_customs/vies/services/checkVatService',
      {
        method: 'POST',
        headers: { 'Content-Type': 'text/xml; charset=utf-8' },
        body: envelope,
        signal: AbortSignal.timeout(6000),
      },
    )
    const text = await response.text()
    const valid = /<valid>\s*true\s*<\/valid>/i.test(text)
    return {
      status: valid ? 'passed' as const : 'failed' as const,
      reference: `${countryCode}${normalized}`,
    }
  } catch {
    return { status: 'unavailable' as const, reference: `${countryCode}${normalized}` }
  }
}

export async function POST(request: Request) {
  let createdUserId: string | null = null
  try {
    const body = (await request.json()) as Record<string, unknown>
    const email = clean(body.email).toLowerCase()
    const password = String(body.password || '')
    const firstName = clean(body.firstName)
    const lastName = clean(body.lastName)
    const displayName = `${firstName} ${lastName}`.trim()
    const birthDate = clean(body.birthDate)
    const phone = clean(body.phone).replace(/[\s()-]/g, '')
    const countryCode = clean(body.countryCode).toUpperCase()
    const addressLine1 = clean(body.addressLine1)
    const addressLine2 = clean(body.addressLine2)
    const postalCode = clean(body.postalCode)
    const city = clean(body.city)
    const region = clean(body.region)
    const accountType = body.accountType === 'business' ? 'business' : 'private'
    const nationalId = clean(body.nationalId)
    const companyName = clean(body.companyName)
    const registrationNumber = clean(body.registrationNumber)
    const vatNumber = clean(body.vatNumber)
    const locale = clean(body.locale || 'en').slice(0, 5)

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      password.length < 10 ||
      firstName.length < 2 ||
      lastName.length < 2 ||
      !isAdult(birthDate) ||
      !/^\+[1-9]\d{7,14}$/.test(phone) ||
      !euCountryCodes.has(countryCode) ||
      !addressLine1 ||
      !postalCode ||
      !city ||
      (accountType === 'private' && !validateNationalId(countryCode, nationalId)) ||
      (accountType === 'business' && (!companyName || !registrationNumber)) ||
      body.acceptedTerms !== true
    ) {
      return NextResponse.json(
        { error: 'Kontrollera namn, ålder, adress, telefonnummer och identitetsuppgifter.' },
        { status: 400 },
      )
    }

    const normalizedNationalId =
      accountType === 'private' ? normalizeIdentifier(nationalId) : ''
    const identifierSecret =
      process.env.MARKETPLACE_IDENTITY_HASH_SECRET ||
      process.env.SUPABASE_SERVICE_ROLE_KEY
    if (accountType === 'private' && !identifierSecret) {
      throw new Error('Identity hashing is not configured.')
    }
    const nationalIdHash = normalizedNationalId
      ? createHmac('sha256', identifierSecret!).update(`${countryCode}:${normalizedNationalId}`).digest('hex')
      : null
    const vatCheck =
      accountType === 'business' && vatNumber
        ? await validateVat(countryCode, vatNumber)
        : { status: 'pending' as const, reference: null }

    if (vatCheck.status === 'failed') {
      return NextResponse.json(
        { error: 'VAT-numret kunde inte valideras mot EU VIES. Kontrollera numret.' },
        { status: 400 },
      )
    }

    const admin = createAdminClient()
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: displayName, account_type: accountType },
    })

    if (error || !data.user) {
      return NextResponse.json(
        { error: error?.message || 'Kontot kunde inte skapas.' },
        { status: 409 },
      )
    }
    createdUserId = data.user.id

    const identityStatus = accountType === 'private' ? 'format_validated' : 'pending'
    const businessVerificationStatus =
      accountType === 'business'
        ? vatCheck.status === 'passed'
          ? 'vat_validated'
          : 'pending'
        : null

    const { error: profileError } = await admin.from('marketplace_profiles').insert({
      user_id: data.user.id,
      account_type: accountType,
      display_name: displayName,
      legal_name: displayName,
      first_name: firstName,
      last_name: lastName,
      birth_date: birthDate,
      email,
      phone,
      country_code: countryCode,
      company_name: accountType === 'business' ? companyName : null,
      registration_number: accountType === 'business' ? registrationNumber : null,
      vat_number: accountType === 'business' ? vatNumber || null : null,
      address_line_1: addressLine1,
      address_line_2: addressLine2 || null,
      registered_address: [addressLine1, addressLine2].filter(Boolean).join(', '),
      city,
      postal_code: postalCode,
      region: region || null,
      national_id_hash: nationalIdHash,
      national_id_last4: normalizedNationalId ? normalizedNationalId.slice(-4) : null,
      identity_status: identityStatus,
      business_verification_status: businessVerificationStatus,
      vat_verified_at: vatCheck.status === 'passed' ? new Date().toISOString() : null,
      verification_updated_at: new Date().toISOString(),
      locale,
      terms_version: TERMS_VERSION,
      privacy_version: PRIVACY_VERSION,
    })

    if (profileError) throw profileError

    await admin.from('marketplace_identity_checks').insert({
      user_id: data.user.id,
      check_type: accountType === 'private' ? 'private_id_format' : 'business_vat',
      country_code: countryCode,
      status:
        accountType === 'private'
          ? 'passed'
          : vatCheck.status,
      provider: accountType === 'private' ? 'autorell-format-check' : 'eu-vies',
      reference:
        accountType === 'private'
          ? normalizedNationalId.slice(-4)
          : vatCheck.reference,
      metadata: { raw_identifier_stored: false },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Marketplace registration failed', error)
    if (createdUserId) {
      await createAdminClient().auth.admin.deleteUser(createdUserId)
    }
    return NextResponse.json(
      { error: 'Kontot kunde inte skapas. Försök igen eller kontakta support.' },
      { status: 500 },
    )
  }
}
