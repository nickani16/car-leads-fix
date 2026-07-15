import Link from 'next/link'
import { Building2 } from 'lucide-react'
import { CompanyPortalShell, EmptyPanel, getCompanyPortalContext } from '@/lib/company-portal'
import { localizePublicHref, translatePublicObject, type PublicLocale } from '@/lib/public-i18n'

const baseCopy = {
  title: 'Company profile',
  description: 'Manage company presentation, contact details and verified legal information.',
  panelTitle: 'Company details',
  panelText: 'Company profile fields are currently managed through the account profile form. Sensitive legal fields should remain audit-controlled and may require admin review.',
  editProfile: 'Open account profile',
}

export default async function CompanyProfilePage({ localeOverride }: { localeOverride?: PublicLocale } = {}) {
  const context = await getCompanyPortalContext(localeOverride)
  const copy = translatePublicObject(context.locale, baseCopy)
  return (
    <CompanyPortalShell context={context} active="profile" title={copy.title} description={copy.description}>
      <EmptyPanel
        icon={Building2}
        title={copy.panelTitle}
        text={`${copy.panelText} ${context.profile.company_name || ''}`.trim()}
        action={<Link href={localizePublicHref(context.locale, '/account#profile-details')} className="inline-flex min-h-11 items-center rounded-[10px] bg-[#0866ff] px-4 text-sm font-bold text-white">{copy.editProfile}</Link>}
      />
    </CompanyPortalShell>
  )
}
