import AdminResourcePage from '../AdminResourcePage'
import AdminEntityActions from '../AdminEntityActions'
import type { AdminSearchParams } from '../admin-helpers'

export const dynamic = 'force-dynamic'

export default function AdminMediaPage({ searchParams }: { searchParams: AdminSearchParams }) {
  return (
    <AdminResourcePage
      searchParams={searchParams}
      permission="media.read"
      table="media_assets"
      select="id,object_path,mime_type,byte_size,width,height,alt_text,usage_count,status,created_at"
      title="Media"
      eyebrow="Bibliotek"
      description="Sökbart bildbibliotek med tillgänglighetstext, dimensioner, användning och livscykelstatus."
      basePath="/admin/media"
      searchColumns={['object_path', 'alt_text']}
      statusOptions={[
        { value: 'active', label: 'Aktiv' },
        { value: 'archived', label: 'Arkiverad' },
        { value: 'deleted', label: 'Raderad' },
      ]}
      columns={[
        { key: 'object_path', label: 'Objekt' },
        { key: 'mime_type', label: 'Format' },
        { key: 'width', label: 'Bredd' },
        { key: 'height', label: 'Höjd' },
        { key: 'usage_count', label: 'Användning' },
        { key: 'status', label: 'Status', format: 'status' },
        { key: 'created_at', label: 'Uppladdad', format: 'date' },
      ]}
      actions={(row) => (
        <AdminEntityActions endpoint={`/api/admin/media/${String(row.id)}`} actions={[
          { action: 'archive', label: 'Arkivera', tone: 'danger', requiresReason: true },
        ]} />
      )}
      actionsPermission="media.manage"
      emptyText="Inga mediafiler matchar filtret."
    />
  )
}
