import AdminResourcePage from '../../AdminResourcePage'
import type { AdminSearchParams } from '../../admin-helpers'

export const dynamic = 'force-dynamic'

export default function AdminIpBlocksPage({ searchParams }: { searchParams: AdminSearchParams }) {
  return (
    <AdminResourcePage
      searchParams={searchParams}
      permission="security.manage"
      table="ip_blocks"
      select="id,ip_network,status,reason,starts_at,ends_at,revoked_at,created_at"
      title="IP-spärrar"
      eyebrow="Säkerhet"
      description="Tidsbegränsade nätverksspärrar med ägare, motivering och automatisk sluttid. Endast säkerhetsansvariga har åtkomst."
      basePath="/admin/security/blocks"
      searchColumns={['reason']}
      statusOptions={[
        { value: 'active', label: 'Aktiv' },
        { value: 'expired', label: 'Utgången' },
        { value: 'revoked', label: 'Återkallad' },
      ]}
      columns={[
        { key: 'ip_network', label: 'Nätverk' },
        { key: 'reason', label: 'Motivering' },
        { key: 'status', label: 'Status', format: 'status' },
        { key: 'starts_at', label: 'Start', format: 'date' },
        { key: 'ends_at', label: 'Slut', format: 'date' },
      ]}
      emptyText="Inga IP-spärrar matchar filtret."
    />
  )
}
