import { Mail, Users } from 'lucide-react'
import { CompanyPortalShell, EmptyPanel, LockedFeature, getCompanyPortalContext, planAllows } from '@/lib/company-portal'
import { translatePublicObject, type PublicLocale } from '@/lib/public-i18n'

const baseCopy = {
  title: 'Team',
  description: 'Invite people to the company account and prepare role-based access for listing work, analytics and billing.',
  lockedText: 'Team accounts are available from Growth. Free and Starter remain limited to the account owner.',
  inviteTitle: 'Invite a team member',
  inviteText: 'Team invitations will be connected to the company account, email address and role. The backend must enforce role and plan limits before access is granted.',
  membersTitle: 'Team members',
  membersText: 'No additional team members are connected yet. Owner access remains active for the current account.',
  emailPlaceholder: 'name@company.com',
  role: 'Role',
  sendInvite: 'Send invitation',
}

export default async function CompanyTeamPage({ localeOverride }: { localeOverride?: PublicLocale } = {}) {
  const context = await getCompanyPortalContext(localeOverride)
  const copy = translatePublicObject(context.locale, baseCopy)
  const plan = String(context.subscription?.plan_key || 'free')
  if (!planAllows(plan, 'growth')) {
    return (
      <CompanyPortalShell context={context} active="team" title={copy.title} description={copy.description}>
        <LockedFeature locale={context.locale} requiredPlan="Growth" text={copy.lockedText} />
      </CompanyPortalShell>
    )
  }

  return (
    <CompanyPortalShell context={context} active="team" title={copy.title} description={copy.description}>
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <section className="rounded-[16px] border border-[#d9e2ef] bg-white p-6 shadow-[0_18px_50px_rgba(16,24,40,.045)]">
          <div className="grid h-11 w-11 place-items-center rounded-[13px] bg-[#eef5ff] text-[#0866ff]"><Mail className="h-5 w-5" /></div>
          <h2 className="mt-4 text-xl font-semibold tracking-[-.025em] text-[#101828]">{copy.inviteTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-[#667085]">{copy.inviteText}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_180px_auto]">
            <input disabled placeholder={copy.emailPlaceholder} className="min-h-11 rounded-[10px] border border-[#d7e1ee] bg-[#f8fafc] px-3 text-sm text-[#667085]" />
            <select disabled className="min-h-11 rounded-[10px] border border-[#d7e1ee] bg-[#f8fafc] px-3 text-sm text-[#667085]"><option>{copy.role}</option></select>
            <button disabled className="min-h-11 rounded-[10px] bg-[#d0d8e6] px-4 text-sm font-bold text-white">{copy.sendInvite}</button>
          </div>
        </section>
        <EmptyPanel icon={Users} title={copy.membersTitle} text={copy.membersText} />
      </div>
    </CompanyPortalShell>
  )
}
