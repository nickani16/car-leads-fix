import Link from 'next/link'
import { Bell, Building2, Globe2, MapPin, MessageSquare, type LucideIcon } from 'lucide-react'
import { CompanyPortalShell, getCompanyPortalContext } from '@/lib/company-portal'
import { localizePublicHref, translatePublicObject, type PublicLocale } from '@/lib/public-i18n'
import { generateAccountMetadata } from '@/lib/account-seo'

export const generateMetadata = generateAccountMetadata('company-settings')

const baseCopy = {
  title: 'Company settings',
  description: 'Company-specific settings for notifications, leads, defaults, markets, data protection and account closure.',
  branchTitle: 'Locations and branches',
  branchText: 'Prepare separate inventory locations such as Riddermark Nacka, Riddermark Järfälla or a central storage location instead of mixing everything into one company profile.',
  leadTitle: 'Lead routing',
  leadText: 'Choose how enquiries, phone reveals and contact forms should be routed when several people or branches work in the same account.',
  marketTitle: 'Default market and currency',
  marketText: 'Keep the company default market, currency and listing country consistent when new inventory is created or imported.',
  notificationTitle: 'Notifications',
  notificationText: 'Control email notifications for verification, new leads, payment warnings, imports and account changes.',
  verificationTitle: 'Autorell verification',
  verificationText: 'Company verification remains handled by Autorell. New applications generate an admin notification so they can be reviewed before larger listing access is granted.',
  active: 'Active',
  managed: 'Managed',
  openLocations: 'Open locations',
  editProfile: 'Edit profile',
  manageTeam: 'Manage team',
  contactSupport: 'Contact support',
}

export default async function CompanySettingsPage({ localeOverride }: { localeOverride?: PublicLocale } = {}) {
  const context = await getCompanyPortalContext(localeOverride)
  const copy = translatePublicObject(context.locale, baseCopy)
  return (
    <CompanyPortalShell context={context} active="settings" title={copy.title} description={copy.description}>
      <div className="grid gap-4 lg:grid-cols-2">
        <SettingsCard icon={MapPin} title={copy.branchTitle} text={copy.branchText} badge={copy.active} action={copy.openLocations} href="/account/company/locations" locale={context.locale} />
        <SettingsCard icon={MessageSquare} title={copy.leadTitle} text={copy.leadText} badge={copy.managed} action={copy.manageTeam} href="/account/company/team" locale={context.locale} />
        <SettingsCard icon={Globe2} title={copy.marketTitle} text={copy.marketText} badge={copy.managed} action={copy.editProfile} href="/account/company/profile" locale={context.locale} />
        <SettingsCard icon={Bell} title={copy.notificationTitle} text={copy.notificationText} badge={copy.active} action={copy.contactSupport} href="/account/company/support" locale={context.locale} />
        <SettingsCard icon={Building2} title={copy.verificationTitle} text={copy.verificationText} badge={copy.active} action={copy.editProfile} href="/account/company/profile" locale={context.locale} wide />
      </div>
    </CompanyPortalShell>
  )
}

function SettingsCard({
  icon: Icon,
  title,
  text,
  badge,
  action,
  href,
  locale,
  wide = false,
}: {
  icon: LucideIcon
  title: string
  text: string
  badge: string
  action: string
  href: string
  locale: PublicLocale
  wide?: boolean
}) {
  return (
    <section className={`rounded-[16px] border border-[#d9e2ef] bg-white p-6 shadow-[0_18px_50px_rgba(16,24,40,.045)] ${wide ? 'lg:col-span-2' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        <span className="grid h-11 w-11 place-items-center rounded-[13px] bg-[#eef5ff] text-[#0866ff]">
          <Icon className="h-5 w-5" />
        </span>
        <span className="rounded-full bg-[#ecfdf3] px-3 py-1 text-xs font-bold text-[#067647]">{badge}</span>
      </div>
      <h2 className="mt-4 text-xl font-semibold tracking-[-.025em] text-[#101828]">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-[#667085]">{text}</p>
      <Link href={localizePublicHref(locale, href)} className="mt-5 inline-flex min-h-10 items-center justify-center rounded-[10px] border border-[#c7d7eb] px-4 text-sm font-bold text-[#0866ff] transition hover:border-[#0866ff] hover:bg-[#eef5ff]">
        {action}
      </Link>
    </section>
  )
}
