import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  FileText,
  Heart,
  HelpCircle,
  MessageCircle,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { getAccountListingSummary, type AccountListingSummary } from '@/lib/account-listings-management'
import { getRequestLocale } from '@/lib/request-locale'
import { localizePublicHref, translatePublicObject, type PublicLocale } from '@/lib/public-i18n'
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

type ConversationRow = {
  id: string
  buyer_user_id: string | null
  seller_user_id: string | null
}

export default async function AccountPage() {
  const locale = await getRequestLocale()
  const copy = getPrivateAccountCopy(locale)
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect(localizePublicHref(locale, '/login'))

  const admin = createAdminClient()
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
  if (profile.account_type === 'business') {
    await redirectBusinessAccountFromLegacyAccount(admin, user.id, profile, locale)
  }

  const [
    listingSummary,
    savedListingCount,
    savedSearchCount,
    conversationData,
    pendingPaymentCount,
  ] = await Promise.all([
    getAccountListingSummary(admin, user.id).catch(() => emptyListingSummary()),
    countRows(admin, 'marketplace_saved_listings', user.id),
    countRows(admin, 'marketplace_saved_searches', user.id),
    admin
      .from('marketplace_conversations')
      .select('id,buyer_user_id,seller_user_id')
      .or(`buyer_user_id.eq.${user.id},seller_user_id.eq.${user.id}`),
    admin
      .from('payment_orders')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .in('status', ['created', 'checkout_created', 'pending', 'failed']),
  ])

  const conversations = (conversationData.data || []) as ConversationRow[]
  const visibleConversationCount = await countVisibleConversations(admin, user.id, conversations)
  const paymentCount = pendingPaymentCount.count || 0
  const name = displayName(profile, user.email || copy.user)
  const firstName = profile.first_name || name.split(' ')[0] || copy.user
  const verificationLabel =
    profile.identity_status === 'verified' || profile.identity_status === 'basic_checked'
      ? copy.verified
      : copy.reviewPending
  const profileComplete = Boolean(
    profile.first_name &&
      profile.last_name &&
      profile.email &&
      profile.phone &&
      profile.address_line_1 &&
      profile.postal_code &&
      profile.city,
  )

  const primaryActions = [
    {
      title: copy.createListing,
      text: copy.createListingText,
      href: localizePublicHref(locale, '/account/listings/new'),
      icon: Plus,
      cta: true,
    },
    {
      title: copy.manageListings,
      text: copy.manageListingsText,
      href: localizePublicHref(locale, '/account/listings'),
      icon: FileText,
    },
    {
      title: copy.savedListings,
      text: copy.savedListingsText,
      href: localizePublicHref(locale, '/account/saved-listings'),
      icon: Heart,
      badge: String(savedListingCount),
    },
    {
      title: copy.savedSearches,
      text: copy.savedSearchesText,
      href: localizePublicHref(locale, '/account/saved-searches'),
      icon: Search,
      badge: String(savedSearchCount),
    },
    {
      title: copy.messages,
      text: copy.messagesText,
      href: localizePublicHref(locale, '/account/messages'),
      icon: MessageCircle,
      badge: String(visibleConversationCount),
    },
    {
      title: copy.payments,
      text: copy.paymentsText,
      href: localizePublicHref(locale, '/account/payments'),
      icon: CreditCard,
      badge: paymentCount ? String(paymentCount) : undefined,
    },
  ]

  const secondaryNavigation = [
    { label: copy.overview, href: localizePublicHref(locale, '/account'), icon: UserRound, active: true },
    { label: copy.listings, href: localizePublicHref(locale, '/account/listings'), icon: FileText },
    { label: copy.createListing, href: localizePublicHref(locale, '/account/listings/new'), icon: Plus },
    { label: copy.savedListings, href: localizePublicHref(locale, '/account/saved-listings'), icon: Heart },
    { label: copy.savedSearches, href: localizePublicHref(locale, '/account/saved-searches'), icon: Search },
    { label: copy.messages, href: localizePublicHref(locale, '/account/messages'), icon: MessageCircle },
    { label: copy.payments, href: localizePublicHref(locale, '/account/payments'), icon: CreditCard },
    { label: copy.settings, href: '#profile-details', icon: Settings },
    { label: copy.support, href: localizePublicHref(locale, '/help-center'), icon: HelpCircle },
  ]

  const attentionItems = [
    !profileComplete
      ? {
          icon: UserRound,
          title: copy.profileNeedsWork,
          text: copy.profileNeedsWorkText,
          href: '#profile-details',
          label: copy.completeProfile,
        }
      : null,
    listingSummary.counts.payment
      ? {
          icon: CreditCard,
          title: `${listingSummary.counts.payment} ${copy.awaitingPayment}`,
          text: copy.awaitingPaymentText,
          href: localizePublicHref(locale, '/account/listings?status=payment'),
          label: copy.continuePayment,
        }
      : null,
    listingSummary.counts.draft
      ? {
          icon: FileText,
          title: `${listingSummary.counts.draft} ${copy.drafts}`,
          text: copy.draftsText,
          href: localizePublicHref(locale, '/account/listings?status=draft'),
          label: copy.continueDraft,
        }
      : null,
    listingSummary.expiringSoon
      ? {
          icon: CalendarClock,
          title: `${listingSummary.expiringSoon} ${copy.expiringSoon}`,
          text: copy.expiringSoonText,
          href: localizePublicHref(locale, '/account/listings?status=active&sort=expires_asc'),
          label: copy.reviewListings,
        }
      : null,
  ].filter(Boolean) as Array<AttentionItem>

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

          <nav
            aria-label={copy.accountNavigation}
            className="mt-7 flex gap-2 overflow-x-auto rounded-[18px] border border-[#dfe7f2] bg-[#f8fbff] p-2"
          >
            {secondaryNavigation.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                aria-current={item.active ? 'page' : undefined}
                className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-[12px] px-3 text-sm font-bold transition ${
                  item.active
                    ? 'bg-[#0866ff] text-white shadow-[0_10px_24px_rgba(8,102,255,.18)]'
                    : 'text-[#475467] hover:bg-white hover:text-[#0866ff]'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <div className="mx-auto max-w-[var(--autorell-page-max)] px-5 py-6 sm:px-8 lg:py-9">
        <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="rounded-[24px] border border-[#dfe7f2] bg-white p-5 shadow-[0_18px_50px_rgba(16,24,40,.045)] sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-2xl font-semibold tracking-[-0.035em] text-[#101828]">
                    {name}
                  </h2>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#eef5ff] px-3 py-1 text-xs font-bold text-[#0866ff]">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    {verificationLabel}
                  </span>
                </div>
                <p className="mt-2 text-sm font-medium text-[#475467]">{user.email}</p>
              </div>
              <a
                href="#profile-details"
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[12px] bg-[#101828] px-4 text-sm font-bold text-white transition hover:bg-[#0866ff]"
              >
                {copy.editProfile}
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
              <OverviewMetric icon={CheckCircle2} label={copy.activeListings} value={listingSummary.counts.active} href={localizePublicHref(locale, '/account/listings?status=active')} />
              <OverviewMetric icon={CreditCard} label={copy.awaitingPaymentShort} value={listingSummary.counts.payment} href={localizePublicHref(locale, '/account/listings?status=payment')} />
              <OverviewMetric icon={ShieldCheck} label={copy.inReview} value={listingSummary.counts.review} href={localizePublicHref(locale, '/account/listings?status=review')} />
              <OverviewMetric icon={FileText} label={copy.draftsShort} value={listingSummary.counts.draft} href={localizePublicHref(locale, '/account/listings?status=draft')} />
            </div>
          </div>

          <aside className="rounded-[24px] border border-[#dfe7f2] bg-white p-5 shadow-[0_18px_50px_rgba(16,24,40,.045)] sm:p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-[14px] bg-[#eef5ff] text-[#0866ff]">
                <Bell className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-semibold tracking-[-0.025em] text-[#101828]">{copy.nextSteps}</h2>
                <p className="text-sm text-[#667085]">{copy.nextStepsText}</p>
              </div>
            </div>
            <div className="mt-4 grid gap-2">
              {attentionItems.length ? attentionItems.map((item) => (
                <AttentionCard key={item.title} item={item} />
              )) : (
                <div className="rounded-[16px] border border-[#dfe7f2] bg-[#f8fbff] p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#0866ff]" />
                    <div>
                      <h3 className="text-sm font-bold text-[#101828]">{copy.noUrgentActions}</h3>
                      <p className="mt-1 text-sm leading-6 text-[#667085]">{copy.noUrgentActionsText}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {primaryActions.map((card) => (
            <AccountCard key={card.title} {...card} />
          ))}
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          <SummaryPanel title={copy.buying} text={copy.buyingText} items={[
            [copy.savedListings, savedListingCount, localizePublicHref(locale, '/account/saved-listings')],
            [copy.savedSearches, savedSearchCount, localizePublicHref(locale, '/account/saved-searches')],
            [copy.messages, visibleConversationCount, localizePublicHref(locale, '/account/messages')],
          ]} />
          <SummaryPanel title={copy.selling} text={copy.sellingText} items={[
            [copy.activeListings, listingSummary.counts.active, localizePublicHref(locale, '/account/listings?status=active')],
            [copy.soldListings, listingSummary.counts.sold, localizePublicHref(locale, '/account/listings?status=sold')],
            [copy.expiredListings, listingSummary.counts.expired, localizePublicHref(locale, '/account/listings?status=expired')],
          ]} />
          <SummaryPanel title={copy.safety} text={copy.safetyText} items={[
            [copy.profileStatus, profileComplete ? copy.complete : copy.needsUpdate, '#profile-details'],
            [copy.accountType, copy.privateAccount, '#profile-details'],
            [copy.country, profile.country_code || copy.notSet, '#profile-details'],
          ]} />
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

async function countRows(
  admin: ReturnType<typeof createAdminClient>,
  table: 'marketplace_saved_listings' | 'marketplace_saved_searches',
  userId: string,
) {
  const { count } = await admin
    .from(table)
    .select('user_id', { count: 'exact', head: true })
    .eq('user_id', userId)
  return count || 0
}

async function countVisibleConversations(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  conversations: ConversationRow[],
) {
  const conversationIds = conversations.map((conversation) => conversation.id)
  const { data: messageConversationData } = conversationIds.length
    ? await admin
        .from('marketplace_messages')
        .select('conversation_id')
        .in('conversation_id', conversationIds)
    : { data: [] }
  const conversationsWithMessages = new Set(
    (messageConversationData || []).map((message) => message.conversation_id),
  )
  return conversations.filter(
    (conversation) =>
      conversation.buyer_user_id === userId ||
      conversationsWithMessages.has(conversation.id),
  ).length
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
  const onboarding = String((profile as ProfileRow & { business_onboarding_status?: string }).business_onboarding_status || '')
  const status = onboarding || (subscription?.status === 'active' ? 'active' : 'subscription_pending')
  if (status === 'under_review' || status === 'submitted' || status === 'draft') {
    redirect(localizePublicHref(locale, '/account/business/status?state=under_review'))
  }
  if (
    status !== 'active' ||
    !subscription ||
    (!['active', 'trialing'].includes(String(subscription.status)) && !subscription.manually_activated)
  ) {
    redirect(localizePublicHref(locale, '/account/business/subscription'))
  }
  redirect(localizePublicHref(locale, '/account/company'))
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
      className={`group relative overflow-hidden rounded-[22px] border p-5 transition hover:-translate-y-0.5 ${
        cta
          ? 'border-[#0866ff] bg-[#0866ff] text-white shadow-[0_24px_60px_rgba(8,102,255,.22)]'
          : 'border-[#dfe7f2] bg-white shadow-[0_16px_46px_rgba(16,24,40,.045)] hover:border-[#b9cef4] hover:shadow-[0_22px_60px_rgba(16,24,40,.08)]'
      }`}
    >
      <div className="relative flex items-start justify-between gap-4">
        <span
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-[14px] ${
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
        className={`relative mt-5 h-5 w-5 transition group-hover:translate-x-1 ${
          cta ? 'text-white' : 'text-[#98a2b3] group-hover:text-[#0866ff]'
        }`}
      />
    </Link>
  )
}

function OverviewMetric({
  href,
  icon: Icon,
  label,
  value,
}: {
  href: string
  icon: LucideIcon
  label: string
  value: number
}) {
  return (
    <Link
      href={href}
      className="rounded-[16px] border border-[#dfe7f2] bg-[#f8fbff] p-4 transition hover:border-[#aac5ef] hover:bg-white"
    >
      <Icon className="h-4 w-4 text-[#0866ff]" />
      <strong className="mt-3 block text-2xl tracking-[-0.04em] text-[#101828]">
        {value.toLocaleString()}
      </strong>
      <span className="mt-1 block text-xs font-bold uppercase tracking-[0.1em] text-[#667085]">
        {label}
      </span>
    </Link>
  )
}

type AttentionItem = {
  icon: LucideIcon
  title: string
  text: string
  href: string
  label: string
}

function AttentionCard({ item }: { item: AttentionItem }) {
  return (
    <Link
      href={item.href}
      className="rounded-[16px] border border-[#dfe7f2] bg-[#f8fbff] p-4 transition hover:border-[#aac5ef] hover:bg-white"
    >
      <div className="flex items-start gap-3">
        <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-[#0866ff]" />
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-[#101828]">{item.title}</h3>
          <p className="mt-1 text-sm leading-6 text-[#667085]">{item.text}</p>
          <span className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-[#0866ff]">
            {item.label}
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}

function SummaryPanel({
  title,
  text,
  items,
}: {
  title: string
  text: string
  items: Array<[string, number | string, string]>
}) {
  return (
    <section className="rounded-[22px] border border-[#dfe7f2] bg-white p-5 shadow-[0_16px_46px_rgba(16,24,40,.045)]">
      <h2 className="text-lg font-semibold tracking-[-0.025em] text-[#101828]">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-[#667085]">{text}</p>
      <div className="mt-4 grid gap-2">
        {items.map(([label, value, href]) => (
          <Link
            key={label}
            href={href}
            className="flex items-center justify-between gap-3 rounded-[14px] border border-[#edf1f7] bg-[#fbfcff] px-4 py-3 text-sm transition hover:border-[#aac5ef] hover:bg-white"
          >
            <span className="font-semibold text-[#475467]">{label}</span>
            <strong className="text-[#101828]">{typeof value === 'number' ? value.toLocaleString() : value}</strong>
          </Link>
        ))}
      </div>
    </section>
  )
}

function displayName(profile: ProfileRow, fallback: string) {
  const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ')
  return name || profile.display_name || fallback
}

function emptyListingSummary(): AccountListingSummary {
  return {
    counts: {
      all: 0,
      active: 0,
      payment: 0,
      review: 0,
      draft: 0,
      paused: 0,
      expired: 0,
      sold: 0,
      deleted: 0,
    },
    totalViews: 0,
    totalFavorites: 0,
    missingImages: 0,
    firstMissingImageId: null,
    flagged: 0,
    expiringSoon: 0,
    failedPayments: 0,
    categories: [],
    countries: [],
  }
}

function getPrivateAccountCopy(locale: PublicLocale) {
  const en = {
    eyebrow: 'My Autorell',
    welcome: 'Welcome',
    intro:
      'A simple overview for buying, selling, saved vehicles, messages and payments on Autorell.',
    home: 'Home',
    signOut: 'Sign out',
    user: 'Autorell user',
    privateAccount: 'Private account',
    verified: 'Verified',
    reviewPending: 'Review pending',
    editProfile: 'Edit profile',
    accountNavigation: 'Account navigation',
    overview: 'Overview',
    listings: 'Listings',
    createListing: 'Create listing',
    createListingText: 'Start a new vehicle listing and save it as a draft while you work.',
    manageListings: 'My listings',
    manageListingsText: 'Continue drafts, complete payment, edit, pause or mark a vehicle as sold.',
    savedListings: 'Saved listings',
    savedListingsText: 'Vehicles you saved so you can compare and return later.',
    savedSearches: 'Saved searches',
    savedSearchesText: 'Saved filters and searches for the vehicles you are watching.',
    messages: 'Messages',
    messagesText: 'Read and reply to enquiries from buyers and sellers.',
    payments: 'Payments',
    paymentsText: 'See listing orders, payment status and receipts when available.',
    settings: 'Settings',
    support: 'Help',
    activeListings: 'Active',
    awaitingPaymentShort: 'Payment',
    inReview: 'Review',
    draftsShort: 'Drafts',
    nextSteps: 'Next steps',
    nextStepsText: 'Only the things that need your attention.',
    profileNeedsWork: 'Complete your profile',
    profileNeedsWorkText: 'Add contact and address details before publishing listings.',
    completeProfile: 'Complete profile',
    awaitingPayment: 'listings await payment',
    awaitingPaymentText: 'Payment is required before the listing can continue.',
    continuePayment: 'Continue payment',
    drafts: 'saved drafts',
    draftsText: 'You can continue from the last saved version.',
    continueDraft: 'Continue draft',
    expiringSoon: 'listings expire soon',
    expiringSoonText: 'Review them before the listing period ends.',
    reviewListings: 'Review listings',
    noUrgentActions: 'Everything looks calm',
    noUrgentActionsText: 'No draft, payment or profile action needs immediate attention.',
    buying: 'Buying',
    buyingText: 'Saved vehicles, searches and conversations stay connected to your account.',
    selling: 'Selling',
    sellingText: 'Follow your listings from draft to payment, review, active and sold.',
    safety: 'Account',
    safetyText: 'Your private account details stay separate from business and admin flows.',
    soldListings: 'Sold',
    expiredListings: 'Expired',
    profileStatus: 'Profile status',
    complete: 'Complete',
    needsUpdate: 'Needs update',
    accountType: 'Account type',
    country: 'Country',
    notSet: 'Not set',
    profileEyebrow: 'Profile and security',
    profileTitle: 'Account details',
    profileText:
      'Keep contact, address and account details updated so listings and messages work smoothly.',
    secureAccount: 'Secure account',
  }

  if (locale === 'sv') {
    return {
      ...en,
      eyebrow: 'Mina sidor',
      welcome: 'Välkommen',
      intro:
        'En enkel översikt för köp, försäljning, sparade fordon, meddelanden och betalningar på Autorell.',
      home: 'Startsida',
      signOut: 'Logga ut',
      user: 'Autorell-användare',
      privateAccount: 'Privatkonto',
      verified: 'Verifierad',
      reviewPending: 'Granskning pågår',
      editProfile: 'Redigera profil',
      accountNavigation: 'Kontonavigation',
      overview: 'Översikt',
      listings: 'Annonser',
      createListing: 'Skapa annons',
      createListingText: 'Starta en ny fordonsannons och spara den som utkast medan du arbetar.',
      manageListings: 'Mina annonser',
      manageListingsText: 'Fortsätt utkast, slutför betalning, redigera, pausa eller markera som såld.',
      savedListings: 'Sparade annonser',
      savedListingsText: 'Fordon du sparat för att kunna jämföra och återvända senare.',
      savedSearches: 'Sparade sökningar',
      savedSearchesText: 'Sparade filter och sökningar för fordon du bevakar.',
      messages: 'Meddelanden',
      messagesText: 'Läs och svara på förfrågningar från köpare och säljare.',
      payments: 'Betalningar',
      paymentsText: 'Se annonsordrar, betalningsstatus och kvitton när de finns.',
      settings: 'Inställningar',
      support: 'Hjälp',
      activeListings: 'Aktiva',
      awaitingPaymentShort: 'Betalning',
      inReview: 'Granskning',
      draftsShort: 'Utkast',
      nextSteps: 'Nästa steg',
      nextStepsText: 'Bara det som behöver din uppmärksamhet.',
      profileNeedsWork: 'Komplettera profilen',
      profileNeedsWorkText: 'Lägg till kontakt- och adressuppgifter innan du publicerar annonser.',
      completeProfile: 'Komplettera profil',
      awaitingPayment: 'annonser väntar på betalning',
      awaitingPaymentText: 'Betalning krävs innan annonsen kan gå vidare.',
      continuePayment: 'Fortsätt betalning',
      drafts: 'sparade utkast',
      draftsText: 'Du kan fortsätta från den senast sparade versionen.',
      continueDraft: 'Fortsätt utkast',
      expiringSoon: 'annonser går snart ut',
      expiringSoonText: 'Se över dem innan annonsperioden tar slut.',
      reviewListings: 'Se annonser',
      noUrgentActions: 'Allt ser lugnt ut',
      noUrgentActionsText: 'Inga utkast, betalningar eller profilåtgärder kräver direkt uppmärksamhet.',
      buying: 'Köpa',
      buyingText: 'Sparade fordon, sökningar och konversationer följer ditt konto.',
      selling: 'Sälja',
      sellingText: 'Följ dina annonser från utkast till betalning, granskning, aktiv och såld.',
      safety: 'Konto',
      safetyText: 'Ditt privatkonto hålls separerat från företag och adminflöden.',
      soldListings: 'Sålda',
      expiredListings: 'Utgångna',
      profileStatus: 'Profilstatus',
      complete: 'Komplett',
      needsUpdate: 'Behöver uppdateras',
      accountType: 'Kontotyp',
      country: 'Land',
      notSet: 'Ej valt',
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
      eyebrow: 'Mein Autorell',
      welcome: 'Willkommen',
      intro:
        'Eine einfache Übersicht für Kauf, Verkauf, gespeicherte Fahrzeuge, Nachrichten und Zahlungen auf Autorell.',
      home: 'Startseite',
      signOut: 'Abmelden',
      user: 'Autorell-Nutzer',
      privateAccount: 'Privatkonto',
      verified: 'Verifiziert',
      reviewPending: 'Prüfung läuft',
      editProfile: 'Profil bearbeiten',
      overview: 'Übersicht',
      listings: 'Anzeigen',
      createListing: 'Anzeige erstellen',
      manageListings: 'Meine Anzeigen',
      savedListings: 'Gespeicherte Anzeigen',
      savedSearches: 'Gespeicherte Suchen',
      messages: 'Nachrichten',
      payments: 'Zahlungen',
      settings: 'Einstellungen',
      support: 'Hilfe',
      activeListings: 'Aktiv',
      awaitingPaymentShort: 'Zahlung',
      inReview: 'Prüfung',
      draftsShort: 'Entwürfe',
      nextSteps: 'Nächste Schritte',
      completeProfile: 'Profil vervollständigen',
      continuePayment: 'Zahlung fortsetzen',
      continueDraft: 'Entwurf fortsetzen',
      reviewListings: 'Anzeigen prüfen',
      buying: 'Kaufen',
      selling: 'Verkaufen',
      safety: 'Konto',
      soldListings: 'Verkauft',
      expiredListings: 'Abgelaufen',
      profileStatus: 'Profilstatus',
      complete: 'Vollständig',
      needsUpdate: 'Aktualisieren',
      accountType: 'Kontotyp',
      country: 'Land',
      notSet: 'Nicht gesetzt',
      profileEyebrow: 'Profil und Sicherheit',
      profileTitle: 'Kontodaten',
      secureAccount: 'Sicheres Konto',
    }
  }

  return translatePublicObject(locale, en)
}
