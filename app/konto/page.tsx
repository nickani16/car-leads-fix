import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CreditCard,
  FileText,
  Heart,
  MessageCircle,
  Plus,
  ReceiptText,
  Search,
  Settings,
  ShieldCheck,
  Star,
  UserRound,
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
import AccountLogoutButton from './AccountLogoutButton'
import DeleteAccountPanel from './DeleteAccountPanel'
import ProfileForm from './ProfileForm'
import { generateAccountMetadata } from '@/lib/account-seo'

export const generateMetadata = generateAccountMetadata('profile')

type ProfileRow = {
  account_type: 'private' | 'business'
  first_name: string | null
  last_name: string | null
  birth_date: string | null
  email: string
  phone: string
  country_code: string
  company_name: string | null
  registration_number: string | null
  vat_number: string | null
  website_url: string | null
  logo_url: string | null
  address_line_1: string | null
  address_line_2: string | null
  city: string | null
  region: string | null
  postal_code: string | null
  identity_status: string
  business_verification_status: string | null
  business_onboarding_status?: string | null
  risk_status: string
  national_id_last4: string | null
  display_name?: string | null
}

export default async function AccountPage() {
  const locale = await getRequestLocale()
  const copy = getMyAutorellCopy(locale)
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect(localizePublicHref(locale, '/login'))

  const { data: profile } = await supabase
    .from('marketplace_profiles')
    .select(`
      account_type,
      first_name,
      last_name,
      birth_date,
      email,
      phone,
      country_code,
      company_name,
      registration_number,
      vat_number,
      website_url,
      logo_url,
      address_line_1,
      address_line_2,
      city,
      region,
      postal_code,
      identity_status,
      business_verification_status,
      business_onboarding_status,
      risk_status,
      national_id_last4,
      display_name
    `)
    .eq('user_id', user.id)
    .maybeSingle<ProfileRow>()

  if (!profile) redirect(localizePublicHref(locale, '/register'))

  const admin = createAdminClient()
  let businessSubscription: {
    plan_key: string | null
    status: string | null
    payment_status: string | null
    manually_activated: boolean | null
    free_period_ends_at: string | null
  } | null = null
  if (profile.account_type === 'business') {
    businessSubscription = await redirectBusinessAccountFromLegacyAccount(admin, user.id, profile, locale)
  }
  const [{ count: listings }, { data: conversationData }, { count: reviews }] =
    await Promise.all([
      admin
        .from('marketplace_listings')
        .select('id', { count: 'exact', head: true })
        .eq('seller_user_id', user.id),
      admin
        .from('marketplace_conversations')
        .select('id,buyer_user_id,seller_user_id')
        .or(`buyer_user_id.eq.${user.id},seller_user_id.eq.${user.id}`),
      admin
        .from('marketplace_reviews')
        .select('id', { count: 'exact', head: true })
        .eq('reviewee_id', user.id)
        .eq('status', 'visible'),
    ])
  const conversationRows = conversationData || []
  const conversationIds = conversationRows.map((conversation) => conversation.id)
  const { data: messageConversationData } = conversationIds.length
    ? await admin
        .from('marketplace_messages')
        .select('conversation_id')
        .in('conversation_id', conversationIds)
    : { data: [] }
  const conversationsWithMessages = new Set(
    (messageConversationData || []).map((message) => message.conversation_id),
  )
  const visibleConversationCount = conversationRows.filter(
    (conversation) =>
      conversation.buyer_user_id === user.id ||
      conversationsWithMessages.has(conversation.id),
  ).length

  const name = displayName(profile, user.email || copy.user)
  const firstName = profile.first_name || name.split(' ')[0] || copy.user
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  const accountTypeLabel =
    profile.account_type === 'business' ? copy.businessAccount : copy.privateAccount
  const verificationLabel =
    profile.account_type === 'business'
      ? profile.business_verification_status === 'verified'
        ? copy.verified
        : copy.reviewPending
      : profile.identity_status === 'verified' || profile.identity_status === 'basic_checked'
        ? copy.verified
        : copy.reviewPending

  const cards = [
    {
      title: copy.myAccount,
      text: copy.myAccountText,
      href: '#profile-details',
      icon: UserRound,
    },
    {
      title: copy.myListings,
      text: copy.myListingsText,
      href: localizePublicHref(locale, '/account/listings'),
      icon: FileText,
      badge: String(listings || 0),
    },
    {
      title: copy.createListing,
      text: copy.createListingText,
      href: localizePublicHref(locale, '/account/listings/new'),
      icon: Plus,
      cta: true,
    },
    {
      title: copy.messages,
      text: copy.messagesText,
      href: localizePublicHref(locale, '/account/messages'),
      icon: MessageCircle,
      badge: String(visibleConversationCount),
    },
    {
      title: copy.savedSearches,
      text: copy.savedSearchesText,
      href: localizePublicHref(locale, '/marketplace'),
      icon: Search,
    },
    {
      title: copy.favorites,
      text: copy.favoritesText,
      href: localizePublicHref(locale, '/sparade'),
      icon: Heart,
    },
    {
      title: copy.reviews,
      text: copy.reviewsText,
      href: localizePublicHref(locale, '/account/reviews'),
      icon: Star,
      badge: String(reviews || 0),
    },
    {
      title: copy.business,
      text:
        profile.account_type === 'business'
          ? copy.businessText
          : copy.businessEntryText,
      href:
        profile.account_type === 'business'
          ? localizePublicHref(locale, '/account/company')
          : localizePublicHref(locale, '/foretag'),
      icon: Building2,
    },
    ...(profile.account_type === 'business'
      ? [
          {
            title: copy.plan,
            text: businessSubscription?.plan_key
              ? `${copy.currentPlan}: ${businessSubscription.plan_key}`
              : copy.planText,
            href: localizePublicHref(locale, '/account/company/subscription'),
            icon: CreditCard,
          },
          {
            title: copy.payments,
            text: copy.paymentsText,
            href: localizePublicHref(locale, '/account/payments'),
            icon: ReceiptText,
          },
        ]
      : []),
    {
      title: copy.settings,
      text: copy.settingsText,
      href: '#profile-details',
      icon: Settings,
    },
  ]

  return (
    <main className="bg-[#f7f9fc]">
      <section className="border-b border-[#e4eaf3] bg-white">
        <div className="mx-auto max-w-[var(--autorell-page-max)] px-5 py-8 sm:px-8 lg:py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#0866ff]">
                {copy.eyebrow}
              </p>
              <h1 className="mt-3 text-4xl tracking-[-0.055em] text-[#101828] sm:text-5xl">
                {copy.welcome} {firstName}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#667085] sm:text-base">
                {copy.intro}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href={localizePublicHref(locale, '/')}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[13px] border border-[#d6e1ee] bg-white px-4 text-sm font-bold text-[#344054] transition hover:border-[#0866ff] hover:text-[#0866ff]"
              >
                {copy.home}
              </Link>
              <AccountLogoutButton
                homeHref={localizePublicHref(locale, '/')}
                label={copy.signOut}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[var(--autorell-page-max)] px-5 py-6 sm:px-8 lg:py-9">
        <section className="overflow-hidden rounded-[28px] border border-[#dfe7f2] bg-white shadow-[0_20px_60px_rgba(16,24,40,.06)]">
          <div className="grid gap-0 lg:grid-cols-[1fr_340px]">
            <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
              <div className="grid h-24 w-24 shrink-0 place-items-center rounded-full border border-[#c9d8ee] bg-[#eef5ff] text-3xl font-black text-[#0866ff] shadow-inner">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-3xl tracking-[-0.045em] text-[#101828]">
                    {name}
                  </h2>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#eef5ff] px-3 py-1 text-xs font-bold text-[#0866ff]">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    {verificationLabel}
                  </span>
                </div>
                <p className="mt-2 text-sm font-medium text-[#475467]">{user.email}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-[#dfe7f2] bg-white px-3 py-1 text-xs font-bold text-[#344054]">
                    {accountTypeLabel}
                  </span>
                  {profile.country_code ? (
                    <span className="rounded-full border border-[#dfe7f2] bg-white px-3 py-1 text-xs font-bold text-[#344054]">
                      {profile.country_code}
                    </span>
                  ) : null}
                </div>
                <div className="mt-5">
                  <a
                    href="#profile-details"
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[13px] bg-[#101828] px-4 text-sm font-bold text-white transition hover:bg-[#0866ff]"
                  >
                    {copy.editProfile}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
            <aside className="border-t border-[#e4eaf3] bg-[#f8fbff] p-6 sm:p-8 lg:border-l lg:border-t-0">
              <div className="grid gap-3">
                <ProfileStat icon={FileText} label={copy.myListings} value={listings || 0} />
                <ProfileStat icon={MessageCircle} label={copy.messages} value={visibleConversationCount} />
                <ProfileStat icon={Star} label={copy.reviews} value={reviews || 0} />
              </div>
            </aside>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <AccountCard key={card.title} {...card} />
          ))}
        </section>

        <section
          id="profile-details"
          className="mt-8 scroll-mt-24 rounded-[26px] border border-[#dfe7f2] bg-white p-5 shadow-[0_18px_50px_rgba(16,24,40,.045)] sm:p-8"
        >
          <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0866ff]">
                {copy.profileEyebrow}
              </p>
              <h2 className="mt-2 text-3xl tracking-[-0.045em]">{copy.profileTitle}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#667085]">
                {copy.profileText}
              </p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#eef5ff] px-4 py-2 text-xs font-bold text-[#0866ff]">
              <ShieldCheck className="h-4 w-4" />
              {copy.secureAccount}
            </span>
          </div>
          <ProfileForm profile={profile} locale={locale} />
        </section>

        <DeleteAccountPanel
          locale={locale}
          homeHref={localizePublicHref(locale, '/')}
        />
      </div>
    </main>
  )
}

function AccountCard({
  href,
  icon: Icon,
  title,
  text,
  badge,
  cta,
}: {
  href: string
  icon: LucideIcon
  title: string
  text: string
  badge?: string
  cta?: boolean
}) {
  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-[24px] border p-6 transition hover:-translate-y-0.5 ${
        cta
          ? 'border-[#0866ff] bg-[#0866ff] text-white shadow-[0_24px_60px_rgba(8,102,255,.22)]'
          : 'border-[#dfe7f2] bg-white shadow-[0_16px_46px_rgba(16,24,40,.045)] hover:border-[#b9cef4] hover:shadow-[0_22px_60px_rgba(16,24,40,.08)]'
      }`}
    >
      {cta ? (
        <div className="absolute -right-14 -top-14 h-36 w-36 rounded-full bg-white/15" />
      ) : null}
      <div className="relative flex items-start justify-between gap-4">
        <span
          className={`grid h-12 w-12 shrink-0 place-items-center rounded-[16px] ${
            cta ? 'bg-white/18 text-white' : 'bg-[#eef5ff] text-[#0866ff]'
          }`}
        >
          <Icon className="h-5 w-5" />
        </span>
        {badge ? (
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-black ${
              cta ? 'bg-white/20 text-white' : 'bg-[#f2f6ff] text-[#0866ff]'
            }`}
          >
            {badge}
          </span>
        ) : null}
      </div>
      <div className="relative mt-5">
        <h3 className="text-xl tracking-[-0.03em]">{title}</h3>
        <p className={`mt-2 text-sm leading-6 ${cta ? 'text-white/82' : 'text-[#667085]'}`}>
          {text}
        </p>
      </div>
      <ArrowRight
        className={`relative mt-6 h-5 w-5 transition group-hover:translate-x-1 ${
          cta ? 'text-white' : 'text-[#98a2b3] group-hover:text-[#0866ff]'
        }`}
      />
    </Link>
  )
}

function ProfileStat({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: number
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[16px] border border-[#dfe7f2] bg-white px-4 py-3">
      <span className="flex min-w-0 items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-[#eef5ff] text-[#0866ff]">
          <Icon className="h-4 w-4" />
        </span>
        <span className="truncate text-sm font-bold text-[#475467]">{label}</span>
      </span>
      <strong className="text-lg tracking-[-0.03em]">{value}</strong>
    </div>
  )
}

async function redirectBusinessAccountFromLegacyAccount(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  profile: ProfileRow,
  locale: PublicLocale,
) {
  const { data: subscription } = await admin
    .from('business_subscriptions')
    .select('plan_key,status,payment_status,manually_activated,free_period_ends_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  const businessSubscription = subscription || null
  const onboarding = String((profile as ProfileRow & { business_onboarding_status?: string }).business_onboarding_status || '')
  const status = onboarding || (subscription?.status === 'active' ? 'active' : 'subscription_pending')
  if (status === 'under_review' || status === 'submitted' || status === 'draft') {
    redirect(localizePublicHref(locale, '/account/business/status?state=under_review'))
  }
  if (status !== 'active' || !subscription || !['active', 'trialing'].includes(String(subscription.status)) && !subscription.manually_activated) {
    redirect(localizePublicHref(locale, '/account/business/subscription'))
  }
  redirect(localizePublicHref(locale, '/account/company'))
  return businessSubscription
}

function displayName(profile: ProfileRow, fallback: string) {
  if (profile.account_type === 'business' && profile.company_name) {
    return profile.company_name
  }

  const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ')
  return name || profile.display_name || fallback
}

function getMyAutorellCopy(locale: PublicLocale) {
  const en = {
    eyebrow: 'Account area',
    title: 'Welcome',
    welcome: 'Welcome',
    intro:
      'Your listings, messages, saved vehicles and account settings in the same Autorell marketplace.',
    home: 'Home',
    signOut: 'Sign out',
    user: 'Autorell user',
    privateAccount: 'Private account',
    businessAccount: 'Business account',
    verified: 'Verified',
    reviewPending: 'Review pending',
    editProfile: 'View / edit profile',
    myAccount: 'My account',
    myAccountText: 'View and update your account details, contact details and security.',
    myListings: 'My listings',
    myListingsText: 'Manage your active, paused and completed listings.',
    createListing: 'Create listing',
    createListingText: 'List a new vehicle on Autorell.',
    messages: 'Messages',
    messagesText: 'Read and reply to messages from buyers and sellers.',
    savedSearches: 'Saved searches',
    savedSearchesText: 'View and manage your saved searches.',
    favorites: 'Favorites',
    favoritesText: 'Vehicles and listings you have saved.',
    reviews: 'Reviews',
    reviewsText: 'See reviews you have received and left.',
    business: 'Business',
    businessText: 'Manage company details, listings and team.',
    businessEntryText: 'Explore business profiles, inventory tools and team features.',
    settings: 'Settings',
    settingsText: 'Language, currency, notifications and account settings.',
    plan: 'Plan',
    planText: 'Choose, upgrade or change the company subscription.',
    currentPlan: 'Current plan',
    payments: 'Payments',
    paymentsText: 'View invoices, payment status and Stripe billing portal.',
    profileEyebrow: 'Profile and security',
    profileTitle: 'Account details',
    profileText:
      'Keep your contact, address and account details updated so listings and messages work smoothly.',
    secureAccount: 'Secure account',
  }

  if (locale === 'sv') {
    return {
      ...en,
      eyebrow: 'Kontoyta',
      title: 'Välkommen',
      welcome: 'Välkommen',
      intro:
        'Dina annonser, meddelanden, sparade fordon och kontoinställningar inne på samma Autorell-marknadsplats.',
      home: 'Startsida',
      signOut: 'Logga ut',
      user: 'Autorell-användare',
      privateAccount: 'Privatkonto',
      businessAccount: 'Företagskonto',
      verified: 'Verifierad',
      reviewPending: 'Granskning pågår',
      editProfile: 'Visa / redigera profil',
      myAccount: 'Mitt konto',
      myAccountText: 'Se och ändra dina kontouppgifter, kontaktuppgifter och säkerhet.',
      myListings: 'Mina annonser',
      myListingsText: 'Hantera dina aktiva, pausade och avslutade annonser.',
      createListing: 'Skapa annons',
      createListingText: 'Lägg upp ett nytt fordon på Autorell.',
      messages: 'Meddelanden',
      messagesText: 'Läs och svara på meddelanden från köpare och säljare.',
      savedSearches: 'Sparade sökningar',
      savedSearchesText: 'Se och hantera dina sparade sökningar.',
      favorites: 'Favoriter',
      favoritesText: 'Fordon och annonser du har sparat.',
      reviews: 'Recensioner',
      reviewsText: 'Se omdömen du fått och lämnat.',
      business: 'Företag',
      businessText: 'Hantera företagsuppgifter, annonser och team.',
      businessEntryText: 'Utforska företagsprofil, lagerverktyg och teamfunktioner.',
      settings: 'Inställningar',
      settingsText: 'Språk, valuta, notiser och kontoinställningar.',
      plan: 'Plan',
      planText: 'Välj, uppgradera eller ändra företagets abonnemang.',
      currentPlan: 'Nuvarande plan',
      payments: 'Betalningar',
      paymentsText: 'Se fakturor, betalningsstatus och Stripe-portalen.',
      profileEyebrow: 'Profil och säkerhet',
      profileTitle: 'Kontouppgifter',
      profileText:
        'Håll kontakt-, adress- och kontouppgifter uppdaterade så att annonser och meddelanden fungerar smidigt.',
      secureAccount: 'Säkert konto',
    }
  }

  if (locale === 'de') {
    return {
      ...en,
      eyebrow: 'Kontobereich',
      title: 'Willkommen',
      welcome: 'Willkommen',
      intro:
        'Ihre Anzeigen, Nachrichten, gespeicherten Fahrzeuge und Kontoeinstellungen auf demselben Autorell-Marktplatz.',
      home: 'Startseite',
      signOut: 'Abmelden',
      user: 'Autorell-Nutzer',
      privateAccount: 'Privatkonto',
      businessAccount: 'Unternehmenskonto',
      verified: 'Verifiziert',
      reviewPending: 'Prüfung läuft',
      editProfile: 'Profil ansehen / bearbeiten',
      myAccount: 'Mein Konto',
      myAccountText: 'Kontodaten, Kontaktdaten und Sicherheit ansehen und ändern.',
      myListings: 'Meine Anzeigen',
      myListingsText: 'Aktive, pausierte und abgeschlossene Anzeigen verwalten.',
      createListing: 'Anzeige erstellen',
      createListingText: 'Ein neues Fahrzeug auf Autorell einstellen.',
      messages: 'Nachrichten',
      messagesText: 'Nachrichten von Käufern und Verkäufern lesen und beantworten.',
      savedSearches: 'Gespeicherte Suchen',
      savedSearchesText: 'Gespeicherte Suchen ansehen und verwalten.',
      favorites: 'Favoriten',
      favoritesText: 'Fahrzeuge und Anzeigen, die Sie gespeichert haben.',
      reviews: 'Bewertungen',
      reviewsText: 'Erhaltene und abgegebene Bewertungen ansehen.',
      business: 'Unternehmen',
      businessText: 'Firmendaten, Anzeigen und Team verwalten.',
      businessEntryText: 'Unternehmensprofil, Bestandstools und Teamfunktionen entdecken.',
      settings: 'Einstellungen',
      settingsText: 'Sprache, Währung, Benachrichtigungen und Kontoeinstellungen.',
      plan: 'Tarif',
      planText: 'Unternehmensabo auswählen, upgraden oder ändern.',
      currentPlan: 'Aktueller Tarif',
      payments: 'Zahlungen',
      paymentsText: 'Rechnungen, Zahlungsstatus und Stripe-Portal anzeigen.',
      profileEyebrow: 'Profil und Sicherheit',
      profileTitle: 'Kontodaten',
      profileText:
        'Halten Sie Kontakt-, Adress- und Kontodaten aktuell, damit Anzeigen und Nachrichten reibungslos funktionieren.',
      secureAccount: 'Sicheres Konto',
    }
  }

  return translatePublicObject(locale, en)
}
