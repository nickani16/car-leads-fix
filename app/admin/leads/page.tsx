import Link from 'next/link'
import { ArrowRight, Mail, Phone } from 'lucide-react'
import { requireAdmin } from '@/lib/admin-auth'
import { formatStockholmTimestamp } from '@/lib/date-time'
import {
  AdminEmpty,
  AdminFilters,
  AdminPageHeader,
  Badge,
  FilterSelect,
} from '../AdminUI'

type SearchParams = Promise<{
  q?: string
  country?: string
  status?: string
  type?: 'private_bid' | 'dealer_marketplace'
}>

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const { adminClient } = await requireAdmin()
  const query = (params.q || '').trim().toLowerCase()
  const safeQuery = query.replace(/[^a-z0-9åäöüé@+().\s-]/gi, ' ').trim()

  let filteredQuery = adminClient
    .from('leads')
    .select(
      'id,reg,make,model,model_year,miles,phone,email,status,source,origin_country,pickup_city,pickup_postal_code,created_at,submission_type'
    )
    .order('created_at', { ascending: false, nullsFirst: false })
    .limit(1000)

  if (safeQuery) {
    if (
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        safeQuery
      )
    ) {
      filteredQuery = filteredQuery.eq('id', safeQuery)
    } else {
      const searchPattern = `%${safeQuery}%`
      filteredQuery = filteredQuery.or(
        [
          `reg.ilike.${searchPattern}`,
          `make.ilike.${searchPattern}`,
          `model.ilike.${searchPattern}`,
          `email.ilike.${searchPattern}`,
          `phone.ilike.${searchPattern}`,
          `pickup_city.ilike.${searchPattern}`,
          `pickup_postal_code.ilike.${searchPattern}`,
        ].join(',')
      )
    }
  }

  if (params.status) {
    filteredQuery = filteredQuery.eq('status', params.status)
  }

  if (params.type) {
    filteredQuery = filteredQuery.eq('submission_type', params.type)
  }

  if (params.country) {
    filteredQuery = filteredQuery.or(
      `origin_country.eq.${params.country},source.eq.${params.country}`
    )
  }

  const [{ data }, { data: filterData }] = await Promise.all([
    filteredQuery,
    adminClient
      .from('leads')
      .select('status,source,origin_country,submission_type')
      .order('created_at', { ascending: false, nullsFirst: false })
      .limit(5000),
  ])

  const filtered = data || []
  const leads = filterData || []

  const countries = Array.from(
    new Set(
      leads
        .map((lead) => lead.origin_country || lead.source)
        .filter((value): value is string => Boolean(value))
    )
  ).sort()
  const statuses = Array.from(
    new Set(leads.map((lead) => lead.status || 'New'))
  ).sort()
  const pendingReviewCount = leads.filter(
    (lead) => lead.status === 'Pending review'
  ).length
  const privateCount = leads.filter(
    (lead) => lead.submission_type !== 'dealer_marketplace'
  ).length
  const dealerMarketplaceCount = leads.filter(
    (lead) => lead.submission_type === 'dealer_marketplace'
  ).length

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <AdminPageHeader
        eyebrow="Customer operations"
        title={
          params.type === 'private_bid'
            ? 'Private seller bids'
            : params.type === 'dealer_marketplace'
              ? 'Dealer marketplace'
              : 'All vehicle intake'
        }
        description="Private seller requests and dealer marketplace inventory are kept in separate operational channels."
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <ChannelLink
          href="/admin/leads"
          label="All intake"
          value={leads.length}
          active={!params.type}
        />
        <ChannelLink
          href="/admin/leads?type=private_bid"
          label="Private seller bids"
          value={privateCount}
          active={params.type === 'private_bid'}
        />
        <ChannelLink
          href="/admin/leads?type=dealer_marketplace"
          label="Dealer marketplace"
          value={dealerMarketplaceCount}
          active={params.type === 'dealer_marketplace'}
        />
      </div>

      <div className="mb-6 flex flex-col justify-between gap-4 rounded-[20px] border border-[#9bc9e4] bg-[#eef7fb] p-5 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-[#202124]">
            {pendingReviewCount} waiting for publication review
          </p>
          <p className="mt-1 text-sm text-[#617681]">
            Open a vehicle to approve or reject it before dealers can see it.
          </p>
        </div>
        <Link
          href={`/admin/leads?status=Pending%20review${
            params.type ? `&type=${params.type}` : ''
          }`}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#202124] px-5 text-sm text-white"
        >
          Show review queue
          <ArrowRight size={15} />
        </Link>
      </div>

      <AdminFilters
        search={params.q}
        searchPlaceholder="Search registration, make, model, email, phone, city or postal code"
      >
        {params.type && <input type="hidden" name="type" value={params.type} />}
        <FilterSelect
          name="country"
          value={params.country}
          label="All countries"
          options={countries.map((country) => ({
            value: country,
            label: country,
          }))}
        />
        <FilterSelect
          name="status"
          value={params.status}
          label="All statuses"
          options={statuses.map((status) => ({
            value: status,
            label: status,
          }))}
        />
      </AdminFilters>

      <div className="mb-4 flex items-center justify-between text-sm text-[#73797c]">
        <span>{filtered.length} leads found</span>
        <span>{leads.length} loaded</span>
      </div>

      {filtered.length ? (
        <div className="overflow-hidden rounded-[20px] border border-[#deddd7] bg-white shadow-[0_14px_45px_rgba(32,33,36,.05)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="border-b border-[#e5e3dd] bg-[#faf9f6] text-xs uppercase tracking-[0.1em] text-[#858a8c]">
                <tr>
                  <th className="px-5 py-4 font-medium">Vehicle</th>
                  <th className="px-5 py-4 font-medium">Customer</th>
                  <th className="px-5 py-4 font-medium">Country</th>
                  <th className="px-5 py-4 font-medium">Channel</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium">Submitted</th>
                  <th className="px-5 py-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#efede7]">
                {filtered.map((lead) => (
                  <tr
                    key={lead.id}
                    className={
                      lead.status === 'Pending review'
                        ? 'bg-[#f0f8fc] hover:bg-[#e8f5fb]'
                        : 'hover:bg-[#fcfbf8]'
                    }
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-[#242424]">
                        {lead.make || 'Unknown make'} {lead.model || ''}
                      </p>
                      <p className="mt-1 text-xs text-[#73797c]">
                        {lead.reg || 'No reg'} · {lead.model_year || 'No year'} ·{' '}
                        {lead.miles || 'No mileage'}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="flex items-center gap-2 text-xs">
                        <Mail size={13} /> {lead.email || 'No email'}
                      </p>
                      <p className="mt-1 flex items-center gap-2 text-xs">
                        <Phone size={13} /> {lead.phone || 'No phone'}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      {lead.origin_country || lead.source || 'Unknown'}
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        label={
                          lead.submission_type === 'dealer_marketplace'
                            ? 'Dealer marketplace'
                            : 'Private bids'
                        }
                        tone={
                          lead.submission_type === 'dealer_marketplace'
                            ? 'blue'
                            : 'amber'
                        }
                      />
                    </td>
                    <td className="px-5 py-4">
                      <Badge label={lead.status || 'New'} />
                    </td>
                    <td className="px-5 py-4 text-xs text-[#62686c]">
                      {formatStockholmTimestamp(lead.created_at)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/leads/${lead.id}`}
                        className="inline-flex items-center gap-2 rounded-full bg-[#242424] px-4 py-2 text-xs text-white"
                      >
                        {lead.status === 'Pending review' ? 'Review' : 'Open'}
                        <ArrowRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <AdminEmpty text="No leads match these filters." />
      )}
    </main>
  )
}

function ChannelLink({
  href,
  label,
  value,
  active,
}: {
  href: string
  label: string
  value: number
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={`rounded-[18px] border p-5 transition ${
        active
          ? 'border-[#8dbdd8] bg-[#eaf5fa] shadow-sm'
          : 'border-[#deddd7] bg-white hover:border-[#b9d5e4]'
      }`}
    >
      <span className="text-sm font-semibold">{label}</span>
      <strong className="mt-2 block text-2xl">{value}</strong>
    </Link>
  )
}
