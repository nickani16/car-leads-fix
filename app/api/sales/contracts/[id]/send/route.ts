import { createHash, randomBytes } from 'node:crypto'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { requireSalesRoute } from '@/lib/sales-route-auth'

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[
        character
      ] || character
  )
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await requireSalesRoute()
  if ('error' in auth) return auth.error

  const { data: selected } = await auth.adminClient
    .from('contract_documents_v2')
    .select('packet_id,deal_id,version')
    .eq('id', id)
    .maybeSingle()
  if (!selected) {
    return NextResponse.json({ error: 'Agreement was not found.' }, { status: 404 })
  }

  const [
    { data: documents },
    { data: parties },
    { data: leadDeal },
    { data: latestDocument },
  ] =
    await Promise.all([
      auth.adminClient
        .from('contract_documents_v2')
        .select('id,packet_id,deal_id,document_type,version,status,final_approved_at')
        .eq('packet_id', selected.packet_id)
        .eq('version', selected.version)
        .neq('status', 'void'),
      auth.adminClient
        .from('contract_parties')
        .select('party_role,legal_name,email')
        .eq('deal_id', selected.deal_id)
        .in('party_role', ['seller', 'buyer']),
      auth.adminClient
        .from('deals')
        .select('lead_id,leads(reg,make,model)')
        .eq('id', selected.deal_id)
        .maybeSingle(),
      auth.adminClient
        .from('contract_documents_v2')
        .select('version')
        .eq('packet_id', selected.packet_id)
        .neq('status', 'void')
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ])

  if (!latestDocument || latestDocument.version !== selected.version) {
    return NextResponse.json(
      { error: 'Only the latest agreement version can be sent.' },
      { status: 409 }
    )
  }

  if (
    !documents ||
    documents.length !== 2 ||
    documents.some((document) => !document.final_approved_at)
  ) {
    return NextResponse.json(
      { error: 'Finalize both latest agreements before sending.' },
      { status: 400 }
    )
  }
  if (documents.some((document) => document.status === 'signed')) {
    return NextResponse.json(
      { error: 'A signed agreement cannot be replaced or resent.' },
      { status: 409 }
    )
  }

  const partyMap = new Map((parties || []).map((party) => [party.party_role, party]))
  for (const role of ['seller', 'buyer'] as const) {
    if (!partyMap.get(role)?.email) {
      return NextResponse.json(
        { error: `${role === 'seller' ? 'Seller' : 'Buyer'} email is missing.` },
        { status: 400 }
      )
    }
  }
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.autorell.com'
  const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    return NextResponse.json(
      { error: 'Email delivery is not configured.' },
      { status: 503 }
    )
  }
  const resend = new Resend(resendKey)
  const vehicle = Array.isArray(leadDeal?.leads) ? leadDeal.leads[0] : leadDeal?.leads
  const vehicleName =
    [vehicle?.reg, vehicle?.make, vehicle?.model].filter(Boolean).join(' ') ||
    'the vehicle'

  const sent: { role: string; email: string }[] = []
  for (const document of documents) {
    const role =
      document.document_type === 'seller_purchase_agreement' ? 'seller' : 'buyer'
    const party = partyMap.get(role)!

    await auth.adminClient
      .from('contract_signing_requests')
      .update({ revoked_at: new Date().toISOString() })
      .eq('document_id', document.id)
      .is('signed_at', null)
      .is('revoked_at', null)

    const token = randomBytes(32).toString('base64url')
    const tokenHash = createHash('sha256').update(token).digest('hex')
    const signingUrl = new URL(`/sign/${token}`, baseUrl).toString()
    const { data: signingRequest, error: requestError } = await auth.adminClient
      .from('contract_signing_requests')
      .insert({
        document_id: document.id,
        packet_id: document.packet_id,
        deal_id: document.deal_id,
        signer_role: role,
        signer_email: party.email.toLowerCase(),
        signer_name: party.legal_name,
        token_hash: tokenHash,
        expires_at: expiresAt.toISOString(),
        created_by: auth.user.id,
      })
      .select('id')
      .single()

    if (requestError || !signingRequest) {
      return NextResponse.json(
        { error: requestError?.message || 'Signing request could not be created.' },
        { status: 400 }
      )
    }

    const subject =
      role === 'seller'
        ? `Sign your vehicle sale agreement for ${vehicleName}`
        : `Sign your vehicle purchase agreement for ${vehicleName}`
    const intro =
      role === 'seller'
        ? 'Autorell has prepared the agreement for the sale of your vehicle.'
        : 'Autorell has prepared the agreement for the vehicle you won in the bidding.'
    const { data: emailData, error: emailError } = await resend.emails.send({
      from:
        process.env.NOTIFICATION_FROM_EMAIL ||
        process.env.CONTACT_FROM_EMAIL ||
        'Autorell <onboarding@resend.dev>',
      to: party.email,
      subject,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#202124">
        <h1 style="font-size:24px">Agreement ready for signature</h1>
        <p>Hello ${escapeHtml(party.legal_name || '')},</p>
        <p>${escapeHtml(intro)} Review the locked agreement and sign through the secure link below.</p>
        <p><a href="${signingUrl}" style="display:inline-block;background:#242424;color:#fff;text-decoration:none;padding:14px 22px;border-radius:999px">Review and sign agreement</a></p>
        <p style="color:#697074;font-size:13px">The link expires ${expiresAt.toLocaleDateString('en-GB')}. Contact Autorell before signing if any information is incorrect.</p>
      </div>`,
    })

    if (emailError) {
      await auth.adminClient
        .from('contract_signing_requests')
        .update({ revoked_at: new Date().toISOString() })
        .eq('id', signingRequest.id)
      return NextResponse.json({ error: emailError.message }, { status: 502 })
    }

    const now = new Date().toISOString()
    await Promise.all([
      auth.adminClient
        .from('contract_signing_requests')
        .update({
          email_provider_id: emailData?.id || null,
          email_sent_at: now,
        })
        .eq('id', signingRequest.id),
      auth.adminClient
        .from('contract_documents_v2')
        .update({
          status: 'sent',
          sent_at: now,
          signing_provider: 'autorell_native',
          provider_document_id: signingRequest.id,
          signing_url: signingUrl,
        })
        .eq('id', document.id),
      auth.adminClient.from('contract_events').insert({
        deal_id: document.deal_id,
        packet_id: document.packet_id,
        document_id: document.id,
        signing_request_id: signingRequest.id,
        actor_user_id: auth.user.id,
        actor_role: 'sales',
        event_type: 'contract_sent',
        summary: `${role === 'seller' ? 'Seller' : 'Buyer'} agreement sent for signature`,
        metadata: { recipient_email: party.email },
      }),
    ])
    sent.push({ role, email: party.email })
  }

  await auth.adminClient
    .from('contract_packets')
    .update({
      status: 'sent_for_signature',
      sent_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', selected.packet_id)

  return NextResponse.json({ success: true, sent })
}
