import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  ArrowRight,
  BadgeEuro,
  CarFront,
  CheckCircle2,
  Clock3,
  Eye,
  Gavel,
  Plus,
  Truck,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import SellerDecisionButtons from './SellerDecisionButtons'

const money = new Intl.NumberFormat('en-IE', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

type SearchParams = Promise<{ submitted?: string }>

export default async function DealerSalesPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: dealer } = await admin
    .from('dealers')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!dealer) redirect('/login?status=dealer-not-found')

  const { data: listings } = await admin
    .from('leads')
    .select(
      'id,reg,make,model,model_year,miles,status,sale_format,reserve_price,buy_now_price,auction_starts_at,auction_ends_at,auction_closed_at,auction_outcome,created_at'
    )
    .eq('seller_dealer_id', dealer.id)
    .order('created_at', { ascending: false })

  const leadIds = (listings || []).map((listing) => listing.id)
  const [{ data: bids }, { data: deals }, { data: views }] = leadIds.length
    ? await Promise.all([
        admin
          .from('bids')
          .select('lead_id,amount,created_at')
          .in('lead_id', leadIds)
          .order('amount', { ascending: false }),
        admin
          .from('deals')
          .select(
            'id,lead_id,status,winning_bid_amount,seller_net_amount,seller_decision,created_at'
          )
          .in('lead_id', leadIds),
        admin
          .from('vehicle_listing_views')
          .select('lead_id')
          .in('lead_id', leadIds),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }]

  const bidsByLead = (bids || []).reduce<Record<string, number[]>>(
    (grouped, bid) => {
      grouped[bid.lead_id] ||= []
      grouped[bid.lead_id].push(Number(bid.amount))
      return grouped
    },
    {}
  )
  const dealByLead = new Map((deals || []).map((deal) => [deal.lead_id, deal]))
  const viewsByLead = (views || []).reduce<Record<string, number>>(
    (grouped, view) => {
      grouped[view.lead_id] = (grouped[view.lead_id] || 0) + 1
      return grouped
    },
    {}
  )

  const activeCount = (listings || []).filter(
    (listing) => listing.status === 'Active' && !listing.auction_closed_at
  ).length
  const pendingCount = (listings || []).filter(
    (listing) => listing.status === 'Pending review'
  ).length
  const soldCount = (deals || []).filter(
    (deal) => !['cancelled', 'provisional_winner', 'seller_review'].includes(deal.status)
  ).length
  const sellerValue = (deals || [])
    .filter((deal) => deal.seller_decision === 'accepted')
    .reduce((sum, deal) => sum + Number(deal.seller_net_amount || 0), 0)

  return (
    <main className="mx-auto max-w-[1240px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#6f767a]">
            Dealer selling
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
            My sales
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#687177]">
            Follow review, buyer activity, winning offers, payment and collection
            in one place.
          </p>
        </div>
        <Link
          href="/dealer/sell"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#242424] px-6 text-sm font-semibold text-white"
        >
          <Plus size={17} />
          List vehicle
        </Link>
      </section>

      {params.submitted === '1' && (
        <div className="mt-6 flex items-start gap-3 rounded-[18px] border border-[#b8dfc5] bg-[#eaf7ee] px-5 py-4 text-sm text-[#176b39]">
          <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
          Vehicle submitted. Autorell will review it before publication.
        </div>
      )}

      <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric icon={<CarFront />} label="Active listings" value={activeCount} />
        <Metric icon={<Clock3 />} label="Awaiting review" value={pendingCount} />
        <Metric icon={<CheckCircle2 />} label="Accepted sales" value={soldCount} />
        <Metric
          icon={<BadgeEuro />}
          label="Accepted seller value"
          value={money.format(sellerValue)}
        />
      </section>

      <section className="mt-7 space-y-4">
        {(listings || []).length ? (
          listings!.map((listing) => {
            const listingBids = bidsByLead[listing.id] || []
            const highestBid = listingBids.length
              ? Math.max(...listingBids)
              : null
            const deal = dealByLead.get(listing.id)
            const reserve = Number(listing.reserve_price || 0)
            const reserveMet =
              listing.sale_format !== 'auction' ||
              (highestBid !== null && highestBid >= reserve)

            return (
              <article
                key={listing.id}
                className="overflow-hidden rounded-[22px] border border-[#deddd7] bg-white shadow-[0_12px_36px_rgba(32,33,36,.05)]"
              >
                <div className="grid lg:grid-cols-[1.2fr_.85fr_.9fr]">
                  <div className="p-6 lg:border-r lg:border-[#eceae5]">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.16em] text-[#7d8386]">
                          {listing.sale_format === 'marketplace'
                            ? 'Fixed price'
                            : 'Auction'}
                        </p>
                        <h2 className="mt-2 text-xl font-semibold">
                          {listing.make || 'Vehicle'} {listing.model || ''}
                        </h2>
                        <p className="mt-1 text-sm text-[#70777b]">
                          {listing.reg} · {listing.model_year} ·{' '}
                          {Number(listing.miles || 0) * 10} km
                        </p>
                      </div>
                      <StatusBadge status={listing.status || 'New'} />
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2 text-xs text-[#596166]">
                      <span className="flex items-center gap-1.5 rounded-full bg-[#f4f3ef] px-3 py-2">
                        <Eye size={13} />
                        {viewsByLead[listing.id] || 0} views
                      </span>
                      <span className="flex items-center gap-1.5 rounded-full bg-[#f4f3ef] px-3 py-2">
                        <Gavel size={13} />
                        {listingBids.length} bids
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-[#eceae5] p-6 lg:border-r lg:border-t-0">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-[#7d8386]">
                      Pricing
                    </p>
                    <p className="mt-3 text-2xl font-semibold">
                      {money.format(
                        listing.sale_format === 'marketplace'
                          ? Number(listing.buy_now_price || 0)
                          : Number(highestBid || 0)
                      )}
                    </p>
                    <p className="mt-1 text-xs text-[#70777b]">
                      {listing.sale_format === 'marketplace'
                        ? 'Fixed vehicle price'
                        : highestBid
                          ? 'Current highest bid'
                          : 'No bids yet'}
                    </p>
                    {listing.sale_format === 'auction' && (
                      <p
                        className={`mt-4 text-xs font-semibold ${
                          reserveMet ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        Reserve {money.format(reserve)} ·{' '}
                        {reserveMet ? 'met' : 'not met'}
                      </p>
                    )}
                  </div>

                  <div className="border-t border-[#eceae5] bg-[#faf9f6] p-6 lg:border-t-0">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-[#7d8386]">
                      Transaction
                    </p>
                    {deal ? (
                      <>
                        <p className="mt-3 font-semibold">
                          {dealStatusLabel(deal.status)}
                        </p>
                        <p className="mt-1 text-sm text-[#70777b]">
                          Winning offer {money.format(Number(deal.winning_bid_amount))}
                        </p>
                        {['provisional_winner', 'seller_review'].includes(
                          deal.status
                        ) && !deal.seller_decision ? (
                          <SellerDecisionButtons dealId={deal.id} />
                        ) : (
                          <div className="mt-4 flex items-center gap-2 text-xs text-[#596166]">
                            {dealStatusIcon(deal.status)}
                            {dealStatusDetail(deal.status)}
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="mt-3 text-sm font-medium">
                          {listing.status === 'Pending review'
                            ? 'Waiting for Autorell review'
                            : listing.auction_closed_at
                              ? 'Listing closed'
                              : 'Waiting for buyer activity'}
                        </p>
                        <p className="mt-2 text-xs leading-5 text-[#70777b]">
                          Payment and collection status appears here after an
                          offer is accepted.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </article>
            )
          })
        ) : (
          <div className="rounded-[22px] border border-dashed border-[#cfcac0] bg-white px-6 py-14 text-center">
            <CarFront size={28} className="mx-auto text-[#8aaec2]" />
            <h2 className="mt-4 text-lg font-semibold">No vehicles listed yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#70777b]">
              Add your first vehicle and choose auction or fixed price. Autorell
              reviews it before buyers see it.
            </p>
            <Link
              href="/dealer/sell"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#242424] px-5 py-3 text-sm text-white"
            >
              List first vehicle
              <ArrowRight size={15} />
            </Link>
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
  value: string | number
}) {
  return (
    <div className="rounded-[18px] border border-[#deddd7] bg-white p-5">
      <div className="mb-4 text-[#52768a]">{icon}</div>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-[#73797c]">{label}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === 'Active'
      ? 'bg-emerald-50 text-emerald-700'
      : status === 'Rejected'
        ? 'bg-red-50 text-red-700'
        : 'bg-amber-50 text-amber-700'
  return (
    <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${tone}`}>
      {status}
    </span>
  )
}

function dealStatusLabel(status: string) {
  const labels: Record<string, string> = {
    provisional_winner: 'Your decision is required',
    seller_review: 'Your decision is required',
    seller_accepted: 'Offer accepted',
    contracts_pending: 'Contracts in preparation',
    contracts_ready: 'Contracts ready',
    contracts_signed: 'Contracts signed',
    payment_pending: 'Waiting for buyer payment',
    funded: 'Buyer payment received',
    pickup_scheduled: 'Collection scheduled',
    vehicle_collected: 'Vehicle collected',
    seller_paid: 'Seller payout completed',
    export_in_progress: 'Export in progress',
    delivered: 'Vehicle delivered',
    completed: 'Sale completed',
    cancelled: 'Transaction cancelled',
    disputed: 'Transaction under review',
  }
  return labels[status] || status.replaceAll('_', ' ')
}

function dealStatusDetail(status: string) {
  if (['payment_pending', 'contracts_signed'].includes(status)) {
    return 'Payment is being coordinated by Autorell.'
  }
  if (status === 'funded') return 'Funds are cleared. Collection can be arranged.'
  if (status === 'pickup_scheduled') return 'Collection details are being coordinated.'
  if (['vehicle_collected', 'export_in_progress', 'delivered'].includes(status)) {
    return 'The vehicle is in the collection and delivery flow.'
  }
  if (['seller_paid', 'completed'].includes(status)) {
    return 'Seller payment and completion are recorded.'
  }
  return 'Autorell is coordinating the next transaction step.'
}

function dealStatusIcon(status: string) {
  if (
    ['pickup_scheduled', 'vehicle_collected', 'export_in_progress', 'delivered'].includes(
      status
    )
  ) {
    return <Truck size={15} />
  }
  if (['seller_paid', 'completed'].includes(status)) {
    return <CheckCircle2 size={15} />
  }
  return <Clock3 size={15} />
}
