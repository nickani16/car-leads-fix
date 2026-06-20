import { notFound, redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import DealerListingEditForm from './DealerListingEditForm'

export default async function DealerListingEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: dealer } = await admin
    .from('dealers')
    .select('id,status')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!dealer || dealer.status !== 'approved') redirect('/login?status=pending')

  const { data: listing } = await admin
    .from('leads')
    .select(
      'id,reg,vin,make,model,variant,model_year,first_registration,miles,color,body_type,fuel_type,gearbox,drivetrain,power_hp,engine_size,owners,keys_count,inspection_valid_until,service,damage,warnings,tires,tireset,towbar,finance_status,damage_description,equipment,is_driveable,has_engine_transmission_issues,has_fluid_leaks,has_serious_collision_damage,origin_country,pickup_city,pickup_postal_code,seller_target_price,status,seller_dealer_id,submission_type,images'
    )
    .eq('id', id)
    .eq('seller_dealer_id', dealer.id)
    .maybeSingle()
  if (!listing || listing.submission_type !== 'dealer_marketplace') notFound()

  const [{ count: bidCount }, { count: dealCount }] = await Promise.all([
    admin
      .from('bids')
      .select('id', { count: 'exact', head: true })
      .eq('lead_id', id),
    admin
      .from('deals')
      .select('id', { count: 'exact', head: true })
      .eq('lead_id', id),
  ])
  const editable = (bidCount || 0) === 0 && (dealCount || 0) === 0

  return (
    <DealerListingEditForm
      listing={{
        ...listing,
        mileageKm: Number(listing.miles || 0) * 10,
        imageCount: Array.isArray(listing.images) ? listing.images.length : 0,
      }}
      editable={editable}
    />
  )
}
