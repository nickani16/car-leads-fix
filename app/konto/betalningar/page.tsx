import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, ExternalLink, FileText } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { getRequestLocale } from '@/lib/request-locale'
import { localizePublicHref } from '@/lib/public-i18n'
import BillingPortalButton from './BillingPortalButton'

type InvoiceRow = {
  id: string
  invoice_number: string | null
  hosted_invoice_url: string | null
  pdf_url: string | null
  amount_minor: number
  currency: string
  status: string
  issued_at: string | null
  paid_at: string | null
  created_at: string
}

export default async function PaymentsPage() {
  const locale = await getRequestLocale()
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(localizePublicHref(locale, '/login'))

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('marketplace_profiles')
    .select('account_type')
    .eq('user_id', user.id)
    .maybeSingle()
  if (profile?.account_type !== 'business') redirect(localizePublicHref(locale, '/account'))

  const [{ data: subscription }, { data: invoices }] = await Promise.all([
    admin
      .from('business_subscriptions')
      .select('plan_key,product_key,status,payment_status,active_listing_limit,next_billing_at,current_period_end,stripe_customer_id')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    admin
      .from('business_invoices')
      .select('id,invoice_number,hosted_invoice_url,pdf_url,amount_minor,currency,status,issued_at,paid_at,created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(24),
  ])

  const rows = (invoices || []) as InvoiceRow[]
  const currentPlan = subscription?.plan_key ? capitalize(subscription.plan_key) : 'Ingen aktiv plan'
  const nextBilling = subscription?.next_billing_at || subscription?.current_period_end || null

  return (
    <main className="min-h-screen bg-[#f6f8fb] px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-[1180px]">
        <Link
          href={localizePublicHref(locale, '/account')}
          className="inline-flex items-center gap-2 text-sm font-bold text-[#475467] transition hover:text-[#0866ff]"
        >
          <ArrowLeft className="h-4 w-4" />
          Mina sidor
        </Link>

        <section className="mt-6 rounded-[16px] border border-[#d9e2ef] bg-white p-6 shadow-[0_18px_50px_rgba(16,24,40,.055)] sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-[#0866ff]">Betalningar</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-[-.045em] text-[#101828]">Fakturor och abonnemang</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#667085]">
                Här ser företaget fakturor, betalningsstatus och nästa debitering. Kort och abonnemangsbetalningar hanteras säkert via Stripe.
              </p>
            </div>
            {subscription?.stripe_customer_id ? <BillingPortalButton label="Öppna Stripe portal" /> : null}
          </div>

          <div className="mt-7 grid gap-3 md:grid-cols-3">
            <SummaryItem label="Nuvarande plan" value={currentPlan} />
            <SummaryItem label="Betalningsstatus" value={paymentText(subscription?.payment_status || subscription?.status || null)} />
            <SummaryItem label="Nästa debitering" value={nextBilling ? formatDate(nextBilling) : 'Inte schemalagd'} />
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-[16px] border border-[#d9e2ef] bg-white shadow-[0_18px_50px_rgba(16,24,40,.045)]">
          <div className="border-b border-[#edf1f7] px-5 py-4 sm:px-6">
            <h2 className="text-lg font-semibold tracking-[-.025em] text-[#101828]">Senaste fakturor</h2>
          </div>
          {rows.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead className="bg-[#f8fafc] text-xs uppercase tracking-[.12em] text-[#667085]">
                  <tr>
                    <th className="px-5 py-3 font-bold">Faktura</th>
                    <th className="px-5 py-3 font-bold">Datum</th>
                    <th className="px-5 py-3 font-bold">Belopp</th>
                    <th className="px-5 py-3 font-bold">Status</th>
                    <th className="px-5 py-3 font-bold">Dokument</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf1f7]">
                  {rows.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="px-5 py-4 font-semibold text-[#101828]">{invoice.invoice_number || invoice.id.slice(0, 8)}</td>
                      <td className="px-5 py-4 text-[#475467]">{formatDate(invoice.issued_at || invoice.created_at)}</td>
                      <td className="px-5 py-4 text-[#475467]">{formatMoney(invoice.amount_minor, invoice.currency)}</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${invoiceStatusClass(invoice.status)}`}>
                          {invoiceStatusText(invoice.status)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          {invoice.hosted_invoice_url ? (
                            <a href={invoice.hosted_invoice_url} className="inline-flex items-center gap-1 font-bold text-[#0866ff]">
                              Öppna <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          ) : null}
                          {invoice.pdf_url ? (
                            <a href={invoice.pdf_url} className="inline-flex items-center gap-1 font-bold text-[#0866ff]">
                              PDF <FileText className="h-3.5 w-3.5" />
                            </a>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-[14px] bg-[#eef5ff] text-[#0866ff]">
                <FileText className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-[#101828]">Inga fakturor ännu</h2>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#667085]">
                När en faktura skapas via Stripe visas den här automatiskt efter att webhooken har behandlats.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] border border-[#dfe6f1] bg-[#f8fafc] px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-[.12em] text-[#667085]">{label}</p>
      <p className="mt-1 text-base font-semibold text-[#101828]">{value}</p>
    </div>
  )
}

function invoiceStatusText(status: string) {
  if (status === 'paid') return 'Betald'
  if (status === 'open') return 'Skickad'
  if (status === 'draft') return 'Utkast'
  if (status === 'void') return 'Makulerad'
  if (status === 'uncollectible') return 'Ej indrivbar'
  return capitalize(status)
}

function invoiceStatusClass(status: string) {
  if (status === 'paid') return 'bg-[#eef5ff] text-[#0866ff]'
  if (status === 'open') return 'bg-[#fff7ed] text-[#c2410c]'
  if (status === 'void' || status === 'uncollectible') return 'bg-red-50 text-red-700'
  return 'bg-[#f2f4f7] text-[#475467]'
}

function paymentText(status?: string | null) {
  if (status === 'paid') return 'Betald'
  if (status === 'pending') return 'Inväntar betalning'
  if (status === 'failed') return 'Misslyckad betalning'
  if (status === 'not_required') return 'Ingen betalning krävs'
  if (status === 'active') return 'Aktiv'
  if (status === 'past_due') return 'Förfallen'
  return 'Väntar'
}

function formatMoney(amountMinor: number, currency: string) {
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: currency.toUpperCase(),
    maximumFractionDigits: ['sek', 'dkk', 'pln'].includes(currency.toLowerCase()) ? 0 : 2,
  }).format(amountMinor / 100)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('sv-SE', { dateStyle: 'medium' }).format(new Date(value))
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
