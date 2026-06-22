import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })

  const body = (await request.json()) as Record<string, unknown>
  const profile = {
    display_name: String(body.displayName || '').trim(),
    legal_name: String(body.legalName || '').trim() || null,
    phone: String(body.phone || '').trim(),
    country_code: String(body.countryCode || '').trim().toUpperCase(),
    company_name: String(body.companyName || '').trim() || null,
    registration_number: String(body.registrationNumber || '').trim() || null,
    vat_number: String(body.vatNumber || '').trim() || null,
    registered_address: String(body.address || '').trim() || null,
    city: String(body.city || '').trim() || null,
    postal_code: String(body.postalCode || '').trim() || null,
    updated_at: new Date().toISOString(),
  }

  if (!profile.display_name || !profile.phone || !/^[A-Z]{2}$/.test(profile.country_code)) {
    return NextResponse.json({ error: 'Complete name, phone and country.' }, { status: 400 })
  }

  const { error } = await supabase
    .from('marketplace_profiles')
    .update(profile)
    .eq('user_id', user.id)

  return error
    ? NextResponse.json({ error: error.message }, { status: 400 })
    : NextResponse.json({ success: true })
}
