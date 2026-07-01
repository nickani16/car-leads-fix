import { AdminPageHeader } from '../AdminUI'
import ProfileAdminList from '../ProfileAdminList'
import type { AdminSearchParams } from '../admin-helpers'

export const dynamic = 'force-dynamic'

export default function AdminUsersPage({
  searchParams,
}: {
  searchParams: AdminSearchParams
}) {
  return (
    <main className="px-4 py-7 sm:px-6 lg:px-8">
      <AdminPageHeader
        eyebrow="Konton"
        title="Användare"
        description="Sök, filtrera och öppna alla Autorell-konton. Härifrån kan admin pausa, aktivera eller radera konton med spårbar intern anledning."
      />
      <ProfileAdminList searchParams={searchParams} basePath="/admin/users" />
    </main>
  )
}
