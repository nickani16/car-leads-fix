import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import {
  ArrowRight,
  BadgeEuro,
  CarFront,
  CheckCircle2,
  Clock3,
  Eye,
  Gavel,
  Info,
  Pencil,
  Plus,
  Truck,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { fulfillListingCheckout } from '@/lib/listing-packages'
import { getStripe } from '@/lib/stripe'
import SellerDecisionButtons from './SellerDecisionButtons'
import DealerListingCheckoutButton from './DealerListingCheckoutButton'

const money = new Intl.NumberFormat('en-IE', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

type SearchParams = Promise<{
  submitted?: string
  edited?: string
  payment?: string
  session_id?: string
}>

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

  if (params.payment === 'success' && params.session_id) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(
        params.session_id
      )
      if (session.metadata?.dealerId === dealer.id) {
        await fulfillListingCheckout(session)
      }
    } catch (error) {
      console.error('Dealer checkout confirmation failed', error)
    }
  }

  const { data: listings } = await admin
    .from('leads')
    .select(
      'id,reg,make,model,model_year,miles,status,sale_format,seller_target_price,autorell_purchase_price,reserve_price,buy_now_price,auction_starts_at,auction_ends_at,auction_closed_at,auction_outcome,images,created_at,listing_plan'
    )
    .eq('seller_dealer_id', dealer.id)
    .order('created_at', { ascending: false })

  const leadIds = (listings || []).map((listing) => listing.id)
  const [
    { data: bids },
    { data: deals },
    { data: views },
    { data: orders },
  ] = leadIds.length
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
        admin
          .from('seller_listing_orders')
          .select('lead_id,status,package')
          .in('lead_id', leadIds)
          .order('created_at', { ascending: false }),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }, { data: [] }]

  const bidsByLead = (bids || []).reduce<Record<string, number[]>>(
    (grouped, bid) => {
      grouped[bid.lead_id] ||= []
      grouped[bid.lead_id].push(Number(bid.amount))
      return grouped
    },
    {}
  )
  const dealByLead = new Map((deals || []).map((deal) => [deal.lead_id, deal]))
  const orderByLead = new Map<
    string,
    { status: string; package: string }
  >()
  for (const order of orders || []) {
    if (!orderByLead.has(order.lead_id)) {
      orderByLead.set(order.lead_id, {
        status: order.status,
        package: order.package,
      })
    }
  }
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
            Follow Autorell&apos;s assessment, conditional purchase offer,
            European demand and completed stock sales in one place.
          </p>
        </div>
        <Link
          href="/dealer/sell"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#242424] px-6 text-sm font-semibold text-white"
        >
          <Plus size={17} />
          Offer stock
        </Link>
      </section>

      {params.submitted === '1' && (
        <div className="mt-6 flex items-start gap-3 rounded-[18px] border border-[#b8dfc5] bg-[#eaf7ee] px-5 py-4 text-sm text-[#176b39]">
          <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
          Vehicle submitted. Autorell will assess export demand and may return
          with a conditional purchase offer.
        </div>
      )}
      {params.edited === '1' && (
        <div className="mt-6 flex items-start gap-3 rounded-[18px] border border-[#b8dfc5] bg-[#eaf7ee] px-5 py-4 text-sm text-[#176b39]">
          <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
          Changes saved. The vehicle is hidden from buyers and waiting for a
          new Autorell review.
        </div>
      )}
      {params.payment === 'success' && (
        <div className="mt-6 flex items-start gap-3 rounded-[18px] border border-[#b8dfc5] bg-[#eaf7ee] px-5 py-4 text-sm text-[#176b39]">
          <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
          Payment received. The vehicle is waiting for Autorell&apos;s review.
        </div>
      )}
      {params.payment === 'cancelled' && (
        <div className="mt-6 flex items-start gap-3 rounded-[18px] border border-[#ead49b] bg-[#fff9e9] px-5 py-4 text-sm text-[#735f31]">
          <Info size={19} className="mt-0.5 shrink-0" />
          Payment was not completed. You can resume it from the vehicle below.
        </div>
      )}

      <div className="mt-6 flex items-start gap-3 rounded-[18px] border border-[#c9dce5] bg-[#f1f7fa] px-5 py-4 text-sm text-[#526b78]">
        <Info size={18} className="mt-0.5 shrink-0 text-[#397b9f]" />
        <p>
          Your company supplies the vehicle to Autorell. European buyers only
          see Autorell&apos;s export offer and never your requested net price.
        </p>
      </div>

      <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric icon={<CarFront />} label="Active export offers" value={activeCount} />
        <Metric icon={<Clock3 />} label="Awaiting assessment" value={pendingCount} />
        <Metric icon={<CheckCircle2 />} label="Sales to Autorell" value={soldCount} />
        <Metric
          icon={<BadgeEuro />}
          label="Accepted seller value"
          value={money.format(sellerValue)}
        />
      </section>

      <section className="mt-7 space-y-4">
        {(listings || []).length ? (
          listings!.map((listing) => {
            const images = Array.isArray(listing.images)
              ? (listing.images as string[])
              : []
            const listingBids = bidsByLead[listing.id] || []
            const highestBid = listingBids.length
              ? Math.max(...listingBids)
              : null
            const deal = dealByLead.get(listing.id)
            const listingOrder = orderByLead.get(listing.id)
            const canEdit =
              !deal &&
              listingBids.length === 0 &&
              ['Pending review', 'Active', 'Rejected'].includes(
                listing.status || ''
              )

            return (
              <article
                key={listing.id}
                className="overflow-hidden rounded-[22px] border border-[#deddd7] bg-white shadow-[0_12px_36px_rgba(32,33,36,.05)]"
              >
                <div className="grid lg:grid-cols-[1.35fr_.8fr_.9fr]">
                  <div className="grid sm:grid-cols-[150px_1fr] lg:border-r lg:border-[#eceae5]">
                    <div className="relative min-h-36 overflow-hidden bg-[#e8edef] sm:min-h-full">
                      {images[0] ? (
                        <Image
                          src={images[0]}
                          alt={`${listing.make || 'Vehicle'} ${listing.model || ''}`}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        <div className="grid h-full min-h-36 place-items-center text-[#8aa0ab]">
                          <CarFront size={30} />
                        </div>
                      )}
                      {listing.status === 'Active' && !listing.auction_closed_at && (
                        <span className="absolute left-3 top-3 rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-semibold text-white shadow">
                          Live to buyers
                        </span>
                      )}
                    </div>
                    <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.16em] text-[#7d8386]">
                          Vehicle offered to Autorell
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
                  </div>

                  <div className="border-t border-[#eceae5] p-6 lg:border-r lg:border-t-0">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-[#7d8386]">
                      Your supply value
                    </p>
                    <p className="mt-3 text-2xl font-semibold">
                      {money.format(
                        Number(
                          listing.autorell_purchase_price ||
                            listing.seller_target_price ||
                            0
                        )
                      )}
                    </p>
                    <p className="mt-1 text-xs text-[#70777b]">
                      {listing.autorell_purchase_price
                        ? 'Conditional Autorell purchase price'
                        : 'Your requested net price'}
                    </p>
                    {highestBid ? (
                      <p className="mt-4 text-xs font-semibold text-emerald-700">
                        European demand confirmed
                      </p>
                    ) : null}
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
                          Autorell purchase offer{' '}
                          {money.format(Number(deal.seller_net_amount))}
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
                            ? 'Waiting for Autorell assessment'
                            : listing.auction_closed_at
                              ? 'Listing closed'
                              : 'Autorell is testing European demand'}
                        </p>
                        <p className="mt-2 text-xs leading-5 text-[#70777b]">
                          Purchase, payment and collection status appears here
                          after your company accepts Autorell&apos;s offer.
                        </p>
                        {listingOrder && listingOrder.status !== 'paid' ? (
                          <DealerListingCheckoutButton leadId={listing.id} />
                        ) : null}
                        {canEdit ? (
                          <Link
                            href={`/dealer/sales/${listing.id}/edit`}
                            className="mt-5 inline-flex h-10 items-center gap-2 rounded-full border border-[#c7d8e0] bg-white px-4 text-xs font-semibold text-[#315f74] transition hover:border-[#7faec3]"
                          >
                            <Pencil size={14} />
                            Edit vehicle
                          </Link>
                        ) : null}
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
              Offer your first Swedish stock vehicle to Autorell for export
              assessment.
            </p>
            <Link
              href="/dealer/sell"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#242424] px-5 py-3 text-sm text-white"
            >
              Offer first vehicle
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
