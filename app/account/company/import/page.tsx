import Link from 'next/link'
import { Download, Upload } from 'lucide-react'
import { CompanyPortalShell, EmptyPanel, LockedFeature, getCompanyPortalContext, planAllows } from '@/lib/company-portal'
import { localizePublicHref, translatePublicObject, type PublicLocale } from '@/lib/public-i18n'

const baseCopy = {
  title: 'Import listings',
  description: 'Prepare many listings at once with a structured template, validation and preview before publishing.',
  lockedText: 'Bulk import is available from Growth because it can create many listings and must respect quota, moderation and image requirements.',
  templateTitle: 'Structured import template',
  templateText: 'Download the CSV template, fill in the listing data and keep one row per vehicle. Image upload and row-level validation will be handled in the next import step.',
  downloadTemplate: 'Download CSV template',
  uploadTitle: 'Upload and validate',
  uploadText: 'The importer is prepared as a separate company flow. The upload endpoint will validate each row, show field errors and allow valid rows to continue as drafts or publishing candidates.',
  goToListings: 'Go to listings',
}

export default async function CompanyImportPage({ localeOverride }: { localeOverride?: PublicLocale } = {}) {
  const context = await getCompanyPortalContext(localeOverride)
  const copy = translatePublicObject(context.locale, baseCopy)
  const plan = String(context.subscription?.plan_key || 'free')
  if (!planAllows(plan, 'growth')) {
    return (
      <CompanyPortalShell context={context} active="import" title={copy.title} description={copy.description}>
        <LockedFeature locale={context.locale} requiredPlan="Growth" text={copy.lockedText} />
      </CompanyPortalShell>
    )
  }

  return (
    <CompanyPortalShell context={context} active="import" title={copy.title} description={copy.description}>
      <div className="grid gap-4 lg:grid-cols-2">
        <EmptyPanel
          icon={Download}
          title={copy.templateTitle}
          text={copy.templateText}
          action={<a href="/templates/autorell-business-import.csv" className="inline-flex min-h-11 items-center gap-2 rounded-[10px] bg-[#0866ff] px-4 text-sm font-bold text-white"><Download className="h-4 w-4" />{copy.downloadTemplate}</a>}
        />
        <EmptyPanel
          icon={Upload}
          title={copy.uploadTitle}
          text={copy.uploadText}
          action={<Link href={localizePublicHref(context.locale, '/account/company/listings')} className="inline-flex min-h-11 items-center rounded-[10px] border border-[#d0d8e6] bg-white px-4 text-sm font-bold text-[#344054]">{copy.goToListings}</Link>}
        />
      </div>
    </CompanyPortalShell>
  )
}
