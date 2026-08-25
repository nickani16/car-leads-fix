import { createHmac } from 'node:crypto'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { euCountryCodes } from '@/lib/eu-countries'
import { phoneRiskStatus, validatePhoneForCountry } from '@/lib/phone-verification'
import { normalizePlaceName } from '@/lib/place-name'
import { normalizeNationalId, reviewNationalId } from '@/lib/national-id'

function clean(value: unknown) {
  return String(value || '').trim()
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Inte inloggad.' }, { status: 401 })

  const admin = createAdminClient()
  const { data: existingProfile } = await admin
    .from('marketplace_profiles')
    .select('account_type,company_id,phone,national_id_hash,national_id_last4,identity_status')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!existingProfile) return NextResponse.json({ error: 'Profilen hittades inte.' }, { status: 404 })

  const body = (await request.json()) as Record<string, unknown>
  const firstName = clean(body.firstName)
  const lastName = clean(body.lastName)
  const countryCode = clean(body.countryCode).toUpperCase()
  const phoneValidation = validatePhoneForCountry(body.phone, countryCode)
  const phone = phoneValidation.phone
  const phoneChanged = Boolean(existingProfile.phone && existingProfile.phone !== phone)
  const phoneRiskFlags = phoneChanged
    ? Array.from(new Set([...phoneValidation.riskFlags, 'phone_changed_recently']))
    : phoneValidation.riskFlags
  const addressLine1 = clean(body.addressLine1)
  const addressLine2 = clean(body.addressLine2)
  const postalCode = clean(body.postalCode)
  const city = normalizePlaceName(body.city)
  const region = normalizePlaceName(body.region)
  const birthDate = clean(body.birthDate)
  const nationalId = clean(body.nationalId)
  const websiteUrl = clean(body.websiteUrl)
  const companyContactEmail = clean(body.companyContactEmail).toLowerCase()
  const companyContactPhone = clean(body.companyContactPhone)
  const companyContactEmailValid = !companyContactEmail || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(companyContactEmail)
  let identityUpdate: Record<string, unknown> = {}
  if (existingProfile.account_type === 'private' && nationalId) {
    const nationalIdReview = reviewNationalId(countryCode, nationalId)
    if (nationalIdReview.status === 'invalid') {
      return NextResponse.json(
        { code: 'profile_invalid_national_id', field: 'nationalId', error: 'Kontrollera identitetsnumrets format.' },
        { status: 400 },
      )
    }

    const identifierSecret =
      process.env.MARKETPLACE_IDENTITY_HASH_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!identifierSecret) throw new Error('Identity hashing is not configured.')

    const normalizedNationalId = normalizeNationalId(nationalId)
    const nationalIdHash = createHmac('sha256', identifierSecret)
      .update(`${countryCode}:${normalizedNationalId}`)
      .digest('hex')
    const { data: identityOwner, error: identityOwnerError } = await admin
      .from('marketplace_profiles')
      .select('user_id')
      .eq('country_code', countryCode)
      .eq('national_id_hash', nationalIdHash)
      .maybeSingle()
    if (identityOwnerError) throw identityOwnerError
    if (identityOwner && identityOwner.user_id !== user.id) {
      return NextResponse.json(
        { code: 'profile_national_id_in_use', field: 'nationalId', error: 'Identitetsuppgifterna är redan kopplade till ett annat konto.' },
        { status: 409 },
      )
    }

    identityUpdate = {
      national_id_hash: nationalIdHash,
      national_id_last4: normalizedNationalId.slice(-4),
      identity_status: nationalIdReview.status === 'passed' ? 'format_validated' : 'needs_review',
      verification_updated_at: new Date().toISOString(),
    }
  }
  const profile = {
    display_name: `${firstName} ${lastName}`.trim(),
    legal_name: `${firstName} ${lastName}`.trim(),
    first_name: firstName,
    last_name: lastName,
    birth_date: birthDate,
    phone,
    phone_verified: false,
    phone_verification_status: phoneValidation.status,
    phone_risk_flags: phoneRiskFlags,
    country_code: countryCode,
    company_name: clean(body.companyName) || null,
    registration_number: clean(body.registrationNumber) || null,
    vat_number: clean(body.vatNumber) || null,
    website_url: websiteUrl || null,
    address_line_1: addressLine1,
    address_line_2: addressLine2 || null,
    registered_address: [addressLine1, addressLine2].filter(Boolean).join(', '),
    city,
    region: region || null,
    postal_code: postalCode,
    risk_status: phoneRiskStatus(phoneRiskFlags),
    ...identityUpdate,
    updated_at: new Date().toISOString(),
  }

  if (
    firstName.length < 2 ||
    lastName.length < 2 ||
    !phoneValidation.valid ||
    !euCountryCodes.has(countryCode) ||
    !addressLine1 ||
    !postalCode ||
    !city ||
    (existingProfile.account_type === 'private' && !birthDate) ||
    (existingProfile.account_type === 'business' &&
      (!profile.company_name || !(profile.registration_number || profile.vat_number) || !companyContactEmailValid))
  ) {
    return NextResponse.json(
      { error: 'Fyll i namn, telefon, födelsedatum och fullständig adress.' },
      { status: 400 },
    )
  }

  const { error } = await supabase
    .from('marketplace_profiles')
    .update(profile)
    .eq('user_id', user.id)

  if (!error && existingProfile.account_type === 'business' && existingProfile.company_id) {
    await admin
      .from('marketplace_companies')
      .update({
        name: profile.company_name,
        registration_number: profile.registration_number || profile.vat_number,
        vat_number: profile.vat_number,
        country_code: countryCode,
        website_url: websiteUrl || null,
        phone: companyContactPhone || null,
        address_line_1: addressLine1,
        address_line_2: addressLine2 || null,
        postal_code: postalCode,
        city,
        region: region || null,
        contact_name: profile.display_name,
        contact_email: companyContactEmail || null,
        contact_phone: companyContactPhone || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingProfile.company_id)
  }

  if (!error) {
    await admin.from('marketplace_identity_checks').insert({
      user_id: user.id,
      check_type: 'phone_format',
      country_code: countryCode,
      status: phoneValidation.valid ? 'passed' : 'failed',
      provider: 'autorell-phone-format',
      reference: phone.slice(-4),
      metadata: {
        phone_verified_with_code: false,
        phone_changed: phoneChanged,
        risk_flags: phoneRiskFlags,
      },
    })
  }

  return error
    ? NextResponse.json({ error: error.message }, { status: 400 })
    : NextResponse.json({ success: true })
}
