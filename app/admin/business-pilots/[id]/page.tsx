import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAdminPermission } from '@/lib/admin-auth'
import { AdminPageHeader, Badge, DetailCard, DetailGrid } from '../../AdminUI'
import { formatDate, statusTone } from '../../admin-helpers'
import { localizePublicHref, type PublicLocale } from '@/lib/public-i18n'
import BusinessPilotAdminControls from './BusinessPilotAdminControls'

export const dynamic = 'force-dynamic'

const requiredInventoryFlags = [
  'business_pilot_program',
  'dealer_inventory_import',
  'dealer_website_import',
  'dealer_inventory_sync',
] as const

export default async function AdminBusinessPilotDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const context = await requireAdminPermission('business_pilots.read')
  const { data: application, error } = await context.adminClient
    .from('business_pilot_applications')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error || !application) notFound()

  const [{ data: events }, { data: program }, { data: deliveries }, { data: organization }, { data: members }, { data: flags }] = await Promise.all([
    context.adminClient.from('business_pilot_application_events').select('*').eq('application_id', id).order('created_at', { ascending: false }).limit(100),
    context.adminClient.from('business_pilot_programs').select('*').eq('application_id', id).maybeSingle(),
    context.adminClient.from('business_pilot_email_deliveries').select('id,email_type,locale,recipient_email,status,sent_at,created_at,error_message').eq('application_id', id).order('created_at', { ascending: false }).limit(40),
    application.organization_id
      ? context.adminClient.from('marketplace_companies').select('id,name,registration_number,verification_status,created_by').eq('id', application.organization_id).maybeSingle()
      : Promise.resolve({ data: null }),
    application.organization_id
      ? context.adminClient.from('marketplace_company_members').select('user_id,role,created_at').eq('company_id', application.organization_id).order('created_at', { ascending: true })
      : Promise.resolve({ data: [] }),
    application.organization_id
      ? context.adminClient.from('feature_flag_overrides').select('flag_key,enabled,pilot_program_id,environment').eq('organization_id', application.organization_id).eq('environment', businessPilotEnvironment())
      : Promise.resolve({ data: [] }),
  ])

  const memberUserIds = (members || []).map((member) => String(member.user_id))
  const { data: memberProfiles } = memberUserIds.length
    ? await context.adminClient.from('marketplace_profiles').select('user_id,display_name,email').in('user_id', memberUserIds)
    : { data: [] }
  const profilesByUserId = new Map((memberProfiles || []).map((profile) => [String(profile.user_id), profile]))
  const flagState = new Map<string, boolean>()
  for (const flag of (flags || []).sort((left, right) => Number(Boolean(left.pilot_program_id)) - Number(Boolean(right.pilot_program_id)))) {
    if (!flag.pilot_program_id || flag.pilot_program_id === program?.id) {
      flagState.set(String(flag.flag_key), Boolean(flag.enabled))
    }
  }
  const hasManagingMember = (members || []).some((member) => ['owner', 'admin', 'manager'].includes(String(member.role)))
  const hasInventoryAccess = Boolean(
    organization &&
    program?.status === 'pilot_active' &&
    program?.is_free === true &&
    program?.automatic_conversion_enabled === false &&
    hasManagingMember &&
    requiredInventoryFlags.every((flag) => flagState.get(flag) === true),
  )
  const inventoryHref = localizePublicHref(
    String(application.locale || 'en') as PublicLocale,
    '/account/company/inventory',
  )

  const canManage = context.permissions.includes('business_pilots.manage')

  return (
    <main className="px-4 py-7 sm:px-6 lg:px-8">
      <AdminPageHeader
        eyebrow="Företagspilot"
        title={String(application.company_name)}
        description="Fullständigt ansökningsunderlag, programvillkor, kommunikation och ändringshistorik."
        backHref="/admin/business-pilots"
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Badge label={statusLabel(String(application.status))} tone={statusTone(String(application.status))} />
        <span className="font-mono text-xs text-[#667085]">{application.id}</span>
        {application.website_url ? <Link href={String(application.website_url)} target="_blank" rel="noreferrer" className="text-sm font-semibold text-[#0866ff] hover:underline">Öppna webbplats</Link> : null}
        {application.organization_id ? <Link href={inventoryHref} target="_blank" className="inline-flex min-h-10 items-center rounded-[10px] border border-[#0866ff] bg-[#0866ff] px-4 text-sm font-bold text-white hover:bg-[#075ce6]">Öppna företagets lageranslutning</Link> : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <DetailCard title="Ansökan">
          <DetailGrid items={[
            { label: 'Organisationsnummer', value: application.company_registration_number },
            { label: 'Land', value: application.country_code },
            { label: 'Marknad och språk', value: `${application.market_code} / ${application.locale}` },
            { label: 'Inskickad', value: formatDate(application.submitted_at) },
            { label: 'Lagerstorlek', value: application.inventory_size_range },
            { label: 'Beräknat antal', value: application.estimated_inventory_count },
            { label: 'Antal anläggningar', value: application.location_count },
            { label: 'Nuvarande system', value: application.current_inventory_system },
            { label: 'Önskad anslutning', value: application.preferred_integration_method },
            { label: 'Företags-ID', value: application.organization_id },
          ]} />
          {application.message ? <p className="mt-5 whitespace-pre-wrap rounded-[12px] bg-[#f8fafc] p-4 text-sm leading-6 text-[#475467]">{String(application.message)}</p> : null}
        </DetailCard>

        <DetailCard title="Kontakt och samtycken">
          <DetailGrid items={[
            { label: 'Kontaktperson', value: application.contact_name },
            { label: 'Roll', value: application.contact_role },
            { label: 'E-post', value: application.contact_email },
            { label: 'Telefon', value: application.contact_phone },
            { label: 'Integritet godkänd', value: formatDate(application.privacy_consent_at) },
            { label: 'Kontakt godkänd', value: formatDate(application.contact_consent_at) },
            { label: 'Integritetsversion', value: application.privacy_version },
            { label: 'Tilldelad admin', value: application.assigned_admin_user_id },
          ]} />
        </DetailCard>

        <DetailCard title="Pilotprogram">
          {program ? (
            <DetailGrid items={[
              { label: 'Program-ID', value: program.id },
              { label: 'Status', value: statusLabel(String(program.status)) },
              { label: 'Start', value: program.start_date || 'Ej startad' },
              { label: 'Planerat slut', value: program.planned_end_date },
              { label: 'Kostnadsfri', value: program.is_free ? 'Ja' : 'Nej' },
              { label: 'Automatisk övergång', value: program.automatic_conversion_enabled ? 'Ja' : 'Nej' },
              { label: 'Separat avtal krävs', value: program.commercial_agreement_required ? 'Ja' : 'Nej' },
              { label: 'Villkor', value: program.terms_version },
              { label: 'Villkor godkända', value: program.terms_accepted_at ? formatDate(program.terms_accepted_at) : 'Nej' },
              { label: 'Godkänt av', value: program.terms_accepted_by },
            ]} />
          ) : <p className="text-sm text-[#667085]">Inget pilotprogram har skapats ännu.</p>}
        </DetailCard>

        <DetailCard title="Åtkomst och koppling">
          <DetailGrid items={[
            { label: 'Organisation', value: organization ? `${organization.name} · ${organization.id}` : 'Ej kopplad' },
            {
              label: 'Kopplade användare',
              value: members?.length ? (
                <span className="grid gap-1">
                  {members.map((member) => {
                    const profile = profilesByUserId.get(String(member.user_id))
                    return <span key={member.user_id}>{profile?.display_name || profile?.email || member.user_id} · {member.role}</span>
                  })}
                </span>
              ) : 'Inga användare',
            },
            { label: 'Pilotstatus', value: program ? statusLabel(String(program.status)) : 'Pilot saknas' },
            {
              label: 'Feature flags',
              value: (
                <span className="grid gap-1 font-mono text-xs">
                  {requiredInventoryFlags.map((flag) => <span key={flag}>{flag}: {flagState.get(flag) === true ? 'på' : 'av'}</span>)}
                </span>
              ),
            },
            { label: 'Lagerimportåtkomst', value: hasInventoryAccess ? 'Aktiv' : 'Saknas' },
            { label: 'Betalning krävs', value: program?.is_free === true && program?.automatic_conversion_enabled === false ? 'Nej' : 'Kontroll krävs' },
          ]} />
        </DetailCard>

        {canManage ? (
          <DetailCard title="Handläggning">
            <BusinessPilotAdminControls
              applicationId={id}
              organizationId={application.organization_id}
              contactName={String(application.contact_name || '')}
              contactRole={application.contact_role ? String(application.contact_role) : null}
              hasProgram={Boolean(program)}
            />
          </DetailCard>
        ) : null}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <DetailCard title="Händelser">
          <div className="grid gap-3">
            {(events || []).map((event) => (
              <article key={event.id} className="rounded-[12px] bg-[#f8fafc] p-4 text-sm">
                <div className="flex flex-wrap justify-between gap-2"><strong>{event.event_type}</strong><span className="text-[#667085]">{formatDate(event.created_at)}</span></div>
                {event.from_status || event.to_status ? <p className="mt-2 text-[#475467]">{event.from_status || '–'} → {event.to_status || '–'}</p> : null}
                {event.note ? <p className="mt-2 whitespace-pre-wrap text-[#475467]">{event.note}</p> : null}
              </article>
            ))}
            {!events?.length ? <p className="text-sm text-[#667085]">Ingen historik ännu.</p> : null}
          </div>
        </DetailCard>

        <DetailCard title="Mejlleveranser">
          <div className="grid gap-3">
            {(deliveries || []).map((delivery) => (
              <article key={delivery.id} className="rounded-[12px] bg-[#f8fafc] p-4 text-sm">
                <div className="flex flex-wrap justify-between gap-2"><strong>{delivery.email_type}</strong><Badge label={delivery.status} tone={statusTone(String(delivery.status))} /></div>
                <p className="mt-2 break-all text-[#475467]">{delivery.recipient_email} · {delivery.locale}</p>
                <p className="mt-1 text-xs text-[#667085]">{formatDate(delivery.sent_at || delivery.created_at)}</p>
                {delivery.error_message ? <p className="mt-2 text-red-700">{delivery.error_message}</p> : null}
              </article>
            ))}
            {!deliveries?.length ? <p className="text-sm text-[#667085]">Inga mejlleveranser ännu.</p> : null}
          </div>
        </DetailCard>
      </div>
    </main>
  )
}

function statusLabel(status: string) {
  return ({
    submitted: 'Inskickad', under_review: 'Granskas', more_information_required: 'Komplettering krävs',
    contacted: 'Kontaktad', technical_review: 'Teknisk granskning', approved: 'Godkänd', rejected: 'Avslagen',
    onboarding: 'Onboarding', pilot_active: 'Pilot aktiv', pilot_paused: 'Pilot pausad', pilot_completed: 'Pilot avslutad',
    commercial_discussion: 'Kommersiell dialog', commercial_customer: 'Separat avtal klart', closed: 'Stängd',
  } as Record<string, string>)[status] || status
}

function businessPilotEnvironment() {
  return process.env.VERCEL_ENV === 'production'
    ? 'production'
    : process.env.VERCEL_ENV === 'preview'
      ? 'preview'
      : process.env.NODE_ENV === 'test'
        ? 'test'
        : 'development'
}
