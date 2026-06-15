import Link from 'next/link'
import { ArrowRight, FileText } from 'lucide-react'
import { requireAdmin } from '@/lib/admin-auth'
import { AdminEmpty, AdminPageHeader, Badge } from '../AdminUI'

export default async function AdminContractsPage() {
  const { adminClient } = await requireAdmin()
  const { data } = await adminClient
    .from('contract_documents_v2')
    .select(
      'id,deal_id,document_type,version,status,template_version,content_hash,created_at,final_approved_at'
    )
    .order('created_at', { ascending: false })
    .limit(200)

  const documents = data || []

  return (
    <main className="mx-auto max-w-[1180px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <AdminPageHeader
        eyebrow="Contract operations"
        title="All contract documents"
        description="Monitor draft, sales-finalized, void, sent and signed contract snapshots across every deal. Sales manages completion and signature preparation."
      />

      {documents.length ? (
        <div className="grid gap-4">
          {documents.map((document) => (
            <Link
              key={document.id}
              href={`/admin/contracts/${document.id}`}
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
                  label={
                    document.final_approved_at
                      ? 'finalized for signature'
                      : document.status
                  }
                  tone={
                    document.final_approved_at || document.status === 'ready'
                      ? 'green'
                      : 'gray'
                  }
                />
                <ArrowRight size={16} />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <AdminEmpty text="No contract documents yet." />
      )}
    </main>
  )
}
