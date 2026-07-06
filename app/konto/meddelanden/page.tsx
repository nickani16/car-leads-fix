import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  ArrowRight,
  CarFront,
  CheckCheck,
  MessageCircle,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { getRequestLocale } from '@/lib/request-locale'
import {
  isPublicLanguage,
  localizePublicHref,
  translatePublicObject,
  type PublicLocale,
} from '@/lib/public-i18n'
import MessageComposer from './MessageComposer'

const copy = {
  sv: {
    title: 'Meddelanden',
    intro: 'Frågor och svar mellan köpare och säljare samlade per annons.',
    empty: 'Du har inga konversationer ännu.',
    emptyText: 'Öppna en annons och välj Kontakta säljaren för att starta en trygg konversation.',
    browse: 'Utforska fordon',
    conversation: 'Konversation',
    listingRemoved: 'Annonsen är inte längre tillgänglig',
    buyer: 'Köpare',
    seller: 'Säljare',
    safety: 'Skicka aldrig lösenord, kortuppgifter eller betalningar via meddelanden.',
    choose: 'Välj en konversation för att läsa och svara.',
    unread: 'olästa',
    you: 'Du',
  },
  de: {
    title: 'Nachrichten',
    intro: 'Fragen und Antworten zwischen Käufern und Verkäufern, nach Anzeige geordnet.',
    empty: 'Sie haben noch keine Unterhaltungen.',
    emptyText: 'Öffnen Sie eine Anzeige und wählen Sie Verkäufer kontaktieren, um eine sichere Unterhaltung zu starten.',
    browse: 'Fahrzeuge entdecken',
    conversation: 'Unterhaltung',
    listingRemoved: 'Die Anzeige ist nicht mehr verfügbar',
    buyer: 'Käufer',
    seller: 'Verkäufer',
    safety: 'Senden Sie niemals Passwörter, Kartendaten oder Zahlungen über Nachrichten.',
    choose: 'Wählen Sie eine Unterhaltung zum Lesen und Antworten.',
    unread: 'ungelesen',
    you: 'Sie',
  },
  en: {
    title: 'Messages',
    intro: 'Questions and replies between buyers and sellers, organised by listing.',
    empty: 'You have no conversations yet.',
    emptyText: 'Open a listing and choose Contact seller to start a secure conversation.',
    browse: 'Browse vehicles',
    conversation: 'Conversation',
    listingRemoved: 'The listing is no longer available',
    buyer: 'Buyer',
    seller: 'Seller',
    safety: 'Never send passwords, card details or payments through messages.',
    choose: 'Choose a conversation to read and reply.',
    unread: 'unread',
    you: 'You',
  },
} as const

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ conversation?: string }>
}) {
  const requestLocale = await getRequestLocale()
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(localizePublicHref(requestLocale, '/'))

  const admin = createAdminClient()
  const { data: ownProfile } = await admin
    .from('marketplace_profiles')
    .select('locale')
    .eq('user_id', user.id)
    .maybeSingle()
  const locale: PublicLocale =
    ownProfile?.locale === 'sv' ||
    ownProfile?.locale === 'de' ||
    isPublicLanguage(ownProfile?.locale || '')
      ? (ownProfile!.locale as PublicLocale)
      : requestLocale
  const text =
    locale === 'sv' || locale === 'de' || locale === 'en'
      ? copy[locale]
      : translatePublicObject(locale, copy.en)

  const { data: conversationData } = await admin
    .from('marketplace_conversations')
    .select('id,listing_id,buyer_user_id,seller_user_id,last_message_at,status')
    .not('listing_id', 'is', null)
    .or(`buyer_user_id.eq.${user.id},seller_user_id.eq.${user.id}`)
    .order('last_message_at', { ascending: false })
  const conversations = conversationData || []

  const listingIds = [...new Set(conversations.map((item) => item.listing_id).filter(Boolean))]
  const participantIds = [
    ...new Set(
      conversations
        .flatMap((item) => [item.buyer_user_id, item.seller_user_id])
        .filter((id) => id !== user.id),
    ),
  ]
  const conversationIds = conversations.map((item) => item.id)

  const [{ data: listingData }, { data: profileData }, { data: messageData }] =
    await Promise.all([
      listingIds.length
        ? admin
            .from('marketplace_listings')
            .select('id,title,category,images,city,country_code,status')
            .in('id', listingIds)
        : Promise.resolve({ data: [] }),
      participantIds.length
        ? admin
            .from('marketplace_profiles')
            .select('user_id,display_name,company_name,account_type')
            .in('user_id', participantIds)
        : Promise.resolve({ data: [] }),
      conversationIds.length
        ? admin
            .from('marketplace_messages')
            .select('id,conversation_id,sender_user_id,body,read_at,created_at')
            .in('conversation_id', conversationIds)
            .order('created_at', { ascending: true })
        : Promise.resolve({ data: [] }),
    ])
  const listings = listingData || []
  const profiles = profileData || []
  const allMessages = messageData || []

  const requestedId = (await searchParams).conversation
  const selectedId =
    requestedId && conversations.some((item) => item.id === requestedId)
      ? requestedId
      : conversations[0]?.id
  const selected = conversations.find((item) => item.id === selectedId)
  const selectedMessages = allMessages.filter(
    (message) => message.conversation_id === selectedId,
  )

  if (selectedId) {
    await admin
      .from('marketplace_messages')
      .update({ read_at: new Date().toISOString() })
      .eq('conversation_id', selectedId)
      .neq('sender_user_id', user.id)
      .is('read_at', null)
  }

  const listingsById = new Map(listings.map((listing) => [listing.id, listing]))
  const profilesById = new Map(profiles.map((profile) => [profile.user_id, profile]))
  const selectedListing = selected ? listingsById.get(selected.listing_id) : null
  const selectedOtherId = selected
    ? selected.buyer_user_id === user.id
      ? selected.seller_user_id
      : selected.buyer_user_id
    : null
  const selectedOther = selectedOtherId ? profilesById.get(selectedOtherId) : null
  const selectedRole =
    selected?.buyer_user_id === user.id ? text.seller : text.buyer

  return (
    <main className="mx-auto max-w-[var(--autorell-page-max)] px-5 py-8 sm:px-8 lg:py-12">
      <section className="mb-7 overflow-hidden rounded-[28px] border border-[#dfe6f1] bg-white shadow-[0_22px_65px_rgba(16,24,40,.065)]">
        <div className="flex flex-col gap-5 bg-[#eef6ff] p-7 sm:p-9 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0866ff]">
              Autorell marketplace
            </p>
            <h1 className="mt-3 text-[40px] font-semibold leading-[1] tracking-[-0.05em] sm:text-5xl">
              {text.title}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#667085]">{text.intro}</p>
          </div>
          <div className="rounded-[18px] border border-[#cfe0f5] bg-white/72 p-4 text-sm leading-6 text-[#475467] lg:max-w-md">
            <span className="flex gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#0866ff]" />
              {text.safety}
            </span>
          </div>
        </div>
      </section>

      {conversations.length ? (
        <div className="grid min-h-[640px] overflow-hidden rounded-[24px] border border-[#dde1e7] bg-white shadow-[0_18px_50px_rgba(16,24,40,.07)] lg:grid-cols-[360px_1fr]">
          <aside className="border-b border-[#e4e7ec] bg-[#fafaf9] lg:border-b-0 lg:border-r">
            <div className="border-b border-[#e4e7ec] px-5 py-4">
              <p className="text-sm font-semibold">{conversations.length} {text.conversation.toLocaleLowerCase(locale)}</p>
            </div>
            <div className="max-h-[620px] overflow-y-auto p-2">
              {conversations.map((conversation) => {
                const listing = listingsById.get(conversation.listing_id)
                const otherId =
                  conversation.buyer_user_id === user.id
                    ? conversation.seller_user_id
                    : conversation.buyer_user_id
                const other = profilesById.get(otherId)
                const messages = allMessages.filter(
                  (message) => message.conversation_id === conversation.id,
                )
                const latest = messages.at(-1)
                const unread = messages.filter(
                  (message) =>
                    message.sender_user_id !== user.id && !message.read_at,
                ).length

                return (
                  <Link
                    key={conversation.id}
                    href={`${localizePublicHref(locale, '/account/messages')}?conversation=${conversation.id}`}
                    className={`flex gap-3 rounded-[16px] p-3.5 transition ${
                      selectedId === conversation.id
                        ? 'bg-white shadow-sm ring-1 ring-[#dfe3e8]'
                        : 'hover:bg-white'
                    }`}
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[13px] bg-[#eef0f2] text-[#3f4549]">
                      <CarFront className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-2">
                        <strong className="truncate text-sm">
                          {listing?.title || text.listingRemoved}
                        </strong>
                        {unread ? (
                          <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#0866ff] px-1.5 text-[10px] font-bold text-white">
                            {unread}
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-1 block truncate text-xs font-medium text-[#667085]">
                        {other?.company_name || other?.display_name || text.conversation}
                      </span>
                      <span className="mt-1 block truncate text-xs text-[#98a2b3]">
                        {latest?.sender_user_id === user.id ? `${text.you}: ` : ''}
                        {latest?.body || text.conversation}
                      </span>
                    </span>
                  </Link>
                )
              })}
            </div>
          </aside>

          <section className="flex min-h-[620px] flex-col">
            {selected ? (
              <>
                <div className="flex items-center justify-between gap-4 border-b border-[#e4e7ec] px-5 py-4 sm:px-6">
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold">
                      {selectedListing?.title || text.listingRemoved}
                    </h2>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-[#667085]">
                      <UserRound className="h-3.5 w-3.5" />
                      {selectedRole}: {selectedOther?.company_name || selectedOther?.display_name || text.conversation}
                    </p>
                  </div>
                  {selectedListing ? (
                    <Link
                      href={`${localizePublicHref(locale, `/marketplace/${selectedListing.category}`)}?q=${encodeURIComponent(selectedListing.title)}`}
                      className="hidden items-center gap-2 text-sm font-semibold text-[#475467] hover:text-[#101828] sm:flex"
                    >
                      {selectedListing.title}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : null}
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto bg-[#fcfcfb] px-5 py-6 sm:px-7">
                  <div className="mb-6 flex items-start gap-3 rounded-[14px] border border-[#e4e7ec] bg-white p-4 text-xs leading-5 text-[#667085]">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#475467]" />
                    {text.safety}
                  </div>
                  {selectedMessages.map((message) => {
                    const mine = message.sender_user_id === user.id
                    return (
                      <div
                        key={message.id}
                        className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[82%] rounded-[18px] px-4 py-3 text-sm leading-6 sm:max-w-[68%] ${
                            mine
                              ? 'rounded-br-[5px] bg-[#202124] text-white'
                              : 'rounded-bl-[5px] border border-[#e2e4e7] bg-white text-[#202124]'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{message.body}</p>
                          <span className={`mt-1.5 flex items-center justify-end gap-1 text-[10px] ${mine ? 'text-white/60' : 'text-[#98a2b3]'}`}>
                            {new Intl.DateTimeFormat(locale, {
                              hour: '2-digit',
                              minute: '2-digit',
                              day: 'numeric',
                              month: 'short',
                            }).format(new Date(message.created_at))}
                            {mine && message.read_at ? <CheckCheck className="h-3 w-3" /> : null}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <MessageComposer conversationId={selected.id} locale={locale} />
              </>
            ) : (
              <div className="grid flex-1 place-items-center p-8 text-center">
                <div>
                  <MessageCircle className="mx-auto h-10 w-10 text-[#98a2b3]" />
                  <p className="mt-4 text-sm text-[#667085]">{text.choose}</p>
                </div>
              </div>
            )}
          </section>
        </div>
      ) : (
        <div className="grid min-h-[460px] place-items-center rounded-[24px] border border-[#dde1e7] bg-white p-8 text-center">
          <div className="max-w-md">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-[18px] bg-[#f0f1f2]">
              <MessageCircle className="h-6 w-6 text-[#475467]" />
            </span>
            <h2 className="mt-5 text-xl font-semibold">{text.empty}</h2>
            <p className="mt-2 text-sm leading-6 text-[#667085]">{text.emptyText}</p>
            <Link
              href={localizePublicHref(locale, '/marketplace/vehicles')}
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-[13px] bg-[#202124] px-5 text-sm font-semibold text-white"
            >
              {text.browse}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </main>
  )
}
