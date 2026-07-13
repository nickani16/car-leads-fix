import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  FileText,
  Eye,
  Heart,
  MessageCircle,
  Pencil,
  Plus,
  ShieldCheck,
  Tag,
  type LucideIcon,
} from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { getRequestLocale } from '@/lib/request-locale'
import {
  localizePublicHref,
  translatePublicObject,
  type PublicLocale,
} from '@/lib/public-i18n'
import ListingStatusActions, { type ListingBuyerOption } from './ListingStatusActions'
import { generateAccountMetadata } from '@/lib/account-seo'
import { publicSellerName } from '@/lib/public-seller'

export const generateMetadata = generateAccountMetadata('listings')

type ListingRow = {
  id: string
  title: string
  status: string
  category: string
  price: number
  currency: string
  created_at: string
  published_at: string | null
  review_status: string | null
  reference_number: string | null
  sold_at: string | null
}

type ConversationRow = {
  id: string
  listing_id: string
  buyer_user_id: string
}

type ProfileRow = {
  user_id: string
  account_type: string | null
  first_name: string | null
  display_name: string | null
  company_name: string | null
}

export default async function AccountListingsPage() {
  const locale = await getRequestLocale()
  const copy = getListingsCopy(locale)
  const statsCopy = getListingStatsCopy(locale)
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(localizePublicHref(locale, '/'))

  const admin = createAdminClient()
  const { data } = await admin
    .from('marketplace_listings')
    .select('id,title,status,category,price,currency,created_at,published_at,review_status,reference_number,sold_at')
    .eq('seller_user_id', user.id)
    .order('created_at', { ascending: false })

  const listings = (data || []) as ListingRow[]
  const listingIds = listings.map((listing) => listing.id)
  const [
    { data: conversationData },
    { data: savedListingData },
    { data: viewEventData },
  ] = listingIds.length
    ? await Promise.all([
        admin
          .from('marketplace_conversations')
          .select('id,listing_id,buyer_user_id')
          .in('listing_id', listingIds)
          .eq('seller_user_id', user.id),
        admin
          .from('marketplace_saved_listings')
          .select('listing_id')
          .in('listing_id', listingIds),
        admin
          .from('marketplace_listing_events')
          .select('listing_id,created_at')
          .in('listing_id', listingIds)
          .eq('event_type', 'listing_view'),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }]
  const conversationRows = (conversationData || []) as ConversationRow[]
  const conversationIds = conversationRows.map((conversation) => conversation.id)
  const { data: messageConversationData } = conversationIds.length
    ? await admin
        .from('marketplace_messages')
        .select('conversation_id,created_at')
        .in('conversation_id', conversationIds)
    : { data: [] }
  const conversationsWithMessages = new Set(
    (messageConversationData || []).map((message) => message.conversation_id),
  )
  const conversations = conversationRows.filter((conversation) =>
    conversationsWithMessages.has(conversation.id),
  )
  const buyerIds = [
    ...new Set(conversations.map((item) => item.buyer_user_id).filter(Boolean)),
  ]
  const { data: profileData } = buyerIds.length
    ? await admin
        .from('marketplace_profiles')
        .select('user_id,account_type,first_name,display_name,company_name')
        .in('user_id', buyerIds)
    : { data: [] }
  const profilesById = new Map(
    ((profileData || []) as ProfileRow[]).map((profile) => [
      profile.user_id,
      profile,
    ]),
  )
  const savedByListing = countByListing(savedListingData || [])
  const viewsByListing = countByListing(viewEventData || [])
  const conversationById = new Map(conversations.map((conversation) => [conversation.id, conversation]))
  const messagesByListing = new Map<string, number>()
  ;(messageConversationData || []).forEach((message) => {
    const conversation = conversationById.get(message.conversation_id)
    if (!conversation) return
    messagesByListing.set(
      conversation.listing_id,
      (messagesByListing.get(conversation.listing_id) || 0) + 1,
    )
  })
  const buyersByListingCount = new Map<string, number>()
  const buyersByListing = new Map<string, ListingBuyerOption[]>()
  conversations.forEach((conversation) => {
    const profile = profilesById.get(conversation.buyer_user_id)
    const buyer = {
      userId: conversation.buyer_user_id,
      name: publicSellerName({
        account_type: profile?.account_type,
        first_name: profile?.first_name,
        display_name: profile?.display_name,
        company_name: profile?.company_name,
      }, copy.buyer),
    }
    buyersByListing.set(conversation.listing_id, [
      ...(buyersByListing.get(conversation.listing_id) || []),
      buyer,
    ])
    buyersByListingCount.set(
      conversation.listing_id,
      (buyersByListingCount.get(conversation.listing_id) || 0) + 1,
    )
  })
  const totalViews = sumMapValues(viewsByListing)
  const totalSaved = sumMapValues(savedByListing)
  const totalMessages = sumMapValues(messagesByListing)

  return (
    <main className="mx-auto max-w-[var(--autorell-page-max)] px-5 py-8 sm:px-8 lg:py-12">
      <section className="overflow-hidden rounded-[28px] border border-[#dfe6f1] bg-white shadow-[0_22px_65px_rgba(16,24,40,.065)]">
        <div className="flex flex-col gap-5 bg-[#eef6ff] p-7 sm:p-9 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#0866ff]">
              {copy.eyebrow}
            </p>
            <h1 className="mt-3 text-[40px] leading-[1] tracking-[-.05em] sm:text-5xl">
              {copy.title}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#667085]">
              {copy.intro}
            </p>
          </div>
          <Link
            href={localizePublicHref(locale, '/account/listings/new')}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] bg-[#0866ff] px-5 text-sm font-bold text-white shadow-[0_14px_34px_rgba(8,102,255,.24)]"
          >
            <Plus className="h-4 w-4" />
            {copy.createListing}
          </Link>
        </div>
        <div className="grid gap-px bg-[#e6edf7] sm:grid-cols-3">
          <SummaryTile icon={FileText} label={copy.totalListings} value={listings.length} />
          <SummaryTile icon={BadgeCheck} label={copy.published} value={listings.filter((item) => item.status === 'published').length} />
          <SummaryTile icon={ShieldCheck} label={copy.inReview} value={listings.filter((item) => (item.review_status || 'pending_review') === 'pending_review').length} />
        </div>
        <div className="grid gap-px bg-[#e6edf7] sm:grid-cols-3">
          <SummaryTile icon={Eye} label={statsCopy.totalViews} value={totalViews} />
          <SummaryTile icon={Heart} label={statsCopy.totalSaved} value={totalSaved} />
          <SummaryTile icon={MessageCircle} label={statsCopy.totalMessages} value={totalMessages} />
        </div>
      </section>

      <div className="mt-8 flex items-center justify-between gap-5">
        <div>
          <h2 className="text-2xl tracking-[-.035em]">{copy.inventory}</h2>
          <p className="mt-1 text-sm text-[#667085]">{copy.inventoryText}</p>
        </div>
        <Link
          href={localizePublicHref(locale, '/marketplace')}
          className="hidden items-center gap-2 text-sm font-bold text-[#0866ff] sm:inline-flex"
        >
          {copy.viewMarketplace}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-5 grid gap-4">
        {listings.length ? (
          listings.map((listing) => (
            <article
              key={listing.id}
              className="overflow-hidden rounded-[22px] border border-[#dfe6f1] bg-white shadow-[0_16px_45px_rgba(16,24,40,.045)]"
            >
              <div className="grid gap-0 lg:grid-cols-[1fr_auto]">
                <div className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={listing.status} />
                    <ReviewBadge status={listing.review_status || 'pending_review'} />
                  </div>
                  <h3 className="mt-4 text-xl font-bold tracking-[-.025em]">
                    {listing.title}
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-3 text-sm text-[#667085]">
                    <span className="inline-flex items-center gap-1.5">
                      <Tag className="h-4 w-4 text-[#0866ff]" />
                      {listing.category}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-4 w-4 text-[#0866ff]" />
                      {new Intl.DateTimeFormat(locale, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      }).format(new Date(listing.created_at))}
                    </span>
                    <span className="font-bold text-[#101828]">
                      {Number(listing.price).toLocaleString(locale)} {listing.currency}
                    </span>
                  </div>
                  <div className="mt-4 rounded-[14px] bg-[#f6f8fc] px-4 py-3 text-xs leading-5 text-[#667085]">
                    <strong className="text-[#344054]">{copy.reference}:</strong>{' '}
                    {listing.reference_number || listing.id}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <ListingStatCard icon={Eye} label={statsCopy.views} value={viewsByListing.get(listing.id) || 0} />
                    <ListingStatCard icon={Heart} label={statsCopy.saved} value={savedByListing.get(listing.id) || 0} />
                    <ListingStatCard icon={MessageCircle} label={statsCopy.messages} value={messagesByListing.get(listing.id) || 0} />
                    <ListingStatCard
                      icon={CalendarDays}
                      label={statsCopy.daysLive}
                      value={listing.status === 'published' ? daysLive(listing.published_at || listing.created_at) : 0}
                    />
                  </div>
                  <div className="mt-3 rounded-[14px] border border-[#e5ecf6] bg-white px-4 py-3 text-xs leading-5 text-[#667085]">
                    <strong className="text-[#344054]">{statsCopy.engagement}:</strong>{' '}
                    {buyersByListingCount.get(listing.id) || 0} {statsCopy.interestedBuyers.toLocaleLowerCase(locale)}
                  </div>
                </div>
                <div className="flex flex-col justify-center gap-3 border-t border-[#eef1f6] bg-[#fbfcff] p-5 lg:min-w-[300px] lg:border-l lg:border-t-0">
                  <Link
                    href={localizePublicHref(locale, `/account/listings/${listing.id}/edit`)}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] border border-[#c9d7ec] bg-white px-4 text-sm font-black text-[#0866ff] transition hover:bg-[#f5f9ff]"
                  >
                    <Pencil className="h-4 w-4" />
                    {copy.editListing}
                  </Link>
                  <ListingStatusActions
                    listingId={listing.id}
                    status={listing.status}
                    buyers={buyersByListing.get(listing.id) || []}
                    copy={{
                      markSold: copy.markSold,
                      sold: copy.sold,
                      chooseBuyer: copy.chooseBuyer,
                      saving: copy.saving,
                    }}
                  />
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-[26px] border border-dashed border-[#b8c5d8] bg-white p-10 text-center text-[#667085] shadow-[0_16px_45px_rgba(16,24,40,.045)]">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-[18px] bg-[#eef5ff] text-[#0866ff]">
              <FileText className="h-6 w-6" />
            </span>
            <h2 className="mt-5 text-xl font-bold text-[#101828]">{copy.empty}</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6">{copy.emptyText}</p>
            <Link
              href={localizePublicHref(locale, '/account/listings/new')}
              className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] bg-[#0866ff] px-5 text-sm font-bold text-white"
            >
              <Plus className="h-4 w-4" />
              {copy.createListing}
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}

function SummaryTile({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: number
}) {
  return (
    <article className="flex items-center gap-4 bg-white p-5">
      <span className="grid h-11 w-11 place-items-center rounded-[14px] bg-[#eef5ff] text-[#0866ff]">
        <Icon className="h-5 w-5" />
      </span>
      <span>
        <strong className="block text-2xl tracking-[-.04em]">{value}</strong>
        <span className="text-sm font-medium text-[#667085]">{label}</span>
      </span>
    </article>
  )
}

function ListingStatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: number
}) {
  return (
    <div className="rounded-[14px] border border-[#e4ebf5] bg-white px-3 py-3">
      <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[.08em] text-[#667085]">
        <Icon className="h-3.5 w-3.5 text-[#0866ff]" />
        {label}
      </span>
      <strong className="mt-2 block text-xl tracking-[-.035em] text-[#101828]">
        {value.toLocaleString()}
      </strong>
    </div>
  )
}

function countByListing(rows: Array<{ listing_id?: string | null }>) {
  const counts = new Map<string, number>()
  rows.forEach((row) => {
    if (!row.listing_id) return
    counts.set(row.listing_id, (counts.get(row.listing_id) || 0) + 1)
  })
  return counts
}

function sumMapValues(map: Map<string, number>) {
  return Array.from(map.values()).reduce((sum, value) => sum + value, 0)
}

function daysLive(value: string | null) {
  if (!value) return 0
  const timestamp = new Date(value).getTime()
  if (!Number.isFinite(timestamp)) return 0
  return Math.max(1, Math.ceil((Date.now() - timestamp) / 86_400_000))
}

function getListingStatsCopy(locale: PublicLocale) {
  const en = {
    totalViews: 'Total views',
    totalSaved: 'Total saves',
    totalMessages: 'Messages',
    views: 'Views',
    saved: 'Saved',
    messages: 'Messages',
    daysLive: 'Days live',
    engagement: 'Engagement',
    interestedBuyers: 'Interested buyers',
  }
  if (locale === 'sv') {
    return {
      totalViews: 'Totala visningar',
      totalSaved: 'Totalt sparade',
      totalMessages: 'Meddelanden',
      views: 'Visningar',
      saved: 'Sparade',
      messages: 'Meddelanden',
      daysLive: 'Dagar live',
      engagement: 'Engagemang',
      interestedBuyers: 'Intresserade k\u00f6pare',
    }
  }
  if (locale === 'es') {
    return {
      totalViews: 'Visualizaciones',
      totalSaved: 'Guardados',
      totalMessages: 'Mensajes',
      views: 'Vistas',
      saved: 'Guardados',
      messages: 'Mensajes',
      daysLive: 'Dias online',
      engagement: 'Interes',
      interestedBuyers: 'Compradores interesados',
    }
  }
  if (locale === 'en') return en
  return translatePublicObject(locale, en)
}

function StatusBadge({ status }: { status: string }) {
  const published = status === 'published'
  const sold = status === 'sold'
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[.12em] ${
        sold
          ? 'bg-[#ecfdf3] text-[#027a48]'
          : published
            ? 'bg-[#eef5ff] text-[#0866ff]'
            : 'bg-[#fff7ed] text-[#c2410c]'
      }`}
    >
      {status}
    </span>
  )
}

function ReviewBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex rounded-full bg-[#f3f5f7] px-3 py-1 text-[11px] font-bold uppercase tracking-[.12em] text-[#475467]">
      Review: {status}
    </span>
  )
}

function getListingsCopy(locale: PublicLocale) {
  const en = {
    eyebrow: 'Account',
    title: 'Your listings',
    intro: 'Follow every listing from draft and review to messages, sale and review.',
    createListing: 'Create listing',
    totalListings: 'Total listings',
    published: 'Published',
    inReview: 'In review',
    totalViews: 'Total views',
    totalSaved: 'Total saves',
    totalMessages: 'Messages',
    inventory: 'Inventory',
    inventoryText: 'Your published, pending and sold marketplace listings in one place.',
    viewMarketplace: 'View marketplace',
    reference: 'Reference',
    views: 'Views',
    saved: 'Saved',
    messages: 'Messages',
    daysLive: 'Days live',
    engagement: 'Engagement',
    interestedBuyers: 'Interested buyers',
    empty: 'You do not have any listings yet.',
    emptyText: 'Create your first listing with structured vehicle data, photos and clear seller information.',
    markSold: 'Mark as sold',
    editListing: 'Edit listing',
    sold: 'Sold',
    chooseBuyer: 'Choose buyer',
    saving: 'Saving...',
    buyer: 'Buyer',
  }
  if (locale === 'sv') {
    return {
      ...en,
      eyebrow: 'Konto',
      title: 'Dina annonser',
      intro: 'Följ varje annons från utkast och granskning till meddelanden, försäljning och recension.',
      createListing: 'Skapa annons',
      totalListings: 'Totalt antal annonser',
      published: 'Publicerade',
      inReview: 'Under granskning',
      inventory: 'Lager och annonser',
      inventoryText: 'Dina publicerade, väntande och sålda marketplace-annonser på ett ställe.',
      viewMarketplace: 'Visa marketplace',
      reference: 'Referens',
      empty: 'Du har inga annonser ännu.',
      emptyText: 'Skapa din första annons med strukturerad fordonsdata, bilder och tydlig säljarinformation.',
      markSold: 'Markera som såld',
      editListing: 'Redigera annons',
      sold: 'Såld',
      chooseBuyer: 'Välj köpare',
      saving: 'Sparar...',
      buyer: 'Köpare',
    }
  }
  if (locale === 'es') {
    return {
      ...en,
      eyebrow: 'Cuenta',
      title: 'Tus anuncios',
      intro: 'Sigue cada anuncio desde revisión hasta mensajes, venta y reseña.',
      createListing: 'Crear anuncio',
      totalListings: 'Anuncios totales',
      published: 'Publicados',
      inReview: 'En revisión',
      inventory: 'Inventario',
      inventoryText: 'Tus anuncios publicados, pendientes y vendidos en un solo lugar.',
      viewMarketplace: 'Ver marketplace',
      reference: 'Referencia',
      empty: 'Todavía no tienes anuncios.',
      emptyText: 'Crea tu primer anuncio con datos estructurados, fotos e información clara del vendedor.',
      markSold: 'Marcar como vendido',
      editListing: 'Editar anuncio',
      sold: 'Vendido',
      chooseBuyer: 'Elegir comprador',
      saving: 'Guardando...',
      buyer: 'Comprador',
    }
  }
  if (locale === 'en') return en
  return translatePublicObject(locale, en)
}
