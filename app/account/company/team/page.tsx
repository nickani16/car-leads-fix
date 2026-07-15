import { Mail, Users } from 'lucide-react'
import { CompanyPortalShell, LockedFeature, getCompanyPortalContext, planAllows } from '@/lib/company-portal'
import { translatePublicObject, type PublicLocale } from '@/lib/public-i18n'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCompanyTeamOverview } from '@/lib/business-team'
import TeamInviteForm from './TeamInviteForm'

const baseCopy = {
  title: 'Team',
  description: 'Invite people to the company account and prepare role-based access for listing work, analytics and billing.',
  lockedText: 'Team accounts are available from Growth. Free and Starter remain limited to the account owner.',
  inviteTitle: 'Invite a team member',
  inviteText: 'Team invitations will be connected to the company account, email address and role. The backend must enforce role and plan limits before access is granted.',
  membersTitle: 'Team members',
  membersText: 'No additional team members are connected yet. Owner access remains active for the current account.',
  pendingTitle: 'Pending invitations',
  seats: 'Seats',
  used: 'used',
  emailPlaceholder: 'name@company.com',
  role: 'Role',
  sendInvite: 'Send invitation',
  sending: 'Sending...',
  sent: 'Invitation sent.',
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
  const team = context.profile.company_id
    ? await getCompanyTeamOverview(createAdminClient(), context.profile.company_id, plan)
    : null

  return (
    <CompanyPortalShell context={context} active="team" title={copy.title} description={copy.description}>
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <section className="rounded-[16px] border border-[#d9e2ef] bg-white p-6 shadow-[0_18px_50px_rgba(16,24,40,.045)]">
          <div className="grid h-11 w-11 place-items-center rounded-[13px] bg-[#eef5ff] text-[#0866ff]"><Mail className="h-5 w-5" /></div>
          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-[-.025em] text-[#101828]">{copy.inviteTitle}</h2>
              <p className="mt-2 text-sm leading-6 text-[#667085]">{copy.inviteText}</p>
            </div>
            {team ? (
              <div className="rounded-[12px] border border-[#d9e2ef] bg-[#f8fbff] px-4 py-3 text-sm font-semibold text-[#344054]">
                {copy.seats}: {team.usedSeats}/{team.seatLimit} {copy.used}
              </div>
            ) : null}
          </div>
          <TeamInviteForm copy={copy} />
        </section>
        <section className="rounded-[16px] border border-[#d9e2ef] bg-white p-6 shadow-[0_18px_50px_rgba(16,24,40,.045)]">
          <div className="grid h-11 w-11 place-items-center rounded-[13px] bg-[#eef5ff] text-[#0866ff]"><Users className="h-5 w-5" /></div>
          <h2 className="mt-4 text-xl font-semibold tracking-[-.025em] text-[#101828]">{copy.membersTitle}</h2>
          {team?.members.length ? (
            <div className="mt-4 grid gap-3">
              {team.members.map((member) => (
                <div key={member.userId} className="rounded-[12px] border border-[#e5ebf3] px-4 py-3">
                  <p className="text-sm font-bold text-[#101828]">{member.name}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[.12em] text-[#667085]">{member.role}</p>
                  {member.email ? <p className="mt-1 truncate text-sm text-[#667085]">{member.email}</p> : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm leading-6 text-[#667085]">{copy.membersText}</p>
          )}
        </section>
      </div>
      {team?.invitations.length ? (
        <section className="mt-4 rounded-[16px] border border-[#d9e2ef] bg-white p-6 shadow-[0_18px_50px_rgba(16,24,40,.045)]">
          <h2 className="text-xl font-semibold tracking-[-.025em] text-[#101828]">{copy.pendingTitle}</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {team.invitations.map((invitation) => (
              <div key={invitation.id} className="rounded-[12px] border border-[#e5ebf3] px-4 py-3">
                <p className="truncate text-sm font-bold text-[#101828]">{invitation.email}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[.12em] text-[#667085]">{invitation.role} · {invitation.emailStatus}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </CompanyPortalShell>
  )
}
