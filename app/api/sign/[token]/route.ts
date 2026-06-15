import { createHash } from 'node:crypto'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const body = (await request.json().catch(() => ({}))) as {
    typedName?: string
    accepted?: boolean
  }
  if (!body.accepted || !body.typedName?.trim()) {
    return NextResponse.json(
      { error: 'Confirm the agreement and enter your full name.' },
      { status: 400 }
    )
  }

  const forwardedFor = request.headers.get('x-forwarded-for')
  const tokenHash = createHash('sha256').update(token).digest('hex')
  const adminClient = createAdminClient()
  const { data, error } = await adminClient.rpc(
    'complete_native_contract_signature',
    {
      p_token_hash: tokenHash,
      p_typed_name: body.typedName.trim(),
      p_ip_address: forwardedFor?.split(',')[0]?.trim() || null,
      p_user_agent: request.headers.get('user-agent'),
    }
  )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  return NextResponse.json({ success: true, result: data })
}
