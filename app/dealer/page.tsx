'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  Archive,
  Award,
  CalendarDays,
  Camera,
  CarFront,
  Clock3,
  Gavel,
  ImageIcon,
  MapPin,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  TrendingUp,
  Users,
  X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { vehicleValueInEnglish } from '@/lib/vehicle-translation'

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
  auction_ends_at?: string | null
  listing_plan?: 'free_24h' | 'extended_7d' | 'premium_30d'
  listing_priority?: number
  source?: string
  pickup_city?: string
  pickup_postal_code?: string
  sellTime?: string
  owners?: string
  service?: string
  damage?: string
  gearbox?: string
  tires?: string
  tireset?: string
  towbar?: string
  warnings?: string
  is_driveable?: boolean
  has_engine_transmission_issues?: boolean
  has_fluid_leaks?: boolean
  has_serious_collision_damage?: boolean
  brakes?: string
  importCar?: string
  inspection_valid_until?: string
  keys_count?: string
  damage_description?: string
  equipment?: string
  damage_translation_pending?: boolean
  equipment_translation_pending?: boolean
  images?: string[]
  status?: string
}

type Dealer = {
  company_name: string | null
  contact_person?: string | null
  email: string
  country?: string | null
  delivery_city?: string | null
  delivery_postal_code?: string | null
}

type Bid = {
  id: string
  lead_id: string
  amount: number | string
  dealer_id?: string | null
  created_at: string
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

const BUYER_FEE_PERCENT = 0.03
const MINIMUM_BUYER_FEE = 750
const VERIFIED_INSPECTION_FEE = 249
const ESTIMATED_TRANSPORT_FEE = 850
const EXPORT_DOCUMENT_FEE = 250

const countryNames = new Intl.DisplayNames(['en'], { type: 'region' })

function marketLocation(city?: string, countryCode?: string) {
  const country =
    countryCode && countryCode.length === 2
      ? countryNames.of(countryCode.toUpperCase())
      : countryCode
  return [city, country].filter(Boolean).join(', ') || 'Not specified'
}

function getCreatedAtTime(createdAt: string | null) {
  if (!createdAt) return 0
  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(createdAt)
  const normalizedCreatedAt = hasTimezone ? createdAt : `${createdAt}Z`
  const time = new Date(normalizedCreatedAt).getTime()
  return Number.isFinite(time) ? time : 0
}

function getBiddingEndsAt(
  createdAt: string | null,
  auctionEndsAt?: string | null
) {
  return auctionEndsAt
    ? new Date(auctionEndsAt)
    : new Date(getCreatedAtTime(createdAt) + 24 * 60 * 60 * 1000)
}

function isBiddingClosed(
  createdAt: string | null,
  now: number,
  auctionEndsAt?: string | null
) {
  const endsAt = getBiddingEndsAt(createdAt, auctionEndsAt).getTime()
  return !Number.isFinite(endsAt) || endsAt === 0 || now >= endsAt
}

function getBiddingStatus(
  createdAt: string | null,
  now: number,
  auctionEndsAt?: string | null
) {
  if (!getCreatedAtTime(createdAt)) return 'Archived record'

  const diffMs = getBiddingEndsAt(createdAt, auctionEndsAt).getTime() - now

  if (diffMs <= 0) {
    return 'Bidding closed'
  }

  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs / (1000 * 60)) % 60)

  return `${hours}h ${minutes}m remaining`
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
  const [countryFilter, setCountryFilter] = useState('')
  const [makeFilter, setMakeFilter] = useState('')
  const [fuelFilter, setFuelFilter] = useState('')
  const [gearboxFilter, setGearboxFilter] = useState('')
  const [maxKilometers, setMaxKilometers] = useState('')
  const [myBidsOnly, setMyBidsOnly] = useState(false)
  const [quickCategory, setQuickCategory] = useState<
    '' | 'electric' | 'hybrid' | 'suv'
  >('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [submittingBid, setSubmittingBid] = useState(false)
  const [bidTermsAccepted, setBidTermsAccepted] = useState(false)
  const [portalError, setPortalError] = useState('')
  const [bidError, setBidError] = useState('')
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

    setPortalError('')

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      setPortalError('Your session has expired. Please sign in again.')
      setLoading(false)
      setRefreshing(false)
      return
    }

    setCurrentUserId(user.id)

    const [leadsResult, bidsResult, dealerResult] = await Promise.all([
      supabase
        .from('dealer_leads')
        .select(
          'id,reg,make,model,variant,model_year,first_registration,vin,body_type,fuel_type,drivetrain,power_hp,engine_size,color,miles,created_at,auction_ends_at,listing_plan,listing_priority,source,pickup_city,pickup_postal_code,sellTime,owners,service,damage,damage_description,damage_translation_pending,brakes,importCar,inspection_valid_until,keys_count,gearbox,tires,tireset,towbar,warnings,is_driveable,has_engine_transmission_issues,has_fluid_leaks,has_serious_collision_damage,equipment,equipment_translation_pending,images,status'
        )
        .order('created_at', { ascending: false }),
      supabase
        .from('dealer_bids')
        .select('id,lead_id,amount,dealer_id,created_at')
        .order('created_at', { ascending: false }),
      supabase
        .from('dealers')
        .select('company_name,contact_person,email,country,delivery_city,delivery_postal_code')
        .eq('user_id', user.id)
        .single(),
    ])

    if (leadsResult.error || bidsResult.error || dealerResult.error) {
      console.error('Dealer portal load failed', {
        leads: leadsResult.error,
        bids: bidsResult.error,
        dealer: dealerResult.error,
      })
      setPortalError(
        'The marketplace could not be loaded. Refresh the page or sign in again.'
      )
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
      const firstClosed = isBiddingClosed(
        first.created_at,
        now,
        first.auction_ends_at
      )
      const secondClosed = isBiddingClosed(
        second.created_at,
        now,
        second.auction_ends_at
      )

      if (firstClosed !== secondClosed) return firstClosed ? 1 : -1
      if (!firstClosed && first.listing_priority !== second.listing_priority) {
        return (second.listing_priority || 0) - (first.listing_priority || 0)
      }

      return (
        getCreatedAtTime(second.created_at) -
        getCreatedAtTime(first.created_at)
      )
    })
  }, [leads, now])

  const filteredLeads = useMemo(() => {
    const query = search.trim().toLowerCase()
    return sortedLeads.filter((lead) => {
      const closed = isBiddingClosed(
        lead.created_at,
        now,
        lead.auction_ends_at
      )
      const matchesView = auctionView === 'active' && !closed
      const matchesSearch =
        !query ||
        [
          lead.reg,
          lead.make,
          lead.model,
          lead.variant,
          lead.source,
          lead.status,
          lead.pickup_city,
          vehicleValueInEnglish(lead.fuel_type),
          vehicleValueInEnglish(lead.gearbox),
          vehicleValueInEnglish(lead.body_type),
          vehicleValueInEnglish(lead.damage),
        ].some((value) =>
          value?.toLowerCase().includes(query)
        )
      const kilometers = Number(lead.miles) * 10
      const matchesCountry =
        !countryFilter || lead.source === countryFilter
      const matchesMake = !makeFilter || lead.make === makeFilter
      const matchesFuel = !fuelFilter || lead.fuel_type === fuelFilter
      const matchesGearbox =
        !gearboxFilter || lead.gearbox === gearboxFilter
      const matchesMileage =
        !maxKilometers ||
        (Number.isFinite(kilometers) &&
          kilometers <= Number(maxKilometers))
      const matchesMyBids =
        !myBidsOnly ||
        (bidsByLead[lead.id] || []).some(
          (item) => item.dealer_id === currentUserId
        )
      const normalizedFuel =
        vehicleValueInEnglish(lead.fuel_type)?.toLowerCase() || ''
      const matchesQuickCategory =
        !quickCategory ||
        (quickCategory === 'electric' &&
          normalizedFuel === 'electric') ||
        (quickCategory === 'hybrid' && normalizedFuel.includes('hybrid')) ||
        (quickCategory === 'suv' &&
          vehicleValueInEnglish(lead.body_type)?.toLowerCase() === 'suv')

      return (
        matchesView &&
        matchesSearch &&
        matchesCountry &&
        matchesMake &&
        matchesFuel &&
        matchesGearbox &&
        matchesMileage &&
        matchesMyBids &&
        matchesQuickCategory
      )
    })
  }, [
    auctionView,
    bidsByLead,
    countryFilter,
    currentUserId,
    fuelFilter,
    gearboxFilter,
    makeFilter,
    maxKilometers,
    myBidsOnly,
    now,
    quickCategory,
    search,
    sortedLeads,
  ])

  const filterOptions = useMemo(
    () => ({
      countries: Array.from(
        new Set(leads.map((lead) => lead.source).filter(Boolean))
      ).sort() as string[],
      makes: Array.from(
        new Set(leads.map((lead) => lead.make).filter(Boolean))
      ).sort() as string[],
      fuels: Array.from(
        new Set(leads.map((lead) => lead.fuel_type).filter(Boolean))
      ).sort() as string[],
      gearboxes: Array.from(
        new Set(leads.map((lead) => lead.gearbox).filter(Boolean))
      ).sort() as string[],
    }),
    [leads]
  )

  const activeFilterCount = [
    countryFilter,
    makeFilter,
    fuelFilter,
    gearboxFilter,
    maxKilometers,
    myBidsOnly ? 'yes' : '',
    quickCategory,
  ].filter(Boolean).length

  function resetFilters() {
    setCountryFilter('')
    setMakeFilter('')
    setFuelFilter('')
    setGearboxFilter('')
    setMaxKilometers('')
    setMyBidsOnly(false)
    setQuickCategory('')
    setSearch('')
  }

  const activeAuctionCount = leads.filter(
    (lead) => !isBiddingClosed(lead.created_at, now, lead.auction_ends_at)
  ).length
  const myBids = allBids.filter((item) => item.dealer_id === currentUserId)
  const myLeadIds = new Set(myBids.map((item) => item.lead_id))
  const myActivePositions = leads.filter(
    (lead) =>
      myLeadIds.has(lead.id) &&
      !isBiddingClosed(lead.created_at, now, lead.auction_ends_at)
  ).length
  const myLeadingAuctions = leads.filter((lead) => {
    if (isBiddingClosed(lead.created_at, now, lead.auction_ends_at)) return false
    const leadBids = bidsByLead[lead.id] || []
    if (!leadBids.length) return false
    const highest = Math.max(...leadBids.map((item) => Number(item.amount)))
    return leadBids.some(
      (item) =>
        item.dealer_id === currentUserId && Number(item.amount) === highest
    )
  }).length
  const myWonAuctions = leads.filter((lead) => {
    if (!isBiddingClosed(lead.created_at, now, lead.auction_ends_at)) return false
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
    setBidError('')
    setBidTermsAccepted(false)
    setSelectedBids(sortNewestFirst(bidsByLead[lead.id] || []))
    void fetch('/api/dealer/vehicle-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId: lead.id }),
    })
  }

  async function submitBid() {
    if (!selectedLead) return

    const amount = Number(bid)
    if (!Number.isFinite(amount) || amount <= 0) {
      setBidError('Enter a valid bid amount.')
      return
    }

    if (!bidTermsAccepted) {
      setBidError('Confirm the binding bid terms before submitting.')
      return
    }

    if (
      isBiddingClosed(
        selectedLead.created_at,
        now,
        selectedLead.auction_ends_at
      )
    ) {
      setBidError('Bidding for this vehicle has closed.')
      return
    }

    setSubmittingBid(true)
    setBidError('')

    const response = await fetch('/api/bids', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        leadId: selectedLead.id,
        amount,
        termsAccepted: bidTermsAccepted,
      }),
    })

    const result = (await response.json().catch(() => ({}))) as {
      bid?: Bid
      error?: string
    }

    if (!response.ok || !result.bid) {
      setBidError(
        result.error || 'Your bid could not be submitted. Please try again.'
      )
      setSubmittingBid(false)
      return
    }

    const savedBid = result.bid
    setSelectedBids((current) => sortNewestFirst([savedBid, ...current]))
    setAllBids((current) => sortNewestFirst([savedBid, ...current]))
    setBid('')
    setBidTermsAccepted(false)
    setSubmittingBid(false)
  }

  const enteredBidAmount = Number(bid)
  const validBidAmount =
    Number.isFinite(enteredBidAmount) && enteredBidAmount > 0
      ? enteredBidAmount
      : 0
  const estimatedBuyerFee = validBidAmount
    ? Math.max(MINIMUM_BUYER_FEE, validBidAmount * BUYER_FEE_PERCENT)
    : 0
  const estimatedBuyerTotal = validBidAmount
    ? validBidAmount +
      estimatedBuyerFee +
      VERIFIED_INSPECTION_FEE +
      ESTIMATED_TRANSPORT_FEE +
      EXPORT_DOCUMENT_FEE
    : 0

  return (
    <main className="min-h-screen bg-[#f5f4f0] text-[#202124]">
      <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
        <section className="relative mb-7 overflow-hidden rounded-[24px] border border-[#deddd7] bg-white px-6 py-7 shadow-[0_24px_70px_rgba(32,33,36,.07)] sm:px-8 lg:px-10 lg:py-9">
          <div className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full border-[44px] border-[#B4D9EF]/45" />
          <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.22em] text-[#70767a]">
              Private dealer marketplace
            </p>
            <h1 className="max-w-3xl text-3xl font-semibold tracking-[-0.035em] sm:text-4xl lg:text-[42px]">
              Welcome back
              {dealer
                ? `, ${
                    dealer.contact_person ||
                    dealer.company_name ||
                    dealer.email.split('@')[0]
                  }`
                : ''}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#697278] sm:text-base">
              Your personal bidding overview and the latest verified vehicle
              opportunities across Europe.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchPortalData(true)}
            disabled={refreshing}
            className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-full border border-[#d8d7d1] bg-[#f8f7f3] px-5 text-sm font-normal text-[#242424] transition hover:border-[#242424] disabled:opacity-60 lg:self-auto"
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

        <section className="overflow-hidden rounded-[24px] border border-[#deddd7] bg-white shadow-[0_18px_50px_rgba(32,33,36,.055)]">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 px-5 py-5 xl:flex-row xl:items-center sm:px-7">
            <div>
              <h2 className="text-lg font-bold">
                {auctionView === 'active'
                  ? 'Live marketplace'
                  : 'Autorell transaction archive'}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {auctionView === 'active'
                  ? `${filteredLeads.length} vehicle${
                      filteredLeads.length === 1 ? '' : 's'
                    } shown`
                  : 'Completed auctions are retained securely by Autorell'}
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
              <div className="flex rounded-full border border-[#deddd7] bg-[#f3f2ee] p-1">
                <button
                  type="button"
                  onClick={() => setAuctionView('active')}
                  className={`flex-1 rounded-full px-4 py-2 text-sm font-normal transition sm:flex-none ${
                    auctionView === 'active'
                      ? 'bg-[#B4D9EF] text-[#242424] shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Active ({activeAuctionCount})
                </button>
                <button
                  type="button"
                  onClick={() => setAuctionView('closed')}
                  className={`flex-1 rounded-full px-4 py-2 text-sm font-normal transition sm:flex-none ${
                    auctionView === 'closed'
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Closed +10k vehicles
                </button>
              </div>

              {auctionView === 'active' && (
              <label className="relative block w-full sm:w-80">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search registration or country"
                  className="h-11 w-full rounded-full border border-[#d8d7d1] bg-[#fbfbf9] pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#8dbdd8] focus:bg-white focus:ring-4 focus:ring-[#B4D9EF]/35"
                />
              </label>
              )}

              {auctionView === 'active' && (
              <button
                type="button"
                onClick={() => setFiltersOpen((open) => !open)}
                className={`inline-flex h-11 items-center justify-center gap-2 border px-4 text-sm font-semibold transition ${
                  filtersOpen || activeFilterCount
                    ? 'border-[#B4D9EF] bg-[#B4D9EF] text-[#242424]'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <SlidersHorizontal size={16} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#242424] px-1 text-[10px] text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              )}
            </div>
          </div>

          {auctionView === 'active' && filtersOpen && (
            <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-5 sm:px-7">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <FilterSelect
                  label="Country"
                  value={countryFilter}
                  options={filterOptions.countries}
                  onChange={setCountryFilter}
                />
                <FilterSelect
                  label="Make"
                  value={makeFilter}
                  options={filterOptions.makes}
                  onChange={setMakeFilter}
                />
                <FilterSelect
                  label="Fuel"
                  value={fuelFilter}
                  options={filterOptions.fuels}
                  translateOptions
                  onChange={setFuelFilter}
                />
                <FilterSelect
                  label="Transmission"
                  value={gearboxFilter}
                  options={filterOptions.gearboxes}
                  translateOptions
                  onChange={setGearboxFilter}
                />
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold text-slate-500">
                    Maximum mileage
                  </span>
                  <select
                    value={maxKilometers}
                    onChange={(event) =>
                      setMaxKilometers(event.target.value)
                    }
                    className="h-11 w-full rounded-[14px] border border-[#d8d7d1] bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#8dbdd8]"
                  >
                    <option value="">Any mileage</option>
                    <option value="50000">Up to 50,000 km</option>
                    <option value="100000">Up to 100,000 km</option>
                    <option value="150000">Up to 150,000 km</option>
                    <option value="200000">Up to 200,000 km</option>
                  </select>
                </label>
                <div className="flex flex-col justify-end gap-2">
                  <label className="flex h-11 cursor-pointer items-center gap-2 rounded-full border border-[#d8d7d1] bg-white px-4 text-sm font-normal text-slate-700">
                    <input
                      type="checkbox"
                      checked={myBidsOnly}
                      onChange={(event) =>
                        setMyBidsOnly(event.target.checked)
                      }
                      className="accent-[#242424]"
                    />
                    My bids only
                  </label>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
                <p className="text-sm text-slate-500">
                  Showing <strong>{filteredLeads.length}</strong> matching
                  vehicles
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex h-9 items-center gap-2 border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  <RotateCcw size={14} />
                  Reset filters
                </button>
              </div>
            </div>
          )}

          {auctionView === 'active' && (
          <div className="flex gap-2 overflow-x-auto border-b border-slate-100 px-5 py-3 sm:px-7">
            <QuickFilter
              active={
                !fuelFilter &&
                !makeFilter &&
                !myBidsOnly &&
                !quickCategory &&
                !maxKilometers
              }
              label="All vehicles"
              onClick={() => {
                setFuelFilter('')
                setMakeFilter('')
                setMyBidsOnly(false)
                setQuickCategory('')
                setMaxKilometers('')
              }}
            />
            <QuickFilter
              active={quickCategory === 'electric'}
              label="Electric"
              onClick={() =>
                setQuickCategory((value) =>
                  value === 'electric' ? '' : 'electric'
                )
              }
            />
            <QuickFilter
              active={quickCategory === 'hybrid'}
              label="Hybrid"
              onClick={() =>
                setQuickCategory((value) =>
                  value === 'hybrid' ? '' : 'hybrid'
                )
              }
            />
            <QuickFilter
              active={quickCategory === 'suv'}
              label="SUV"
              onClick={() =>
                setQuickCategory((value) =>
                  value === 'suv' ? '' : 'suv'
                )
              }
            />
            <QuickFilter
              active={myBidsOnly}
              label="My bids"
              onClick={() => setMyBidsOnly((value) => !value)}
            />
            <QuickFilter
              active={maxKilometers === '100000'}
              label="Under 100,000 km"
              onClick={() =>
                setMaxKilometers((value) =>
                  value === '100000' ? '' : '100000'
                )
              }
            />
          </div>
          )}

          {portalError && (
            <div className="mx-5 mt-5 rounded-[5px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:mx-7">
              {portalError}
            </div>
          )}

          {auctionView === 'closed' ? (
            <div className="p-5 sm:p-7">
              <div className="relative overflow-hidden rounded-[22px] bg-[#242424] px-6 py-9 text-white sm:px-9 sm:py-11">
                <div className="absolute -right-12 -top-24 h-64 w-64 rounded-full border-[42px] border-[#B4D9EF]/15" />
                <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
                  <div className="max-w-2xl">
                    <div className="grid h-12 w-12 place-items-center rounded-[14px] bg-[#B4D9EF] text-[#242424]">
                      <Archive size={23} />
                    </div>
                    <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B4D9EF]">
                      Closed market intelligence
                    </p>
                    <h3 className="mt-2 text-3xl font-semibold tracking-tight">
                      10,000+ completed vehicle records
                    </h3>
                    <p className="mt-4 max-w-xl text-sm leading-7 text-white/60">
                      Closed auctions are removed from the live marketplace.
                      Autorell retains the transaction history internally for
                      documentation, compliance and market analysis.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                    <ArchivePoint label="Dealer view" value="Live vehicles only" />
                    <ArchivePoint label="Documentation" value="Retained by Autorell" />
                    <ArchivePoint label="Buyer privacy" value="Closed bids protected" />
                  </div>
                </div>
              </div>
            </div>
          ) : loading ? (
            <div className="grid min-h-72 place-items-center">
              <div className="text-center">
                <RefreshCw
                  size={25}
                  className="mx-auto mb-3 animate-spin text-[#242424]"
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
                  No active auctions
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {search
                    ? 'Try a different search.'
                    : 'New vehicle opportunities will appear here.'}
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
                  const closed = isBiddingClosed(
                    lead.created_at,
                    now,
                    lead.auction_ends_at
                  )

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
                        value={
                          marketLocation(lead.pickup_city, lead.source)
                        }
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
                          {getBiddingStatus(
                            lead.created_at,
                            now,
                            lead.auction_ends_at
                          )}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => openLead(lead)}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#242424] px-5 text-sm font-normal text-white shadow-sm transition hover:bg-[#111111]"
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
          <div className="mx-auto my-3 w-full max-w-5xl overflow-hidden rounded-[24px] border border-white/10 bg-white shadow-2xl sm:my-8">
            <div className="flex items-start justify-between border-b border-slate-100 px-5 py-5 sm:px-7">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#B4D9EF] px-2.5 py-1 text-xs font-medium text-[#242424]">
                    {marketLocation(
                      selectedLead.pickup_city,
                      selectedLead.source
                    )}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      isBiddingClosed(
                        selectedLead.created_at,
                        now,
                        selectedLead.auction_ends_at
                      )
                        ? 'bg-slate-100 text-slate-500'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {getBiddingStatus(
                      selectedLead.created_at,
                      now,
                      selectedLead.auction_ends_at
                    )}
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
                  setBidError('')
                }}
                className="grid h-10 w-10 place-items-center rounded-full bg-[#f2f1ed] text-slate-500 transition hover:bg-[#e7e5df] hover:text-slate-900"
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
                      <Camera size={18} className="text-[#242424]" />
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
                    <Detail
                      label="Body type"
                      value={vehicleValueInEnglish(selectedLead.body_type)}
                    />
                    <Detail
                      label="Fuel type"
                      value={vehicleValueInEnglish(selectedLead.fuel_type)}
                    />
                    <Detail
                      label="Drivetrain"
                      value={vehicleValueInEnglish(selectedLead.drivetrain)}
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
                    <Detail
                      label="Service history"
                      value={vehicleValueInEnglish(selectedLead.service)}
                    />
                    <Detail
                      label="Imported vehicle"
                      value={vehicleValueInEnglish(selectedLead.importCar)}
                    />
                    <Detail
                      label="Inspection valid until"
                      value={selectedLead.inspection_valid_until}
                    />
                    <Detail
                      label="Keys"
                      value={selectedLead.keys_count}
                    />
                    <Detail
                      label="Brakes"
                      value={vehicleValueInEnglish(selectedLead.brakes)}
                    />
                    <Detail
                      label="Damage"
                      value={vehicleValueInEnglish(selectedLead.damage)}
                    />
                    <Detail
                      label="Gearbox"
                      value={vehicleValueInEnglish(selectedLead.gearbox)}
                    />
                    <Detail
                      label="Tires"
                      value={vehicleValueInEnglish(selectedLead.tires)}
                    />
                    <Detail
                      label="Tire sets included"
                      value={vehicleValueInEnglish(selectedLead.tireset)}
                    />
                    <Detail
                      label="Towbar"
                      value={vehicleValueInEnglish(selectedLead.towbar)}
                    />
                    <Detail
                      label="Warnings"
                      value={vehicleValueInEnglish(selectedLead.warnings)}
                    />
                    <Detail
                      label="Driveable"
                      value={
                        selectedLead.is_driveable === undefined
                          ? undefined
                          : selectedLead.is_driveable
                            ? 'Yes'
                            : 'No'
                      }
                    />
                    <Detail
                      label="Engine or transmission issues"
                      value={
                        selectedLead.has_engine_transmission_issues === undefined
                          ? undefined
                          : selectedLead.has_engine_transmission_issues
                            ? 'Yes'
                            : 'No'
                      }
                    />
                    <Detail
                      label="Fluid leaks"
                      value={
                        selectedLead.has_fluid_leaks === undefined
                          ? undefined
                          : selectedLead.has_fluid_leaks
                            ? 'Yes'
                            : 'No'
                      }
                    />
                    <Detail
                      label="Serious collision damage"
                      value={
                        selectedLead.has_serious_collision_damage === undefined
                          ? undefined
                          : selectedLead.has_serious_collision_damage
                            ? 'Yes'
                            : 'No'
                      }
                    />
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
                  {selectedLead.damage_translation_pending && (
                    <TranslationPending label="Damage description" />
                  )}
                  {selectedLead.equipment && (
                    <div className="mt-3 rounded-[14px] border border-[#c9e3f2] bg-[#eff8fd] px-4 py-3">
                      <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#52616b]">
                        Key equipment
                      </p>
                      <p className="mt-1 text-sm leading-6 text-blue-950">
                        {selectedLead.equipment}
                      </p>
                    </div>
                  )}
                  {selectedLead.equipment_translation_pending && (
                    <TranslationPending label="Equipment details" />
                  )}
                </section>
              </div>

              <aside className="bg-slate-50/60 p-5 sm:p-7">
                <div className="mb-6 rounded-[18px] border border-[#deddd7] bg-[#242424] p-5 text-white shadow-lg shadow-slate-900/10">
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

                {!isBiddingClosed(
                  selectedLead.created_at,
                  now,
                  selectedLead.auction_ends_at
                ) && (
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
                        className="h-14 w-full rounded-[14px] border border-slate-200 bg-white pl-9 pr-4 text-lg font-semibold outline-none transition focus:border-[#8dbdd8] focus:ring-4 focus:ring-[#B4D9EF]/35"
                      />
                    </div>

                    <div className="mt-4 overflow-hidden rounded-[14px] border border-[#d7e8f2] bg-white">
                      <div className="border-b border-[#e5edf1] bg-[#eff8fd] px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#52616b]">
                          Estimated purchase summary
                        </p>
                      </div>
                      <dl className="space-y-2 px-4 py-4 text-sm">
                        <BidCostRow
                          label="Your binding bid"
                          value={moneyFormatter.format(validBidAmount)}
                        />
                        <BidCostRow
                          label="Autorell buyer fee (3%, min. €750)"
                          value={moneyFormatter.format(estimatedBuyerFee)}
                        />
                        <BidCostRow
                          label="Autorell Verified Inspection"
                          value={moneyFormatter.format(
                            VERIFIED_INSPECTION_FEE
                          )}
                        />
                        <BidCostRow
                          label={`Estimated transport${
                            selectedLead?.pickup_city &&
                            dealer?.delivery_city
                              ? ` · ${selectedLead.pickup_city} → ${dealer.delivery_city}`
                              : ''
                          }`}
                          value={moneyFormatter.format(
                            ESTIMATED_TRANSPORT_FEE
                          )}
                        />
                        <BidCostRow
                          label="Export & documentation"
                          value={moneyFormatter.format(EXPORT_DOCUMENT_FEE)}
                        />
                        <div className="my-3 border-t border-[#deddd7]" />
                        <BidCostRow
                          label="Estimated total"
                          value={moneyFormatter.format(estimatedBuyerTotal)}
                          total
                        />
                      </dl>
                    </div>

                    <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-[10px] border border-[#deddd7] bg-white px-4 py-3">
                      <input
                        type="checkbox"
                        checked={bidTermsAccepted}
                        onChange={(event) =>
                          setBidTermsAccepted(event.target.checked)
                        }
                        className="mt-0.5 h-4 w-4 accent-[#242424]"
                      />
                      <span className="text-xs leading-5 text-[#52616b]">
                        I understand that this is a binding purchase offer and
                        that the final transport cost is confirmed based on the
                        vehicle route. I accept the{' '}
                        <Link
                          href="/dealer/legal#binding-bids"
                          target="_blank"
                          className="font-semibold text-[#242424] underline underline-offset-2"
                        >
                          Binding Bid Rules
                        </Link>{' '}
                        and{' '}
                        <Link
                          href="/dealer/legal#fees"
                          target="_blank"
                          className="font-semibold text-[#242424] underline underline-offset-2"
                        >
                          Buyer Fee Policy
                        </Link>
                        .
                      </span>
                    </label>

                    {bidError && (
                      <p className="mt-3 rounded-[5px] border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                        {bidError}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={submitBid}
                      disabled={
                        submittingBid ||
                        !validBidAmount ||
                        !bidTermsAccepted
                      }
                      className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#B4D9EF] px-4 text-sm font-normal text-[#242424] shadow-lg transition hover:bg-[#C9E6F6] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Gavel size={17} />
                      {submittingBid ? 'Submitting bid...' : 'Submit secure bid'}
                    </button>

                    <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-slate-400">
                      <ShieldCheck size={14} className="mt-0.5 shrink-0" />
                      Your bid is binding and linked to your approved dealer
                      account. Fees are shown before submission.
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
                              {item.dealer_id === currentUserId
                                ? 'Your bid'
                                : 'Anonymous dealer'}
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
    blue: 'bg-[#B4D9EF] text-[#242424]',
    emerald: 'bg-emerald-50 text-emerald-600',
    violet: 'bg-violet-50 text-violet-600',
    amber: 'bg-amber-50 text-amber-600',
  }

  return (
    <div className="group rounded-[18px] border border-[#deddd7] bg-white p-5 shadow-[0_8px_24px_rgba(32,33,36,.04)] transition hover:-translate-y-0.5 hover:border-[#c9c7c0] hover:shadow-[0_14px_34px_rgba(32,33,36,.08)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
        </div>
        <div
          className={`grid h-11 w-11 place-items-center rounded-[12px] ${accentClasses[accent]}`}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}

function ArchivePoint({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-52 rounded-[14px] border border-white/10 bg-white/6 px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-white/85">{value}</p>
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
    <div className="rounded-[14px] border border-[#deddd7] bg-[#f8f7f3] px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-700">
        {value || 'Not specified'}
      </p>
    </div>
  )
}

function TranslationPending({ label }: { label: string }) {
  return (
    <div className="mt-3 rounded-[12px] border border-amber-200 bg-amber-50 px-4 py-3">
      <p className="text-xs font-semibold text-amber-800">
        {label}: translation pending
      </p>
      <p className="mt-1 text-xs leading-5 text-amber-700">
        Autorell is reviewing the customer-provided text before it is released
        to dealers.
      </p>
    </div>
  )
}

function BidCostRow({
  label,
  value,
  total = false,
}: {
  label: string
  value: string
  total?: boolean
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 ${
        total ? 'text-base font-semibold text-[#242424]' : 'text-[#52616b]'
      }`}
    >
      <dt>{label}</dt>
      <dd className="shrink-0 font-semibold text-[#242424]">{value}</dd>
    </div>
  )
}

function FilterSelect({
  label,
  value,
  options,
  translateOptions = false,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  translateOptions?: boolean
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-slate-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-[14px] border border-[#d8d7d1] bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#8dbdd8]"
      >
        <option value="">All {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {label === 'Country'
              ? countryNames.of(option.toUpperCase()) || option
              : translateOptions
                ? vehicleValueInEnglish(option)
                : option}
          </option>
        ))}
      </select>
    </label>
  )
}

function QuickFilter({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 border px-4 py-2 text-xs font-semibold transition ${
        active
          ? 'border-[#242424] bg-[#242424] text-white'
          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
      }`}
    >
      {label}
    </button>
  )
}
