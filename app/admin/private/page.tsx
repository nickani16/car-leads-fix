import { AdminPageHeader } from '../AdminUI'
import ProfileAdminList from '../ProfileAdminList'
import type { AdminSearchParams } from '../admin-helpers'

export const dynamic = 'force-dynamic'

export default function AdminPrivatePage({
  searchParams,
}: {
  searchParams: AdminSearchParams
}) {
  return (
    <main className="px-4 py-7 sm:px-6 lg:px-8">
      <AdminPageHeader
        eyebrow="Privata konton"
        title="Privatpersoner"
        description="Se privata säljare, kontaktuppgifter, annonser och kontostatus. Känsliga åtgärder kräver bekräftelse."
      />
      <ProfileAdminList
        searchParams={searchParams}
        accountType="private"
        basePath="/admin/private"
      />
    </main>
  )
}
