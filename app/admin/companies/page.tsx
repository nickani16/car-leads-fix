import { AdminPageHeader } from '../AdminUI'
import ProfileAdminList from '../ProfileAdminList'
import type { AdminSearchParams } from '../admin-helpers'

export const dynamic = 'force-dynamic'

export default function AdminCompaniesPage({
  searchParams,
}: {
  searchParams: AdminSearchParams
}) {
  return (
    <main className="px-4 py-7 sm:px-6 lg:px-8">
      <AdminPageHeader
        eyebrow="Business"
        title="Företag"
        description="Hantera företagskonton, kontaktuppgifter, annonser och riskstatus för handlare och återkommande säljare."
      />
      <ProfileAdminList
        searchParams={searchParams}
        accountType="business"
        basePath="/admin/companies"
      />
    </main>
  )
}
