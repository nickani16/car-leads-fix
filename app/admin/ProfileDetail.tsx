import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAdminPermission } from '@/lib/admin-auth'
import type { AdminPermission } from '@/lib/admin/permissions'
import AdminEntityActions from './AdminEntityActions'
import { AdminPageHeader, AdminTable, Badge, DetailCard, DetailGrid } from './AdminUI'
import { categoryLabel, formatDate, profileName, statusTone } from './admin-helpers'

export default async function ProfileDetail({
  userId,
  backHref,
  permission = 'users.read',
}: {
  userId: string
  backHref: string
  permission?: AdminPermission
}) {
  const { adminClient, permissions } = await requireAdminPermission(permission)
  const accountActions = [
    ...(permissions.includes('users.manage')
      ? [
          { action: 'suspend', label: 'Pausa konto', requiresReason: true },
          { action: 'activate', label: 'Aktivera konto' },
        ]
      : []),
    ...(permissions.includes('users.delete')
      ? [{
          action: 'delete',
          label: 'Radera konto',
          tone: 'danger' as const,
          requiresReason: true,
          confirmTitle: 'Radera konto',
          confirmText: 'Kontot mjukraderas/spärras. Alla åtgärder loggas i admin audit log.',
        }]
      : []),
  ]
  const [{ data: profile }, { data: listings }] = await Promise.all([
    adminClient
      .from('marketplace_profiles')
      .select(`
        user_id,
        account_type,
        email,
        phone,
        country_code,
        city,
        first_name,
        last_name,
        display_name,
        company_name,
        registration_number,
        vat_number,
        website_url,
        company_id,
        business_verification_status,
        company_domain_match,
        company_verification_note,
        risk_status,
        created_at,
        updated_at
      `)
      .eq('user_id', userId)
      .maybeSingle(),
    adminClient
      .from('marketplace_listings')
      .select('id,title,category,status,review_status,country_code,city,created_at')
      .eq('seller_user_id', userId)
      .order('created_at', { ascending: false })
      .limit(40),
  ])

  if (!profile) notFound()

  return (
    <main className="px-4 py-7 sm:px-6 lg:px-8">
      <AdminPageHeader
        eyebrow={profile.account_type === 'business' ? 'Företag' : 'Användare'}
        title={profileName(profile)}
        description="Kontaktuppgifter, kontostatus, annonser och administrativa åtgärder för kontot."
        backHref={backHref}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <DetailCard title="Profil">
            <DetailGrid
              items={[
                { label: 'User ID', value: profile.user_id },
                { label: 'Typ', value: profile.account_type === 'business' ? 'Företag' : 'Privatperson' },
                { label: 'E-post', value: profile.email },
                { label: 'Telefon', value: profile.phone },
                { label: 'Land', value: profile.country_code },
                { label: 'Stad', value: profile.city },
                { label: 'Företag', value: profile.company_name },
                { label: 'Organisationsnummer', value: profile.registration_number },
                { label: 'VAT', value: profile.vat_number },
                { label: 'Webbplats', value: profile.website_url },
                { label: 'Företagsverifiering', value: companyVerificationLabel(profile.business_verification_status) },
                { label: 'Domänmatchning', value: profile.company_domain_match ? 'Ja' : 'Nej' },
                { label: 'Intern verifieringsnotering', value: profile.company_verification_note },
                { label: 'Riskstatus', value: profile.risk_status || 'standard' },
                { label: 'Skapad', value: formatDate(profile.created_at) },
                { label: 'Uppdaterad', value: formatDate(profile.updated_at) },
              ]}
            />
          </DetailCard>

          <DetailCard title="Annonser">
            {listings?.length ? (
              <AdminTable columns={['Annons', 'Kategori', 'Plats', 'Status', 'Skapad']}>
                {listings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-[#f8fafc]">
                    <td className="px-4 py-4">
                      <Link href={`/admin/listings/${listing.id}`} className="font-bold text-[#101828] hover:text-[#0866ff]">
                        {listing.title}
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-[#475467]">{categoryLabel(listing.category)}</td>
                    <td className="px-4 py-4 text-[#475467]">
                      {listing.city || 'Saknas'}, {listing.country_code || '--'}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Badge label={listing.status || 'okänd'} tone={statusTone(listing.status)} />
                        <Badge label={listing.review_status || 'ej satt'} tone={statusTone(listing.review_status)} />
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[#667085]">{formatDate(listing.created_at)}</td>
                  </tr>
                ))}
              </AdminTable>
            ) : (
              <p className="text-sm text-[#667085]">Kontot har inga annonser.</p>
            )}
          </DetailCard>
        </div>

        <aside className="space-y-6">
          {accountActions.length || (profile.account_type === 'business' && permissions.includes('companies.verify')) ? <DetailCard title="Admin actions">
            <AdminEntityActions
              endpoint={`/api/admin/users/${profile.user_id}`}
              actions={[
                ...(profile.account_type === 'business' && permissions.includes('companies.verify')
                  ? [
                      {
                        action: 'company_verified',
                        label: 'Godkänn företag',
                        requiresReason: true,
                      },
                      {
                        action: 'company_pending_review',
                        label: 'Sätt granskning',
                        requiresReason: true,
                      },
                      {
                        action: 'company_rejected',
                        label: 'Neka företag',
                        tone: 'danger' as const,
                        requiresReason: true,
                        confirmTitle: 'Neka företagsverifiering',
                        confirmText: 'Företaget kan inte publicera nya annonser medan verifieringen är nekad.',
                      },
                    ]
                  : []),
                ...accountActions,
              ]}
            />
          </DetailCard> : null}
        </aside>
      </div>
    </main>
  )
}

function companyVerificationLabel(status?: string | null) {
  if (status === 'verified' || status === 'vat_validated') return 'Verifierat företag'
  if (status === 'rejected') return 'Verifiering nekad'
  if (status === 'pending_review' || status === 'pending' || status === 'needs_review') {
    return 'Verifiering pågår'
  }
  return 'Ej verifierat företag'
}
