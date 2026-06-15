import { createHash } from 'node:crypto'
import { notFound } from 'next/navigation'
import ContractDocumentView from '@/app/components/ContractDocumentView'
import { createAdminClient } from '@/lib/supabase/admin'
import SignAgreementForm from './SignAgreementForm'

export const metadata = {
  title: 'Sign agreement',
  robots: { index: false, follow: false },
}

export default async function SignAgreementPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const tokenHash = createHash('sha256').update(token).digest('hex')
  const adminClient = createAdminClient()
  const { data: signingRequest } = await adminClient
    .from('contract_signing_requests')
    .select('document_id,signer_name,signer_role,expires_at,signed_at,revoked_at')
    .eq('token_hash', tokenHash)
    .maybeSingle()

  if (
    !signingRequest ||
    signingRequest.revoked_at ||
    new Date(signingRequest.expires_at) <= new Date()
  ) {
    notFound()
  }

  const { data: document } = await adminClient
    .from('contract_documents_v2')
    .select('*')
    .eq('id', signingRequest.document_id)
    .maybeSingle()
  if (!document) notFound()

  return (
    <main className="min-h-screen bg-[#f5f4f0] pb-12 text-[#202124]">
      <SignAgreementForm
        token={token}
        signerName={signingRequest.signer_name || ''}
        alreadySigned={Boolean(signingRequest.signed_at)}
      />
      <ContractDocumentView document={document} backHref="/" />
    </main>
  )
}
