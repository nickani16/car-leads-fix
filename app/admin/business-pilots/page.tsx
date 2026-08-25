import Link from 'next/link'
import AdminResourcePage from '../AdminResourcePage'
import type { AdminSearchParams } from '../admin-helpers'

export const dynamic = 'force-dynamic'

export default function AdminBusinessPilotsPage({ searchParams }: { searchParams: AdminSearchParams }) {
  return (
    <AdminResourcePage
      searchParams={searchParams}
      permission="business_pilots.read"
      table="business_pilot_applications"
      select="id,company_name,country_code,contact_name,contact_email,inventory_size_range,preferred_integration_method,status,assigned_admin_user_id,submitted_at"
      title="Företagspiloter"
      eyebrow="Dealer operations"
      description="Ansökningar, teknisk granskning, onboarding och aktiva pilotprogram i en spårbar kö."
      basePath="/admin/business-pilots"
      searchColumns={['company_name', 'company_registration_number', 'contact_email', 'website_url']}
      statusOptions={[
        { value: 'submitted', label: 'Inskickad' },
        { value: 'under_review', label: 'Granskas' },
        { value: 'more_information_required', label: 'Komplettering krävs' },
        { value: 'technical_review', label: 'Teknisk granskning' },
        { value: 'approved', label: 'Godkänd' },
        { value: 'onboarding', label: 'Onboarding' },
        { value: 'pilot_active', label: 'Pilot aktiv' },
        { value: 'pilot_paused', label: 'Pilot pausad' },
        { value: 'pilot_completed', label: 'Pilot avslutad' },
        { value: 'rejected', label: 'Avslagen' },
        { value: 'closed', label: 'Stängd' },
      ]}
      columns={[
        { key: 'company_name', label: 'Företag' },
        { key: 'country_code', label: 'Marknad' },
        { key: 'contact_email', label: 'Kontakt' },
        { key: 'inventory_size_range', label: 'Lagerstorlek' },
        { key: 'preferred_integration_method', label: 'Anslutning' },
        { key: 'status', label: 'Status', format: 'status' },
        { key: 'submitted_at', label: 'Inskickad', format: 'date' },
      ]}
      actions={(row) => (
        <Link
          href={`/admin/business-pilots/${String(row.id)}`}
          className="inline-flex min-h-9 items-center rounded-[10px] border border-[#d7deea] bg-white px-3 text-xs font-bold text-[#344054] hover:border-[#0866ff] hover:text-[#0866ff]"
        >
          Öppna
        </Link>
      )}
      emptyText="Inga pilotansökningar matchar filtret."
    />
  )
}
