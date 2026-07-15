import { createHmac } from 'node:crypto'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { sendAdminNotificationEmail } from '@/lib/email/admin-notifications'
import { euCountryCodes } from '@/lib/eu-countries'
import {
  accountConfirmationKeys,
  businessAccountConfirmationKeys,
  MARKETPLACE_PRIVACY_VERSION,
  MARKETPLACE_PURCHASE_TERMS_VERSION,
  MARKETPLACE_TERMS_VERSION,
} from '@/lib/marketplace-security'
import { phoneRiskStatus, validatePhoneForCountry } from '@/lib/phone-verification'

function clean(value: unknown) {
  return String(value || '').trim()
}

function normalizeIdentifier(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

const freeEmailDomains = new Set([
  'gmail.com',
  'googlemail.com',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'msn.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'yahoo.com',
  'proton.me',
  'protonmail.com',
])

function normalizeWebsite(value: unknown) {
  const raw = clean(value)
  if (!raw) return ''
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`)
    return url.origin.replace(/\/$/, '')
  } catch {
    return ''
  }
}

function domainFromEmail(email: string) {
  return email.split('@')[1]?.toLowerCase() || ''
}

function domainFromWebsite(website: string) {
  if (!website) return ''
  try {
    return new URL(website).hostname.toLowerCase().replace(/^www\./, '')
  } catch {
    return ''
  }
}

function domainsMatch(emailDomain: string, websiteDomain: string) {
  if (!emailDomain || !websiteDomain || freeEmailDomains.has(emailDomain)) return false
  return emailDomain === websiteDomain || emailDomain.endsWith(`.${websiteDomain}`)
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
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user?.email) {
      return NextResponse.json(
        { error: 'Logga in med e-postkoden innan du skapar profilen.' },
        { status: 401 },
      )
    }
    if (!user.email_confirmed_at) {
      return NextResponse.json(
        { error: 'Bekräfta mejladressen med koden innan du skapar profilen.' },
        { status: 403 },
      )
    }
    const body = (await request.json()) as Record<string, unknown>
    const email = user.email.toLowerCase()
    const firstName = clean(body.firstName)
    const lastName = clean(body.lastName)
    const displayName = `${firstName} ${lastName}`.trim()
    const birthDate = clean(body.birthDate)
    const countryCode = clean(body.countryCode).toUpperCase()
    const phoneValidation = validatePhoneForCountry(body.phone, countryCode)
    const phone = phoneValidation.phone
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
    const websiteUrl = normalizeWebsite(body.websiteUrl)
    const locale = clean(body.locale || 'en').slice(0, 5)
    const confirmations =
      accountType === 'business'
        ? {
            business_right_to_sell: body.confirmedBusinessRightToSell === true,
            marketplace_terms: body.acceptedMarketplaceTerms === true,
            purchase_terms: body.acceptedPurchaseTerms === true,
            privacy_policy: body.acceptedPrivacyPolicy === true,
          }
        : {
            adult_18: body.adult18 === true,
            marketplace_terms: body.acceptedMarketplaceTerms === true,
            purchase_terms: body.acceptedPurchaseTerms === true,
            privacy_policy: body.acceptedPrivacyPolicy === true,
            right_to_sell_only: body.confirmedRightToSellOnly === true,
          }
    const requiredConfirmations =
      accountType === 'business'
        ? businessAccountConfirmationKeys
        : accountConfirmationKeys

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      firstName.length < 2 ||
      lastName.length < 2 ||
      (accountType === 'private' && !isAdult(birthDate)) ||
      (accountType === 'business' && birthDate && !isAdult(birthDate)) ||
      !phoneValidation.valid ||
      !euCountryCodes.has(countryCode) ||
      !addressLine1 ||
      !postalCode ||
      !city ||
      (accountType === 'private' && !validateNationalId(countryCode, nationalId)) ||
      (accountType === 'business' && (!companyName || !(registrationNumber || vatNumber))) ||
      requiredConfirmations.some((key) => confirmations[key] !== true)
    ) {
      return NextResponse.json(
        {
          error:
            accountType === 'business'
              ? 'Kontrollera kontaktperson, företagsnamn, organisationsnummer, adress, telefonnummer och villkor.'
              : 'Kontrollera namn, ålder, adress, telefonnummer och identitetsuppgifter.',
        },
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

    const admin = createAdminClient()
    const { data: existingProfile } = await admin
      .from('marketplace_profiles')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle()
    if (existingProfile) {
      return NextResponse.json(
        { error: 'Det finns redan en profil för kontot.' },
        { status: 409 },
      )
    }

    await admin.auth.admin.updateUserById(user.id, {
      email_confirm: true,
      user_metadata: { display_name: displayName, account_type: accountType },
    })

    const emailDomain = domainFromEmail(email)
    const websiteDomain = domainFromWebsite(websiteUrl)
    const domainMatch = domainsMatch(emailDomain, websiteDomain)
    const identityStatus = accountType === 'private' ? 'verified' : 'pending'
    const phoneFlags = phoneValidation.riskFlags
    const profileRiskStatus = phoneRiskStatus(phoneFlags)
    // marketplace_profiles only accepts the verification states defined by the
    // identity/safety schema (pending, needs_review, verified, ...). Keep the
    // workflow state in business_onboarding_status; do not write the listing
    // lifecycle value `pending_review` into this column.
    const businessVerificationStatus =
      accountType === 'business' ? 'pending' : null
    const businessOnboardingStatus =
      accountType === 'business' ? 'under_review' : null

    let companyId: string | null = null
    if (accountType === 'business') {
      const { data: existingCompany } = await admin
        .from('marketplace_companies')
        .select('id')
        .eq('created_by', user.id)
        .maybeSingle()

      if (existingCompany?.id) {
        companyId = existingCompany.id
      } else {
        const { data: company, error: companyError } = await admin
          .from('marketplace_companies')
          .insert({
            name: companyName,
            registration_number: registrationNumber || vatNumber,
            vat_number: vatNumber || null,
            country_code: countryCode,
            website_url: websiteUrl || null,
            phone,
            address_line_1: addressLine1,
            address_line_2: addressLine2 || null,
            postal_code: postalCode,
            city,
            region: region || null,
            contact_name: displayName,
            contact_email: email,
            contact_phone: phone,
            verification_status: businessVerificationStatus,
            domain_match: domainMatch,
            created_by: user.id,
          })
          .select('id')
          .single()
        if (companyError || !company) throw companyError
        companyId = company.id
        try {
          await sendAdminNotificationEmail({
            admin,
            notificationType: 'company_application',
            title: 'Ny företagsansökan',
            body: `${companyName} (${countryCode}) väntar på granskning.`,
            actionUrl: `/admin/companies?company=${company.id}`,
            origin: new URL(request.url).origin,
          })
        } catch (notificationError) {
          console.error('Company application admin email failed', notificationError)
        }
      }
    }

    const { error: profileError } = await admin.from('marketplace_profiles').insert({
      user_id: user.id,
      account_type: accountType,
      display_name: displayName,
      legal_name: displayName,
      first_name: firstName,
      last_name: lastName,
      birth_date: birthDate || null,
      email,
      phone,
      phone_verified: false,
      phone_verification_status: phoneValidation.status,
      phone_risk_flags: phoneFlags,
      country_code: countryCode,
      company_name: accountType === 'business' ? companyName : null,
      registration_number: accountType === 'business' ? registrationNumber : null,
      vat_number: accountType === 'business' ? vatNumber || null : null,
      website_url: accountType === 'business' ? websiteUrl || null : null,
      company_id: companyId,
      company_domain_match: accountType === 'business' ? domainMatch : false,
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
      business_onboarding_status: businessOnboardingStatus,
      risk_status: profileRiskStatus,
      vat_verified_at: vatCheck.status === 'passed' ? new Date().toISOString() : null,
      verified_at: user.email_confirmed_at || new Date().toISOString(),
      verification_updated_at: new Date().toISOString(),
      locale,
      terms_version: MARKETPLACE_TERMS_VERSION,
      privacy_version: MARKETPLACE_PRIVACY_VERSION,
    })

    if (profileError) throw profileError

    if (accountType === 'business' && companyId) {
      await admin.from('marketplace_company_members').insert({
        company_id: companyId,
        user_id: user.id,
        role: 'contact_person',
      })
    }

    await admin.from('marketplace_identity_checks').insert({
      user_id: user.id,
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

    await admin.from('marketplace_identity_checks').insert({
      user_id: user.id,
      check_type: 'phone_format',
      country_code: countryCode,
      status: phoneValidation.valid ? 'passed' : 'failed',
      provider: 'autorell-phone-format',
      reference: phone.slice(-4),
      metadata: {
        phone_verified_with_code: false,
        risk_flags: phoneFlags,
      },
    })

    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      null
    const userAgent = request.headers.get('user-agent')?.slice(0, 1000) || null
    await admin.from('marketplace_legal_acceptances').insert(
      requiredConfirmations.map((key) => ({
        user_id: user.id,
        acceptance_scope:
          key === 'privacy_policy'
            ? 'privacy'
            : key === 'purchase_terms'
              ? 'purchase'
              : 'account',
        acceptance_key: key,
        accepted: true,
        terms_version:
          key === 'privacy_policy'
            ? MARKETPLACE_PRIVACY_VERSION
            : key === 'purchase_terms'
              ? MARKETPLACE_PURCHASE_TERMS_VERSION
              : MARKETPLACE_TERMS_VERSION,
        ip_address: ipAddress,
        user_agent: userAgent,
        metadata: { account_type: accountType, locale },
      })),
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Marketplace registration failed', error)
    return NextResponse.json(
      { error: 'Kontot kunde inte skapas. Försök igen eller kontakta support.' },
      { status: 500 },
    )
  }
}
