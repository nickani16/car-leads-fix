import Link from 'next/link'
import { ArrowRight, FileText } from 'lucide-react'
import { requireSales } from '@/lib/sales-auth'
import { AdminEmpty, AdminPageHeader, Badge } from '@/app/admin/AdminUI'

export default async function SalesContractsPage() {
  const { adminClient } = await requireSales()
  const { data } = await adminClient
    .from('contract_documents_v2')
    .select(
      'id,deal_id,document_type,version,status,template_version,content_hash,created_at'
    )
    .neq('status', 'void')
    .order('created_at', { ascending: false })

  const documents = data || []

  return (
    <main className="mx-auto max-w-[1180px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <AdminPageHeader
        eyebrow="Contract review"
        title="Current contract drafts"
        description="Review locked buyer and seller draft documents before any e-signing process is enabled."
      />

      {documents.length ? (
        <div className="grid gap-4">
          {documents.map((document) => (
            <Link
              key={document.id}
              href={`/sales/contracts/${document.id}`}
              className="flex flex-col justify-between gap-4 rounded-[18px] border border-[#deddd7] bg-white p-5 transition hover:border-[#B4D9EF] sm:flex-row sm:items-center"
            >
              <div className="flex items-start gap-4">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-[#eaf6fc] text-[#52768a]">
                  <FileText size={18} />
                </div>
                <div>
                  <h2 className="font-semibold">
                    {document.document_type.replaceAll('_', ' ')}
                  </h2>
                  <p className="mt-1 text-xs text-[#62686c]">
                    Version {document.version} · {document.template_version}
                  </p>
                  <p className="mt-1 max-w-xl truncate text-xs text-[#858a8c]">
                    {document.content_hash}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  label={document.status}
                  tone={document.status === 'ready' ? 'green' : 'amber'}
                />
                <ArrowRight size={16} />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <AdminEmpty text="No current contract drafts yet." />
      )}
    </main>
  )
}
