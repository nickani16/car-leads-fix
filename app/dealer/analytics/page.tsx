'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  Award,
  BarChart3,
  CalendarDays,
  Gavel,
  RefreshCw,
  Target,
  TrendingUp,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Lead = {
  id: string
  make: string | null
  model: string | null
  reg: string
  created_at: string | null
}

type Bid = {
  id: string
  lead_id: string
  amount: number | string
  dealer_id: string | null
  created_at: string
}

const supabase = createClient()
const money = new Intl.NumberFormat('en-IE', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

function closed(createdAt: string | null) {
  if (!createdAt) return true
  return Date.now() >= new Date(createdAt).getTime() + 24 * 60 * 60 * 1000
}

export default function DealerAnalyticsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [bids, setBids] = useState<Bid[]>([])
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadAnalytics() {
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
        .select('id,make,model,reg,created_at')
        .order('created_at', { ascending: false }),
      supabase
        .from('bids')
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
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void loadAnalytics(), 0)
    return () => window.clearTimeout(timer)
  }, [])

  const analytics = useMemo(() => {
    const myBids = bids.filter((bid) => bid.dealer_id === userId)
    const uniqueLeadIds = new Set(myBids.map((bid) => bid.lead_id))
    const bidsByLead = bids.reduce<Record<string, Bid[]>>((groups, bid) => {
      groups[bid.lead_id] ||= []
      groups[bid.lead_id].push(bid)
      return groups
    }, {})

    let leading = 0
    let won = 0
    let completedWithBid = 0

    leads.forEach((lead) => {
      const leadBids = bidsByLead[lead.id] || []
      const myLeadBids = leadBids.filter((bid) => bid.dealer_id === userId)
      if (!myLeadBids.length) return

      const highest = Math.max(...leadBids.map((bid) => Number(bid.amount)))
      const iAmHighest = myLeadBids.some(
        (bid) => Number(bid.amount) === highest
      )

      if (closed(lead.created_at)) {
        completedWithBid += 1
        if (iAmHighest) won += 1
      } else if (iAmHighest) {
        leading += 1
      }
    })

    const average = myBids.length
      ? myBids.reduce((sum, bid) => sum + Number(bid.amount), 0) /
        myBids.length
      : 0

    const activity = Array.from({ length: 6 }, (_, index) => {
      const date = new Date()
      date.setMonth(date.getMonth() - (5 - index))
      const month = date.toLocaleDateString('en-GB', { month: 'short' })
      const count = myBids.filter((bid) => {
        const bidDate = new Date(bid.created_at)
        return (
          bidDate.getMonth() === date.getMonth() &&
          bidDate.getFullYear() === date.getFullYear()
        )
      }).length
      return { month, count }
    })

    return {
      myBids,
      uniqueAuctions: uniqueLeadIds.size,
      leading,
      won,
      average,
      winRate: completedWithBid
        ? Math.round((won / completedWithBid) * 100)
        : 0,
      activity,
    }
  }, [bids, leads, userId])

  const maxActivity = Math.max(
    1,
    ...analytics.activity.map((item) => item.count)
  )

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <section className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#6f767a]">
            Performance overview
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Dealer analytics
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Understand your bidding activity, current positions and completed
            auction performance.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadAnalytics()}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-[#d8d7d1] bg-white px-5 text-sm font-normal text-[#242424]"
        >
          <RefreshCw size={16} />
          Refresh analytics
        </button>
      </section>

      {error && (
        <div className="mb-6 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Metric icon={<Gavel />} label="Total bids" value={analytics.myBids.length.toString()} />
        <Metric icon={<BarChart3 />} label="Auctions entered" value={analytics.uniqueAuctions.toString()} />
        <Metric icon={<TrendingUp />} label="Currently leading" value={analytics.leading.toString()} />
        <Metric icon={<Award />} label="Auctions won" value={analytics.won.toString()} />
        <Metric icon={<Target />} label="Win rate" value={`${analytics.winRate}%`} />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-[22px] border border-[#deddd7] bg-white p-6 shadow-[0_14px_40px_rgba(32,33,36,.05)] sm:p-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold">Bid activity</h2>
              <p className="mt-1 text-sm text-slate-500">
                Your submitted bids over the last six months
              </p>
            </div>
            <Activity size={20} className="text-[#242424]" />
          </div>

          <div className="mt-8 grid h-56 grid-cols-6 items-end gap-3">
            {analytics.activity.map((item) => (
              <div key={item.month} className="flex h-full flex-col justify-end">
                <p className="mb-2 text-center text-xs font-semibold text-slate-600">
                  {item.count}
                </p>
                <div
                  className="min-h-1 rounded-t-[8px] bg-[#B4D9EF] transition-all"
                  style={{
                    height: `${Math.max(
                      4,
                      (item.count / maxActivity) * 100
                    )}%`,
                  }}
                />
                <p className="mt-3 text-center text-xs text-slate-400">
                  {item.month}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[22px] bg-[#242424] p-6 text-white shadow-lg sm:p-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#B4D9EF]">
            Average bid
          </p>
          <p className="mt-3 text-4xl font-semibold">
            {analytics.average ? money.format(analytics.average) : '—'}
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Average value across all bids submitted by your dealer account.
          </p>

          <div className="mt-8 border-t border-white/10 pt-6">
            <p className="text-sm font-semibold">Performance note</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Consistent bidding and complete vehicle review typically improve
              your ability to identify the strongest opportunities.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-[22px] border border-[#deddd7] bg-white shadow-[0_14px_40px_rgba(32,33,36,.05)]">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="text-lg font-semibold">Recent bid activity</h2>
        </div>
        {loading ? (
          <div className="p-8 text-sm text-slate-500">Loading analytics...</div>
        ) : analytics.myBids.length ? (
          <div className="divide-y divide-slate-100">
            {analytics.myBids.slice(0, 8).map((bid) => {
              const lead = leads.find((item) => item.id === bid.lead_id)
              return (
                <div
                  key={bid.id}
                  className="flex flex-col justify-between gap-3 px-6 py-4 sm:flex-row sm:items-center"
                >
                  <div>
                    <p className="font-semibold">
                      {lead?.make && lead?.model
                        ? `${lead.make} ${lead.model}`
                        : lead?.reg || 'Vehicle'}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                      <CalendarDays size={13} />
                      {new Date(bid.created_at).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                  <p className="text-lg font-semibold">
                    {money.format(Number(bid.amount))}
                  </p>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-8 text-sm text-slate-500">
            Your bid activity will appear here.
          </div>
        )}
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
  value: string
}) {
  return (
    <div className="rounded-[18px] border border-[#deddd7] bg-white p-5 shadow-[0_10px_30px_rgba(32,33,36,.04)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold">{value}</p>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-full bg-[#B4D9EF] text-[#242424]">
          {icon}
        </div>
      </div>
    </div>
  )
}
