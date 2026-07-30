import {
  AdminEmpty,
  AdminFilters,
  AdminPageHeader,
  AdminPagination,
  AdminTable,
  Badge,
  FilterSelect,
} from '../AdminUI'
import {
  type AdminSearchParams,
  formatDate,
  getPage,
  getParam,
  pageRange,
  queryToUrlSearchParams,
  statusTone,
} from '../admin-helpers'
import { requireAdminPermission } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

type InvoiceRow = {
  id: string
  user_id: string
  subscription_id: string | null
  stripe_invoice_id: string | null
  invoice_number: string | null
  hosted_invoice_url: string | null
  pdf_url: string | null
  amount_minor: number | null
  currency: string | null
  status: string | null
  issued_at: string | null
  paid_at: string | null
  due_at: string | null
  created_at: string | null
}

export default async function AdminBusinessInvoicesPage({ searchParams }: { searchParams: AdminSearchParams }) {
  const params = await searchParams
  const q = getParam(params, 'q')
  const status = getParam(params, 'status')
  const page = getPage(params)
  const { from, to } = pageRange(page)
  const { adminClient } = await requireAdminPermission('payments.read')

  let query = adminClient
    .from('business_invoices')
    .select('id,user_id,subscription_id,stripe_invoice_id,invoice_number,hosted_invoice_url,pdf_url,amount_minor,currency,status,issued_at,paid_at,due_at,created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (status) query = query.eq('status', status)
  if (q) {
    const escaped = q.replace(/[%_,]/g, '')
    query = query.or(`invoice_number.ilike.%${escaped}%,stripe_invoice_id.ilike.%${escaped}%,currency.ilike.%${escaped}%`)
  }

  const { data, count, error } = await query
  const rows = (data || []) as InvoiceRow[]

  return (
    <main className="px-4 py-7 sm:px-6 lg:px-8">
      <AdminPageHeader
        eyebrow="Ekonomi"
        title="Företagsfakturor"
        description="Stripe-fakturor för företagskonton med status, förfallodatum och direktlänkar. Använd den här vyn när ett företag ska spärras, följas upp eller öppnas igen."
      />
      <AdminFilters search={q} searchPlaceholder="Sök fakturanummer, Stripe-ID eller valuta">
        <FilterSelect
          name="status"
          value={status}
          label="Status"
          options={[
            { value: 'draft', label: 'Utkast' },
            { value: 'open', label: 'Öppen' },
            { value: 'paid', label: 'Betald' },
            { value: 'void', label: 'Makulerad' },
            { value: 'uncollectible', label: 'Ej indrivningsbar' },
          ]}
        />
      </AdminFilters>

      {error ? (
        <AdminEmpty text={`Fakturorna kunde inte läsas: ${error.message}`} />
      ) : !rows.length ? (
        <AdminEmpty text="Inga företagsfakturor matchar filtret." />
      ) : (
        <>
          <AdminTable columns={['Faktura', 'Kund', 'Belopp', 'Status', 'Förfallodatum', 'Betald', 'Skapad', 'Länkar']}>
            {rows.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-[#f8fafc]">
                <td className="px-4 py-4 align-top">
                  <span className="block font-semibold text-[#101828]">{invoice.invoice_number || invoice.id.slice(0, 8)}</span>
                  <span className="mt-1 block max-w-[220px] truncate text-xs text-[#667085]">{invoice.stripe_invoice_id || 'Stripe-ID saknas'}</span>
                </td>
                <td className="px-4 py-4 align-top">
                  <span className="block max-w-[220px] truncate text-[#344054]">{invoice.user_id}</span>
                  {invoice.subscription_id ? <span className="mt-1 block max-w-[220px] truncate text-xs text-[#667085]">{invoice.subscription_id}</span> : null}
                </td>
                <td className="px-4 py-4 align-top font-semibold text-[#101828]">
                  {formatMoney(invoice.amount_minor, invoice.currency)}
                </td>
                <td className="px-4 py-4 align-top">
                  <Badge label={invoice.status || 'unknown'} tone={statusTone(invoice.status)} />
                </td>
                <td className="px-4 py-4 align-top text-[#344054]">{formatDate(invoice.due_at)}</td>
                <td className="px-4 py-4 align-top text-[#344054]">{formatDate(invoice.paid_at)}</td>
                <td className="px-4 py-4 align-top text-[#344054]">{formatDate(invoice.created_at)}</td>
                <td className="px-4 py-4 align-top">
                  <div className="flex min-w-[140px] flex-col gap-2">
                    {invoice.hosted_invoice_url ? (
                      <a className="text-xs font-bold text-[#0866ff] hover:underline" href={invoice.hosted_invoice_url} target="_blank" rel="noreferrer">
                        Öppna faktura
                      </a>
                    ) : null}
                    {invoice.pdf_url ? (
                      <a className="text-xs font-bold text-[#0866ff] hover:underline" href={invoice.pdf_url} target="_blank" rel="noreferrer">
                        Ladda PDF
                      </a>
                    ) : null}
                    {!invoice.hosted_invoice_url && !invoice.pdf_url ? <span className="text-xs text-[#667085]">Länk saknas</span> : null}
                  </div>
                </td>
              </tr>
            ))}
          </AdminTable>
          <AdminPagination page={page} hasNext={page * 20 < (count || 0)} basePath="/admin/invoices" query={queryToUrlSearchParams(params)} />
        </>
      )}
    </main>
  )
}

function formatMoney(amountMinor?: number | null, currency?: string | null) {
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: String(currency || 'sek').toUpperCase(),
  }).format((amountMinor || 0) / 100)
}
