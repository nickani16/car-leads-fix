import Link from 'next/link'
import { ArrowRight, CarFront, FileText } from 'lucide-react'
import { requireSales } from '@/lib/sales-auth'
import { AdminEmpty, AdminPageHeader, Badge } from '@/app/admin/AdminUI'

const createdDate = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export default async function SalesContractsPage() {
  const { adminClient } = await requireSales()
  const [{ data }, { data: deals }, { data: leads }] = await Promise.all([
    adminClient
      .from('contract_documents_v2')
      .select(
        'id,deal_id,document_type,version,status,template_version,content_hash,created_at,final_approved_at'
      )
      .neq('status', 'void')
      .order('created_at', { ascending: false }),
    adminClient.from('deals').select('id,lead_id'),
    adminClient.from('leads').select('id,reg,make,model,model_year'),
  ])

  const dealMap = new Map((deals || []).map((deal) => [deal.id, deal]))
  const leadMap = new Map((leads || []).map((lead) => [lead.id, lead]))
  const documents = data || []
  const grouped = documents.reduce<
    Record<string, typeof documents>
  >((result, document) => {
    const key = `${document.deal_id}:${document.document_type}`
    result[key] = [...(result[key] || []), document]
    return result
  }, {})
  const latestDocuments = Object.values(grouped)
    .map((versions) =>
      [...versions].sort((a, b) => Number(b.version) - Number(a.version))[0]
    )
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

  return (
    <main className="mx-auto max-w-[1180px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <AdminPageHeader
        eyebrow="Contract review"
        title="Transaction agreements"
        description="Complete both parties, review the two agreements and finalize the locked versions directly for signature. No separate admin approval is required."
      />

      {latestDocuments.length ? (
        <div className="grid gap-4">
          {latestDocuments.map((document) => {
            const deal = dealMap.get(document.deal_id)
            const lead = deal ? leadMap.get(deal.lead_id) : undefined
            const history =
              grouped[`${document.deal_id}:${document.document_type}`]
                ?.filter((version) => version.id !== document.id)
                .sort((a, b) => Number(b.version) - Number(a.version)) || []
            const documentName =
              document.document_type === 'seller_purchase_agreement'
                ? 'Seller agreement'
                : 'Buyer agreement'

            return (
              <article
                key={document.id}
                className="rounded-[18px] border border-[#deddd7] bg-white"
              >
                <Link
                  href={`/sales/contracts/${document.id}`}
                  className="grid gap-4 p-5 transition hover:bg-[#fbfaf7] sm:grid-cols-[1fr_auto] sm:items-center"
                >
                <div className="flex min-w-0 items-start gap-4">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#eaf6fc] text-[#52768a]">
                    <FileText size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold">{documentName}</h2>
                      <Badge
                        label={
                          document.status === 'signed'
                            ? 'signed'
                            : document.final_approved_at
                            ? 'ready for signature'
                            : document.status
                        }
                        tone={
                          document.status === 'signed'
                            ? 'green'
                            : document.final_approved_at ||
                                document.status === 'ready'
                              ? 'blue'
                              : 'amber'
                        }
                      />
                    </div>
                    <p className="mt-2 flex items-center gap-2 text-sm text-[#3e464a]">
                      <CarFront size={15} />
                      <strong>{lead?.reg || 'Unknown registration'}</strong>
                      <span className="text-[#73797c]">
                        {[lead?.make, lead?.model, lead?.model_year]
                          .filter(Boolean)
                          .join(' ') || 'Vehicle details incomplete'}
                      </span>
                    </p>
                    <p className="mt-2 text-xs text-[#73797c]">
                      Transaction {document.deal_id.slice(0, 8).toUpperCase()} ·
                      Version {document.version} · {formatDate(document.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <span className="text-xs text-[#73797c]">Open agreement</span>
                  <ArrowRight size={16} />
                </div>
                </Link>
                {history.length > 0 && (
                  <details className="border-t border-[#e9e7e1] px-5 py-4">
                    <summary className="cursor-pointer text-xs font-medium text-[#596166]">
                      Version history ({history.length})
                    </summary>
                    <div className="mt-3 grid gap-2">
                      {history.map((version) => (
                        <Link
                          key={version.id}
                          href={`/sales/contracts/${version.id}`}
                          className="flex items-center justify-between rounded-[10px] bg-[#f7f6f2] px-4 py-3 text-xs"
                        >
                          <span>
                            Version {version.version} / {formatDate(version.created_at)}
                          </span>
                          <Badge label={version.status} tone="gray" />
                        </Link>
                      ))}
                    </div>
                  </details>
                )}
              </article>
            )
          })}
        </div>
      ) : (
        <AdminEmpty text="No current contract drafts yet." />
      )}
    </main>
  )
}

function formatDate(value: string) {
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime())
    ? 'Date unavailable'
    : createdDate.format(parsed)
}
