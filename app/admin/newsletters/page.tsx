import AdminEntityActions from '../AdminEntityActions'
import AdminDraftForm from '../AdminDraftForm'
import AdminResourcePage from '../AdminResourcePage'
import type { AdminSearchParams } from '../admin-helpers'

export const dynamic = 'force-dynamic'

export default function AdminNewslettersPage({ searchParams }: { searchParams: AdminSearchParams }) {
  return (
    <AdminResourcePage
      searchParams={searchParams}
      permission="newsletters.read"
      table="newsletter_campaigns"
      select="id,name,subject,market,language,status,scheduled_at,sent_at,updated_at"
      title="Nyhetsbrev"
      eyebrow="Kommunikation"
      description="Kampanjutkast, segmentering och godkännandesteg. Utskick kan inte startas från den här vyn utan en separat leveransintegration och samtyckeskontroll."
      basePath="/admin/newsletters"
      searchColumns={['name', 'subject']}
      statusOptions={[
        { value: 'draft', label: 'Utkast' },
        { value: 'review', label: 'Granskning' },
        { value: 'scheduled', label: 'Schemalagd' },
        { value: 'sent', label: 'Skickad' },
        { value: 'cancelled', label: 'Avbruten' },
      ]}
      columns={[
        { key: 'name', label: 'Kampanj' },
        { key: 'subject', label: 'Ämnesrad' },
        { key: 'market', label: 'Marknad' },
        { key: 'language', label: 'Språk' },
        { key: 'status', label: 'Status', format: 'status' },
        { key: 'scheduled_at', label: 'Schemalagd', format: 'date' },
      ]}
      actions={(row) => (
        <AdminEntityActions
          endpoint={`/api/admin/newsletters/${String(row.id)}`}
          actions={[
            { action: 'review', label: 'Till granskning' },
            { action: 'cancel', label: 'Avbryt', tone: 'danger', requiresReason: true },
          ]}
        />
      )}
      actionsPermission="newsletters.manage"
      emptyText="Inga nyhetsbrevskampanjer matchar filtret."
      toolbar={<AdminDraftForm mode="newsletter" />}
      toolbarPermission="newsletters.manage"
    />
  )
}
