import Link from 'next/link'
import { ArrowRight, Mail, Phone } from 'lucide-react'
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

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const { adminClient } = await requireAdmin()
  const { data } = await adminClient
    .from('leads')
    .select(
      'id,reg,make,model,model_year,miles,phone,email,status,source,origin_country,created_at'
    )
    .order('created_at', { ascending: false })
    .limit(1000)

  const leads = data || []
  const query = (params.q || '').trim().toLowerCase()
  const filtered = leads.filter((lead) => {
    const matchesQuery =
      !query ||
      [
        lead.reg,
        lead.make,
        lead.model,
        lead.email,
        lead.phone,
        lead.id,
      ].some((value) => String(value || '').toLowerCase().includes(query))
    const country = lead.origin_country || lead.source || ''
    const matchesCountry = !params.country || country === params.country
    const matchesStatus =
      !params.status ||
      String(lead.status || 'New').toLowerCase() === params.status.toLowerCase()
    return matchesQuery && matchesCountry && matchesStatus
  })

  const countries = Array.from(
    new Set(
      leads
        .map((lead) => lead.origin_country || lead.source)
        .filter((value): value is string => Boolean(value))
    )
  ).sort()
  const statuses = Array.from(
    new Set(leads.map((lead) => lead.status || 'New'))
  ).sort()

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <AdminPageHeader
        eyebrow="Customer operations"
        title="All leads"
        description="Search every customer and vehicle across all Autorell markets. Contact details are restricted to authorised admins."
      />

      <AdminFilters
        search={params.q}
        searchPlaceholder="Search registration, make, model, email, phone or lead ID"
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
          options={statuses.map((status) => ({
            value: status,
            label: status,
          }))}
        />
      </AdminFilters>

      <div className="mb-4 flex items-center justify-between text-sm text-[#73797c]">
        <span>{filtered.length} leads found</span>
        <span>{leads.length} total</span>
      </div>

      {filtered.length ? (
        <div className="overflow-hidden rounded-[20px] border border-[#deddd7] bg-white shadow-[0_14px_45px_rgba(32,33,36,.05)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="border-b border-[#e5e3dd] bg-[#faf9f6] text-xs uppercase tracking-[0.1em] text-[#858a8c]">
                <tr>
                  <th className="px-5 py-4 font-medium">Vehicle</th>
                  <th className="px-5 py-4 font-medium">Customer</th>
                  <th className="px-5 py-4 font-medium">Country</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium">Submitted</th>
                  <th className="px-5 py-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#efede7]">
                {filtered.map((lead) => (
                  <tr key={lead.id} className="hover:bg-[#fcfbf8]">
                    <td className="px-5 py-4">
                      <p className="font-medium text-[#242424]">
                        {lead.make || 'Unknown make'} {lead.model || ''}
                      </p>
                      <p className="mt-1 text-xs text-[#73797c]">
                        {lead.reg || 'No reg'} · {lead.model_year || 'No year'} ·{' '}
                        {lead.miles || 'No mileage'}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="flex items-center gap-2 text-xs">
                        <Mail size={13} /> {lead.email || 'No email'}
                      </p>
                      <p className="mt-1 flex items-center gap-2 text-xs">
                        <Phone size={13} /> {lead.phone || 'No phone'}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      {lead.origin_country || lead.source || 'Unknown'}
                    </td>
                    <td className="px-5 py-4">
                      <Badge label={lead.status || 'New'} />
                    </td>
                    <td className="px-5 py-4 text-xs text-[#62686c]">
                      {lead.created_at
                        ? new Date(lead.created_at).toLocaleString('sv-SE')
                        : 'Unknown'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/leads/${lead.id}`}
                        className="inline-flex items-center gap-2 rounded-full bg-[#242424] px-4 py-2 text-xs text-white"
                      >
                        Open
                        <ArrowRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <AdminEmpty text="No leads match these filters." />
      )}
    </main>
  )
}

