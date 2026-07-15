import { Settings } from 'lucide-react'
import { CompanyPortalShell, EmptyPanel, getCompanyPortalContext } from '@/lib/company-portal'
import { translatePublicObject, type PublicLocale } from '@/lib/public-i18n'

const baseCopy = {
  title: 'Company settings',
  description: 'Company-specific settings for notifications, leads, defaults, markets, data protection and account closure.',
  panelTitle: 'Settings structure prepared',
  panelText: 'This area separates company settings from private account settings. Next steps are default currency, default market, contact defaults, notifications and data export.',
}

export default async function CompanySettingsPage({ localeOverride }: { localeOverride?: PublicLocale } = {}) {
  const context = await getCompanyPortalContext(localeOverride)
  const copy = translatePublicObject(context.locale, baseCopy)
  return (
    <CompanyPortalShell context={context} active="settings" title={copy.title} description={copy.description}>
      <EmptyPanel icon={Settings} title={copy.panelTitle} text={copy.panelText} />
    </CompanyPortalShell>
  )
}
