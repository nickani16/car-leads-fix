import { notFound } from 'next/navigation'
import { requireSales } from '@/lib/sales-auth'
import ContractDocumentView from '@/app/components/ContractDocumentView'
import SalesContractFinalize from '../SalesContractFinalize'

export const metadata = {
  title: 'Contract draft',
}

export default async function SalesContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { adminClient } = await requireSales()
  const { data: document } = await adminClient
    .from('contract_documents_v2')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (!document) notFound()

  const [{ data: packet }, { data: approval }] = await Promise.all([
    adminClient
      .from('contract_packets')
      .select('status,blockers')
      .eq('id', document.packet_id)
      .maybeSingle(),
    adminClient
      .from('contract_approvals')
      .select('approved_at,document_version')
      .eq('packet_id', document.packet_id)
      .eq('document_version', document.version)
      .maybeSingle(),
  ])
  const blockers = Array.isArray(packet?.blockers) ? packet.blockers : []
  const canFinalize =
    document.status === 'ready' &&
    packet?.status === 'draft_ready' &&
    blockers.length === 0

  return (
    <>
      <div className="mx-auto max-w-[1014px] px-5 pt-8 sm:px-8 lg:px-12">
        <SalesContractFinalize
          documentId={document.id}
          finalizedAt={approval?.approved_at || document.final_approved_at}
          canFinalize={canFinalize}
          reason={
            blockers.length
              ? 'Complete the seller and buyer details first.'
              : document.status !== 'ready'
                ? 'Save the party details to generate a ready version.'
                : undefined
          }
        />
      </div>
      <ContractDocumentView
        document={document}
        backHref="/sales/contracts"
      />
    </>
  )
}
