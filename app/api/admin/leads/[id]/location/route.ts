import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = (await request.json()) as {
    city?: string
    postalCode?: string
    countryCode?: string
  }
  const city = body.city?.trim()
  const postalCode = body.postalCode?.trim().toUpperCase()
  const countryCode = body.countryCode?.trim().toUpperCase()

  if (!city || !postalCode || !countryCode || !/^[A-Z]{2}$/.test(countryCode)) {
    return NextResponse.json(
      { error: 'City, postal code and a two-letter country code are required.' },
      { status: 400 }
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
  }

  const adminClient = createAdminClient()
  const { data: adminUser } = await adminClient
    .from('admin_users')
    .select('role')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle()

  if (!adminUser || !['admin', 'super_admin'].includes(adminUser.role)) {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 403 })
  }

  const { error } = await adminClient
    .from('leads')
    .update({
      pickup_city: city,
      pickup_postal_code: postalCode,
      origin_country: countryCode,
      source: countryCode,
    })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
