import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/admin-auth'
import ContractDocumentView from '@/app/components/ContractDocumentView'

export const metadata = {
  title: 'Contract draft',
}

export default async function AdminContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { adminClient } = await requireAdmin()
  const { data: document } = await adminClient
    .from('contract_documents_v2')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (!document) notFound()

  return (
    <ContractDocumentView
      document={document}
      backHref="/admin/contracts"
    />
  )
}
