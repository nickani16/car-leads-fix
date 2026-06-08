import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { requireAdmin } from '@/lib/admin-auth'
import {
  AdminEmpty,
  AdminFilters,
  AdminPageHeader,
  Badge,
  FilterSelect,
} from '../AdminUI'

type SearchParams = Promise<{
  q?: string
  state?: string
  country?: string
}>

function parseTime(value: string | null) {
  if (!value) return null
  const normalized = /[+-]\d{2}$/.test(value)
    ? `${value}:00`
    : /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value)
      ? value
      : `${value}Z`
  const time = new Date(normalized).getTime()
  return Number.isFinite(time) ? time : null
}

export default async function AdminAuctionsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const { adminClient } = await requireAdmin()
  const [{ data: leads }, { data: bids }, { data: deals }] = await Promise.all([
    adminClient
      .from('leads')
      .select(
        'id,reg,make,model,miles,origin_country,source,status,created_at'
      )
      .order('created_at', { ascending: false })
      .limit(1000),
    adminClient
      .from('bids')
      .select('id,lead_id,amount,created_at,is_winner'),
    adminClient.from('deals').select('id,lead_id,status'),
  ])

  const bidMap = new Map<string, typeof bids>()
  for (const bid of bids || []) {
    const current = bidMap.get(bid.lead_id) || []
    current.push(bid)
    bidMap.set(bid.lead_id, current)
  }
  const dealMap = new Map((deals || []).map((deal) => [deal.lead_id, deal]))
  const query = (params.q || '').toLowerCase().trim()

  const rows = (leads || [])
    .map((lead) => {
      const leadBids = bidMap.get(lead.id) || []
      const highestBid = leadBids.length
        ? Math.max(...leadBids.map((bid) => Number(bid.amount)))
        : null
      const created = parseTime(lead.created_at)
      const endsAt = created === null ? null : created + 24 * 60 * 60 * 1000
      // Auction state is intentionally evaluated at request time on the server.
      // eslint-disable-next-line react-hooks/purity
      const closed = endsAt === null || Date.now() >= endsAt
      return {
        ...lead,
        bids: leadBids.length,
        highestBid,
        endsAt,
        closed,
        deal: dealMap.get(lead.id),
      }
    })
    .filter((lead) => {
      const state = lead.deal ? 'deal' : lead.closed ? 'closed' : 'active'
      const country = lead.origin_country || lead.source || ''
      return (
        (!query ||
          [lead.reg, lead.make, lead.model, lead.id].some((value) =>
            String(value || '').toLowerCase().includes(query)
          )) &&
        (!params.state || params.state === state) &&
        (!params.country || params.country === country)
      )
    })

  const countries = Array.from(
    new Set(
      (leads || [])
        .map((lead) => lead.origin_country || lead.source)
        .filter((value): value is string => Boolean(value))
    )
  ).sort()

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <AdminPageHeader
        eyebrow="Auction operations"
        title="All auctions"
        description="Monitor active and closed auctions, bid activity, highest offers and deal creation."
      />
      <AdminFilters
        search={params.q}
        searchPlaceholder="Search registration, vehicle or lead ID"
      >
        <FilterSelect
          name="state"
          value={params.state}
          label="All auction states"
          options={[
            { value: 'active', label: 'Active' },
            { value: 'closed', label: 'Closed without deal' },
            { value: 'deal', label: 'Deal created' },
          ]}
        />
        <FilterSelect
          name="country"
          value={params.country}
          label="All countries"
          options={countries.map((country) => ({
            value: country,
            label: country,
          }))}
        />
      </AdminFilters>

      {rows.length ? (
        <div className="overflow-hidden rounded-[20px] border border-[#deddd7] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="border-b border-[#e5e3dd] bg-[#faf9f6] text-xs uppercase tracking-[0.1em] text-[#858a8c]">
                <tr>
                  <th className="px-5 py-4 font-medium">Vehicle</th>
                  <th className="px-5 py-4 font-medium">Market</th>
                  <th className="px-5 py-4 font-medium">Bids</th>
                  <th className="px-5 py-4 font-medium">Highest bid</th>
                  <th className="px-5 py-4 font-medium">State</th>
                  <th className="px-5 py-4 font-medium">Timing</th>
                  <th className="px-5 py-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#efede7]">
                {rows.map((lead) => (
                  <tr key={lead.id}>
                    <td className="px-5 py-4">
                      <p className="font-medium">
                        {lead.make || 'Vehicle'} {lead.model || ''}
                      </p>
                      <p className="mt-1 text-xs text-[#73797c]">
                        {lead.reg || 'No reg'} · {lead.miles || 'No mileage'}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      {lead.origin_country || lead.source || 'Unknown'}
                    </td>
                    <td className="px-5 py-4">{lead.bids}</td>
                    <td className="px-5 py-4 font-medium">
                      {lead.highestBid
                        ? `€${lead.highestBid.toLocaleString()}`
                        : 'No bids'}
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        label={
                          lead.deal
                            ? `Deal: ${lead.deal.status}`
                            : lead.closed
                              ? 'Closed'
                              : 'Active'
                        }
                        tone={lead.deal ? 'blue' : lead.closed ? 'amber' : 'green'}
                      />
                    </td>
                    <td className="px-5 py-4 text-xs text-[#62686c]">
                      {lead.endsAt
                        ? `${lead.closed ? 'Ended' : 'Ends'} ${new Date(
                            lead.endsAt
                          ).toLocaleString('sv-SE')}`
                        : 'Unknown'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/leads/${lead.id}`}
                        className="inline-flex items-center gap-2 rounded-full bg-[#242424] px-4 py-2 text-xs text-white"
                      >
                        Inspect
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
        <AdminEmpty text="No auctions match these filters." />
      )}
    </main>
  )
}
