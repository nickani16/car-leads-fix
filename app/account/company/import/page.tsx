import { CompanyPortalShell, getCompanyPortalContext } from '@/lib/company-portal'
import { translatePublicObject, type PublicLocale } from '@/lib/public-i18n'
import { generateAccountMetadata } from '@/lib/account-seo'
import { CompanyImportClient } from './CompanyImportClient'

export const generateMetadata = generateAccountMetadata('company-import')

const baseCopy = {
  title: 'Import listings',
  description: 'Prepare many listings at once with a structured template. Valid rows become drafts and reserve the company quota for the current billing period.',
  templateTitle: 'Structured import template',
  templateText: 'Download the CSV template, fill in one row per vehicle and keep the original reference number so your team can track the draft later.',
  downloadTemplate: 'Download CSV template',
  uploadTitle: 'Upload and validate',
  uploadText: 'Upload the file to preview every row before import. Drafts are created only when the full file passes validation.',
  chooseFile: 'Choose CSV file',
  validate: 'Validate file',
  importDrafts: 'Import as drafts',
  validating: 'Validating',
  importing: 'Importing',
  ready: 'Import preview',
  fileErrors: 'File errors',
  row: 'Row',
  titleColumn: 'Listing',
  category: 'Category',
  price: 'Price',
  location: 'Location',
  status: 'Status',
  valid: 'Valid',
  invalid: 'Invalid',
  quota: 'Period quota',
  created: 'Drafts created',
  openListings: 'Open listings',
  quotaNote: 'Imports follow the company listing quota. Free company accounts can import drafts within the included active listing limit.',
}

export default async function CompanyImportPage({ localeOverride }: { localeOverride?: PublicLocale } = {}) {
  const context = await getCompanyPortalContext(localeOverride)
  const copy = translatePublicObject(context.locale, baseCopy)

  return (
    <CompanyPortalShell context={context} active="import" title={copy.title} description={copy.description}>
      <CompanyImportClient locale={context.locale} copy={copy} />
    </CompanyPortalShell>
  )
}
