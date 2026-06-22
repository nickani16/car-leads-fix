import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const TERMS_VERSION = 'marketplace-terms-v1.0-2026-06-22'
const PRIVACY_VERSION = 'marketplace-privacy-v1.0-2026-06-22'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>
    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')
    const displayName = String(body.displayName || '').trim()
    const phone = String(body.phone || '').trim()
    const countryCode = String(body.countryCode || '').trim().toUpperCase()
    const accountType = body.accountType === 'business' ? 'business' : 'private'
    const companyName = String(body.companyName || '').trim()
    const registrationNumber = String(body.registrationNumber || '').trim()
    const locale = String(body.locale || 'en').slice(0, 5)

    if (
      !email ||
      password.length < 10 ||
      !displayName ||
      !phone ||
      !/^[A-Z]{2}$/.test(countryCode) ||
      (accountType === 'business' && (!companyName || !registrationNumber)) ||
      body.acceptedTerms !== true
    ) {
      return NextResponse.json(
        { error: 'Complete all required fields and accept the marketplace terms.' },
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
        { error: error?.message || 'The account could not be created.' },
        { status: 409 },
      )
    }

    const { error: profileError } = await admin.from('marketplace_profiles').insert({
      user_id: data.user.id,
      account_type: accountType,
      display_name: displayName,
      legal_name: displayName,
      email,
      phone,
      country_code: countryCode,
      company_name: accountType === 'business' ? companyName : null,
      registration_number:
        accountType === 'business' ? registrationNumber : null,
      locale,
      terms_version: TERMS_VERSION,
      privacy_version: PRIVACY_VERSION,
    })

    if (profileError) {
      await admin.auth.admin.deleteUser(data.user.id)
      throw profileError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Marketplace registration failed', error)
    return NextResponse.json(
      { error: 'The account could not be created.' },
      { status: 500 },
    )
  }
}
