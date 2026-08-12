import { CompanyPortalShell, getCompanyPortalContext } from '@/lib/company-portal'
import { translatePublicObject } from '@/lib/public-i18n'
import { generateAccountMetadata } from '@/lib/account-seo'
import { createAdminClient } from '@/lib/supabase/admin'
import { companyImportLimitsForPlan } from '@/lib/company-import-limits'
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
  planLimitsTitle: 'Included in your plan',
  rowsPerImport: 'rows per import',
  imagesPerListing: 'images per listing',
  recurringFeedTitle: 'Recurring feed and API import',
  recurringFeedText: 'Automatic feed/API imports are available on Professional and Enterprise. CSV import stays available here with the limits shown for your current plan.',
  importHistory: 'Recent imports',
  importHistoryEmpty: 'No imports have been run yet.',
  completed: 'Completed',
  completedWithWarnings: 'Completed with warnings',
  failed: 'Failed',
  running: 'Running',
  importedImages: 'images',
  skippedImages: 'skipped',
}

type ImportJobRow = {
  id: string
  status: string | null
  file_name: string | null
  requested_rows: number | null
  valid_rows: number | null
  invalid_rows: number | null
  created_count: number | null
  image_imported_count: number | null
  image_skipped_count: number | null
  created_at: string | null
  finished_at: string | null
}

export default async function CompanyImportPage() {
  const context = await getCompanyPortalContext()
  const copy = translatePublicObject(context.locale, baseCopy)
  const importLimits = companyImportLimitsForPlan(context.subscription?.plan_key || 'free')
  const importJobs = await loadImportJobs(context.profile.company_id)

  return (
    <CompanyPortalShell context={context} active="import" title={copy.title} description={copy.description}>
      <CompanyImportClient locale={context.locale} copy={copy} importLimits={importLimits} importJobs={importJobs} />
    </CompanyPortalShell>
  )
}

async function loadImportJobs(companyId: string | null): Promise<ImportJobRow[]> {
  if (!companyId) return []
  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('marketplace_company_import_jobs')
      .select('id,status,file_name,requested_rows,valid_rows,invalid_rows,created_count,image_imported_count,image_skipped_count,created_at,finished_at')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(6)
    if (error || !data) return []
    return data as ImportJobRow[]
  } catch {
    return []
  }
}
