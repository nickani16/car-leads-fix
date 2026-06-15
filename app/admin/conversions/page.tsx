import {
  ArrowUpRight,
  FileSignature,
  Gavel,
  MessageCircle,
  Send,
  Store,
} from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'

type ConversionEvent = {
  event_name: string
  country_code: string | null
  source: string | null
  campaign: string | null
  value: number | string | null
  created_at: string
}

type ContractEvent = {
  deal_id: string | null
  event_type: string
  created_at: string
}

type Deal = {
  id: string
  destination_country: string | null
}

const eventLabels: Record<string, string> = {
  dealer_application_submitted: 'Dealer applications',
  contact_submitted: 'Contact enquiries',
  whatsapp_clicked: 'WhatsApp clicks',
  bid_submitted: 'Bids',
  contract_finalized: 'Contracts finalized',
  contract_sent: 'Contracts sent',
  signing_link_opened: 'Signing links opened',
  contract_signed: 'Agreements signed',
}

const countryNames = new Intl.DisplayNames(['en'], { type: 'region' })

function rangeStart(range: string) {
  if (range === 'all') return null
  const days = range === '90' ? 90 : 30
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
}

export default async function ConversionAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>
}) {
  const { range: requestedRange } = await searchParams
  const range = ['30', '90', 'all'].includes(requestedRange || '')
    ? requestedRange || '30'
    : '30'
  const since = rangeStart(range)
  const supabase = createAdminClient()

  let conversionQuery = supabase
    .from('conversion_events')
    .select('event_name,country_code,source,campaign,value,created_at')
    .order('created_at', { ascending: false })
  let contractQuery = supabase
    .from('contract_events')
    .select('deal_id,event_type,created_at')
    .in('event_type', [
      'contract_finalized',
      'contract_sent',
      'signing_link_opened',
      'contract_signed',
    ])

  if (since) {
    conversionQuery = conversionQuery.gte('created_at', since)
    contractQuery = contractQuery.gte('created_at', since)
  }

  const [conversionResult, contractResult] = await Promise.all([
    conversionQuery,
    contractQuery,
  ])
  const conversions = (conversionResult.data || []) as ConversionEvent[]
  const contractEvents = (contractResult.data || []) as ContractEvent[]
  const dealIds = [
    ...new Set(
      contractEvents.map((event) => event.deal_id).filter(Boolean) as string[],
    ),
  ]
  const { data: dealData } = dealIds.length
    ? await supabase
        .from('deals')
        .select('id,destination_country')
        .in('id', dealIds)
    : { data: [] }
  const deals = (dealData || []) as Deal[]
  const countryByDeal = new Map(
    deals.map((deal) => [deal.id, deal.destination_country || 'EU']),
  )
  const rows = [
    ...conversions.map((event) => ({
      eventName: event.event_name,
      country: event.country_code || 'EU',
      source: event.source || 'direct',
      campaign: event.campaign || '',
      value: Number(event.value || 0),
    })),
    ...contractEvents.map((event) => ({
      eventName: event.event_type,
      country: event.deal_id
        ? countryByDeal.get(event.deal_id) || 'EU'
        : 'EU',
      source: 'contract_system',
      campaign: '',
      value: 0,
    })),
  ]
  const eventOrder = Object.keys(eventLabels)
  const countries = [...new Set(rows.map((row) => row.country))].sort()
  const countryTotals = countries
    .map((country) => ({
      country,
      total: rows.filter((row) => row.country === country).length,
      counts: Object.fromEntries(
        eventOrder.map((eventName) => [
          eventName,
          rows.filter(
            (row) =>
              row.country === country && row.eventName === eventName,
          ).length,
        ]),
      ),
    }))
    .sort((a, b) => b.total - a.total)
  const totals = Object.fromEntries(
    eventOrder.map((eventName) => [
      eventName,
      rows.filter((row) => row.eventName === eventName).length,
    ]),
  )
  const sources = Object.entries(
    rows.reduce<Record<string, number>>((result, row) => {
      if (
        row.source !== 'contract_system' &&
        row.eventName !== 'bid_submitted'
      ) {
        const label = row.campaign
          ? `${row.source} / ${row.campaign}`
          : row.source
        result[label] = (result[label] || 0) + 1
      }
      return result
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
  const maxCountryTotal = Math.max(
    ...countryTotals.map((country) => country.total),
    1,
  )

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <section className="relative overflow-hidden rounded-[24px] border border-[#deddd7] bg-white p-7 shadow-[0_24px_70px_rgba(32,33,36,.07)] sm:p-9">
        <span className="absolute -right-24 -top-28 h-72 w-72 rounded-full border-[46px] border-[#B4D9EF]/35" />
        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#6d7e86]">
              Conversion intelligence
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">
              Market funnel by country
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[#626f75]">
              Dealer applications, enquiries, WhatsApp, bids and contract
              progress measured from the actual Autorell workflow.
            </p>
          </div>
          <div className="flex gap-2">
            {[
              ['30', '30 days'],
              ['90', '90 days'],
              ['all', 'All time'],
            ].map(([value, label]) => (
              <a
                key={value}
                href={`/admin/conversions?range=${value}`}
                className={`rounded-full px-4 py-2 text-sm ${
                  range === value
                    ? 'bg-[#242424] text-white'
                    : 'border border-[#d8d7d1] bg-white text-[#62686c]'
                }`}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          icon={<Store />}
          label="Dealer applications"
          value={totals.dealer_application_submitted}
        />
        <Metric
          icon={<MessageCircle />}
          label="Contacts + WhatsApp"
          value={totals.contact_submitted + totals.whatsapp_clicked}
        />
        <Metric icon={<Gavel />} label="Submitted bids" value={totals.bid_submitted} />
        <Metric
          icon={<FileSignature />}
          label="Signed agreements"
          value={totals.contract_signed}
        />
      </section>

      <section className="mt-6 overflow-hidden rounded-[22px] border border-[#deddd7] bg-white shadow-[0_18px_50px_rgba(32,33,36,.05)]">
        <div className="border-b border-[#e6e4de] p-6">
          <h2 className="text-xl font-semibold tracking-[-0.025em]">
            Country funnel
          </h2>
          <p className="mt-1 text-sm text-[#73797c]">
            Each column is an actual recorded conversion or contract event.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] text-left text-sm">
            <thead className="bg-[#faf9f6] text-[10px] uppercase tracking-[0.13em] text-[#7d8589]">
              <tr>
                <th className="px-5 py-4 font-medium">Country</th>
                {eventOrder.map((eventName) => (
                  <th key={eventName} className="px-4 py-4 font-medium">
                    {eventLabels[eventName]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efede7]">
              {countryTotals.map(({ country, counts, total }) => (
                <tr key={country}>
                  <td className="px-5 py-5">
                    <strong className="block">
                      {country === 'EU'
                        ? 'Europe / unknown'
                        : countryNames.of(country) || country}
                    </strong>
                    <span className="mt-1 block text-xs text-[#7c8589]">
                      {country} · {total} events
                    </span>
                  </td>
                  {eventOrder.map((eventName) => (
                    <td key={eventName} className="px-4 py-5">
                      <span
                        className={`inline-flex min-w-10 justify-center rounded-full px-3 py-1.5 text-xs font-medium ${
                          counts[eventName]
                            ? 'bg-[#dceef7] text-[#294f62]'
                            : 'bg-[#f1f0ec] text-[#9a9d9d]'
                        }`}
                      >
                        {counts[eventName]}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
              {!countryTotals.length && (
                <tr>
                  <td
                    colSpan={eventOrder.length + 1}
                    className="px-6 py-16 text-center text-[#777e81]"
                  >
                    No conversions recorded in this period yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_.7fr]">
        <div className="rounded-[22px] border border-[#deddd7] bg-white p-6">
          <h2 className="text-xl font-semibold tracking-[-0.025em]">
            Conversion volume
          </h2>
          <div className="mt-7 grid gap-5">
            {countryTotals.map(({ country, total }) => (
              <div key={country}>
                <div className="flex items-center justify-between gap-5 text-sm">
                  <span>
                    {country === 'EU'
                      ? 'Europe / unknown'
                      : countryNames.of(country) || country}
                  </span>
                  <strong>{total}</strong>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#edf0ef]">
                  <span
                    className="block h-full rounded-full bg-[#83c3df]"
                    style={{ width: `${(total / maxCountryTotal) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[22px] border border-[#deddd7] bg-[#202427] p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#b4d9ef]">
                Acquisition
              </p>
              <h2 className="mt-2 text-xl font-semibold">Top sources</h2>
            </div>
            <Send className="h-5 w-5 text-[#b4d9ef]" />
          </div>
          <div className="mt-6 grid gap-3">
            {sources.map(([source, count], index) => (
              <div
                key={source}
                className="flex items-center justify-between gap-4 rounded-[14px] border border-white/10 bg-white/[.05] px-4 py-3"
              >
                <span className="min-w-0 truncate text-sm text-white/72">
                  {index + 1}. {source}
                </span>
                <strong className="text-sm">{count}</strong>
              </div>
            ))}
            {!sources.length && (
              <p className="text-sm leading-6 text-white/48">
                Source and campaign data appears when tagged traffic converts.
              </p>
            )}
          </div>
          <p className="mt-6 flex items-start gap-2 text-xs leading-5 text-white/42">
            <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Use utm_source, utm_medium and utm_campaign on paid and partner links.
          </p>
        </div>
      </section>
    </main>
  )
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: number
}) {
  return (
    <article className="rounded-[20px] border border-[#deddd7] bg-white p-5 shadow-[0_10px_30px_rgba(32,33,36,.04)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-[#697277]">{label}</p>
          <strong className="mt-2 block text-3xl tracking-[-0.04em]">
            {value}
          </strong>
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-[13px] bg-[#dceef7] text-[#315d72]">
          {icon}
        </span>
      </div>
    </article>
  )
}
