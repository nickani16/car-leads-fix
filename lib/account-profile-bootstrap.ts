import 'server-only'

import type { User } from '@supabase/supabase-js'
import { ACCOUNT_INTENT_COOKIE, readAccountIntent, type AccountIntentDetails } from './account-intent'
import { activeMarketCountryCodes } from './eu-countries'
import { MARKETPLACE_PRIVACY_VERSION } from './marketplace-security'
import { countryForLocale } from './market-locale'
import type { PublicLocale } from './public-i18n'
import { createAdminClient } from './supabase/admin'

const PENDING_TERMS_VERSION = 'pending-profile-completion'

export type MarketplaceProfileBootstrapResult = {
  accountType: 'private' | 'business'
  created: boolean
  profileComplete: boolean
}

export function accountIntentFromRequest(request: Request, user?: User | null): AccountIntentDetails {
  const cookieHeader = request.headers.get('cookie') || ''
  const cookieValue = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ACCOUNT_INTENT_COOKIE}=`))
    ?.slice(ACCOUNT_INTENT_COOKIE.length + 1)

  return accountIntentFromCookieAndUser(cookieValue, user)
}

export function accountIntentFromCookieAndUser(
  cookieValue: unknown,
  user?: User | null,
): AccountIntentDetails {
  const cookieIntent = readAccountIntent(cookieValue)
  const metadata = (user?.user_metadata || {}) as Record<string, unknown>
  const metadataType =
    metadata.autorell_account_type === 'business' || metadata.autorell_account_type === 'private'
      ? metadata.autorell_account_type
      : null

  return {
    accountType: metadataType || cookieIntent.accountType,
    companyName: clean(metadata.autorell_company_name) || cookieIntent.companyName,
    registrationNumber:
      clean(metadata.autorell_registration_number) || cookieIntent.registrationNumber,
  }
}

export async function ensureMarketplaceProfile({
  user,
  locale,
  intent,
}: {
  user: User
  locale: PublicLocale
  intent: AccountIntentDetails
}): Promise<MarketplaceProfileBootstrapResult> {
  if (!user.email) throw new Error('A verified email address is required to create an account profile.')

  const admin = createAdminClient()
  const { data: existing, error: existingError } = await admin
    .from('marketplace_profiles')
    .select('account_type,company_id,first_name,last_name,phone,address_line_1,postal_code,city,birth_date,company_name,registration_number')
    .eq('user_id', user.id)
    .maybeSingle()
  if (existingError) throw existingError
  if (existing) {
    if (existing.account_type === 'business' && existing.company_id) {
      const { error: membershipError } = await admin.from('marketplace_company_members').upsert({
        company_id: existing.company_id,
        user_id: user.id,
        role: 'owner',
      }, { onConflict: 'company_id,user_id', ignoreDuplicates: true })
      if (membershipError) throw membershipError
    }
    return {
      accountType: existing.account_type === 'business' ? 'business' : 'private',
      created: false,
      profileComplete: isMarketplaceProfileComplete(existing),
    }
  }

  const accountType = intent.accountType
  const companyName = clean(intent.companyName)
  const registrationNumber = clean(intent.registrationNumber)
  if (accountType === 'business' && (!companyName || !registrationNumber)) {
    throw new Error('Business name and registration identifier are required for a business account.')
  }

  const countryCode = defaultCountryCode(locale)
  const email = user.email.trim().toLowerCase()
  const fallbackName = oauthDisplayName(user) || email.split('@')[0] || 'Autorell'
  let companyId: string | null = null

  if (accountType === 'business') {
    const { data: company, error: companyError } = await admin
      .from('marketplace_companies')
      .insert({
        name: companyName,
        registration_number: registrationNumber,
        country_code: countryCode,
        contact_email: email,
        created_by: user.id,
      })
      .select('id')
      .single()
    if (companyError) throw companyError
    companyId = company.id
  }

  const { error: profileError } = await admin.from('marketplace_profiles').insert({
    user_id: user.id,
    account_type: accountType,
    display_name: accountType === 'business' ? companyName : fallbackName,
    email,
    phone: '',
    country_code: countryCode,
    company_name: accountType === 'business' ? companyName : null,
    registration_number: accountType === 'business' ? registrationNumber : null,
    company_id: companyId,
    locale,
    terms_version: PENDING_TERMS_VERSION,
    privacy_version: MARKETPLACE_PRIVACY_VERSION,
    identity_status: 'pending',
    business_verification_status: accountType === 'business' ? 'pending' : null,
    business_onboarding_status: accountType === 'business' ? 'draft' : null,
  })

  if (profileError) {
    if (companyId) await admin.from('marketplace_companies').delete().eq('id', companyId)
    throw profileError
  }

  if (companyId) {
    const { error: membershipError } = await admin.from('marketplace_company_members').upsert({
      company_id: companyId,
      user_id: user.id,
      role: 'owner',
    }, { onConflict: 'company_id,user_id' })
    if (membershipError) throw membershipError
  }

  return { accountType, created: true, profileComplete: false }
}

export function isMarketplaceProfileComplete(profile: Record<string, unknown> | null | undefined) {
  if (!profile) return false
  const commonComplete = Boolean(
    clean(profile.first_name) &&
      clean(profile.last_name) &&
      clean(profile.phone) &&
      clean(profile.address_line_1) &&
      clean(profile.postal_code) &&
      clean(profile.city),
  )
  if (!commonComplete) return false
  if (profile.account_type === 'business') {
    return Boolean(clean(profile.company_name) && clean(profile.registration_number))
  }
  return Boolean(clean(profile.birth_date))
}

function defaultCountryCode(locale: PublicLocale) {
  const countryCode = countryForLocale(locale)
  return activeMarketCountryCodes.has(countryCode) ? countryCode : 'DE'
}

function oauthDisplayName(user: User) {
  const metadata = user.user_metadata as Record<string, unknown>
  return clean(metadata.full_name) || clean(metadata.name)
}

function clean(value: unknown) {
  return String(value || '').trim()
}
