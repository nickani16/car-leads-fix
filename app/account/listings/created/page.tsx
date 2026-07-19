import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CheckCircle2, CreditCard, ListChecks, PlusCircle } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { getRequestLocale } from '@/lib/request-locale'
import { localizePublicHref, translatePublicObject, type PublicLocale } from '@/lib/public-i18n'

type SearchParams = Record<string, string | string[] | undefined>

export default async function ListingCreatedPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  return renderListingCreatedPage({ searchParams })
}

export async function renderListingCreatedPage({
  searchParams,
  localeOverride,
}: {
  searchParams: Promise<SearchParams>
  localeOverride?: PublicLocale
}) {
  const locale = localeOverride || await getRequestLocale()
  const copy = getListingCreatedCopy(locale)
  const query = await searchParams
  const listingId = firstParam(query.listing)
  const payment = firstParam(query.payment)
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(localizePublicHref(locale, '/'))

  let listing: { title: string | null; status: string | null; reference_number: string | null } | null = null
  if (listingId) {
    const { data } = await createAdminClient()
      .from('marketplace_listings')
      .select('title,status,reference_number')
      .eq('id', listingId)
      .eq('seller_user_id', user.id)
      .maybeSingle()
    listing = data
  }

  const isPaymentProcessing = payment === 'processing'
  const statusText = isPaymentProcessing
    ? copy.paymentProcessing
    : listing?.status === 'published'
      ? copy.published
      : copy.review

  return (
    <main className="min-h-screen bg-[#f6f8fb] px-4 py-12 sm:px-6 lg:py-20">
      <section className="mx-auto max-w-[760px] overflow-hidden rounded-[28px] border border-[#dbe4f0] bg-white shadow-[0_24px_80px_rgba(16,24,40,.08)]">
        <div className="border-b border-[#e6ebf2] bg-[#f8fbff] p-6 sm:p-8">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#eaf2ff] text-[#0866ff]">
            {isPaymentProcessing ? <CreditCard className="h-6 w-6" /> : <CheckCircle2 className="h-6 w-6" />}
          </span>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[.18em] text-[#0866ff]">
            Autorell
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-.04em] text-[#101828] sm:text-5xl">
            {isPaymentProcessing ? copy.paymentTitle : copy.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#536176]">
            {isPaymentProcessing ? copy.paymentText : copy.text}
          </p>
        </div>

        <div className="p-6 sm:p-8">
          <div className="rounded-[20px] border border-[#dbe4f0] bg-white p-5">
            <p className="text-sm font-semibold text-[#667085]">{copy.status}</p>
            <p className="mt-1 text-xl font-semibold text-[#101828]">{statusText}</p>
            {listing?.title ? <p className="mt-3 text-sm text-[#475467]">{listing.title}</p> : null}
            {listing?.reference_number ? (
              <p className="mt-1 text-sm text-[#667085]">{copy.reference}: {listing.reference_number}</p>
            ) : null}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link
              href={localizePublicHref(locale, '/account/listings')}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] bg-[#0866ff] px-5 text-sm font-semibold text-white"
            >
              <ListChecks className="h-4 w-4" />
              {copy.myListings}
            </Link>
            <Link
              href={localizePublicHref(locale, '/account/listings/new')}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] border border-[#ccd8ea] bg-white px-5 text-sm font-semibold text-[#101828]"
            >
              <PlusCircle className="h-4 w-4" />
              {copy.createMore}
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

function getListingCreatedCopy(locale: PublicLocale) {
  const en = {
    title: 'Your listing is ready',
    text: 'The listing has been saved. If it passes the automatic checks, it becomes visible on Autorell right away.',
    paymentTitle: 'Payment received',
    paymentText: 'Stripe has sent you back to Autorell. We are confirming the payment and updating the listing status.',
    status: 'Status',
    published: 'Published',
    review: 'Saved for review',
    paymentProcessing: 'Payment is being confirmed',
    reference: 'Reference',
    myListings: 'Open my listings',
    createMore: 'Create another listing',
  }
  if (locale === 'sv') {
    return {
      title: 'Annonsen är klar',
      text: 'Annonsen är sparad. Om den går igenom de automatiska kontrollerna syns den direkt på Autorell.',
      paymentTitle: 'Betalningen är mottagen',
      paymentText: 'Stripe har skickat tillbaka dig till Autorell. Vi bekräftar betalningen och uppdaterar annonsens status.',
      status: 'Status',
      published: 'Publicerad',
      review: 'Sparad för granskning',
      paymentProcessing: 'Betalningen bekräftas',
      reference: 'Referens',
      myListings: 'Öppna mina annonser',
      createMore: 'Skapa en till annons',
    }
  }
  return translatePublicObject(locale, en)
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}
