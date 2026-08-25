import Link from 'next/link'
import { HelpCircle } from 'lucide-react'
import { CompanyPortalShell, EmptyPanel, getCompanyPortalContext } from '@/lib/company-portal'
import { localizePublicHref, translatePublicObject } from '@/lib/public-i18n'
import { generateAccountMetadata } from '@/lib/account-seo'

export const generateMetadata = generateAccountMetadata('company-support')

const baseCopy = {
  title: 'Company support',
  description: 'Help for verification, subscriptions, invoices, listings, import, team access and security.',
  faqTitle: 'Company FAQ and support',
  faqText: 'The support area is prepared for company-specific FAQ groups and a direct route to Autorell support.',
  contactSupport: 'Contact support',
}

export default async function CompanySupportPage() {
  const context = await getCompanyPortalContext()
  const copy = translatePublicObject(context.locale, baseCopy)
  return (
    <CompanyPortalShell context={context} active="support" title={copy.title} description={copy.description}>
      <EmptyPanel
        icon={HelpCircle}
        title={copy.faqTitle}
        text={copy.faqText}
        action={<Link href={localizePublicHref(context.locale, '/contact')} className="inline-flex min-h-11 items-center rounded-[10px] bg-[#0866ff] px-4 text-sm font-bold text-white">{copy.contactSupport}</Link>}
      />
    </CompanyPortalShell>
  )
}
