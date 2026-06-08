import { notFound } from 'next/navigation'
import { requireSales } from '@/lib/sales-auth'
import ContractDocumentView from '@/app/components/ContractDocumentView'

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

  return (
    <ContractDocumentView
      document={document}
      backHref="/sales/contracts"
    />
  )
}
