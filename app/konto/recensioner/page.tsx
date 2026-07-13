import { redirect } from 'next/navigation'
import { Star } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { generateAccountMetadata } from '@/lib/account-seo'
import { getRequestLocale } from '@/lib/request-locale'
import { localizePublicHref, translatePublicObject, type PublicLocale } from '@/lib/public-i18n'
import { publicSellerName } from '@/lib/public-seller'
import ReviewFlowPanel from '../ReviewFlowPanel'

export const generateMetadata = generateAccountMetadata('reviews')

type ConversationRow = {
  id: string
  listing_id: string
  buyer_user_id: string
  seller_user_id: string
}

type ListingRow = {
  id: string
  title: string
  status: string
  seller_user_id: string
}

type ProfileRow = {
  user_id: string
  account_type: string | null
  first_name: string | null
  display_name: string | null
  company_name: string | null
}

type ReviewRow = {
  id: string
  listing_id: string
  reviewer_id: string
  reviewee_id: string
  rating: number
  comment: string | null
  created_at: string
}

export default async function ReviewsPage() {
  const locale = await getRequestLocale()
  const copy = getReviewsPageCopy(locale)
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(localizePublicHref(locale, '/login'))

  const admin = createAdminClient()
  const { data: conversationData } = await admin
    .from('marketplace_conversations')
    .select('id,listing_id,buyer_user_id,seller_user_id')
    .or(`buyer_user_id.eq.${user.id},seller_user_id.eq.${user.id}`)
    .not('listing_id', 'is', null)

  const conversations = (conversationData || []) as ConversationRow[]
  const listingIds = [...new Set(conversations.map((item) => item.listing_id).filter(Boolean))]
  const participantIds = [
    ...new Set(conversations.flatMap((item) => [item.buyer_user_id, item.seller_user_id]).filter(Boolean)),
  ]

  const [{ data: listingData }, { data: profileData }, { data: reviewData }] = await Promise.all([
    listingIds.length
      ? admin
          .from('marketplace_listings')
          .select('id,title,status,seller_user_id')
          .in('id', listingIds)
      : Promise.resolve({ data: [] }),
    participantIds.length
      ? admin
          .from('marketplace_profiles')
          .select('user_id,account_type,first_name,display_name,company_name')
          .in('user_id', participantIds)
      : Promise.resolve({ data: [] }),
    admin
      .from('marketplace_reviews')
      .select('id,listing_id,reviewer_id,reviewee_id,rating,comment,created_at')
      .or(`reviewer_id.eq.${user.id},reviewee_id.eq.${user.id}`)
      .order('created_at', { ascending: false }),
  ])

  const listingsById = new Map(((listingData || []) as ListingRow[]).map((listing) => [listing.id, listing]))
  const profilesById = new Map(((profileData || []) as ProfileRow[]).map((profile) => [profile.user_id, profile]))
  const reviews = (reviewData || []) as ReviewRow[]
  const reviewedKeys = new Set(reviews.filter((review) => review.reviewer_id === user.id).map((review) => `${review.listing_id}:${review.reviewee_id}`))

  const opportunities = conversations
    .map((conversation) => {
      const listing = listingsById.get(conversation.listing_id)
      if (!listing || listing.status !== 'sold') return null
      const revieweeId = conversation.buyer_user_id === user.id ? conversation.seller_user_id : conversation.buyer_user_id
      if (!revieweeId || reviewedKeys.has(`${listing.id}:${revieweeId}`)) return null
      const profile = profilesById.get(revieweeId)
      return {
        listingId: listing.id,
        listingTitle: listing.title,
        revieweeId,
        revieweeName: publicSellerName({
          account_type: profile?.account_type,
          first_name: profile?.first_name,
          display_name: profile?.display_name,
          company_name: profile?.company_name,
        }, copy.seller),
        roleLabel: conversation.buyer_user_id === user.id ? copy.seller : copy.buyer,
      }
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))

  const visibleReviews = reviews
    .filter((review) => review.reviewee_id === user.id)
    .map((review) => {
      const listing = listingsById.get(review.listing_id)
      const reviewer = profilesById.get(review.reviewer_id)
      return {
        id: review.id,
        listingTitle: listing?.title || copy.listing,
        reviewerName: publicSellerName({
          account_type: reviewer?.account_type,
          first_name: reviewer?.first_name,
          display_name: reviewer?.display_name,
          company_name: reviewer?.company_name,
        }, copy.buyer),
        rating: review.rating,
        comment: review.comment,
        createdAt: review.created_at,
      }
    })

  return (
    <main className="mx-auto max-w-[var(--autorell-page-max)] px-5 py-8 sm:px-8 lg:py-12">
      <section className="overflow-hidden rounded-[28px] border border-[#dfe6f1] bg-white shadow-[0_22px_65px_rgba(16,24,40,.065)]">
        <div className="flex items-start gap-4 bg-[#eef6ff] p-7 sm:p-9">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[16px] bg-white text-[#0866ff] shadow-sm">
            <Star className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#0866ff]">Autorell</p>
            <h1 className="mt-3 text-[40px] font-semibold leading-[1] tracking-[-.05em] sm:text-5xl">
              {copy.title}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#667085]">{copy.intro}</p>
          </div>
        </div>
      </section>
      <ReviewFlowPanel
        opportunities={opportunities}
        visibleReviews={visibleReviews}
        copy={copy.panel}
      />
    </main>
  )
}

function getReviewsPageCopy(locale: PublicLocale) {
  const en = {
    title: 'Reviews',
    intro: 'Leave reviews after completed marketplace deals and see the public trust score connected to your account.',
    seller: 'Seller',
    buyer: 'Buyer',
    listing: 'Listing',
    panel: {
      title: 'Marketplace reviews',
      intro: 'Reviews help buyers and sellers understand who they are dealing with before the next transaction.',
      empty: 'There are no reviews to show yet.',
      pendingTitle: 'Leave a review',
      rating: 'Rating',
      comment: 'Comment',
      recommend: 'I recommend this person or company',
      submit: 'Submit review',
      submitting: 'Submitting...',
      submitted: 'Review submitted for Autorell review.',
      visibleTitle: 'Reviews about you',
    },
  }
  if (locale === 'sv') {
    return {
      ...en,
      title: 'Omdömen',
      intro: 'Lämna omdömen efter avslutade affärer och se förtroendet kopplat till ditt konto.',
      seller: 'Säljare',
      buyer: 'Köpare',
      listing: 'Annons',
      panel: {
        title: 'Marketplace-omdömen',
        intro: 'Omdömen hjälper köpare och säljare att förstå vem de gör affär med inför nästa transaktion.',
        empty: 'Det finns inga omdömen att visa ännu.',
        pendingTitle: 'Lämna omdöme',
        rating: 'Betyg',
        comment: 'Kommentar',
        recommend: 'Jag rekommenderar personen eller företaget',
        submit: 'Skicka omdöme',
        submitting: 'Skickar...',
        submitted: 'Omdömet har skickats för granskning av Autorell.',
        visibleTitle: 'Omdömen om dig',
      },
    }
  }
  if (locale === 'de') {
    return {
      ...en,
      title: 'Bewertungen',
      intro: 'Geben Sie Bewertungen nach abgeschlossenen Marktplatzgeschäften ab und sehen Sie das Vertrauen in Ihrem Konto.',
      seller: 'Verkäufer',
      buyer: 'Käufer',
      listing: 'Anzeige',
      panel: {
        ...en.panel,
        title: 'Marketplace-Bewertungen',
        pendingTitle: 'Bewertung abgeben',
        rating: 'Bewertung',
        comment: 'Kommentar',
        recommend: 'Ich empfehle diese Person oder Firma',
        submit: 'Bewertung senden',
        submitting: 'Wird gesendet...',
        submitted: 'Bewertung wurde zur Prüfung an Autorell gesendet.',
        visibleTitle: 'Bewertungen über Sie',
      },
    }
  }
  return translatePublicObject(locale, en)
}
