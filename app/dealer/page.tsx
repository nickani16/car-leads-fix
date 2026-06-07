'use client'

import Image from 'next/image'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  Award,
  CalendarDays,
  Camera,
  CarFront,
  Clock3,
  Gavel,
  ImageIcon,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  TrendingUp,
  Users,
  X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import LogoutButton from './LogoutButton'

type Lead = {
  id: string
  reg: string
  make?: string
  model?: string
  variant?: string
  model_year?: string
  first_registration?: string
  vin?: string
  body_type?: string
  fuel_type?: string
  drivetrain?: string
  power_hp?: number
  engine_size?: string
  color?: string
  miles: string
  created_at: string | null
  source?: string
  sellTime?: string
  owners?: string
  service?: string
  damage?: string
  gearbox?: string
  tires?: string
  tireset?: string
  towbar?: string
  warnings?: string
  brakes?: string
  importCar?: string
  inspection_valid_until?: string
  keys_count?: string
  damage_description?: string
  equipment?: string
  images?: string[]
  status?: string
}

type Dealer = {
  company_name: string | null
  email: string
  country?: string | null
}

type Bid = {
  id: string
  lead_id: string
  amount: number | string
  dealer_id?: string | null
  created_at: string
  dealers?: Dealer | Dealer[] | null
}

const supabase = createClient()

const moneyFormatter = new Intl.NumberFormat('en-IE', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

function getCreatedAtTime(createdAt: string | null) {
  if (!createdAt) return 0
  const time = new Date(createdAt).getTime()
  return Number.isFinite(time) ? time : 0
}

function getBiddingEndsAt(createdAt: string | null) {
  return new Date(getCreatedAtTime(createdAt) + 24 * 60 * 60 * 1000)
}

function isBiddingClosed(createdAt: string | null, now: number) {
  const createdAtTime = getCreatedAtTime(createdAt)
  return createdAtTime === 0 || now >= createdAtTime + 24 * 60 * 60 * 1000
}

function getBiddingStatus(createdAt: string | null, now: number) {
  if (!getCreatedAtTime(createdAt)) return 'Archived record'

  const diffMs = getBiddingEndsAt(createdAt).getTime() - now

  if (diffMs <= 0) {
    return 'Bidding closed'
  }

  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs / (1000 * 60)) % 60)

  return `${hours}h ${minutes}m remaining`
}

function dealerLabel(bid: Bid) {
  const dealer = Array.isArray(bid.dealers) ? bid.dealers[0] : bid.dealers
  return dealer?.company_name || dealer?.email || 'Verified dealer'
}

function sortNewestFirst(bids: Bid[]) {
  return [...bids].sort(
    (first, second) =>
      new Date(second.created_at).getTime() -
      new Date(first.created_at).getTime()
  )
}

export default function DealerPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [allBids, setAllBids] = useState<Bid[]>([])
  const [dealer, setDealer] = useState<Dealer | null>(null)
  const [currentUserId, setCurrentUserId] = useState('')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [selectedBids, setSelectedBids] = useState<Bid[]>([])
  const [activeImage, setActiveImage] = useState<string | null>(null)
  const [bid, setBid] = useState('')
  const [search, setSearch] = useState('')
  const [auctionView, setAuctionView] = useState<'active' | 'closed'>('active')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [submittingBid, setSubmittingBid] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [now, setNow] = useState(0)

  useEffect(() => {
    const initialTimer = window.setTimeout(() => setNow(Date.now()), 0)
    const timer = window.setInterval(() => setNow(Date.now()), 30_000)
    return () => {
      window.clearTimeout(initialTimer)
      window.clearInterval(timer)
    }
  }, [])

  const fetchPortalData = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true)
    else setLoading(true)

    setErrorMessage('')

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      setErrorMessage('Your session has expired. Please sign in again.')
      setLoading(false)
      setRefreshing(false)
      return
    }

    setCurrentUserId(user.id)

    const [leadsResult, bidsResult, dealerResult] = await Promise.all([
      supabase
        .from('leads')
        .select(
          'id,reg,make,model,variant,model_year,first_registration,vin,body_type,fuel_type,drivetrain,power_hp,engine_size,color,miles,created_at,source,sellTime,owners,service,damage,damage_description,brakes,importCar,inspection_valid_until,keys_count,gearbox,tires,tireset,towbar,warnings,equipment,images,status'
        )
        .order('created_at', { ascending: false }),
      supabase
        .from('bids')
        .select(
          'id,lead_id,amount,dealer_id,created_at,dealers(company_name,email)'
        )
        .order('created_at', { ascending: false }),
      supabase
        .from('dealers')
        .select('company_name,email,country')
        .eq('user_id', user.id)
        .single(),
    ])

    if (leadsResult.error || bidsResult.error || dealerResult.error) {
      console.error(
        leadsResult.error || bidsResult.error || dealerResult.error
      )
      setErrorMessage('The portal could not be loaded. Please try again.')
    } else {
      setLeads(leadsResult.data || [])
      setAllBids(sortNewestFirst((bidsResult.data as Bid[]) || []))
      setDealer(dealerResult.data)
    }

    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchPortalData()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [fetchPortalData])

  const bidsByLead = useMemo(() => {
    return allBids.reduce<Record<string, Bid[]>>((grouped, currentBid) => {
      grouped[currentBid.lead_id] ||= []
      grouped[currentBid.lead_id].push(currentBid)
      grouped[currentBid.lead_id] = sortNewestFirst(
        grouped[currentBid.lead_id]
      )
      return grouped
    }, {})
  }, [allBids])

  const sortedLeads = useMemo(() => {
    return [...leads].sort((first, second) => {
      const firstClosed = isBiddingClosed(first.created_at, now)
      const secondClosed = isBiddingClosed(second.created_at, now)

      if (firstClosed !== secondClosed) return firstClosed ? 1 : -1

      return (
        getCreatedAtTime(second.created_at) -
        getCreatedAtTime(first.created_at)
      )
    })
  }, [leads, now])

  const filteredLeads = useMemo(() => {
    const query = search.trim().toLowerCase()
    return sortedLeads.filter((lead) => {
      const closed = isBiddingClosed(lead.created_at, now)
      const matchesView = auctionView === 'closed' ? closed : !closed
      const matchesSearch =
        !query ||
        [
          lead.reg,
          lead.make,
          lead.model,
          lead.variant,
          lead.source,
          lead.status,
        ].some((value) =>
          value?.toLowerCase().includes(query)
        )

      return matchesView && matchesSearch
    })
  }, [auctionView, now, search, sortedLeads])

  const activeAuctionCount = leads.filter(
    (lead) => !isBiddingClosed(lead.created_at, now)
  ).length
  const closedAuctionCount = leads.length - activeAuctionCount

  const myBids = allBids.filter((item) => item.dealer_id === currentUserId)
  const myLeadIds = new Set(myBids.map((item) => item.lead_id))
  const myActivePositions = leads.filter(
    (lead) =>
      myLeadIds.has(lead.id) && !isBiddingClosed(lead.created_at, now)
  ).length
  const myLeadingAuctions = leads.filter((lead) => {
    if (isBiddingClosed(lead.created_at, now)) return false
    const leadBids = bidsByLead[lead.id] || []
    if (!leadBids.length) return false
    const highest = Math.max(...leadBids.map((item) => Number(item.amount)))
    return leadBids.some(
      (item) =>
        item.dealer_id === currentUserId && Number(item.amount) === highest
    )
  }).length
  const myWonAuctions = leads.filter((lead) => {
    if (!isBiddingClosed(lead.created_at, now)) return false
    const leadBids = bidsByLead[lead.id] || []
    if (!leadBids.length) return false
    const highest = Math.max(...leadBids.map((item) => Number(item.amount)))
    return leadBids.some(
      (item) =>
        item.dealer_id === currentUserId && Number(item.amount) === highest
    )
  }).length

  function getHighestBid(leadId: string) {
    const leadBids = bidsByLead[leadId] || []
    if (!leadBids.length) return null
    return Math.max(...leadBids.map((item) => Number(item.amount)))
  }

  async function openLead(lead: Lead) {
    setSelectedLead(lead)
    setBid('')
    setSelectedBids(sortNewestFirst(bidsByLead[lead.id] || []))
  }

  async function submitBid() {
    if (!selectedLead) return

    const amount = Number(bid)
    if (!Number.isFinite(amount) || amount <= 0) {
      setErrorMessage('Enter a valid bid amount.')
      return
    }

    if (isBiddingClosed(selectedLead.created_at, now)) {
      setErrorMessage('Bidding for this vehicle has closed.')
      return
    }

    setSubmittingBid(true)
    setErrorMessage('')

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      setErrorMessage('Your session has expired. Please sign in again.')
      setSubmittingBid(false)
      return
    }

    const { data: newBid, error } = await supabase
      .from('bids')
      .insert({
        lead_id: selectedLead.id,
        amount,
        dealer_id: user.id,
      })
      .select(
        'id,lead_id,amount,dealer_id,created_at,dealers(company_name,email)'
      )
      .single()

    if (error) {
      console.error(error)
      setErrorMessage('Your bid could not be submitted. Please try again.')
      setSubmittingBid(false)
      return
    }

    const savedBid = newBid as Bid
    setSelectedBids((current) => sortNewestFirst([savedBid, ...current]))
    setAllBids((current) => sortNewestFirst([savedBid, ...current]))
    setBid('')
    setSubmittingBid(false)
  }

  return (
    <main className="min-h-screen bg-[#f2f4f7] text-slate-950">
      <header className="relative overflow-hidden border-b border-white/10 bg-[#07111f] text-white">
        <div className="pointer-events-none absolute -right-24 -top-40 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="pointer-events-none absolute left-1/3 top-0 h-px w-1/3 bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />
        <div className="relative mx-auto flex max-w-[1440px] items-center justify-between gap-5 px-5 py-5 sm:px-8 lg:px-12">
          <div className="flex items-center gap-4">
            <Image
              src="/autorell-logo.png"
              alt="Autorell"
              width={180}
              height={52}
              priority
              className="h-10 w-auto sm:h-11"
            />
            <div>
              <p className="hidden text-xs text-slate-400 md:block">
                European Dealer Network
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-[5px] border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-300 sm:flex">
              <ShieldCheck size={15} />
              {dealer?.company_name || 'Approved dealer'}
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
        <section className="relative mb-7 overflow-hidden rounded-[12px] border border-slate-800 bg-[#0b1627] px-6 py-7 text-white shadow-[0_24px_70px_rgba(15,23,42,0.16)] sm:px-8 lg:px-10 lg:py-9">
          <div className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
          <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-blue-300">
              Private dealer marketplace
            </p>
            <h1 className="max-w-3xl text-3xl font-semibold tracking-[-0.035em] sm:text-4xl lg:text-[42px]">
              Welcome back
              {dealer?.company_name ? `, ${dealer.company_name}` : ''}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
              Your personal bidding overview and the latest verified vehicle
              opportunities across Europe.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchPortalData(true)}
            disabled={refreshing}
            className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-[5px] border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/15 disabled:opacity-60 lg:self-auto"
          >
            <RefreshCw
              size={16}
              className={refreshing ? 'animate-spin' : ''}
            />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          </div>
        </section>

        <section className="mb-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={<Gavel size={20} />}
            label="My total bids"
            value={myBids.length.toString()}
            accent="blue"
          />
          <StatCard
            icon={<Clock3 size={20} />}
            label="My active positions"
            value={myActivePositions.toString()}
            accent="emerald"
          />
          <StatCard
            icon={<TrendingUp size={20} />}
            label="Currently leading"
            value={myLeadingAuctions.toString()}
            accent="violet"
          />
          <StatCard
            icon={<Award size={20} />}
            label="Auctions won"
            value={myWonAuctions.toString()}
            accent="amber"
          />
        </section>

        <section className="overflow-hidden rounded-[12px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.055)]">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 px-5 py-5 xl:flex-row xl:items-center sm:px-7">
            <div>
              <h2 className="text-lg font-bold">
                {auctionView === 'active'
                  ? 'Live marketplace'
                  : 'Closed archive'}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {filteredLeads.length} vehicle
                {filteredLeads.length === 1 ? '' : 's'} shown
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
              <div className="flex rounded-[7px] border border-slate-200 bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setAuctionView('active')}
                  className={`flex-1 rounded-[5px] px-4 py-2 text-sm font-bold transition sm:flex-none ${
                    auctionView === 'active'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Active ({activeAuctionCount})
                </button>
                <button
                  type="button"
                  onClick={() => setAuctionView('closed')}
                  className={`flex-1 rounded-[5px] px-4 py-2 text-sm font-bold transition sm:flex-none ${
                    auctionView === 'closed'
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Closed ({closedAuctionCount})
                </button>
              </div>

              <label className="relative block w-full sm:w-80">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search registration or country"
                  className="h-11 w-full rounded-[5px] border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </label>
            </div>
          </div>

          {errorMessage && !selectedLead && (
            <div className="mx-5 mt-5 rounded-[5px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:mx-7">
              {errorMessage}
            </div>
          )}

          {loading ? (
            <div className="grid min-h-72 place-items-center">
              <div className="text-center">
                <RefreshCw
                  size={25}
                  className="mx-auto mb-3 animate-spin text-blue-600"
                />
                <p className="text-sm font-medium text-slate-500">
                  Loading vehicle opportunities...
                </p>
              </div>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="grid min-h-72 place-items-center px-5 text-center">
              <div>
                <CarFront size={34} className="mx-auto mb-3 text-slate-300" />
                <h3 className="font-semibold text-slate-700">
                  {auctionView === 'active'
                    ? 'No active auctions'
                    : 'No closed auctions'}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {search
                    ? 'Try a different search.'
                    : auctionView === 'active'
                      ? 'New vehicle opportunities will appear here.'
                      : 'Closed auctions will appear in this archive.'}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="hidden grid-cols-[1.2fr_0.8fr_0.8fr_0.9fr_0.9fr_auto] gap-5 border-b border-slate-100 bg-slate-50/70 px-7 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400 lg:grid">
                <span>Vehicle</span>
                <span>Location</span>
                <span>Highest bid</span>
                <span>Submitted</span>
                <span>Auction</span>
                <span>Action</span>
              </div>

              <div className="divide-y divide-slate-100">
                {filteredLeads.map((lead) => {
                  const leadBids = bidsByLead[lead.id] || []
                  const highestBid = getHighestBid(lead.id)
                  const closed = isBiddingClosed(lead.created_at, now)

                  return (
                    <article
                      key={lead.id}
                      className="grid gap-5 px-5 py-5 transition hover:bg-slate-50/70 sm:px-7 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.9fr_0.9fr_auto] lg:items-center"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="relative grid h-14 w-16 shrink-0 place-items-center overflow-hidden rounded-[7px] bg-slate-100 text-slate-400">
                          {lead.images?.[0] ? (
                            <img
                              src={lead.images[0]}
                              alt={lead.reg}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <CarFront size={23} />
                          )}
                          {!!lead.images?.length && (
                            <span className="absolute bottom-1 right-1 rounded bg-black/65 px-1.5 py-0.5 text-[9px] font-bold text-white">
                              {lead.images.length}
                            </span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate text-base font-bold tracking-tight">
                            {lead.make && lead.model
                              ? `${lead.make} ${lead.model}`
                              : lead.reg}
                          </h3>
                          <p className="mt-1 text-sm text-slate-500">
                            {lead.model_year
                              ? `${lead.model_year} · `
                              : ''}
                            {(Number(lead.miles) * 10).toLocaleString('en-GB')} km
                          </p>
                          <p className="mt-1 truncate text-xs font-medium uppercase tracking-wide text-slate-400">
                            {lead.variant || lead.reg}
                          </p>
                        </div>
                      </div>

                      <DataItem
                        label="Location"
                        icon={<MapPin size={15} />}
                        value={lead.source || 'Not specified'}
                      />

                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400 lg:hidden">
                          Highest bid
                        </p>
                        <p className="mt-1 font-bold text-slate-900 lg:mt-0">
                          {highestBid ? moneyFormatter.format(highestBid) : 'No bids'}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {leadBids.length} {leadBids.length === 1 ? 'bid' : 'bids'}
                        </p>
                      </div>

                      <DataItem
                        label="Submitted"
                        icon={<CalendarDays size={15} />}
                        value={
                          getCreatedAtTime(lead.created_at)
                            ? dateFormatter.format(new Date(lead.created_at!))
                            : 'Legacy record'
                        }
                      />

                      <div>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                            closed
                              ? 'bg-slate-100 text-slate-500'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              closed ? 'bg-slate-400' : 'bg-emerald-500'
                            }`}
                          />
                          {closed ? 'Closed' : 'Live'}
                        </span>
                        <p className="mt-2 text-xs font-medium text-slate-500">
                          {getBiddingStatus(lead.created_at, now)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => openLead(lead)}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-[5px] bg-[#0b5cff] px-4 text-sm font-bold text-white shadow-sm shadow-blue-500/20 transition hover:bg-[#004bd6] hover:shadow-md hover:shadow-blue-500/20"
                      >
                        {closed ? 'View result' : 'View & bid'}
                        <ArrowRight size={15} />
                      </button>
                    </article>
                  )
                })}
              </div>
            </>
          )}
        </section>
      </div>

      {selectedLead && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 p-3 backdrop-blur-sm sm:p-6">
          <div className="mx-auto my-3 w-full max-w-5xl overflow-hidden rounded-[12px] border border-white/10 bg-white shadow-2xl sm:my-8">
            <div className="flex items-start justify-between border-b border-slate-100 px-5 py-5 sm:px-7">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                    {selectedLead.source || 'Europe'}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      isBiddingClosed(selectedLead.created_at, now)
                        ? 'bg-slate-100 text-slate-500'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {getBiddingStatus(selectedLead.created_at, now)}
                  </span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {selectedLead.make && selectedLead.model
                    ? `${selectedLead.make} ${selectedLead.model}`
                    : selectedLead.reg}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {[
                    selectedLead.variant,
                    selectedLead.model_year,
                    `${(Number(selectedLead.miles) * 10).toLocaleString('en-GB')} km`,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedLead(null)
                  setBid('')
                  setErrorMessage('')
                }}
                className="grid h-10 w-10 place-items-center rounded-[5px] bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
                aria-label="Close vehicle details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
              <div className="border-b border-slate-100 p-5 sm:p-7 lg:border-b-0 lg:border-r">
                <section>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 font-bold">
                      <Camera size={18} className="text-blue-600" />
                      Vehicle photos
                    </h3>
                    <span className="text-xs text-slate-400">
                      {selectedLead.images?.length || 0} images
                    </span>
                  </div>

                  {selectedLead.images?.length ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {selectedLead.images.map((image, index) => (
                        <button
                          key={image}
                          type="button"
                          onClick={() => setActiveImage(image)}
                          className={`group relative overflow-hidden rounded-[5px] bg-slate-100 ${
                            index === 0
                              ? 'col-span-2 row-span-2 sm:col-span-2'
                              : ''
                          }`}
                        >
                          <img
                            src={image}
                            alt={`Vehicle ${index + 1}`}
                            className={`w-full object-cover transition duration-300 group-hover:scale-105 ${
                              index === 0 ? 'h-72' : 'h-32'
                            }`}
                          />
                          <div className="absolute inset-0 grid place-items-center bg-black/0 transition group-hover:bg-black/30">
                            <ImageIcon
                              size={24}
                              className="text-white opacity-0 transition group-hover:opacity-100"
                            />
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="grid h-52 place-items-center rounded-[7px] bg-slate-50 text-center">
                      <div>
                        <ImageIcon
                          size={30}
                          className="mx-auto mb-2 text-slate-300"
                        />
                        <p className="text-sm text-slate-400">
                          No vehicle photos available
                        </p>
                      </div>
                    </div>
                  )}
                </section>

                <section className="mt-8">
                  <h3 className="mb-4 font-bold">Vehicle details</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Detail label="Registration" value={selectedLead.reg} />
                    <Detail
                      label="First registration"
                      value={selectedLead.first_registration}
                    />
                    <Detail label="VIN" value={selectedLead.vin} />
                    <Detail label="Body type" value={selectedLead.body_type} />
                    <Detail label="Fuel type" value={selectedLead.fuel_type} />
                    <Detail
                      label="Drivetrain"
                      value={selectedLead.drivetrain}
                    />
                    <Detail
                      label="Power"
                      value={
                        selectedLead.power_hp
                          ? `${selectedLead.power_hp} hp`
                          : undefined
                      }
                    />
                    <Detail
                      label="Engine"
                      value={selectedLead.engine_size}
                    />
                    <Detail label="Colour" value={selectedLead.color} />
                    <Detail label="Owners" value={selectedLead.owners} />
                    <Detail label="Service history" value={selectedLead.service} />
                    <Detail
                      label="Imported vehicle"
                      value={selectedLead.importCar}
                    />
                    <Detail
                      label="Inspection valid until"
                      value={selectedLead.inspection_valid_until}
                    />
                    <Detail
                      label="Keys"
                      value={selectedLead.keys_count}
                    />
                    <Detail label="Brakes" value={selectedLead.brakes} />
                    <Detail label="Damage" value={selectedLead.damage} />
                    <Detail label="Gearbox" value={selectedLead.gearbox} />
                    <Detail label="Tires" value={selectedLead.tires} />
                    <Detail label="Extra tire set" value={selectedLead.tireset} />
                    <Detail label="Towbar" value={selectedLead.towbar} />
                    <Detail label="Warnings" value={selectedLead.warnings} />
                  </div>
                  {selectedLead.damage_description && (
                    <div className="mt-3 rounded-[5px] border border-amber-200 bg-amber-50 px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-amber-700">
                        Damage description
                      </p>
                      <p className="mt-1 text-sm leading-6 text-amber-950">
                        {selectedLead.damage_description}
                      </p>
                    </div>
                  )}
                  {selectedLead.equipment && (
                    <div className="mt-3 rounded-[5px] border border-blue-100 bg-blue-50 px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-blue-700">
                        Key equipment
                      </p>
                      <p className="mt-1 text-sm leading-6 text-blue-950">
                        {selectedLead.equipment}
                      </p>
                    </div>
                  )}
                </section>
              </div>

              <aside className="bg-slate-50/60 p-5 sm:p-7">
                <div className="mb-6 rounded-[7px] border border-slate-800 bg-[#07111f] p-5 text-white shadow-lg shadow-slate-900/10">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                    Current highest bid
                  </p>
                  <p className="mt-2 text-3xl font-bold">
                    {getHighestBid(selectedLead.id)
                      ? moneyFormatter.format(getHighestBid(selectedLead.id)!)
                      : 'No bids yet'}
                  </p>
                  <p className="mt-2 text-xs text-slate-400">
                    {selectedBids.length} competitive{' '}
                    {selectedBids.length === 1 ? 'bid' : 'bids'}
                  </p>
                </div>

                {!isBiddingClosed(selectedLead.created_at, now) && (
                  <div className="mb-7">
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Your bid
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                        €
                      </span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={bid}
                        onChange={(event) => setBid(event.target.value)}
                        placeholder="Enter amount"
                        className="h-14 w-full rounded-[5px] border border-slate-200 bg-white pl-9 pr-4 text-lg font-bold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      />
                    </div>

                    {errorMessage && (
                      <p className="mt-3 rounded-[5px] border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                        {errorMessage}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={submitBid}
                      disabled={submittingBid || !bid}
                      className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[5px] bg-[#0b5cff] px-4 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-[#004bd6] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Gavel size={17} />
                      {submittingBid ? 'Submitting bid...' : 'Submit secure bid'}
                    </button>

                    <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-slate-400">
                      <ShieldCheck size={14} className="mt-0.5 shrink-0" />
                      Your bid is binding and linked to your approved dealer
                      account.
                    </p>
                  </div>
                )}

                <section>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-bold">Bid history</h3>
                    <Users size={17} className="text-slate-400" />
                  </div>

                  {selectedBids.length === 0 ? (
                    <div className="rounded-[7px] border border-dashed border-slate-200 bg-white px-4 py-7 text-center">
                      <Gavel size={22} className="mx-auto mb-2 text-slate-300" />
                      <p className="text-sm text-slate-500">
                        Be the first dealer to bid
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedBids.map((item, index) => (
                        (() => {
                          const highestBid = Math.max(
                            ...selectedBids.map((bidItem) =>
                              Number(bidItem.amount)
                            )
                          )
                          const isHighest =
                            Number(item.amount) === highestBid

                          return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-3 rounded-[5px] border border-slate-200 bg-white px-4 py-3"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-700">
                              {dealerLabel(item)}
                            </p>
                            <p className="mt-0.5 text-[11px] text-slate-400">
                              {index === 0 ? 'Latest bid · ' : ''}
                              {dateFormatter.format(new Date(item.created_at))}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">
                              {moneyFormatter.format(Number(item.amount))}
                            </p>
                            {isHighest && (
                              <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600">
                                Highest
                              </p>
                            )}
                          </div>
                        </div>
                          )
                        })()
                      ))}
                    </div>
                  )}
                </section>
              </aside>
            </div>
          </div>
        </div>
      )}

      {activeImage && (
        <div
          className="fixed inset-0 z-[60] grid place-items-center bg-black/90 p-4"
          onClick={() => setActiveImage(null)}
        >
          <button
            type="button"
            onClick={() => setActiveImage(null)}
            className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-[5px] border border-white/15 bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
            aria-label="Close image"
          >
            <X size={24} />
          </button>
          <img
            src={activeImage}
            alt="Vehicle large preview"
            className="max-h-[88vh] max-w-[95vw] rounded-[7px] object-contain shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </main>
  )
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: string
  accent: 'blue' | 'emerald' | 'violet' | 'amber'
}) {
  const accentClasses = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    violet: 'bg-violet-50 text-violet-600',
    amber: 'bg-amber-50 text-amber-600',
  }

  return (
    <div className="group border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_14px_34px_rgba(15,23,42,0.08)] rounded-[8px]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
        </div>
        <div
          className={`grid h-11 w-11 place-items-center rounded-[5px] ${accentClasses[accent]}`}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}

function DataItem({
  label,
  icon,
  value,
}: {
  label: string
  icon: React.ReactNode
  value: string
}) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400 lg:hidden">
        {label}
      </p>
      <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-600 lg:mt-0">
        <span className="text-slate-400">{icon}</span>
        {value}
      </p>
    </div>
  )
}

function Detail({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-[5px] border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-700">
        {value || 'Not specified'}
      </p>
    </div>
  )
}
