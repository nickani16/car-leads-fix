import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, CreditCard, ExternalLink, FileText, ReceiptText } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { getRequestLocale } from '@/lib/request-locale'
import { localizePublicHref, translatePublicObject, type PublicLocale } from '@/lib/public-i18n'
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

type PaymentOrderRow = {
  id: string
  listing_id: string | null
  product_key: string
  market: string
  currency: string
  amount_minor: number
  status: string
  paid_at: string | null
  fulfilled_at: string | null
  refunded_at: string | null
  created_at: string
  updated_at: string
  marketplace_listings?: { title: string | null; reference_number: string | null } | Array<{ title: string | null; reference_number: string | null }> | null
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

  if (profile?.account_type === 'business') {
    return <BusinessPaymentsPage admin={admin} userId={user.id} locale={locale} />
  }

  return <PrivatePaymentsPage admin={admin} userId={user.id} locale={locale} />
}

async function PrivatePaymentsPage({
  admin,
  userId,
  locale,
}: {
  admin: ReturnType<typeof createAdminClient>
  userId: string
  locale: PublicLocale
}) {
  const copy = privatePaymentsCopy(locale)
  const { data } = await admin
    .from('payment_orders')
    .select('id,listing_id,product_key,market,currency,amount_minor,status,paid_at,fulfilled_at,refunded_at,created_at,updated_at,marketplace_listings(title,reference_number)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  const rows = (data || []) as unknown as PaymentOrderRow[]
  const pending = rows.filter((row) => ['created', 'checkout_created', 'pending'].includes(row.status)).length
  const paid = rows.filter((row) => ['paid', 'fulfilled'].includes(row.status)).length
  const failed = rows.filter((row) => ['failed', 'expired', 'cancelled'].includes(row.status)).length

  return (
    <main className="min-h-screen bg-[#f6f8fb] px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-[1180px]">
        <BackLink locale={locale} label={copy.back} />

        <section className="mt-6 rounded-[18px] border border-[#d9e2ef] bg-white p-6 shadow-[0_18px_50px_rgba(16,24,40,.055)] sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-[#0866ff]">{copy.eyebrow}</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-[-.045em] text-[#101828]">{copy.title}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#667085]">{copy.intro}</p>
            </div>
            <Link
              href={localizePublicHref(locale, '/account/listings')}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[12px] bg-[#0866ff] px-4 text-sm font-bold text-white transition hover:bg-[#075be3]"
            >
              <FileText className="h-4 w-4" />
              {copy.manageListings}
            </Link>
          </div>

          <div className="mt-7 grid gap-3 md:grid-cols-3">
            <SummaryItem label={copy.pending} value={String(pending)} />
            <SummaryItem label={copy.paid} value={String(paid)} />
            <SummaryItem label={copy.needsAttention} value={String(failed)} />
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-[18px] border border-[#d9e2ef] bg-white shadow-[0_18px_50px_rgba(16,24,40,.045)]">
          <div className="border-b border-[#edf1f7] px-5 py-4 sm:px-6">
            <h2 className="text-lg font-semibold tracking-[-.025em] text-[#101828]">{copy.latestOrders}</h2>
          </div>
          {rows.length ? (
            <div className="divide-y divide-[#edf1f7]">
              {rows.map((order) => (
                <article key={order.id} className="grid gap-4 px-5 py-4 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_auto] lg:items-center">
                  <div>
                    <p className="text-sm font-bold text-[#101828]">{productLabel(order.product_key, locale)}</p>
                    <p className="mt-1 text-sm text-[#667085]">
                      {listingTitle(order) || copy.noListing}
                    </p>
                    <p className="mt-1 text-xs text-[#98a2b3]">
                      {copy.order} {order.id.slice(0, 8)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[.12em] text-[#667085]">{copy.date}</p>
                    <p className="mt-1 text-sm font-semibold text-[#101828]">{formatDate(order.created_at, locale)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[.12em] text-[#667085]">{copy.amount}</p>
                    <p className="mt-1 text-sm font-semibold text-[#101828]">{formatMoney(order.amount_minor, order.currency, locale)}</p>
                  </div>
                  <div className="flex items-center justify-between gap-3 lg:justify-end">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${paymentStatusClass(order.status)}`}>
                      {paymentStatusText(order.status, locale)}
                    </span>
                    {['created', 'checkout_created', 'pending', 'failed', 'expired', 'cancelled'].includes(order.status) && order.listing_id ? (
                      <Link
                        href={localizePublicHref(locale, `/account/listings?choosePackage=1&listing=${order.listing_id}`)}
                        className="inline-flex min-h-9 items-center rounded-[10px] border border-[#cbd7e8] px-3 text-xs font-bold text-[#0866ff] transition hover:bg-[#eef5ff]"
                      >
                        {copy.continue}
                      </Link>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyPayments copy={copy} locale={locale} />
          )}
        </section>
      </div>
    </main>
  )
}

async function BusinessPaymentsPage({
  admin,
  userId,
  locale,
}: {
  admin: ReturnType<typeof createAdminClient>
  userId: string
  locale: PublicLocale
}) {
  const copy = businessPaymentsCopy(locale)
  const [{ data: subscription }, { data: invoices }] = await Promise.all([
    admin
      .from('business_subscriptions')
      .select('plan_key,product_key,status,payment_status,active_listing_limit,next_billing_at,current_period_end,stripe_customer_id')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    admin
      .from('business_invoices')
      .select('id,invoice_number,hosted_invoice_url,pdf_url,amount_minor,currency,status,issued_at,paid_at,created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(24),
  ])

  const rows = (invoices || []) as InvoiceRow[]
  const currentPlan = subscription?.plan_key ? capitalize(subscription.plan_key) : copy.noPlan
  const nextBilling = subscription?.next_billing_at || subscription?.current_period_end || null

  return (
    <main className="min-h-screen bg-[#f6f8fb] px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-[1180px]">
        <BackLink locale={locale} label={copy.back} />

        <section className="mt-6 rounded-[16px] border border-[#d9e2ef] bg-white p-6 shadow-[0_18px_50px_rgba(16,24,40,.055)] sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-[#0866ff]">{copy.eyebrow}</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-[-.045em] text-[#101828]">{copy.title}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#667085]">{copy.intro}</p>
            </div>
            {subscription?.stripe_customer_id ? <BillingPortalButton label={copy.openStripe} /> : null}
          </div>

          <div className="mt-7 grid gap-3 md:grid-cols-3">
            <SummaryItem label={copy.currentPlan} value={currentPlan} />
            <SummaryItem label={copy.paymentStatus} value={businessPaymentText(subscription?.payment_status || subscription?.status || null, locale)} />
            <SummaryItem label={copy.nextBilling} value={nextBilling ? formatDate(nextBilling, locale) : copy.notScheduled} />
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-[16px] border border-[#d9e2ef] bg-white shadow-[0_18px_50px_rgba(16,24,40,.045)]">
          <div className="border-b border-[#edf1f7] px-5 py-4 sm:px-6">
            <h2 className="text-lg font-semibold tracking-[-.025em] text-[#101828]">{copy.latestInvoices}</h2>
          </div>
          {rows.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead className="bg-[#f8fafc] text-xs uppercase tracking-[.12em] text-[#667085]">
                  <tr>
                    <th className="px-5 py-3 font-bold">{copy.invoice}</th>
                    <th className="px-5 py-3 font-bold">{copy.date}</th>
                    <th className="px-5 py-3 font-bold">{copy.amount}</th>
                    <th className="px-5 py-3 font-bold">{copy.status}</th>
                    <th className="px-5 py-3 font-bold">{copy.document}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf1f7]">
                  {rows.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="px-5 py-4 font-semibold text-[#101828]">{invoice.invoice_number || invoice.id.slice(0, 8)}</td>
                      <td className="px-5 py-4 text-[#475467]">{formatDate(invoice.issued_at || invoice.created_at, locale)}</td>
                      <td className="px-5 py-4 text-[#475467]">{formatMoney(invoice.amount_minor, invoice.currency, locale)}</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${invoiceStatusClass(invoice.status)}`}>
                          {invoiceStatusText(invoice.status, locale)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          {invoice.hosted_invoice_url ? (
                            <a href={invoice.hosted_invoice_url} className="inline-flex items-center gap-1 font-bold text-[#0866ff]">
                              {copy.open} <ExternalLink className="h-3.5 w-3.5" />
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
              <h2 className="mt-4 text-xl font-semibold text-[#101828]">{copy.noInvoices}</h2>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#667085]">{copy.noInvoicesText}</p>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

function BackLink({ locale, label }: { locale: PublicLocale; label: string }) {
  return (
    <Link
      href={localizePublicHref(locale, '/account')}
      className="inline-flex items-center gap-2 text-sm font-bold text-[#475467] transition hover:text-[#0866ff]"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Link>
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

function EmptyPayments({ copy, locale }: { copy: ReturnType<typeof privatePaymentsCopy>; locale: PublicLocale }) {
  return (
    <div className="px-6 py-12 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-[14px] bg-[#eef5ff] text-[#0866ff]">
        <ReceiptText className="h-5 w-5" />
      </div>
      <h2 className="mt-4 text-xl font-semibold text-[#101828]">{copy.noPayments}</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#667085]">{copy.noPaymentsText}</p>
      <Link
        href={localizePublicHref(locale, '/account/listings/new')}
        className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-[12px] bg-[#0866ff] px-4 text-sm font-bold text-white"
      >
        <CreditCard className="h-4 w-4" />
        {copy.createListing}
      </Link>
    </div>
  )
}

function productLabel(productKey: string, locale: PublicLocale) {
  const sv = locale === 'sv'
  if (productKey.includes('premium')) return sv ? 'Premiumannons' : 'Premium listing'
  if (productKey.includes('standard')) return sv ? 'Standardannons' : 'Standard listing'
  if (productKey.includes('top_placement')) return sv ? 'Toppplacering' : 'Top placement'
  if (productKey.includes('refresh')) return sv ? 'Lyft annons' : 'Listing boost'
  if (productKey.includes('featured')) return 'Featured'
  return productKey.split('_').map(capitalize).join(' ')
}

function listingTitle(order: PaymentOrderRow) {
  const relation = order.marketplace_listings
  if (Array.isArray(relation)) return relation[0]?.title || null
  return relation?.title || null
}

function paymentStatusText(status: string, locale: PublicLocale) {
  const sv = locale === 'sv'
  if (status === 'paid' || status === 'fulfilled') return sv ? 'Betald' : 'Paid'
  if (status === 'created' || status === 'checkout_created' || status === 'pending') return sv ? 'Väntar' : 'Pending'
  if (status === 'failed') return sv ? 'Misslyckad' : 'Failed'
  if (status === 'expired') return sv ? 'Utgången' : 'Expired'
  if (status === 'cancelled') return sv ? 'Avbruten' : 'Cancelled'
  if (status === 'refunded') return sv ? 'Återbetald' : 'Refunded'
  if (status === 'partially_refunded') return sv ? 'Delvis återbetald' : 'Partially refunded'
  return capitalize(status)
}

function paymentStatusClass(status: string) {
  if (status === 'paid' || status === 'fulfilled') return 'bg-[#eef5ff] text-[#0866ff]'
  if (status === 'created' || status === 'checkout_created' || status === 'pending') return 'bg-[#fff7ed] text-[#c2410c]'
  if (status === 'failed' || status === 'expired' || status === 'cancelled') return 'bg-red-50 text-red-700'
  if (status === 'refunded' || status === 'partially_refunded') return 'bg-[#f2f4f7] text-[#475467]'
  return 'bg-[#f2f4f7] text-[#475467]'
}

function invoiceStatusText(status: string, locale: PublicLocale) {
  const sv = locale === 'sv'
  if (status === 'paid') return sv ? 'Betald' : 'Paid'
  if (status === 'open') return sv ? 'Skickad' : 'Sent'
  if (status === 'draft') return sv ? 'Utkast' : 'Draft'
  if (status === 'void') return sv ? 'Makulerad' : 'Void'
  if (status === 'uncollectible') return sv ? 'Ej indrivbar' : 'Uncollectible'
  return capitalize(status)
}

function invoiceStatusClass(status: string) {
  if (status === 'paid') return 'bg-[#eef5ff] text-[#0866ff]'
  if (status === 'open') return 'bg-[#fff7ed] text-[#c2410c]'
  if (status === 'void' || status === 'uncollectible') return 'bg-red-50 text-red-700'
  return 'bg-[#f2f4f7] text-[#475467]'
}

function businessPaymentText(status: string | null | undefined, locale: PublicLocale) {
  const sv = locale === 'sv'
  if (status === 'paid') return sv ? 'Betald' : 'Paid'
  if (status === 'pending') return sv ? 'Inväntar betalning' : 'Awaiting payment'
  if (status === 'failed') return sv ? 'Misslyckad betalning' : 'Failed payment'
  if (status === 'not_required') return sv ? 'Ingen betalning krävs' : 'No payment required'
  if (status === 'active') return sv ? 'Aktiv' : 'Active'
  if (status === 'past_due') return sv ? 'Förfallen' : 'Past due'
  return sv ? 'Väntar' : 'Pending'
}

function formatMoney(amountMinor: number, currency: string, locale: PublicLocale) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency.toUpperCase(),
    maximumFractionDigits: ['sek', 'dkk', 'pln'].includes(currency.toLowerCase()) ? 0 : 2,
  }).format(amountMinor / 100)
}

function formatDate(value: string, locale: PublicLocale) {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(value))
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function privatePaymentsCopy(locale: PublicLocale) {
  const en = {
    back: 'My pages',
    eyebrow: 'Payments',
    title: 'Orders and payments',
    intro: 'View payments for private listing packages and add-ons. Payment status is verified server-side.',
    manageListings: 'Manage listings',
    pending: 'Pending',
    paid: 'Paid',
    needsAttention: 'Needs attention',
    latestOrders: 'Latest orders',
    noListing: 'Listing not available',
    order: 'Order',
    date: 'Date',
    amount: 'Amount',
    continue: 'Continue',
    noPayments: 'No payments yet',
    noPaymentsText: 'When you choose a paid listing package or add-on, the order appears here.',
    createListing: 'Create listing',
  }
  if (locale === 'sv') {
    return {
      ...en,
      back: 'Mina sidor',
      eyebrow: 'Betalningar',
      title: 'Ordrar och betalningar',
      intro: 'Se betalningar för privata annonspaket och tillägg. Betalningsstatus verifieras server-side.',
      manageListings: 'Hantera annonser',
      pending: 'Väntar',
      paid: 'Betalda',
      needsAttention: 'Behöver åtgärd',
      latestOrders: 'Senaste ordrar',
      noListing: 'Annons saknas',
      order: 'Order',
      date: 'Datum',
      amount: 'Belopp',
      continue: 'Fortsätt',
      noPayments: 'Inga betalningar ännu',
      noPaymentsText: 'När du väljer ett betalt annonspaket eller tillägg visas ordern här.',
      createListing: 'Skapa annons',
    }
  }
  if (locale === 'de') {
    return {
      ...en,
      back: 'Mein Konto',
      eyebrow: 'Zahlungen',
      title: 'Bestellungen und Zahlungen',
      intro: 'Zahlungen für private Anzeigenpakete und Zusatzoptionen anzeigen. Der Zahlungsstatus wird serverseitig geprüft.',
      manageListings: 'Anzeigen verwalten',
      pending: 'Ausstehend',
      paid: 'Bezahlt',
      needsAttention: 'Aktion nötig',
      latestOrders: 'Letzte Bestellungen',
      noListing: 'Anzeige nicht verfügbar',
      date: 'Datum',
      amount: 'Betrag',
      continue: 'Fortsetzen',
      noPayments: 'Noch keine Zahlungen',
      noPaymentsText: 'Wenn Sie ein bezahltes Anzeigenpaket oder Add-on wählen, erscheint die Bestellung hier.',
      createListing: 'Anzeige erstellen',
    }
  }
  return translatePublicObject(locale, en)
}

function businessPaymentsCopy(locale: PublicLocale) {
  const en = {
    back: 'My pages',
    eyebrow: 'Payments',
    title: 'Invoices and subscription',
    intro: 'Company invoices, payment status and the next billing date. Card and subscription payments are handled securely via Stripe.',
    openStripe: 'Open Stripe portal',
    currentPlan: 'Current plan',
    paymentStatus: 'Payment status',
    nextBilling: 'Next billing',
    notScheduled: 'Not scheduled',
    noPlan: 'No active plan',
    latestInvoices: 'Latest invoices',
    invoice: 'Invoice',
    date: 'Date',
    amount: 'Amount',
    status: 'Status',
    document: 'Document',
    open: 'Open',
    noInvoices: 'No invoices yet',
    noInvoicesText: 'When Stripe creates an invoice, it appears here after the webhook has been processed.',
  }
  if (locale === 'sv') {
    return {
      ...en,
      back: 'Mina sidor',
      eyebrow: 'Betalningar',
      title: 'Fakturor och abonnemang',
      intro: 'Här ser företaget fakturor, betalningsstatus och nästa debitering. Kort och abonnemangsbetalningar hanteras säkert via Stripe.',
      openStripe: 'Öppna Stripe portal',
      currentPlan: 'Nuvarande plan',
      paymentStatus: 'Betalningsstatus',
      nextBilling: 'Nästa debitering',
      notScheduled: 'Inte schemalagd',
      noPlan: 'Ingen aktiv plan',
      latestInvoices: 'Senaste fakturor',
      invoice: 'Faktura',
      date: 'Datum',
      amount: 'Belopp',
      status: 'Status',
      document: 'Dokument',
      open: 'Öppna',
      noInvoices: 'Inga fakturor ännu',
      noInvoicesText: 'När en faktura skapas via Stripe visas den här automatiskt efter att webhooken har behandlats.',
    }
  }
  if (locale === 'de') {
    return {
      ...en,
      back: 'Mein Konto',
      eyebrow: 'Zahlungen',
      title: 'Rechnungen und Abonnement',
      intro: 'Unternehmensrechnungen, Zahlungsstatus und nächste Abrechnung. Zahlungen werden sicher über Stripe verarbeitet.',
      openStripe: 'Stripe-Portal öffnen',
      currentPlan: 'Aktueller Tarif',
      paymentStatus: 'Zahlungsstatus',
      nextBilling: 'Nächste Abrechnung',
      notScheduled: 'Nicht geplant',
      noPlan: 'Kein aktiver Tarif',
      latestInvoices: 'Letzte Rechnungen',
      invoice: 'Rechnung',
      date: 'Datum',
      amount: 'Betrag',
      status: 'Status',
      document: 'Dokument',
      open: 'Öffnen',
      noInvoices: 'Noch keine Rechnungen',
      noInvoicesText: 'Wenn Stripe eine Rechnung erstellt, erscheint sie hier nach Verarbeitung des Webhooks.',
    }
  }
  return translatePublicObject(locale, en)
}
