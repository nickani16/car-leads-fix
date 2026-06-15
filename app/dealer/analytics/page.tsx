'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  BatteryCharging,
  CircleGauge,
  Fuel,
  Gavel,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Lead = {
  id: string
  body_type: string | null
  fuel_type: string | null
  make: string | null
  miles: number | string | null
}

type Bid = {
  id: string
  lead_id: string
  amount: number | string
  dealer_id: string | null
  created_at: string
}

const marketTrend = [
  { month: 'Jan', value: 94 },
  { month: 'Feb', value: 98 },
  { month: 'Mar', value: 97 },
  { month: 'Apr', value: 104 },
  { month: 'May', value: 109 },
  { month: 'Jun', value: 116 },
]

const demandMix = [
  { label: 'Electric', value: 38, color: '#242424' },
  { label: 'Hybrid', value: 29, color: '#7fb8d8' },
  { label: 'Diesel', value: 21, color: '#b9c5cc' },
  { label: 'Petrol', value: 12, color: '#d8d7d1' },
]

const priceBands = [
  { label: '€10–20k', value: 62 },
  { label: '€20–30k', value: 88 },
  { label: '€30–40k', value: 71 },
  { label: '€40k+', value: 44 },
]

const supabase = createClient()
const money = new Intl.NumberFormat('en-IE', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

export default function DealerAnalyticsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [bids, setBids] = useState<Bid[]>([])
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadAnalytics = useCallback(async () => {
    setLoading(true)
    setError('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('Your session has expired.')
      setLoading(false)
      return
    }

    setUserId(user.id)
    const [leadResult, bidResult] = await Promise.all([
      supabase
        .from('dealer_leads')
        .select('id,body_type,fuel_type,make,miles'),
      supabase
        .from('dealer_bids')
        .select('id,lead_id,amount,dealer_id,created_at')
        .order('created_at', { ascending: false }),
    ])

    if (leadResult.error || bidResult.error) {
      setError('Analytics could not be loaded.')
    } else {
      setLeads(leadResult.data || [])
      setBids(bidResult.data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => void loadAnalytics(), 0)
    return () => window.clearTimeout(timer)
  }, [loadAnalytics])

  const analytics = useMemo(() => {
    const myBids = bids.filter((bid) => bid.dealer_id === userId)
    const uniqueAuctions = new Set(myBids.map((bid) => bid.lead_id)).size
    const averageBid = myBids.length
      ? myBids.reduce((sum, bid) => sum + Number(bid.amount), 0) / myBids.length
      : 0
    const highestBid = myBids.length
      ? Math.max(...myBids.map((bid) => Number(bid.amount)))
      : 0
    const bidsByLead = bids.reduce<Record<string, Bid[]>>((groups, bid) => {
      groups[bid.lead_id] ||= []
      groups[bid.lead_id].push(bid)
      return groups
    }, {})
    const leading = leads.filter((lead) => {
      const leadBids = bidsByLead[lead.id] || []
      if (!leadBids.length) return false
      const highest = Math.max(...leadBids.map((bid) => Number(bid.amount)))
      return leadBids.some(
        (bid) => bid.dealer_id === userId && Number(bid.amount) === highest
      )
    }).length
    const avgMileage = leads.length
      ? Math.round(
          leads.reduce((sum, lead) => sum + Number(lead.miles || 0) * 10, 0) /
            leads.length
        )
      : 0

    return {
      averageBid,
      highestBid,
      leading,
      myBids,
      uniqueAuctions,
      avgMileage,
    }
  }, [bids, leads, userId])

  const linePoints = marketTrend
    .map((item, index) => {
      const x = (index / (marketTrend.length - 1)) * 100
      const y = 92 - ((item.value - 90) / 30) * 72
      return `${x},${y}`
    })
    .join(' ')

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <section className="relative overflow-hidden rounded-[28px] bg-[#242424] px-6 py-8 text-white shadow-[0_24px_70px_rgba(32,33,36,.16)] sm:px-9 lg:px-11 lg:py-10">
        <div className="absolute -right-12 -top-24 h-72 w-72 rounded-full border-[46px] border-[#B4D9EF]/20" />
        <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#B4D9EF]">
              <Sparkles size={14} />
              Dealer intelligence
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">
              See the market before you bid.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/60 sm:text-base">
              Combine your live account activity with Autorell market signals
              to identify stronger vehicle opportunities.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadAnalytics()}
            className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-full border border-white/15 bg-white/10 px-5 text-sm text-white transition hover:bg-white/15 lg:self-auto"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </section>

      {error && (
        <div className="mt-6 rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          icon={<Gavel size={19} />}
          label="Your live bids"
          value={analytics.myBids.length.toString()}
          detail={`${analytics.uniqueAuctions} active auctions entered`}
        />
        <Metric
          icon={<Target size={19} />}
          label="Currently leading"
          value={analytics.leading.toString()}
          detail="Based on open auctions"
        />
        <Metric
          icon={<CircleGauge size={19} />}
          label="Average bid"
          value={analytics.averageBid ? money.format(analytics.averageBid) : '—'}
          detail={
            analytics.highestBid
              ? `Highest ${money.format(analytics.highestBid)}`
              : 'No bid submitted yet'
          }
        />
        <Metric
          icon={<Activity size={19} />}
          label="Live supply"
          value={leads.length.toString()}
          detail={
            analytics.avgMileage
              ? `${analytics.avgMileage.toLocaleString('en-GB')} km average`
              : 'Active marketplace vehicles'
          }
        />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <ChartCard
          eyebrow="Market pulse"
          title="Buyer demand trend"
          note="Illustrative Autorell index · rolling six-month view"
        >
          <div className="mt-7">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-4xl font-semibold tracking-tight">116</p>
                <p className="mt-1 text-xs text-slate-400">
                  Demand index, Jan = 100
                </p>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                <ArrowUpRight size={14} />
                18.4%
              </div>
            </div>
            <div className="relative mt-7 h-64 border-b border-l border-slate-200">
              <div className="absolute inset-0 flex flex-col justify-between">
                {[1, 2, 3, 4].map((line) => (
                  <span key={line} className="border-t border-dashed border-slate-100" />
                ))}
              </div>
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="absolute inset-0 h-full w-full overflow-visible"
                aria-label="Demand trend rising from January to June"
              >
                <defs>
                  <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#B4D9EF" stopOpacity="0.55" />
                    <stop offset="100%" stopColor="#B4D9EF" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polygon
                  points={`0,100 ${linePoints} 100,100`}
                  fill="url(#trend-fill)"
                />
                <polyline
                  points={linePoints}
                  fill="none"
                  stroke="#242424"
                  strokeWidth="2.2"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>
            <div className="mt-3 grid grid-cols-6 text-center text-xs text-slate-400">
              {marketTrend.map((item) => (
                <span key={item.month}>{item.month}</span>
              ))}
            </div>
          </div>
        </ChartCard>

        <ChartCard
          eyebrow="Demand mix"
          title="Powertrain interest"
          note="Illustrative share of dealer interest"
        >
          <div className="mx-auto mt-8 grid h-44 w-44 place-items-center rounded-full bg-[conic-gradient(#242424_0_38%,#7fb8d8_38%_67%,#b9c5cc_67%_88%,#d8d7d1_88%)]">
            <div className="grid h-28 w-28 place-items-center rounded-full bg-white text-center">
              <div>
                <p className="text-3xl font-semibold">67%</p>
                <p className="text-[10px] uppercase tracking-[0.15em] text-slate-400">
                  Electrified
                </p>
              </div>
            </div>
          </div>
          <div className="mt-7 grid grid-cols-2 gap-3">
            {demandMix.map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-sm">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-500">{item.label}</span>
                <strong className="ml-auto">{item.value}%</strong>
              </div>
            ))}
          </div>
        </ChartCard>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <ChartCard
          eyebrow="Opportunity map"
          title="Activity by price band"
          note="Illustrative relative bidding activity"
        >
          <div className="mt-8 space-y-5">
            {priceBands.map((band) => (
              <div key={band.label}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-medium">{band.label}</span>
                  <span className="text-slate-400">{band.value} index</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-[#efeee9]">
                  <div
                    className="h-full rounded-full bg-[#B4D9EF]"
                    style={{ width: `${band.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        <div className="grid gap-4 sm:grid-cols-2">
          <SignalCard
            icon={<BatteryCharging size={22} />}
            label="Fastest demand growth"
            value="Electric SUVs"
            detail="+24% illustrative index"
            tone="dark"
          />
          <SignalCard
            icon={<TrendingUp size={22} />}
            label="Strongest price band"
            value="€20–30k"
            detail="Highest relative activity"
          />
          <SignalCard
            icon={<Fuel size={22} />}
            label="Stable export demand"
            value="Hybrid"
            detail="Broad cross-border interest"
          />
          <SignalCard
            icon={<BarChart3 size={22} />}
            label="Data status"
            value="Benchmark"
            detail="Static market view for launch"
          />
        </div>
      </section>
    </main>
  )
}

function Metric({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode
  label: string
  value: string
  detail: string
}) {
  return (
    <article className="rounded-[20px] border border-[#deddd7] bg-white p-5 shadow-[0_10px_30px_rgba(32,33,36,.045)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
          <p className="mt-2 text-xs text-slate-400">{detail}</p>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-[12px] bg-[#eff8fd] text-[#242424]">
          {icon}
        </div>
      </div>
    </article>
  )
}

function ChartCard({
  eyebrow,
  title,
  note,
  children,
}: {
  eyebrow: string
  title: string
  note: string
  children: React.ReactNode
}) {
  return (
    <article className="rounded-[24px] border border-[#deddd7] bg-white p-6 shadow-[0_14px_40px_rgba(32,33,36,.05)] sm:p-8">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7b8285]">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-xl font-semibold">{title}</h2>
      <p className="mt-1 text-xs text-slate-400">{note}</p>
      {children}
    </article>
  )
}

function SignalCard({
  icon,
  label,
  value,
  detail,
  tone = 'light',
}: {
  icon: React.ReactNode
  label: string
  value: string
  detail: string
  tone?: 'light' | 'dark'
}) {
  return (
    <article
      className={`rounded-[22px] p-6 ${
        tone === 'dark'
          ? 'bg-[#242424] text-white'
          : 'border border-[#deddd7] bg-white'
      }`}
    >
      <div
        className={`grid h-11 w-11 place-items-center rounded-[13px] ${
          tone === 'dark' ? 'bg-[#B4D9EF] text-[#242424]' : 'bg-[#eff8fd]'
        }`}
      >
        {icon}
      </div>
      <p className={`mt-5 text-xs ${tone === 'dark' ? 'text-white/50' : 'text-slate-400'}`}>
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
      <p className={`mt-2 text-xs ${tone === 'dark' ? 'text-white/45' : 'text-slate-400'}`}>
        {detail}
      </p>
    </article>
  )
}
