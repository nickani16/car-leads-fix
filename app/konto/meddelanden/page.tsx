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
  localizePublicHref,
  type PublicLocale,
} from '@/lib/public-i18n'
import CountryFlag from '@/app/components/CountryFlag'
import MessageComposer from './MessageComposer'
import { generateAccountMetadata } from '@/lib/account-seo'
import { getEuCountryName } from '@/lib/eu-countries'
import { publicSellerName } from '@/lib/public-seller'

export const generateMetadata = generateAccountMetadata('messages')

type MessagesCopy = {
  title: string
  intro: string
  empty: string
  emptyText: string
  browse: string
  conversation: string
  listingRemoved: string
  buyer: string
  seller: string
  safety: string
  choose: string
  unread: string
  you: string
  sent: string
  read: string
}

const messagesCopy: Record<PublicLocale, MessagesCopy> = {
  sv: {
    title: 'Meddelanden',
    intro: 'Frågor och svar mellan köpare och säljare, samlade per annons.',
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
    sent: 'Skickat',
    read: 'Läst',
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
    sent: 'Gesendet',
    read: 'Gelesen',
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
    sent: 'Sent',
    read: 'Read',
  },
  at: {
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
    sent: 'Gesendet',
    read: 'Gelesen',
  },
  be: {
    title: 'Berichten',
    intro: 'Vragen en antwoorden tussen kopers en verkopers, per advertentie gebundeld.',
    empty: 'Je hebt nog geen gesprekken.',
    emptyText: 'Open een advertentie en kies Contacteer verkoper om een veilig gesprek te starten.',
    browse: 'Voertuigen bekijken',
    conversation: 'Gesprek',
    listingRemoved: 'De advertentie is niet langer beschikbaar',
    buyer: 'Koper',
    seller: 'Verkoper',
    safety: 'Stuur nooit wachtwoorden, kaartgegevens of betalingen via berichten.',
    choose: 'Kies een gesprek om te lezen en te antwoorden.',
    unread: 'ongelezen',
    you: 'Jij',
    sent: 'Verzonden',
    read: 'Gelezen',
  },
  fr: {
    title: 'Messages',
    intro: 'Questions et réponses entre acheteurs et vendeurs, regroupées par annonce.',
    empty: "Vous n'avez pas encore de conversations.",
    emptyText: 'Ouvrez une annonce et choisissez Contacter le vendeur pour démarrer une conversation sécurisée.',
    browse: 'Explorer les véhicules',
    conversation: 'Conversation',
    listingRemoved: "L'annonce n'est plus disponible",
    buyer: 'Acheteur',
    seller: 'Vendeur',
    safety: "N'envoyez jamais de mots de passe, coordonnées de carte ou paiements par message.",
    choose: 'Choisissez une conversation pour lire et répondre.',
    unread: 'non lus',
    you: 'Vous',
    sent: 'Envoyé',
    read: 'Lu',
  },
  es: {
    title: 'Mensajes',
    intro: 'Preguntas y respuestas entre compradores y vendedores, organizadas por anuncio.',
    empty: 'Todavía no tienes conversaciones.',
    emptyText: 'Abre un anuncio y elige Contactar con el vendedor para iniciar una conversación segura.',
    browse: 'Explorar vehículos',
    conversation: 'Conversación',
    listingRemoved: 'El anuncio ya no está disponible',
    buyer: 'Comprador',
    seller: 'Vendedor',
    safety: 'No envíes nunca contraseñas, datos de tarjeta ni pagos por mensajes.',
    choose: 'Elige una conversación para leer y responder.',
    unread: 'sin leer',
    you: 'Tú',
    sent: 'Enviado',
    read: 'Leído',
  },
  it: {
    title: 'Messaggi',
    intro: 'Domande e risposte tra acquirenti e venditori, organizzate per annuncio.',
    empty: 'Non hai ancora conversazioni.',
    emptyText: 'Apri un annuncio e scegli Contatta il venditore per avviare una conversazione sicura.',
    browse: 'Sfoglia veicoli',
    conversation: 'Conversazione',
    listingRemoved: "L'annuncio non è più disponibile",
    buyer: 'Acquirente',
    seller: 'Venditore',
    safety: 'Non inviare mai password, dati della carta o pagamenti tramite messaggi.',
    choose: 'Scegli una conversazione da leggere e a cui rispondere.',
    unread: 'non letti',
    you: 'Tu',
    sent: 'Inviato',
    read: 'Letto',
  },
  pl: {
    title: 'Wiadomości',
    intro: 'Pytania i odpowiedzi między kupującymi i sprzedającymi, zebrane według ogłoszeń.',
    empty: 'Nie masz jeszcze rozmów.',
    emptyText: 'Otwórz ogłoszenie i wybierz Kontakt ze sprzedawcą, aby rozpocząć bezpieczną rozmowę.',
    browse: 'Przeglądaj pojazdy',
    conversation: 'Rozmowa',
    listingRemoved: 'Ogłoszenie nie jest już dostępne',
    buyer: 'Kupujący',
    seller: 'Sprzedawca',
    safety: 'Nigdy nie wysyłaj haseł, danych karty ani płatności przez wiadomości.',
    choose: 'Wybierz rozmowę, aby przeczytać i odpowiedzieć.',
    unread: 'nieprzeczytane',
    you: 'Ty',
    sent: 'Wysłano',
    read: 'Przeczytano',
  },
  nl: {
    title: 'Berichten',
    intro: 'Vragen en antwoorden tussen kopers en verkopers, per advertentie gebundeld.',
    empty: 'Je hebt nog geen gesprekken.',
    emptyText: 'Open een advertentie en kies Contacteer verkoper om een veilig gesprek te starten.',
    browse: 'Voertuigen bekijken',
    conversation: 'Gesprek',
    listingRemoved: 'De advertentie is niet langer beschikbaar',
    buyer: 'Koper',
    seller: 'Verkoper',
    safety: 'Stuur nooit wachtwoorden, kaartgegevens of betalingen via berichten.',
    choose: 'Kies een gesprek om te lezen en te antwoorden.',
    unread: 'ongelezen',
    you: 'Jij',
    sent: 'Verzonden',
    read: 'Gelezen',
  },
  fi: {
    title: 'Viestit',
    intro: 'Ostajien ja myyjien kysymykset ja vastaukset koottuna ilmoituksittain.',
    empty: 'Sinulla ei ole vielä keskusteluja.',
    emptyText: 'Avaa ilmoitus ja valitse Ota yhteyttä myyjään aloittaaksesi turvallisen keskustelun.',
    browse: 'Selaa ajoneuvoja',
    conversation: 'Keskustelu',
    listingRemoved: 'Ilmoitus ei ole enää saatavilla',
    buyer: 'Ostaja',
    seller: 'Myyjä',
    safety: 'Älä koskaan lähetä salasanoja, korttitietoja tai maksuja viesteissä.',
    choose: 'Valitse keskustelu lukeaksesi ja vastataksesi.',
    unread: 'lukematta',
    you: 'Sinä',
    sent: 'Lähetetty',
    read: 'Luettu',
  },
  da: {
    title: 'Beskeder',
    intro: 'Spørgsmål og svar mellem købere og sælgere samlet pr. annonce.',
    empty: 'Du har ingen samtaler endnu.',
    emptyText: 'Åbn en annonce og vælg Kontakt sælger for at starte en sikker samtale.',
    browse: 'Udforsk køretøjer',
    conversation: 'Samtale',
    listingRemoved: 'Annoncen er ikke længere tilgængelig',
    buyer: 'Køber',
    seller: 'Sælger',
    safety: 'Send aldrig adgangskoder, kortoplysninger eller betalinger via beskeder.',
    choose: 'Vælg en samtale for at læse og svare.',
    unread: 'ulæste',
    you: 'Du',
    sent: 'Sendt',
    read: 'Læst',
  },
}

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
  const locale: PublicLocale = requestLocale
  const text = messagesCopy[locale] || messagesCopy.en

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
            .select('user_id,display_name,first_name,company_name,account_type,country_code')
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
  let allMessages = messageData || []
  const conversationsWithMessages = new Set(allMessages.map((message) => message.conversation_id))
  const visibleConversations = conversations.filter(
    (conversation) =>
      conversation.buyer_user_id === user.id ||
      conversationsWithMessages.has(conversation.id),
  )

  const requestedId = (await searchParams).conversation
  const selectedId =
    requestedId && visibleConversations.some((item) => item.id === requestedId)
      ? requestedId
      : visibleConversations[0]?.id
  const selected = visibleConversations.find((item) => item.id === selectedId)

  if (selectedId) {
    const readAt = new Date().toISOString()
    await admin
      .from('marketplace_messages')
      .update({ read_at: readAt })
      .eq('conversation_id', selectedId)
      .neq('sender_user_id', user.id)
      .is('read_at', null)
    allMessages = allMessages.map((message) =>
      message.conversation_id === selectedId &&
      message.sender_user_id !== user.id &&
      !message.read_at
        ? { ...message, read_at: readAt }
        : message,
    )
  }
  const selectedMessages = allMessages.filter(
    (message) => message.conversation_id === selectedId,
  )

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
    <main className="mx-auto w-full min-w-0 max-w-[var(--autorell-page-max)] overflow-x-hidden px-4 py-6 sm:px-8 lg:py-12">
      <section className="mb-7 overflow-hidden rounded-[28px] border border-[#dfe6f1] bg-white shadow-[0_22px_65px_rgba(16,24,40,.065)]">
        <div className="flex flex-col gap-5 bg-[#eef6ff] p-7 sm:p-9 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0866ff]">
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

      {visibleConversations.length ? (
        <div className="grid min-h-[640px] min-w-0 overflow-hidden rounded-[24px] border border-[#dde1e7] bg-white shadow-[0_18px_50px_rgba(16,24,40,.07)] lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
          <aside className="min-w-0 border-b border-[#e4e7ec] bg-[#fafaf9] lg:border-b-0 lg:border-r">
            <div className="border-b border-[#e4e7ec] px-5 py-4">
              <p className="text-sm font-semibold">{visibleConversations.length} {text.conversation.toLowerCase()}</p>
            </div>
            <div className="max-h-[620px] overflow-y-auto p-2">
              {visibleConversations.map((conversation) => {
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
                const otherCountryCode = other?.country_code || listing?.country_code || 'EU'
                const otherCountryName = getEuCountryName(otherCountryCode, locale)
                const unread = messages.filter(
                  (message) =>
                    message.sender_user_id !== user.id && !message.read_at,
                ).length

                return (
                  <Link
                    key={conversation.id}
                    href={`${localizePublicHref(locale, '/account/messages')}?conversation=${conversation.id}`}
                    className={`flex min-w-0 gap-3 rounded-[16px] p-3.5 transition ${
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
                          <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#0866ff] px-1.5 text-[10px] font-semibold text-white">
                            {unread}
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-1 block truncate text-xs font-medium text-[#667085]">
                        {publicSellerName({
                          account_type: other?.account_type,
                          first_name: other?.first_name,
                          display_name: other?.display_name,
                          company_name: other?.company_name,
                        }, text.conversation)}
                      </span>
                      <span className="mt-1 inline-flex max-w-full items-center gap-1.5 truncate rounded-full border border-[#dfe6f2] bg-white px-2 py-0.5 text-[11px] font-semibold text-[#475467]">
                        <CountryFlag code={otherCountryCode} className="h-3.5 w-5 shrink-0 rounded-[3px]" />
                        <span className="truncate">{otherCountryName}</span>
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

          <section className="flex min-h-[620px] min-w-0 flex-col">
            {selected ? (
              <>
                <div className="flex min-w-0 flex-col gap-3 border-b border-[#e4e7ec] px-5 py-4 sm:px-6 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold">
                      {selectedListing?.title || text.listingRemoved}
                    </h2>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#667085]">
                      <span className="inline-flex items-center gap-1.5">
                        <UserRound className="h-3.5 w-3.5" />
                        {selectedRole}: {publicSellerName({
                          account_type: selectedOther?.account_type,
                          first_name: selectedOther?.first_name,
                          display_name: selectedOther?.display_name,
                          company_name: selectedOther?.company_name,
                        }, text.conversation)}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#dfe6f2] bg-[#f8faff] px-2 py-0.5 font-semibold text-[#475467]">
                        <CountryFlag
                          code={selectedOther?.country_code || selectedListing?.country_code || 'EU'}
                          className="h-3.5 w-5 shrink-0 rounded-[3px]"
                        />
                        {getEuCountryName(selectedOther?.country_code || selectedListing?.country_code || 'EU', locale)}
                      </span>
                    </div>
                  </div>
                  {selectedListing ? (
                    <Link
                      href={`${localizePublicHref(locale, `/marketplace/${selectedListing.category}`)}?q=${encodeURIComponent(selectedListing.title)}`}
                      className="hidden min-w-0 items-center gap-2 text-sm font-semibold text-[#475467] hover:text-[#101828] sm:flex"
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
                            {mine ? (
                              <>
                                <span aria-hidden="true">·</span>
                                <span>{message.read_at ? text.read : text.sent}</span>
                                {message.read_at ? <CheckCheck className="h-3 w-3" /> : null}
                              </>
                            ) : null}
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
              href={localizePublicHref(locale, '/marketplace')}
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
