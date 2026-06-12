import {
  AlertTriangle,
  ArrowRight,
  BadgeEuro,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileText,
  Gavel,
  Mail,
  Phone,
  Store,
  UserCheck,
} from 'lucide-react'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  formatStockholmTimestamp,
  parseDatabaseTimestamp,
} from '@/lib/date-time'

type Lead = {
  id: string
  reg: string | null
  make: string | null
  model: string | null
  miles: string | null
  phone: string | null
  email: string | null
  status: string | null
  source: string | null
  created_at: string | null
}

type Bid = {
  id: string
  lead_id: string
  amount: number | string
}

type Deal = {
  id: string
  lead_id: string
  status: string
  winning_bid_amount: number | string
  commission_amount: number | string
  buyer_total_amount: number | string
  created_at: string
}

type Dealer = {
  id: string
  company_name: string | null
  contact_person: string | null
  email: string | null
  country: string | null
  status: string | null
  created_at: string
}

const money = new Intl.NumberFormat('en-IE', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

function isClosed(createdAt: string | null) {
  const timestamp = parseTimestamp(createdAt)
  return timestamp === null || Date.now() >= timestamp + 24 * 60 * 60 * 1000
}

function parseTimestamp(value: string | null) {
  return parseDatabaseTimestamp(value)?.getTime() ?? null
}

function formatTimestamp(value: string | null) {
  return formatStockholmTimestamp(value)
}

export default async function AdminPage() {
  const supabase = createAdminClient()

  const [
    leadsResult,
    bidsResult,
    dealsResult,
    dealersResult,
  ] = await Promise.all([
    supabase
      .from('leads')
      .select('id,reg,make,model,miles,phone,email,status,source,created_at')
      .order('created_at', { ascending: false, nullsFirst: false })
      .limit(40),
    supabase.from('bids').select('id,lead_id,amount'),
    supabase
      .from('deals')
      .select(
        'id,lead_id,status,winning_bid_amount,commission_amount,buyer_total_amount,created_at'
      )
      .order('created_at', { ascending: false })
      .limit(12),
    supabase
      .from('dealers')
      .select('id,company_name,contact_person,email,country,status,created_at')
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  const leads = (leadsResult.data || []) as Lead[]
  const bids = (bidsResult.data || []) as Bid[]
  const deals = (dealsResult.data || []) as Deal[]
  const dealers = (dealersResult.data || []) as Dealer[]
  const dealLeadIds = new Set(deals.map((deal) => deal.lead_id))

  const pendingReviewLeads = leads.filter(
    (lead) => lead.status === 'Pending review'
  )
  const activeLeads = leads.filter((lead) => lead.status === 'Active')
  const closedLeads = leads.filter(
    (lead) =>
      lead.status !== 'Pending review' &&
      lead.status !== 'Active' &&
      isClosed(lead.created_at)
  )
  const closedWithoutDeal = closedLeads.filter((lead) => !dealLeadIds.has(lead.id))
  const pendingDealers = dealers.filter((dealer) => dealer.status === 'pending')
  const bidCountByLead = bids.reduce<Record<string, number>>((result, bid) => {
    result[bid.lead_id] = (result[bid.lead_id] || 0) + 1
    return result
  }, {})

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <section className="relative mb-7 overflow-hidden rounded-[24px] border border-[#deddd7] bg-white px-6 py-7 shadow-[0_24px_70px_rgba(32,33,36,.07)] sm:px-8 lg:px-10 lg:py-9">
        <div className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full border-[44px] border-[#B4D9EF]/45" />
        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.22em] text-[#70767a]">
              Autorell internal workspace
            </p>
            <h1 className="max-w-3xl text-3xl font-semibold tracking-[-0.035em] sm:text-4xl lg:text-[42px]">
              Admin control room
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#62686c]">
              Review customer leads, monitor auctions, approve dealers and
              prepare provisional deals from winning bids.
            </p>
          </div>

          <div className="rounded-[18px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-950">
            <strong>Internal only.</strong> Customer phone and email are visible
            here and must not be copied to dealers during public bidding.
          </div>
        </div>
      </section>

      {pendingReviewLeads.length ? (
        <section className="mb-7 flex flex-col justify-between gap-5 rounded-[24px] border border-[#8fc4e2] bg-[#eaf5fb] p-6 shadow-[0_18px_55px_rgba(57,127,168,.12)] sm:flex-row sm:items-center sm:p-8">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#397b9f]">
              Publication review
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
              {pendingReviewLeads.length} {pendingReviewLeads.length === 1 ? 'bil väntar' : 'bilar väntar'} på granskning
            </h2>
            <p className="mt-2 text-sm text-[#617681]">
              Kontrollera uppgifter och bilder innan bilen publiceras för handlare.
            </p>
          </div>
          <Link
            href="/admin/leads?status=Pending%20review"
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[#202124] px-6 text-sm font-medium text-white"
          >
            Öppna review queue
            <ArrowRight size={16} />
          </Link>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <Metric icon={<AlertTriangle />} label="Pending review" value={pendingReviewLeads.length} />
        <Metric icon={<FileText />} label="All leads" value={leads.length} />
        <Metric icon={<Clock3 />} label="Active auctions" value={activeLeads.length} />
        <Metric icon={<CalendarClock />} label="Closed, no deal" value={closedWithoutDeal.length} />
        <Metric icon={<Store />} label="Pending dealers" value={pendingDealers.length} />
        <Metric icon={<BadgeEuro />} label="Open deals" value={deals.filter((deal) => !['completed', 'cancelled'].includes(deal.status)).length} />
      </section>

      <section className="mt-7 grid gap-7 xl:grid-cols-[1.25fr_.75fr]">
        <Panel
          id="leads"
          title="Latest customer leads"
          description="Includes customer contact details. Keep this inside Autorell."
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-[#e5e3dd] text-xs uppercase tracking-[0.12em] text-[#858a8c]">
                <tr>
                  <th className="py-3 pr-4 font-medium">Vehicle</th>
                  <th className="py-3 pr-4 font-medium">Contact</th>
                  <th className="py-3 pr-4 font-medium">Bids</th>
                  <th className="py-3 pr-4 font-medium">Auction</th>
                  <th className="py-3 pr-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#efede7]">
                {leads.slice(0, 12).map((lead) => (
                  <tr key={lead.id}>
                    <td className="py-4 pr-4">
                      <p className="font-medium text-[#242424]">
                        {lead.make || 'Unknown make'} {lead.model || ''}
                      </p>
                      <p className="mt-1 text-xs text-[#73797c]">
                        {lead.reg || 'No reg'} · {lead.miles || 'No mileage'}
                      </p>
                    </td>
                    <td className="py-4 pr-4">
                      <p className="flex items-center gap-1.5 text-xs text-[#52616b]">
                        <Mail size={13} /> {lead.email || 'No email'}
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-[#52616b]">
                        <Phone size={13} /> {lead.phone || 'No phone'}
                      </p>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="rounded-full bg-[#eff8fd] px-3 py-1 text-xs text-[#242424]">
                        {bidCountByLead[lead.id] || 0} bids
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      <StatusBadge
                        tone={isClosed(lead.created_at) ? 'amber' : 'green'}
                        label={isClosed(lead.created_at) ? 'Closed' : 'Active'}
                      />
                      <p className="mt-1 text-xs text-[#8a8f91]">
                        {formatTimestamp(lead.created_at)}
                      </p>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="text-xs text-[#62686c]">
                        {lead.status || 'New'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel
          id="auctions"
          title="Action queue"
          description="Items Autorell should review next."
        >
          <div className="space-y-3">
            {pendingReviewLeads.slice(0, 8).map((lead) => (
              <Link
                key={lead.id}
                href={`/admin/leads/${lead.id}`}
                className="flex items-center justify-between gap-4 rounded-[16px] border border-[#9bc9e4] bg-[#eef7fb] p-4 transition hover:bg-[#e4f3fb]"
              >
                <div>
                  <p className="font-medium text-[#202124]">
                    {lead.reg || 'No reg'} · {lead.make || 'Vehicle'} {lead.model || ''}
                  </p>
                  <p className="mt-1 text-xs text-[#617681]">
                    Väntar på godkännande före publicering
                  </p>
                </div>
                <ArrowRight size={17} className="shrink-0" />
              </Link>
            ))}
            {closedWithoutDeal.slice(0, 8).map((lead) => (
              <QueueItem
                key={lead.id}
                icon={<Gavel size={17} />}
                title={`${lead.reg || 'No reg'} · ${lead.make || 'Vehicle'} ${lead.model || ''}`}
                text={`${bidCountByLead[lead.id] || 0} bids · ready for winning-bid review`}
              />
            ))}
            {pendingDealers.slice(0, 5).map((dealer) => (
              <QueueItem
                key={dealer.id}
                icon={<UserCheck size={17} />}
                title={dealer.company_name || dealer.email || 'Dealer application'}
                text={`${dealer.contact_person || 'No contact'} · ${dealer.country || 'No country'}`}
              />
            ))}
            {!pendingReviewLeads.length &&
              !closedWithoutDeal.length &&
              !pendingDealers.length && (
              <div className="rounded-[16px] border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
                <CheckCircle2 size={18} className="mb-2" />
                No urgent admin actions right now.
              </div>
            )}
          </div>
        </Panel>
      </section>

      <section className="mt-7 grid gap-7 xl:grid-cols-2">
        <Panel
          id="deals"
          title="Latest provisional deals"
          description="Commission and buyer total are calculated by the deal engine."
        >
          <div className="space-y-3">
            {deals.map((deal) => (
              <div
                key={deal.id}
                className="rounded-[16px] border border-[#deddd7] bg-[#faf9f6] p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-[#242424]">
                      {money.format(Number(deal.winning_bid_amount))}
                    </p>
                    <p className="mt-1 text-xs text-[#62686c]">
                      Fee {money.format(Number(deal.commission_amount))} · Buyer total{' '}
                      {money.format(Number(deal.buyer_total_amount))}
                    </p>
                  </div>
                  <StatusBadge tone="blue" label={deal.status} />
                </div>
              </div>
            ))}
            {!deals.length && (
              <EmptyState text="No deals have been created yet." />
            )}
          </div>
        </Panel>

        <Panel
          id="dealers"
          title="Dealer applications"
          description="Approve only verified companies and authorised contacts."
        >
          <div className="space-y-3">
            {dealers.slice(0, 10).map((dealer) => (
              <div
                key={dealer.id}
                className="rounded-[16px] border border-[#deddd7] bg-white p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-[#242424]">
                      {dealer.company_name || 'Unnamed dealer'}
                    </p>
                    <p className="mt-1 text-xs text-[#62686c]">
                      {dealer.contact_person || 'No contact'} ·{' '}
                      {dealer.email || 'No email'}
                    </p>
                  </div>
                  <StatusBadge
                    tone={dealer.status === 'approved' ? 'green' : 'amber'}
                    label={dealer.status || 'pending'}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>
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
    <div className="rounded-[18px] border border-[#deddd7] bg-white p-5 shadow-[0_8px_24px_rgba(32,33,36,.04)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-[#62686c]">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-[12px] bg-[#B4D9EF] text-[#242424]">
          {icon}
        </div>
      </div>
    </div>
  )
}

function Panel({
  id,
  title,
  description,
  children,
}: {
  id: string
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section
      id={id}
      className="overflow-hidden rounded-[22px] border border-[#deddd7] bg-white shadow-[0_18px_50px_rgba(32,33,36,.055)]"
    >
      <div className="border-b border-[#e5e3dd] px-5 py-5 sm:px-6">
        <h2 className="text-xl font-semibold tracking-[-0.025em]">{title}</h2>
        <p className="mt-1 text-sm text-[#73797c]">{description}</p>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  )
}

function StatusBadge({
  label,
  tone,
}: {
  label: string
  tone: 'green' | 'amber' | 'blue'
}) {
  const classes = {
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    blue: 'bg-[#eff8fd] text-[#242424] border-[#c9e3f2]',
  }

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${classes[tone]}`}
    >
      {label}
    </span>
  )
}

function QueueItem({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode
  title: string
  text: string
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[16px] border border-[#deddd7] bg-white p-4">
      <div className="flex min-w-0 items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-[#eff8fd] text-[#242424]">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="truncate font-medium text-[#242424]">{title}</p>
          <p className="mt-1 text-xs text-[#73797c]">{text}</p>
        </div>
      </div>
      <ArrowRight size={16} className="shrink-0 text-[#9b9f9f]" />
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-[16px] border border-dashed border-[#deddd7] bg-[#faf9f6] p-8 text-center text-sm text-[#73797c]">
      <AlertTriangle size={20} className="mx-auto mb-2 text-[#a1a5a5]" />
      {text}
    </div>
  )
}
