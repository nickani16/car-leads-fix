import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { requireAdmin } from '@/lib/admin-auth'
import {
  AdminEmpty,
  AdminFilters,
  AdminPageHeader,
  Badge,
  FilterSelect,
} from '../AdminUI'

type SearchParams = Promise<{
  q?: string
  country?: string
  status?: string
}>

export default async function AdminDealersPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const { adminClient } = await requireAdmin()
  const { data } = await adminClient
    .from('dealers')
    .select(
      'id,user_id,company_name,vat_number,country,country_code,contact_person,email,phone,status,created_at'
    )
    .order('created_at', { ascending: false })
    .limit(1000)

  const dealers = data || []
  const query = (params.q || '').trim().toLowerCase()
  const filtered = dealers.filter((dealer) => {
    const matchesQuery =
      !query ||
      [
        dealer.company_name,
        dealer.contact_person,
        dealer.email,
        dealer.phone,
        dealer.vat_number,
        dealer.user_id,
      ].some((value) => String(value || '').toLowerCase().includes(query))
    const country = dealer.country_code || dealer.country || ''
    return (
      matchesQuery &&
      (!params.country || country === params.country) &&
      (!params.status || dealer.status === params.status)
    )
  })

  const countries = Array.from(
    new Set(
      dealers
        .map((dealer) => dealer.country_code || dealer.country)
        .filter((value): value is string => Boolean(value))
    )
  ).sort()

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <AdminPageHeader
        eyebrow="Dealer operations"
        title="Dealer directory"
        description="Search every applicant, approved dealer and authorised contact across all markets."
      />
      <AdminFilters
        search={params.q}
        searchPlaceholder="Search company, contact, email, phone, VAT or user ID"
      >
        <FilterSelect
          name="country"
          value={params.country}
          label="All countries"
          options={countries.map((country) => ({
            value: country,
            label: country,
          }))}
        />
        <FilterSelect
          name="status"
          value={params.status}
          label="All statuses"
          options={[
            { value: 'approved', label: 'Approved' },
            { value: 'pending', label: 'Pending' },
            { value: 'rejected', label: 'Rejected / suspended' },
          ]}
        />
      </AdminFilters>

      <div className="mb-4 text-sm text-[#73797c]">
        {filtered.length} of {dealers.length} dealers
      </div>

      {filtered.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((dealer) => (
            <article
              key={dealer.id}
              className="rounded-[20px] border border-[#deddd7] bg-white p-5 shadow-[0_10px_30px_rgba(32,33,36,.045)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold">
                    {dealer.company_name || 'Unnamed dealer'}
                  </h2>
                  <p className="mt-1 truncate text-sm text-[#62686c]">
                    {dealer.contact_person || 'No contact person'}
                  </p>
                </div>
                <Badge
                  label={dealer.status || 'pending'}
                  tone={
                    dealer.status === 'approved'
                      ? 'green'
                      : dealer.status === 'rejected'
                        ? 'red'
                        : 'amber'
                  }
                />
              </div>
              <dl className="mt-5 space-y-2 text-sm text-[#62686c]">
                <div className="flex justify-between gap-4">
                  <dt>Email</dt>
                  <dd className="truncate text-[#242424]">{dealer.email}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Country</dt>
                  <dd className="text-[#242424]">
                    {dealer.country_code || dealer.country || 'Unknown'}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>VAT</dt>
                  <dd className="text-[#242424]">{dealer.vat_number || 'Missing'}</dd>
                </div>
              </dl>
              <Link
                href={`/admin/dealers/${dealer.id}`}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#242424] px-4 py-2 text-xs text-white"
              >
                Open dealer
                <ArrowRight size={14} />
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <AdminEmpty text="No dealers match these filters." />
      )}
    </main>
  )
}

