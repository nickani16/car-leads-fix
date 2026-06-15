import { createHash } from 'node:crypto'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const tokenHash = createHash('sha256').update(token).digest('hex')
  const adminClient = createAdminClient()
  const { data: signingRequest } = await adminClient
    .from('contract_signing_requests')
    .select('id,deal_id,packet_id,document_id,opened_at')
    .eq('token_hash', tokenHash)
    .is('revoked_at', null)
    .maybeSingle()

  if (!signingRequest) {
    return NextResponse.json({ success: false }, { status: 404 })
  }
  if (!signingRequest.opened_at) {
    const now = new Date().toISOString()
    await Promise.all([
      adminClient
        .from('contract_signing_requests')
        .update({ opened_at: now })
        .eq('id', signingRequest.id),
      adminClient.from('contract_events').insert({
        deal_id: signingRequest.deal_id,
        packet_id: signingRequest.packet_id,
        document_id: signingRequest.document_id,
        signing_request_id: signingRequest.id,
        actor_role: 'signer',
        event_type: 'signing_link_opened',
        summary: 'Signing link opened',
      }),
    ])
  }
  return NextResponse.json({ success: true })
}
