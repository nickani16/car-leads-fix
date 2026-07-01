import Link from 'next/link'
import { requireAdmin } from '@/lib/admin-auth'
import AdminEntityActions from './AdminEntityActions'
import {
  AdminEmpty,
  AdminFilters,
  AdminPagination,
  AdminTable,
  Badge,
  FilterSelect,
} from './AdminUI'
import {
  AdminSearchParams,
  formatDate,
  getPage,
  getParam,
  pageRange,
  profileName,
  queryToUrlSearchParams,
  statusTone,
} from './admin-helpers'

type ProfileAdminListProps = {
  searchParams: AdminSearchParams
  accountType?: 'business' | 'private'
  basePath: string
}

export default async function ProfileAdminList({
  searchParams,
  accountType,
  basePath,
}: ProfileAdminListProps) {
  const params = await searchParams
  const q = getParam(params, 'q')
  const type = accountType || getParam(params, 'type')
  const country = getParam(params, 'country').toUpperCase()
  const page = getPage(params)
  const { from, to } = pageRange(page)
  const { adminClient } = await requireAdmin()

  let query = adminClient
    .from('marketplace_profiles')
    .select(
      'user_id,account_type,display_name,legal_name,email,phone,country_code,company_name,registration_number,vat_number,website_url,city,risk_status,business_verification_status,company_domain_match,created_at,updated_at',
      { count: 'exact' },
    )
    .order('created_at', { ascending: false })
    .range(from, to)

  if (type === 'business' || type === 'private') query = query.eq('account_type', type)
  if (country) query = query.eq('country_code', country)
  if (q) {
    const escaped = q.replace(/[%_,]/g, '')
    query = query.or(
      `display_name.ilike.%${escaped}%,legal_name.ilike.%${escaped}%,email.ilike.%${escaped}%,phone.ilike.%${escaped}%,company_name.ilike.%${escaped}%,registration_number.ilike.%${escaped}%,vat_number.ilike.%${escaped}%`,
    )
  }

  const { data: profiles, count } = await query
  const urlQuery = queryToUrlSearchParams(params)

  if (!profiles?.length) {
    return (
      <>
        <AdminFilters search={q} searchPlaceholder="Sök namn, e-post, telefon, företag eller orgnr">
          {!accountType ? (
            <FilterSelect
              name="type"
              value={type}
              label="Typ"
              options={[
                { value: 'business', label: 'Företag' },
                { value: 'private', label: 'Privatperson' },
              ]}
            />
          ) : null}
          <FilterSelect
            name="country"
            value={country}
            label="Land"
            options={[
              { value: 'SE', label: 'Sverige' },
              { value: 'DE', label: 'Tyskland' },
              { value: 'DK', label: 'Danmark' },
              { value: 'NL', label: 'Nederländerna' },
              { value: 'FR', label: 'Frankrike' },
            ]}
          />
        </AdminFilters>
        <AdminEmpty text="Inga konton matchar filtret." />
      </>
    )
  }

  return (
    <>
      <AdminFilters search={q} searchPlaceholder="Sök namn, e-post, telefon, företag eller orgnr">
        {!accountType ? (
          <FilterSelect
            name="type"
            value={type}
            label="Typ"
            options={[
              { value: 'business', label: 'Företag' },
              { value: 'private', label: 'Privatperson' },
            ]}
          />
        ) : null}
        <FilterSelect
          name="country"
          value={country}
          label="Land"
          options={[
            { value: 'SE', label: 'Sverige' },
            { value: 'DE', label: 'Tyskland' },
            { value: 'DK', label: 'Danmark' },
            { value: 'NL', label: 'Nederländerna' },
            { value: 'FR', label: 'Frankrike' },
          ]}
        />
      </AdminFilters>

      <AdminTable columns={['Konto', 'Kontakt', 'Typ', 'Land', 'Status', 'Granskning', 'Skapad', 'Actions']}>
        {profiles.map((profile) => (
          <tr key={profile.user_id} className="align-top hover:bg-[#f8fafc]">
            <td className="px-4 py-4">
              <Link
                href={`${basePath}/${profile.user_id}`}
                className="font-bold text-[#101828] hover:text-[#0866ff]"
              >
                {profileName(profile)}
              </Link>
              <p className="mt-1 text-xs text-[#667085]">
                {profile.registration_number || profile.vat_number || profile.user_id}
              </p>
            </td>
            <td className="px-4 py-4 text-[#475467]">
              <p>{profile.email}</p>
              <p className="mt-1 text-xs">{profile.phone}</p>
            </td>
            <td className="px-4 py-4">
              <Badge label={profile.account_type === 'business' ? 'Företag' : 'Privat'} tone="gray" />
            </td>
            <td className="px-4 py-4 text-[#475467]">{profile.country_code}</td>
            <td className="px-4 py-4">
              <Badge label={profile.risk_status || 'standard'} tone={statusTone(profile.risk_status || 'standard')} />
            </td>
            <td className="px-4 py-4">
              {profile.account_type === 'business' ? (
                <div className="flex flex-wrap gap-2">
                  <Badge
                    label={companyVerificationLabel(profile.business_verification_status)}
                    tone={companyVerificationTone(profile.business_verification_status)}
                  />
                  <Badge
                    label={profile.company_domain_match ? 'Domän OK' : 'Manuell'}
                    tone={profile.company_domain_match ? 'green' : 'amber'}
                  />
                </div>
              ) : (
                <Badge label="E-post" tone="green" />
              )}
            </td>
            <td className="px-4 py-4 text-[#667085]">{formatDate(profile.created_at)}</td>
            <td className="px-4 py-4">
              <AdminEntityActions
                endpoint={`/api/admin/users/${profile.user_id}`}
                actions={[
                  { action: 'suspend', label: 'Pausa', requiresReason: true },
                  { action: 'activate', label: 'Aktivera' },
                  {
                    action: 'delete',
                    label: 'Radera',
                    tone: 'danger',
                    requiresReason: true,
                    confirmTitle: 'Radera konto',
                    confirmText: 'Kontot mjukraderas/spärras och användaren kan inte fortsätta använda Autorell.',
                  },
                ]}
              />
            </td>
          </tr>
        ))}
      </AdminTable>
      <AdminPagination
        page={page}
        hasNext={(count || 0) > to + 1}
        basePath={basePath}
        query={urlQuery}
      />
    </>
  )
}

function companyVerificationLabel(status?: string | null) {
  if (status === 'verified' || status === 'vat_validated') return 'Verifierat'
  if (status === 'rejected') return 'Nekad'
  if (status === 'pending_review' || status === 'pending' || status === 'needs_review') {
    return 'Granskas'
  }
  return 'Ej verifierat'
}

function companyVerificationTone(
  status?: string | null,
): 'blue' | 'green' | 'amber' | 'red' | 'gray' {
  if (status === 'verified' || status === 'vat_validated') return 'green'
  if (status === 'rejected') return 'red'
  if (status === 'pending_review' || status === 'pending' || status === 'needs_review') return 'amber'
  return 'gray'
}
