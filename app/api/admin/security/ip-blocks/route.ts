import { isIP } from 'node:net'
import { NextResponse } from 'next/server'
import { requireAdminRoute, writeAdminAuditLog } from '@/lib/admin-route-auth'

function validNetwork(value: string) {
  const [address, maskText] = value.split('/')
  const version = isIP(address)
  if (!version) return false
  if (maskText === undefined) return true
  if (!/^\d{1,3}$/.test(maskText)) return false
  const mask = Number(maskText)
  return Number.isInteger(mask) && mask >= 0 && mask <= (version === 4 ? 32 : 128)
}

export async function POST(request: Request) {
  const auth = await requireAdminRoute('security.manage')
  if ('error' in auth) return auth.error
  const body = (await request.json()) as Record<string, unknown>
  const ipNetwork = String(body.ip_network || '').trim()
  const reason = String(body.reason || '').trim()
  const durationHours = Number(body.duration_hours)
  if (!validNetwork(ipNetwork)) return NextResponse.json({ error: 'Ange en giltig IP-adress eller CIDR.' }, { status: 400 })
  if (!Number.isInteger(durationHours) || durationHours < 1 || durationHours > 720) {
    return NextResponse.json({ error: 'Spärrtiden måste vara 1–720 timmar.' }, { status: 400 })
  }
  if (reason.length < 8) return NextResponse.json({ error: 'Ange en intern anledning på minst 8 tecken.' }, { status: 400 })
  const startsAt = new Date()
  const endsAt = new Date(startsAt.getTime() + durationHours * 60 * 60 * 1000)
  const record = {
    ip_network: ipNetwork.includes('/') ? ipNetwork : `${ipNetwork}/${isIP(ipNetwork) === 4 ? 32 : 128}`,
    reason,
    created_by: auth.user.id,
    starts_at: startsAt.toISOString(),
    ends_at: endsAt.toISOString(),
  }
  const { data, error } = await auth.adminClient.from('ip_blocks').insert(record).select('id').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  await writeAdminAuditLog({
    adminClient: auth.adminClient,
    actorUserId: auth.user.id,
    actorRole: auth.primaryRole,
    permission: 'security.manage',
    action: 'ip_block_created',
    targetType: 'ip_block',
    targetId: data.id,
    reason,
    afterData: { ...record, ip_network: '[redacted]' },
  })
  return NextResponse.json({ success: true, id: data.id }, { status: 201 })
}
