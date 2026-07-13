import AdminEntityActions from '../AdminEntityActions'
import AdminDraftForm from '../AdminDraftForm'
import AdminResourcePage from '../AdminResourcePage'
import type { AdminSearchParams } from '../admin-helpers'

export const dynamic = 'force-dynamic'

export default function AdminContentPage({ searchParams }: { searchParams: AdminSearchParams }) {
  return (
    <AdminResourcePage
      searchParams={searchParams}
      permission="content.read"
      table="content_posts"
      select="id,post_type,title,slug,language,market,status,scheduled_at,published_at,updated_at"
      title="Innehåll & nyheter"
      eyebrow="Publicering"
      description="Versionshanterat redaktionellt innehåll med granskningssteg, marknad, språk och schemalagd publicering."
      basePath="/admin/content"
      searchColumns={['title', 'slug']}
      statusOptions={[
        { value: 'draft', label: 'Utkast' },
        { value: 'review', label: 'Granskning' },
        { value: 'scheduled', label: 'Schemalagd' },
        { value: 'published', label: 'Publicerad' },
        { value: 'archived', label: 'Arkiverad' },
      ]}
      columns={[
        { key: 'title', label: 'Titel' },
        { key: 'post_type', label: 'Typ' },
        { key: 'market', label: 'Marknad' },
        { key: 'language', label: 'Språk' },
        { key: 'status', label: 'Status', format: 'status' },
        { key: 'updated_at', label: 'Uppdaterad', format: 'date' },
      ]}
      actions={(row) => (
        <AdminEntityActions
          endpoint={`/api/admin/content/${String(row.id)}`}
          actions={[
            { action: 'preview', label: 'Förhandsgranska' },
            { action: 'review', label: 'Till granskning' },
            { action: 'publish', label: 'Publicera', requiresReason: true },
            { action: 'unpublish', label: 'Avpublicera', tone: 'danger', requiresReason: true },
            { action: 'archive', label: 'Arkivera', tone: 'danger', requiresReason: true },
          ]}
        />
      )}
      actionsPermission="content.manage"
      emptyText="Inget redaktionellt innehåll matchar filtret."
      toolbar={<AdminDraftForm mode="content" />}
      toolbarPermission="content.manage"
    />
  )
}
