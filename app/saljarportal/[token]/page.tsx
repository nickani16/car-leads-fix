import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Clock3,
  Crown,
  Eye,
  Gavel,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStripe } from '@/lib/stripe'
import { fulfillListingCheckout, listingPackages } from '@/lib/listing-packages'
import { hashSellerAccessToken } from '@/lib/seller-access'
import BrandLogo from '@/app/components/BrandLogo'
import CheckoutButton from './CheckoutButton'

export const metadata: Metadata = {
  title: 'Din bilförsäljning | Autorell',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

function formatDate(value: string | null) {
  if (!value) return 'Inte fastställt'
  return new Intl.DateTimeFormat('sv-SE', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Stockholm',
  }).format(new Date(value))
}

export default async function SellerPortalPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>
  searchParams: Promise<{ payment?: string; session_id?: string }>
}) {
  const { token } = await params
  const query = await searchParams

  if (query.payment === 'success' && query.session_id) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(
        query.session_id
      )
      if (session.metadata?.sellerTokenHash === hashSellerAccessToken(token)) {
        await fulfillListingCheckout(session)
      }
    } catch (error) {
      console.error('Checkout confirmation error:', error)
    }
  }

  const supabase = createAdminClient()
  const { data: lead } = await supabase
    .from('leads')
    .select(
      'id,reg,make,model,model_year,status,created_at,auction_starts_at,auction_ends_at,auction_closed_at,auction_outcome,listing_plan,dealer_reach_snapshot,autorell_purchase_price'
    )
    .eq('seller_access_token_hash', hashSellerAccessToken(token))
    .single()

  if (!lead) notFound()

  const [
    { data: bids },
    { count: views },
    { data: orders },
    { data: activeDeal },
  ] =
    await Promise.all([
      supabase
        .from('bids')
        .select('amount,dealer_id,created_at')
        .eq('lead_id', lead.id),
      supabase
        .from('vehicle_listing_views')
        .select('id', { count: 'exact', head: true })
        .eq('lead_id', lead.id),
      supabase
        .from('seller_listing_orders')
        .select('id,package,status,amount_cents,created_at,activated_at,expires_at')
        .eq('lead_id', lead.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('deals')
        .select('id,status,seller_net_amount')
        .eq('lead_id', lead.id)
        .not('status', 'in', '("cancelled","completed")')
        .maybeSingle(),
    ])

  const bidAmounts = (bids || []).map((bid) => Number(bid.amount))
  const uniqueBidders = new Set(
    (bids || []).map((bid) => bid.dealer_id).filter(Boolean)
  ).size
  const autorellOffer = Number(
    activeDeal?.seller_net_amount || lead.autorell_purchase_price || 0
  )
  const isPendingReview = lead.status === 'Pending review'
  const isActive = lead.status === 'Active' && !lead.auction_closed_at
  const hasPackageOrder = Boolean(
    orders?.some((order) => order.status === 'paid')
  )
  const canUpgrade = !activeDeal && !hasPackageOrder
  const showLegacyPackages = Boolean(orders?.length)
  const bidMoney = new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  })
  const packageMoney = new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: 'SEK',
    maximumFractionDigits: 0,
  })

  return (
    <main className="min-h-screen bg-[#f4f3ee] text-[#202124]">
      <header className="border-b border-black/8 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-5 sm:px-8">
          <Link href="/" aria-label="Till Autorells startsida">
            <BrandLogo />
          </Link>
          <Link
            href="/kontakt"
            className="text-sm font-medium text-[#596269] hover:text-black"
          >
            Kontakta oss
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-[1240px] px-5 py-10 sm:px-8 lg:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#687178] hover:text-black"
        >
          <ArrowLeft size={15} />
          Till Autorell
        </Link>

        {query.payment === 'success' ? (
          <div className="mt-7 flex items-start gap-3 rounded-[20px] border border-emerald-200 bg-emerald-50 p-5 text-emerald-950">
            <CheckCircle2 className="mt-0.5 shrink-0" size={20} />
            <div>
              <p className="font-medium">Betalningen är registrerad.</p>
              <p className="mt-1 text-sm text-emerald-800">
                {isPendingReview
                  ? 'Paketet är reserverat och startar först när Autorell har godkänt bilen.'
                  : 'Din nya budgivningsperiod är aktiverad och synlig nedan.'}
              </p>
            </div>
          </div>
        ) : null}

        <section className="mt-7 overflow-hidden rounded-[30px] bg-[#202528] text-white shadow-[0_28px_90px_rgba(30,35,38,.18)]">
          <div className="grid gap-8 p-7 sm:p-10 lg:grid-cols-[1.35fr_.65fr] lg:p-12">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#B4D9EF]">
                Din försäljning
              </p>
              <h1 className="mt-5 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
                {lead.make} {lead.model}
              </h1>
              <p className="mt-3 text-white/60">
                {lead.model_year} · {lead.reg}
              </p>
              <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm">
                <span
                  className={`h-2 w-2 rounded-full ${
                    isActive ? 'bg-emerald-400' : 'bg-white/40'
                  }`}
                />
                {isPendingReview
                  ? 'Väntar på Autorells granskning'
                  : isActive
                    ? 'Autorell testar europeisk efterfrågan'
                    : 'Marknadsbedömningen är avslutad'}
              </div>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-white/7 p-6">
              <p className="text-xs uppercase tracking-[0.18em] text-white/45">
                Nuvarande paket
              </p>
              <p className="mt-3 text-xl font-medium">
                {lead.listing_plan === 'managed_sale'
                  ? 'Autorell Managed Sale'
                  : lead.listing_plan === 'premium_30d'
                    ? 'Premium 15 dagar'
                  : lead.listing_plan === 'extended_7d'
                    ? '7 dagars exponering'
                    : 'Kostnadsfria 24 timmar'}
              </p>
              <div className="mt-7 border-t border-white/10 pt-5">
                <p className="text-xs text-white/45">
                  {isPendingReview ? 'Beräknad granskningstid' : 'Slutar'}
                </p>
                <p className="mt-2 text-sm">
                  {isPendingReview
                    ? 'Cirka 1–2 timmar'
                    : formatDate(lead.auction_ends_at)}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: 'Handlarnätverk',
              value: 'Europa',
              detail: 'verifierade professionella köpare',
              icon: Users,
            },
            {
              label: 'Handlarvisningar',
              value: views || 0,
              detail: 'unika per dag',
              icon: Eye,
            },
            {
              label: 'Mottagna bud',
              value: bidAmounts.length,
              detail: `${uniqueBidders} unika budgivare`,
              icon: Gavel,
            },
            {
              label: 'Autorells erbjudande',
              value: autorellOffer
                ? bidMoney.format(autorellOffer)
                : 'Inte lämnat',
              detail: 'ditt möjliga nettopris från Autorell',
              icon: BarChart3,
            },
          ].map((metric) => (
            <article
              key={metric.label}
              className="rounded-[22px] border border-[#deddd7] bg-white p-6"
            >
              <metric.icon size={20} className="text-[#4f8fb5]" />
              <p className="mt-8 text-xs uppercase tracking-[0.15em] text-[#7b8287]">
                {metric.label}
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
                {metric.value}
              </p>
              <p className="mt-1 text-sm text-[#7b8287]">{metric.detail}</p>
            </article>
          ))}
        </section>

        {showLegacyPackages && (
        <section id="packages" className="mt-12 scroll-mt-24">
          <div className="max-w-2xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#697278]">
              Mer tid på marknaden
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Förläng bara när du behöver det.
            </h2>
            <p className="mt-4 leading-7 text-[#697278]">
              Välj paket direkt. Tiden börjar räknas först när Autorell har
              granskat och godkänt bilen.
            </p>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            <article className="rounded-[26px] border border-[#dcdad3] bg-white p-7 sm:p-8">
              <Clock3 size={23} className="text-[#4f8fb5]" />
              <p className="mt-7 text-sm font-medium text-[#687178]">
                7 dagar
              </p>
              <div className="mt-2 flex items-end justify-between gap-4">
                <h3 className="text-2xl font-semibold">Fortsatt budgivning</h3>
                <p className="text-3xl font-semibold">100 kr</p>
              </div>
              <p className="mt-4 text-sm leading-6 text-[#697278]">
                Bilen återöppnas för verifierade handlare i sju dagar. Alla
                nya visningar och bud syns i den här vyn.
              </p>
              <CheckoutButton
                token={token}
                packageId="extended_7d"
                disabled={!canUpgrade}
              />
            </article>
            <article className="relative overflow-hidden rounded-[26px] border border-[#d2b46c] bg-[#fff9e9] p-7 sm:p-8">
              <div className="absolute right-0 top-0 h-36 w-36 translate-x-10 -translate-y-10 rounded-full bg-[#f3d98f]" />
              <Sparkles size={23} className="relative text-[#8b6815]" />
              <p className="relative mt-7 text-sm font-medium text-[#806619]">
                Managed Sale · 15 dagar
              </p>
              <div className="relative mt-2 flex items-end justify-between gap-4">
                <h3 className="text-2xl font-semibold">Personlig försäljning</h3>
                <p className="text-3xl font-semibold">1 500 kr</p>
              </div>
              <p className="relative mt-4 text-sm leading-6 text-[#735f31]">
                En utsedd Autorell-säljare får uppdraget att prioritera bilen
                aktivt mot vårt europeiska köparnätverk.
              </p>
              <CheckoutButton
                token={token}
                packageId="managed_sale"
                disabled={!canUpgrade}
              />
            </article>

            <article className="relative overflow-hidden rounded-[26px] border border-[#9bc9e4] bg-[#eaf5fb] p-7 sm:p-8">
              <div className="absolute right-0 top-0 h-36 w-36 translate-x-10 -translate-y-10 rounded-full bg-[#B4D9EF]" />
              <Crown size={23} className="relative text-[#276d96]" />
              <p className="relative mt-7 text-sm font-medium text-[#51758a]">
                Premium · 15 dagar
              </p>
              <div className="relative mt-2 flex items-end justify-between gap-4">
                <h3 className="text-2xl font-semibold">
                  Prioriterad placering
                </h3>
                <p className="text-3xl font-semibold">290 kr</p>
              </div>
              <p className="relative mt-4 text-sm leading-6 text-[#526d7c]">
                Längre exponering och högre placering i handlarflödet, med
                samma tydliga statistik över faktisk aktivitet.
              </p>
              <CheckoutButton
                token={token}
                packageId="premium_30d"
                disabled={!canUpgrade}
              />
            </article>
          </div>
        </section>
        )}

        <section className="mt-12 grid gap-5 rounded-[26px] border border-[#deddd7] bg-white p-7 sm:p-9 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <ShieldCheck size={25} className="text-[#4f8fb5]" />
            <h2 className="mt-5 text-2xl font-semibold">
              Vad betalningen faktiskt ger
            </h2>
          </div>
          <div className="grid gap-4 text-sm leading-6 text-[#687178] sm:grid-cols-2">
            <p>En tidsstämplad aktivering med exakt slutdatum.</p>
            <p>Synlig räckvidd till godkända handlare.</p>
            <p>Registrerade handlarvisningar och unika budgivare.</p>
            <p>Betalningshistorik och paketstatus i samma vy.</p>
          </div>
        </section>

        {orders?.length ? (
          <section className="mt-12">
            <h2 className="text-xl font-semibold">Betalningshistorik</h2>
            <div className="mt-4 overflow-hidden rounded-[22px] border border-[#deddd7] bg-white">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col justify-between gap-3 border-b border-[#eceae5] px-6 py-5 last:border-0 sm:flex-row sm:items-center"
                >
                  <div>
                    <p className="font-medium">
                      {order.package in listingPackages
                        ? listingPackages[
                            order.package as keyof typeof listingPackages
                          ].name
                        : order.package}
                    </p>
                    <p className="mt-1 text-sm text-[#788087]">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="font-medium">
                      {packageMoney.format(order.amount_cents / 100)}
                    </p>
                    <p className="mt-1 text-sm capitalize text-[#788087]">
                      {order.status === 'paid'
                        ? 'Betald och aktiverad'
                        : order.status === 'pending'
                          ? 'Väntar på betalning'
                          : order.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  )
}
