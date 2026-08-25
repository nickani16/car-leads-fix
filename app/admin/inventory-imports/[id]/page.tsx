import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAdminPermission } from '@/lib/admin-auth'
import { AdminPageHeader, Badge, DetailCard, DetailGrid } from '../../AdminUI'
import { formatDate, formatNumber, statusTone } from '../../admin-helpers'
import InventoryImportAdminControls from './InventoryImportAdminControls'

export const dynamic = 'force-dynamic'

export default async function AdminInventoryImportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const context = await requireAdminPermission('inventory_imports.read')
  const { data: source, error } = await context.adminClient.from('dealer_import_sources').select('*').eq('id', id).maybeSingle()
  if (error || !source) notFound()

  const [companyResult, pilotResult, parserResult, runsResult, itemsResult, verificationsResult, mappingsResult, eventsResult] = await Promise.all([
    context.adminClient.from('marketplace_companies').select('id,name,registration_number,country_code,website_url,contact_email').eq('id', source.organization_id).maybeSingle(),
    source.pilot_program_id ? context.adminClient.from('business_pilot_programs').select('*').eq('id', source.pilot_program_id).maybeSingle() : Promise.resolve({ data: null }),
    source.parser_profile_id ? context.adminClient.from('dealer_parser_profiles').select('*').eq('id', source.parser_profile_id).maybeSingle() : Promise.resolve({ data: null }),
    context.adminClient.from('dealer_import_runs').select('*').eq('source_id', id).order('created_at', { ascending: false }).limit(50),
    context.adminClient.from('dealer_import_items').select('id,vehicle_id,source_url,source_status,sync_status,normalized_payload,parse_confidence,warnings,last_seen_at,updated_at').eq('source_id', id).order('updated_at', { ascending: false }).limit(100),
    context.adminClient.from('dealer_site_verifications').select('*').eq('source_id', id).order('created_at', { ascending: false }).limit(20),
    context.adminClient.from('dealer_source_mappings').select('*').eq('source_id', id).order('target_field'),
    context.adminClient.from('dealer_import_source_events').select('*').eq('source_id', id).order('created_at', { ascending: false }).limit(100),
  ])

  const company = companyResult.data
  const pilot = pilotResult.data
  const parser = parserResult.data
  const runs = runsResult.data || []
  const items = itemsResult.data || []
  const verifications = verificationsResult.data || []
  const mappings = mappingsResult.data || []
  const events = eventsResult.data || []
  const reviewItems = items.filter((item) => item.sync_status === 'import_review' || item.sync_status === 'import_error')
  const failedUrls = runs.flatMap((run) => failedUrlsFromSummary(run.summary)).slice(0, 100)
  const canManage = context.permissions.includes('inventory_imports.manage')

  return (
    <main className="px-4 py-7 sm:px-6 lg:px-8">
      <AdminPageHeader eyebrow="Lagerimport" title={String(source.name)} description="Källa, verifiering, parser, körningar, datakvalitet och fullständig ändringshistorik." backHref="/admin/inventory-imports" />
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Badge label={String(source.sync_status)} tone={statusTone(String(source.sync_status))} />
        <Badge label={String(source.verification_status)} tone={statusTone(String(source.verification_status))} />
        <span className="font-mono text-xs text-[#667085]">{source.id}</span>
        <Link href={`/api/admin/inventory-imports/${id}/errors`} className="text-sm font-semibold text-[#0866ff] hover:underline">Exportera felrapport</Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <DetailCard title="Importkälla">
          <DetailGrid items={[
            { label: 'Metod', value: String(source.source_type).toUpperCase() },
            { label: 'Webbplats', value: source.website_url }, { label: 'Lager-URL', value: source.inventory_url },
            { label: 'Feed-URL', value: source.feed_url }, { label: 'Verifierad domän', value: source.verified_domain },
            { label: 'Synkintervall', value: `${source.sync_interval_hours} timmar` }, { label: 'Importgräns', value: formatNumber(source.inventory_limit) },
            { label: 'Senast lyckad', value: formatDate(source.last_success_at) }, { label: 'Nästa synk', value: formatDate(source.next_sync_at) },
            { label: 'Publicering godkänd', value: source.publication_approved_at ? formatDate(source.publication_approved_at) : 'Nej' },
            { label: 'Senaste fel', value: source.last_error },
          ]} />
        </DetailCard>

        <DetailCard title="Företag och pilot">
          <DetailGrid items={[
            { label: 'Företag', value: company?.name }, { label: 'Organisationsnummer', value: company?.registration_number },
            { label: 'Land', value: company?.country_code }, { label: 'Kontakt', value: company?.contact_email },
            { label: 'Pilotstatus', value: pilot?.status || 'Ingen pilot' }, { label: 'Pilotstart', value: pilot?.start_date },
            { label: 'Planerat slut', value: pilot?.planned_end_date }, { label: 'Ingen automatisk konvertering', value: pilot ? (pilot.automatic_conversion_enabled ? 'VARNING: aktiverad' : 'Ja') : '–' },
            { label: 'Parserprofil', value: parser ? `${parser.name} v${parser.version} (${parser.status})` : 'Ingen kopplad' },
            { label: 'Parser-ID', value: source.parser_profile_id },
          ]} />
        </DetailCard>

        <DetailCard title="Volymer">
          <DetailGrid items={[
            { label: 'Hittade', value: formatNumber(source.discovered_count) }, { label: 'Importerade', value: formatNumber(source.imported_count) },
            { label: 'Publicerade', value: formatNumber(source.published_count) }, { label: 'Behöver granskas', value: formatNumber(source.review_count) },
            { label: 'Fel', value: formatNumber(source.error_count) }, { label: 'Misslyckanden i följd', value: formatNumber(source.consecutive_failures) },
          ]} />
        </DetailCard>

        {canManage ? <DetailCard title="Administrera"><InventoryImportAdminControls sourceId={id} source={source} reviewItems={reviewItems.map((item) => ({ id: String(item.id), vehicleId: item.vehicle_id ? String(item.vehicle_id) : null, title: itemTitle(item), status: String(item.sync_status) }))} /></DetailCard> : null}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <DetailCard title="Körningar">
          <div className="grid gap-3">{runs.map((run) => <article key={run.id} className="rounded-[8px] bg-[#f8fafc] p-4 text-sm"><div className="flex flex-wrap items-center justify-between gap-2"><strong>{run.trigger_type} · {run.current_step}</strong><Badge label={run.status} tone={statusTone(String(run.status))} /></div><p className="mt-2 text-xs text-[#667085]">{formatDate(run.created_at)} · {run.parsed_count} parsade · {run.warning_count} varningar · {run.error_count} fel</p>{run.last_error_code ? <p className="mt-2 text-red-700">{run.last_error_code}: {run.last_error_message}</p> : null}</article>)}{!runs.length ? <p className="text-sm text-[#667085]">Inga körningar ännu.</p> : null}</div>
        </DetailCard>

        <DetailCard title="Verifieringar">
          <div className="grid gap-3">{verifications.map((verification) => <article key={verification.id} className="rounded-[8px] bg-[#f8fafc] p-4 text-sm"><div className="flex flex-wrap items-center justify-between gap-2"><strong>{verification.method} · {verification.domain}</strong><Badge label={verification.status} tone={statusTone(String(verification.status))} /></div><p className="mt-2 text-xs text-[#667085]">Begärd {formatDate(verification.requested_at)} · kontrollerad {formatDate(verification.checked_at)}</p></article>)}{!verifications.length ? <p className="text-sm text-[#667085]">Ingen verifiering registrerad.</p> : null}</div>
        </DetailCard>

        <DetailCard title="Osäkra eller felaktiga annonser">
          <div className="grid gap-3">{reviewItems.map((item) => <article key={item.id} className="rounded-[8px] border border-[#e4e7ec] p-4 text-sm"><div className="flex flex-wrap items-center justify-between gap-2"><strong>{itemTitle(item)}</strong><Badge label={item.sync_status} tone="amber" /></div><p className="mt-2 break-all text-xs text-[#667085]">{item.source_url || 'Ingen käll-URL'} · kvalitet {item.parse_confidence == null ? '–' : `${Math.round(Number(item.parse_confidence) * 100)}%`}</p><p className="mt-2 text-xs text-amber-800">{Array.isArray(item.warnings) ? item.warnings.join(', ') : ''}</p></article>)}{!reviewItems.length ? <p className="text-sm text-[#667085]">Inga annonser väntar på granskning.</p> : null}</div>
        </DetailCard>

        <DetailCard title="Misslyckade URL:er">
          <div className="grid gap-3">{failedUrls.map((entry, index) => <article key={`${entry.url}-${index}`} className="rounded-[8px] bg-red-50 p-4 text-xs text-red-800"><p className="break-all font-semibold">{entry.url}</p><p className="mt-1">{entry.code}</p></article>)}{!failedUrls.length ? <p className="text-sm text-[#667085]">Inga misslyckade URL:er registrerade.</p> : null}</div>
        </DetailCard>

        <DetailCard title="Fältmappningar">
          <div className="grid gap-3">{mappings.map((mapping) => <article key={mapping.id} className="rounded-[8px] bg-[#f8fafc] p-4 text-sm"><strong>{mapping.external_field} → {mapping.target_field}</strong><p className="mt-1 text-xs text-[#667085]">Transform: {mapping.transform_key || 'ingen'} · godkänd {formatDate(mapping.approved_at)}</p></article>)}{!mappings.length ? <p className="text-sm text-[#667085]">Inga egna mappningar.</p> : null}</div>
        </DetailCard>

        <DetailCard title="Händelser">
          <div className="grid gap-3">{events.map((event) => <article key={event.id} className="rounded-[8px] bg-[#f8fafc] p-4 text-sm"><div className="flex flex-wrap justify-between gap-2"><strong>{event.event_type}</strong><span className="text-xs text-[#667085]">{formatDate(event.created_at)}</span></div>{event.note ? <p className="mt-2 whitespace-pre-wrap text-[#475467]">{event.note}</p> : null}</article>)}{!events.length ? <p className="text-sm text-[#667085]">Ingen historik ännu.</p> : null}</div>
        </DetailCard>
      </div>
    </main>
  )
}

function itemTitle(item: { normalized_payload?: unknown; source_url?: unknown }) {
  const payload = item.normalized_payload && typeof item.normalized_payload === 'object' && !Array.isArray(item.normalized_payload) ? item.normalized_payload as Record<string, unknown> : {}
  return String(payload.title || [payload.make, payload.model, payload.model_year].filter(Boolean).join(' ') || item.source_url || 'Namnlöst fordon')
}

function failedUrlsFromSummary(summary: unknown): Array<{ url: string; code: string }> {
  if (!summary || typeof summary !== 'object' || Array.isArray(summary)) return []
  const failed = (summary as Record<string, unknown>).failed_urls
  if (!Array.isArray(failed)) return []
  return failed.flatMap((entry) => entry && typeof entry === 'object' && !Array.isArray(entry)
    ? [{ url: String((entry as Record<string, unknown>).url || ''), code: String((entry as Record<string, unknown>).code || 'UNKNOWN') }]
    : [])
}
