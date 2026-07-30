import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

const locationTypes = new Set(['headquarters', 'branch', 'storage', 'showroom', 'service', 'other'])

export async function GET() {
  try {
    const access = await getCompanyAccess()
    if (!access.allowed) return NextResponse.json({ error: access.error }, { status: access.status })

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('marketplace_company_locations')
      .select('id,name,slug,location_type,country_code,region,municipality,city,postal_code,address_line_1,contact_email,contact_phone,is_primary,is_active')
      .eq('company_id', access.companyId)
      .eq('is_active', true)
      .order('is_primary', { ascending: false })
      .order('name', { ascending: true })
      .limit(250)

    if (error) return tableError(error)
    return NextResponse.json({ locations: data || [] })
  } catch (error) {
    console.error('Company locations GET failed', error)
    return NextResponse.json({ error: 'Could not load company locations.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const access = await getCompanyAccess()
    if (!access.allowed) return NextResponse.json({ error: access.error }, { status: access.status })

    const body = await request.json().catch(() => ({})) as Record<string, unknown>
    const name = clean(body.name)
    const type = clean(body.locationType) || 'branch'
    const countryCode = clean(body.countryCode).toUpperCase() || access.countryCode || 'SE'
    const city = clean(body.city)
    if (!name) return NextResponse.json({ error: 'Location name is required.' }, { status: 400 })
    if (!city) return NextResponse.json({ error: 'City is required.' }, { status: 400 })
    if (!locationTypes.has(type)) return NextResponse.json({ error: 'Location type is not supported.' }, { status: 400 })

    const insert = {
      company_id: access.companyId,
      name,
      slug: slugify(name),
      location_type: type,
      country_code: countryCode,
      region: clean(body.region) || null,
      municipality: clean(body.municipality) || null,
      city,
      postal_code: clean(body.postalCode) || null,
      address_line_1: clean(body.addressLine1) || null,
      contact_email: clean(body.contactEmail) || null,
      contact_phone: clean(body.contactPhone) || null,
      is_primary: body.isPrimary === true,
      is_active: true,
      created_by: access.userId,
    }

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('marketplace_company_locations')
      .insert(insert)
      .select('id,name,location_type,country_code,region,municipality,city,postal_code,address_line_1,contact_email,contact_phone,is_primary,is_active')
      .single()

    if (error) return tableError(error)
    return NextResponse.json({ location: data })
  } catch (error) {
    console.error('Company locations POST failed', error)
    return NextResponse.json({ error: 'Could not save company location.' }, { status: 500 })
  }
}

async function getCompanyAccess() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { allowed: false as const, status: 401, error: 'Unauthorized' }

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('marketplace_profiles')
    .select('account_type,company_id,country_code')
    .eq('user_id', user.id)
    .maybeSingle()

  if (profile?.account_type !== 'business' || !profile.company_id) {
    return { allowed: false as const, status: 403, error: 'Business account is required.' }
  }

  return {
    allowed: true as const,
    userId: user.id,
    companyId: profile.company_id as string,
    countryCode: profile.country_code as string | null,
  }
}

function clean(value: unknown) {
  return String(value || '').trim().slice(0, 180)
}

function slugify(value: string) {
  const slug = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)
  return slug || `location-${Date.now()}`
}

function tableError(error: { code?: string; message?: string }) {
  if (error.code === '42P01' || /marketplace_company_locations/i.test(error.message || '')) {
    return NextResponse.json(
      { error: 'Company location storage is not active in production yet. Apply the Supabase migration and try again.' },
      { status: 503 },
    )
  }
  return NextResponse.json({ error: error.message || 'Company location request failed.' }, { status: 500 })
}
