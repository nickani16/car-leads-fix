import Link from 'next/link'
import { requireAdmin } from '@/lib/admin-auth'
import AdminEntityActions from '../AdminEntityActions'
import {
  AdminEmpty,
  AdminFilters,
  AdminPageHeader,
  AdminPagination,
  AdminTable,
  Badge,
  FilterSelect,
} from '../AdminUI'
import {
  AdminSearchParams,
  categoryLabel,
  formatNumber,
  getPage,
  getParam,
  pageRange,
  queryToUrlSearchParams,
  statusTone,
} from '../admin-helpers'

export const dynamic = 'force-dynamic'

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: AdminSearchParams
}) {
  const params = await searchParams
  const q = getParam(params, 'q')
  const status = getParam(params, 'status')
  const category = getParam(params, 'category')
  const country = getParam(params, 'country').toUpperCase()
  const date = getParam(params, 'date')
  const page = getPage(params)
  const { from, to } = pageRange(page)
  const { adminClient } = await requireAdmin()
  let matchingSellerIds: string[] = []
  if (q) {
    const escaped = q.replace(/[%_,]/g, '')
    const { data: sellerMatches } = await adminClient
      .from('marketplace_profiles')
      .select('user_id')
      .or(`email.ilike.%${escaped}%,phone.ilike.%${escaped}%,display_name.ilike.%${escaped}%,company_name.ilike.%${escaped}%`)
      .limit(100)
    matchingSellerIds = (sellerMatches || []).map((match) => match.user_id)
  }

  let query = adminClient
    .from('marketplace_listings')
    .select(
      'id,title,category,status,review_status,country_code,city,price,currency,seller_name,seller_type,seller_user_id,vin,chassis_number,registration_reference,created_at,updated_at',
      { count: 'exact' },
    )
    .order('created_at', { ascending: false })
    .range(from, to)

  if (status) query = query.eq('status', status)
  if (category) query = query.eq('category', category)
  if (country) query = query.eq('country_code', country)
  if (date === 'today') {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    query = query.gte('created_at', start.toISOString())
  }
  if (q) {
    const escaped = q.replace(/[%_,]/g, '')
    const searchParts = [
      `title.ilike.%${escaped}%`,
      `category.ilike.%${escaped}%`,
      `country_code.ilike.%${escaped}%`,
      `city.ilike.%${escaped}%`,
      `seller_name.ilike.%${escaped}%`,
      `vin.ilike.%${escaped}%`,
      `chassis_number.ilike.%${escaped}%`,
      `registration_reference.ilike.%${escaped}%`,
    ]
    if (matchingSellerIds.length) {
      searchParts.push(`seller_user_id.in.(${matchingSellerIds.join(',')})`)
    }
    query = query.or(searchParts.join(','))
  }

  const { data: listings, count } = await query
  const urlQuery = queryToUrlSearchParams(params)

  return (
    <main className="px-4 py-7 sm:px-6 lg:px-8">
      <AdminPageHeader
        eyebrow="Marketplace"
        title="Annonser"
        description="Sök på titel, kategori, land, stad, säljare, regnummer och VIN. Annonser publiceras utan manuell kö men kan flaggas, avpubliceras eller mjukraderas här."
      />

      <AdminFilters search={q} searchPlaceholder="Sök titel, kategori, land, stad, säljare, regnummer eller VIN">
        <FilterSelect
          name="status"
          value={status}
          label="Status"
          options={[
            { value: 'published', label: 'Publicerad' },
            { value: 'pending_payment', label: 'Väntar betalning' },
            { value: 'paused', label: 'Pausad' },
            { value: 'rejected', label: 'Avvisad' },
            { value: 'expired', label: 'Utgången' },
          ]}
        />
        <FilterSelect
          name="category"
          value={category}
          label="Kategori"
          options={[
            { value: 'cars', label: 'Bilar' },
            { value: 'vans', label: 'Transportbilar' },
            { value: 'motorcycles', label: 'Motorcyklar' },
            { value: 'motorhomes', label: 'Husbilar' },
            { value: 'caravans', label: 'Husvagnar' },
            { value: 'trucks', label: 'Lastbilar' },
            { value: 'agriculture', label: 'Lantbruk' },
            { value: 'construction', label: 'Entreprenad' },
            { value: 'electric-bikes', label: 'Cyklar' },
            { value: 'e-scooters', label: 'Sparkcyklar' },
          ]}
        />
        <FilterSelect
          name="country"
          value={country}
          label="Land"
          options={[
            { value: 'SE', label: 'Sverige' },
            { value: 'DE', label: 'Tyskland' },
            { value: 'DK', label: 'Danmark' },
            { value: 'NL', label: 'Nederländerna' },
            { value: 'FR', label: 'Frankrike' },
          ]}
        />
        <FilterSelect
          name="date"
          value={date}
          label="Datum"
          options={[{ value: 'today', label: 'Idag' }]}
        />
      </AdminFilters>

      {!listings?.length ? (
        <AdminEmpty text="Inga annonser matchar filtret." />
      ) : (
        <>
          <div className="mb-3 text-sm text-[#667085]">
            {formatNumber(count || 0)} annonser
          </div>
          <AdminTable columns={['Annons', 'Kategori', 'Säljare', 'Plats', 'Pris', 'Status', 'Actions']}>
            {listings.map((listing) => (
              <tr key={listing.id} className="align-top hover:bg-[#f8fafc]">
                <td className="px-4 py-4">
                  <Link href={`/admin/listings/${listing.id}`} className="font-bold text-[#101828] hover:text-[#0866ff]">
                    {listing.title}
                  </Link>
                  <p className="mt-1 text-xs text-[#667085]">
                    VIN: {listing.vin || listing.chassis_number || 'saknas'} · Reg: {listing.registration_reference || 'saknas'}
                  </p>
                </td>
                <td className="px-4 py-4 text-[#475467]">{categoryLabel(listing.category)}</td>
                <td className="px-4 py-4">
                  <Link href={`/admin/users/${listing.seller_user_id}`} className="font-semibold text-[#344054] hover:text-[#0866ff]">
                    {listing.seller_name}
                  </Link>
                  <p className="mt-1 text-xs text-[#667085]">{listing.seller_type}</p>
                </td>
                <td className="px-4 py-4 text-[#475467]">
                  {listing.city || 'Saknas'}, {listing.country_code || '--'}
                </td>
                <td className="px-4 py-4 font-bold">
                  {formatNumber(Number(listing.price))} {listing.currency}
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge label={listing.status || 'okänd'} tone={statusTone(listing.status)} />
                    <Badge label={listing.review_status || 'ej satt'} tone={statusTone(listing.review_status)} />
                  </div>
                </td>
                <td className="px-4 py-4">
                  <AdminEntityActions
                    endpoint={`/api/admin/marketplace-listings/${listing.id}`}
                    actions={[
                      { action: 'mark_suspicious', label: 'Misstänkt', requiresReason: true },
                      {
                        action: 'unpublish',
                        label: 'Avpublicera',
                        tone: 'danger',
                        requiresReason: true,
                      },
                      {
                        action: 'delete',
                        label: 'Radera',
                        tone: 'danger',
                        requiresReason: true,
                        confirmTitle: 'Radera annons',
                        confirmText: 'Annonsen mjukraderas och döljs från publika sökresultat. Åtgärden loggas.',
                      },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </AdminTable>
          <AdminPagination
            page={page}
            hasNext={(count || 0) > to + 1}
            basePath="/admin/listings"
            query={urlQuery}
          />
        </>
      )}
    </main>
  )
}
