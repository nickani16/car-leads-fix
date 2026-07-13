import { AdminPageHeader } from '../AdminUI'
import Link from 'next/link'
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
      <div className="mb-5 flex justify-end">
        <Link href="/admin/companies/verification" className="rounded-[10px] border border-[#d7deea] bg-white px-4 py-2 text-sm font-bold text-[#344054]">
          Verifieringskö
        </Link>
      </div>
      <ProfileAdminList
        searchParams={searchParams}
        accountType="business"
        basePath="/admin/companies"
        permission="companies.read"
      />
    </main>
  )
}
