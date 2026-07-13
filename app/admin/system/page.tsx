import { requireAdminPermission } from '@/lib/admin-auth'
import { AdminEmpty, AdminPageHeader, AdminStatCard, AdminTable, Badge } from '../AdminUI'
import { formatDate } from '../admin-helpers'

export const dynamic = 'force-dynamic'

function isMissingTable(message?: string) {
  return Boolean(message && (message.includes("Could not find the table") || message.includes('schema cache') || message.includes('does not exist')))
}

export default async function AdminSystemPage() {
  const { adminClient } = await requireAdminPermission('system.read')
  const alerts = await adminClient
    .from('system_alerts')
    .select('id,source,severity,title,detail,status,created_at,acknowledged_at,resolved_at')
    .order('created_at', { ascending: false })
    .limit(50)

  const usingFallback = Boolean(alerts.error && isMissingTable(alerts.error.message))
  const webhookEvents = usingFallback
    ? await adminClient.from('stripe_webhook_events').select('stripe_event_id,event_type,processing_status,error_message,received_at,processed_at').order('received_at', { ascending: false }).limit(50)
    : { data: [], error: null }

  const rows = usingFallback
    ? (webhookEvents.data || []).map((row) => ({
        id: String(row.stripe_event_id),
        source: 'Stripe',
        severity: row.processing_status === 'failed' ? 'error' : 'info',
        title: String(row.event_type),
        detail: String(row.error_message || ''),
        status: row.processing_status === 'failed' ? 'open' : 'resolved',
        created_at: String(row.received_at),
      }))
    : (alerts.data || [])

  const loadError = usingFallback ? webhookEvents.error?.message : alerts.error?.message
  const openCount = rows.filter((row) => row.status === 'open').length
  const criticalCount = rows.filter((row) => row.severity === 'critical' || row.severity === 'error').length
  const resolvedCount = rows.filter((row) => row.status === 'resolved').length

  return (
    <main className="px-4 py-7 sm:px-6 lg:px-8">
      <AdminPageHeader eyebrow="Plattform" title="Systemstatus" description="Operativa larm från betalningar, databas, integrationer och bakgrundsjobb med tydligt ägarskap." />
      {usingFallback ? (
        <div className="mb-6 rounded-[12px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
          <span className="font-semibold">Begränsat läge:</span> Den samlade larmtabellen väntar på databasmigration. Nedan visas riktiga Stripe-webhookhändelser så att betalningsintegrationen fortfarande kan övervakas.
        </div>
      ) : null}
      <section className="mb-6 grid gap-4 sm:grid-cols-3">
        <AdminStatCard label="Öppna" value={openCount} helper={usingFallback ? 'Misslyckade webhookhändelser' : 'Kräver hantering'} />
        <AdminStatCard label="Allvarliga" value={criticalCount} helper="Fel eller kritiska händelser" />
        <AdminStatCard label="Lösta" value={resolvedCount} helper="I aktuell historik" />
      </section>
      {loadError ? (
        <AdminEmpty text="Systemdata kunde inte hämtas just nu. Kontrollera databaskopplingen och försök igen." />
      ) : !rows.length ? (
        <AdminEmpty text={usingFallback ? 'Inga Stripe-webhookhändelser har registrerats ännu.' : 'Inga systemlarm har registrerats.'} />
      ) : (
        <AdminTable columns={['Källa', 'Allvarlighet', 'Händelse', 'Detalj', 'Status', 'Tidpunkt']}>
          {rows.map((row) => (
            <tr key={String(row.id)} className="hover:bg-[#f8fafc]">
              <td className="px-4 py-4 font-medium text-[#344054]">{row.source}</td>
              <td className="px-4 py-4"><Badge label={row.severity} tone={row.severity === 'critical' || row.severity === 'error' ? 'red' : row.severity === 'warning' ? 'amber' : 'blue'} /></td>
              <td className="max-w-[260px] px-4 py-4 text-[#344054]">{row.title}</td>
              <td className="max-w-[340px] px-4 py-4 text-[#667085]"><span className="line-clamp-3">{row.detail || 'Ingen ytterligare information'}</span></td>
              <td className="px-4 py-4"><Badge label={row.status === 'open' ? 'Öppen' : row.status === 'resolved' ? 'Löst' : 'Bekräftad'} tone={row.status === 'open' ? 'red' : row.status === 'resolved' ? 'green' : 'amber'} /></td>
              <td className="px-4 py-4 text-[#475467]">{formatDate(row.created_at)}</td>
            </tr>
          ))}
        </AdminTable>
      )}
    </main>
  )
}
