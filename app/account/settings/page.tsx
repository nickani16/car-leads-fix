import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  ArrowLeft,
  Bell,
  Database,
  Globe2,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
import DeleteAccountPanel from '@/app/konto/DeleteAccountPanel'
import { createClient } from '@/lib/supabase/server'
import { getRequestLocale } from '@/lib/request-locale'
import { localizePublicHref, translatePublicObject, type PublicLocale } from '@/lib/public-i18n'
import { generateAccountMetadata } from '@/lib/account-seo'

export const generateMetadata = generateAccountMetadata('settings')

type ProfileRow = {
  account_type: 'private' | 'business'
  email: string | null
  phone: string | null
  phone_verified: boolean | null
  phone_verification_status: string | null
  country_code: string | null
  locale: string | null
  identity_status: string | null
  risk_status: string | null
}

type SettingsSection = {
  icon: LucideIcon
  title: string
  text: string
  rows: Array<[string, string]>
  href: string
  action: string
}

export default async function PrivateSettingsPage() {
  const locale = await getRequestLocale()
  const copy = settingsCopy(locale)
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(localizePublicHref(locale, '/login'))

  const { data: profile } = await supabase
    .from('marketplace_profiles')
    .select('account_type,email,phone,phone_verified,phone_verification_status,country_code,locale,identity_status,risk_status')
    .eq('user_id', user.id)
    .maybeSingle<ProfileRow>()

  if (!profile) redirect(localizePublicHref(locale, '/register'))
  if (profile.account_type === 'business') redirect(localizePublicHref(locale, '/account/company/settings'))

  const sections: SettingsSection[] = [
    {
      icon: UserRound,
      title: copy.account,
      text: copy.accountText,
      rows: [
        [copy.email, profile.email || user.email || copy.notSet],
        [copy.phone, profile.phone || copy.notSet],
        [copy.emailVerification, user.email_confirmed_at ? copy.verified : copy.notVerified],
        [copy.phoneCheck, phoneStatusLabel(profile.phone_verification_status, copy)],
        [copy.profileStatus, profile.identity_status || copy.notSet],
      ],
      href: localizePublicHref(locale, '/account/profile'),
      action: copy.editProfile,
    },
    {
      icon: Globe2,
      title: copy.languageMarket,
      text: copy.languageMarketText,
      rows: [
        [copy.language, profile.locale || locale],
        [copy.market, profile.country_code || copy.notSet],
      ],
      href: localizePublicHref(locale, '/'),
      action: copy.changeMarket,
    },
    {
      icon: Bell,
      title: copy.notifications,
      text: copy.notificationsText,
      rows: [
        [copy.savedSearches, copy.transactionalOn],
        [copy.messages, copy.transactionalOn],
        [copy.marketing, copy.marketingSeparate],
      ],
      href: localizePublicHref(locale, '/account/saved-searches'),
      action: copy.manageSavedSearches,
    },
    {
      icon: ShieldCheck,
      title: copy.safety,
      text: copy.safetyText,
      rows: [
        [copy.session, copy.currentSession],
        [copy.riskStatus, profile.risk_status || copy.standard],
      ],
      href: localizePublicHref(locale, '/account/support'),
      action: copy.getHelp,
    },
    {
      icon: Database,
      title: copy.dataProtection,
      text: copy.dataProtectionText,
      rows: [
        [copy.dataExport, copy.contactSupport],
        [copy.deleteAccount, copy.requiresConfirmation],
      ],
      href: '#delete-account',
      action: copy.deleteAccount,
    },
  ]

  return (
    <main className="min-h-screen bg-[#f7f9fc] px-5 py-8 sm:px-8 lg:py-12">
      <div className="mx-auto max-w-[1180px]">
        <Link
          href={localizePublicHref(locale, '/account')}
          className="inline-flex items-center gap-2 text-sm font-bold text-[#475467] transition hover:text-[#0866ff]"
        >
          <ArrowLeft className="h-4 w-4" />
          {copy.back}
        </Link>

        <section className="mt-6 rounded-[24px] border border-[#dfe7f2] bg-white p-6 shadow-[0_18px_50px_rgba(16,24,40,.05)] sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0866ff]">
            {copy.eyebrow}
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.045em] text-[#101828]">
            {copy.title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#667085]">
            {copy.intro}
          </p>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          {sections.map((section) => (
            <SettingsCard key={section.title} {...section} />
          ))}
        </section>

        <section id="delete-account" className="scroll-mt-24">
          <DeleteAccountPanel locale={locale} homeHref={localizePublicHref(locale, '/')} />
        </section>
      </div>
    </main>
  )
}

function SettingsCard({
  icon: Icon,
  title,
  text,
  rows,
  href,
  action,
}: {
  icon: LucideIcon
  title: string
  text: string
  rows: Array<[string, string]>
  href: string
  action: string
}) {
  return (
    <article className="rounded-[22px] border border-[#dfe7f2] bg-white p-5 shadow-[0_16px_46px_rgba(16,24,40,.045)]">
      <div className="flex items-start gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-[#eef5ff] text-[#0866ff]">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-[-0.025em] text-[#101828]">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-[#667085]">{text}</p>
        </div>
      </div>
      <div className="mt-5 grid gap-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 rounded-[14px] border border-[#edf1f7] bg-[#fbfcff] px-4 py-3 text-sm">
            <span className="font-semibold text-[#475467]">{label}</span>
            <strong className="text-right text-[#101828]">{value}</strong>
          </div>
        ))}
      </div>
      <Link
        href={href}
        className="mt-5 inline-flex min-h-10 items-center justify-center rounded-[12px] border border-[#cbd7e8] px-4 text-sm font-bold text-[#0866ff] transition hover:bg-[#eef5ff]"
      >
        {action}
      </Link>
    </article>
  )
}

function settingsCopy(locale: PublicLocale) {
  const en = {
    back: 'My pages',
    eyebrow: 'Settings',
    title: 'Private account settings',
    intro: 'Manage the simple settings that matter for a private Autorell account.',
    account: 'Account',
    accountText: 'Profile, email and phone safety status.',
    email: 'Email',
    phone: 'Phone',
    profileStatus: 'Profile status',
    emailVerification: 'Email verification',
    phoneCheck: 'Phone check',
    verified: 'Verified',
    notVerified: 'Not verified',
    phoneFormatValid: 'Format approved',
    phoneNeedsReview: 'Needs review',
    phoneNotChecked: 'Checked when saved',
    editProfile: 'Edit profile',
    languageMarket: 'Language and market',
    languageMarketText: 'Autorell uses your selected market for language, currency and local content.',
    language: 'Language',
    market: 'Market',
    changeMarket: 'Change market',
    notifications: 'Notifications',
    notificationsText: 'Transactional messages stay active; marketing must always be separate and voluntary.',
    savedSearches: 'Saved searches',
    messages: 'Messages',
    marketing: 'Marketing',
    transactionalOn: 'Active',
    marketingSeparate: 'Separate consent',
    manageSavedSearches: 'Manage searches',
    safety: 'Safety',
    safetyText: 'Security status and account help for private users.',
    session: 'Session',
    currentSession: 'Current device',
    riskStatus: 'Risk status',
    standard: 'standard',
    getHelp: 'Get help',
    dataProtection: 'Data protection',
    dataProtectionText: 'Account deletion and data requests are handled with confirmation.',
    dataExport: 'Data export',
    contactSupport: 'Contact support',
    deleteAccount: 'Delete account',
    requiresConfirmation: 'Requires confirmation',
    notSet: 'Not set',
  }
  if (locale === 'sv') {
    return {
      ...en,
      back: 'Mina sidor',
      eyebrow: 'Inställningar',
      title: 'Inställningar för privatkonto',
      intro: 'Hantera de enkla inställningar som spelar roll för ett privat Autorell-konto.',
      account: 'Konto',
      accountText: 'Profil, e-post och säkerhetsstatus för telefon.',
      email: 'E-post',
      phone: 'Telefon',
      profileStatus: 'Profilstatus',
      emailVerification: 'Mejlverifiering',
      phoneCheck: 'Telefonkontroll',
      verified: 'Verifierad',
      notVerified: 'Ej verifierad',
      phoneFormatValid: 'Format godkänt',
      phoneNeedsReview: 'Kontrollera numret',
      phoneNotChecked: 'Kontrolleras vid sparande',
      editProfile: 'Redigera profil',
      languageMarket: 'Språk och marknad',
      languageMarketText: 'Autorell använder vald marknad för språk, valuta och lokalt innehåll.',
      language: 'Språk',
      market: 'Marknad',
      changeMarket: 'Byt marknad',
      notifications: 'Notiser',
      notificationsText: 'Transaktionella mejl är aktiva; marknadsföring ska alltid vara separat och frivillig.',
      savedSearches: 'Sparade sökningar',
      messages: 'Meddelanden',
      marketing: 'Marknadsföring',
      transactionalOn: 'Aktiv',
      marketingSeparate: 'Separat samtycke',
      manageSavedSearches: 'Hantera sökningar',
      safety: 'Säkerhet',
      safetyText: 'Säkerhetsstatus och kontohjälp för privatpersoner.',
      session: 'Session',
      currentSession: 'Nuvarande enhet',
      riskStatus: 'Riskstatus',
      standard: 'standard',
      getHelp: 'Få hjälp',
      dataProtection: 'Dataskydd',
      dataProtectionText: 'Kontoradering och dataförfrågningar hanteras med bekräftelse.',
      dataExport: 'Dataexport',
      contactSupport: 'Kontakta support',
      deleteAccount: 'Radera konto',
      requiresConfirmation: 'Kräver bekräftelse',
      notSet: 'Ej valt',
    }
  }
  if (locale === 'de') {
    return {
      ...en,
      back: 'Mein Konto',
      eyebrow: 'Einstellungen',
      title: 'Einstellungen für Privatkonto',
      intro: 'Verwalten Sie die wichtigsten Einstellungen für ein privates Autorell-Konto.',
      account: 'Konto',
      accountText: 'Profil, E-Mail, Telefon und Verifizierungsstatus.',
      email: 'E-Mail',
      phone: 'Telefon',
      profileStatus: 'Profilstatus',
      emailVerification: 'E-Mail-Verifizierung',
      phoneCheck: 'Telefonprüfung',
      verified: 'Verifiziert',
      notVerified: 'Nicht verifiziert',
      phoneFormatValid: 'Format bestätigt',
      phoneNeedsReview: 'Prüfung erforderlich',
      phoneNotChecked: 'Wird beim Speichern geprüft',
      editProfile: 'Profil bearbeiten',
      languageMarket: 'Sprache und Markt',
      languageMarketText: 'Autorell nutzt den gewählten Markt für Sprache, Währung und lokale Inhalte.',
      language: 'Sprache',
      market: 'Markt',
      changeMarket: 'Markt ändern',
      notifications: 'Benachrichtigungen',
      messages: 'Nachrichten',
      marketing: 'Marketing',
      transactionalOn: 'Aktiv',
      marketingSeparate: 'Separate Zustimmung',
      manageSavedSearches: 'Suchen verwalten',
      safety: 'Sicherheit',
      session: 'Sitzung',
      currentSession: 'Aktuelles Gerät',
      riskStatus: 'Risikostatus',
      getHelp: 'Hilfe erhalten',
      dataProtection: 'Datenschutz',
      dataExport: 'Datenexport',
      contactSupport: 'Support kontaktieren',
      deleteAccount: 'Konto löschen',
      requiresConfirmation: 'Bestätigung erforderlich',
      notSet: 'Nicht gesetzt',
    }
  }
  return translatePublicObject(locale, en)
}

function phoneStatusLabel(status: string | null, copy: ReturnType<typeof settingsCopy>) {
  if (status === 'format_valid') return copy.phoneFormatValid
  if (status === 'country_mismatch' || status === 'invalid_format') return copy.phoneNeedsReview
  return copy.phoneNotChecked
}
