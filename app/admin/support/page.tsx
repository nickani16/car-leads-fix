import { requireAdminPermission } from '@/lib/admin-auth'
import {
  AdminEmpty,
  AdminFilters,
  AdminPageHeader,
  AdminStatCard,
  FilterSelect,
} from '../AdminUI'
import {
  AdminSearchParams,
  getPage,
  getParam,
  pageRange,
  queryToUrlSearchParams,
} from '../admin-helpers'
import SupportTicketDetail from '@/components/support/SupportTicketDetail'
import SupportTicketList from '@/components/support/SupportTicketList'
import { fetchTicketBundle } from '@/lib/support/tickets'
import { SUPPORT_STATUSES, type SupportTicket } from '@/lib/support/types'

export const dynamic = 'force-dynamic'

export default async function AdminSupportPage({
  searchParams,
}: {
  searchParams: AdminSearchParams
}) {
  const params = await searchParams
  const q = getParam(params, 'q')
  const status = getParam(params, 'status')
  const priority = getParam(params, 'priority')
  const category = getParam(params, 'category')
  const language = getParam(params, 'language')
  const assignedTo = getParam(params, 'assigned_to')
  const selectedTicketId = getParam(params, 'ticket')
  const page = getPage(params)
  const { from, to } = pageRange(page)
  const { adminClient, user } = await requireAdminPermission('support.read')

  let query = adminClient
    .from('support_tickets')
    .select('*', { count: 'exact' })
    .order('updated_at', { ascending: false })
    .range(from, to)

  if (status) query = query.eq('status', status)
  if (priority) query = query.eq('priority', priority)
  if (category) query = query.eq('category', category)
  if (language) query = query.eq('customer_language', language)
  if (assignedTo === 'unassigned') query = query.is('assigned_to', null)
  else if (assignedTo) query = query.eq('assigned_to', assignedTo)
  if (q) {
    const escaped = q.replace(/[%_,]/g, '')
    query = query.or(`subject.ilike.%${escaped}%,customer_email.ilike.%${escaped}%,customer_name.ilike.%${escaped}%`)
  }

  const [{ data: tickets }, { data: agents }, { data: supportMetrics }] = await Promise.all([
    query,
    adminClient
      .from('support_agent_profiles')
      .select('user_id,display_name,role,languages,is_active')
      .eq('is_active', true)
      .order('display_name', { ascending: true }),
    adminClient.from('support_tickets').select('status,assigned_to,created_at,first_response_at,resolved_at').limit(5000),
  ])

  const metrics = supportMetrics || []
  const resolvedDurations = metrics.flatMap((ticket) => ticket.resolved_at ? [new Date(ticket.resolved_at).getTime() - new Date(ticket.created_at).getTime()] : [])
  const firstResponseDurations = metrics.flatMap((ticket) => ticket.first_response_at ? [new Date(ticket.first_response_at).getTime() - new Date(ticket.created_at).getTime()] : [])
  const averageHours = (values: number[]) => values.length ? `${(values.reduce((sum, value) => sum + value, 0) / values.length / 3_600_000).toFixed(1)} h` : '–'

  const typedTickets = (tickets || []) as SupportTicket[]
  const selectedId = selectedTicketId || typedTickets[0]?.id
  const bundle = selectedId ? await fetchTicketBundle(adminClient, selectedId) : null
  const urlQuery = queryToUrlSearchParams(params)

  return (
    <main className="px-4 py-7 sm:px-6 lg:px-8">
      <AdminPageHeader
        eyebrow="Kundsupport"
        title="Support"
        description="AI-eskalerade chatthistoriker, kundmeddelanden, interna anteckningar och manuella supportåtgärder."
      />
      <section className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Mina aktiva ärenden" value={metrics.filter((ticket) => ticket.assigned_to === user.id && !['resolved', 'closed'].includes(ticket.status)).length} />
        <AdminStatCard label="Otilldelade" value={metrics.filter((ticket) => !ticket.assigned_to && !['resolved', 'closed'].includes(ticket.status)).length} />
        <AdminStatCard label="Snitt första svar" value={averageHours(firstResponseDurations)} />
        <AdminStatCard label="Snitt handläggningstid" value={averageHours(resolvedDurations)} />
      </section>
      <nav className="mb-5 flex flex-wrap gap-2" aria-label="Supportköer">
        {[
          ['Mina ärenden', `?assigned_to=${user.id}`], ['Otilldelade', '?assigned_to=unassigned'], ['Pågående', '?status=in_progress'],
          ['Väntar på kund', '?status=waiting_for_customer'], ['Eskalerade', '?status=escalated'], ['Lösta', '?status=resolved'], ['Stängda', '?status=closed'],
        ].map(([label, href]) => <Link key={label} href={href} className="rounded-full border border-[#d7deea] bg-white px-3 py-2 text-xs font-bold text-[#344054] hover:border-[#0866ff] hover:text-[#0866ff]">{label}</Link>)}
      </nav>
      <AdminFilters search={q} searchPlaceholder="Sök ämne, kund eller e-post">
        <FilterSelect
          name="status"
          value={status}
          label="Status"
          options={[
            ...SUPPORT_STATUSES.map((value) => ({ value, label: value.replaceAll('_', ' ') })),
          ]}
        />
        <FilterSelect
          name="priority"
          value={priority}
          label="Prioritet"
          options={[
            { value: 'low', label: 'Low' },
            { value: 'normal', label: 'Normal' },
            { value: 'high', label: 'High' },
            { value: 'urgent', label: 'Urgent' },
          ]}
        />
        <FilterSelect
          name="category"
          value={category}
          label="Kategori"
          options={[
            { value: 'listing', label: 'Listing' },
            { value: 'account', label: 'Account' },
            { value: 'payment', label: 'Payment' },
            { value: 'business_account', label: 'Business' },
            { value: 'report_listing', label: 'Report listing' },
            { value: 'fraud', label: 'Fraud' },
            { value: 'gdpr', label: 'GDPR' },
            { value: 'technical', label: 'Technical' },
            { value: 'other', label: 'Other' },
          ]}
        />
        <FilterSelect
          name="language"
          value={language}
          label="Språk"
          options={[
            { value: 'sv', label: 'Svenska' },
            { value: 'en', label: 'English' },
            { value: 'de', label: 'Deutsch' },
            { value: 'fr', label: 'Français' },
            { value: 'nl', label: 'Nederlands' },
            { value: 'da', label: 'Dansk' },
            { value: 'fi', label: 'Suomi' },
            { value: 'it', label: 'Italiano' },
            { value: 'pl', label: 'Polski' },
            { value: 'es', label: 'Español' },
          ]}
        />
        <FilterSelect
          name="assigned_to"
          value={assignedTo}
          label="Tilldelad"
          options={[
            { value: 'unassigned', label: 'Ej tilldelad' },
            ...((agents || []) as { user_id: string; display_name: string | null; role: string }[]).map((agent) => ({
              value: agent.user_id,
              label: agent.display_name || agent.role,
            })),
          ]}
        />
      </AdminFilters>

      {!typedTickets.length ? (
        <AdminEmpty text="Inga supportärenden hittades. Kör Supabase-migrationen för support AI-MVP om detta är första versionen." />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
          <SupportTicketList tickets={typedTickets} selectedId={selectedId} query={urlQuery} />
          {bundle ? (
            <SupportTicketDetail
              ticket={bundle.ticket}
              messages={bundle.messages}
              chatMessages={bundle.chatMessages as {
                id: string
                role: string
                message: string
                created_at: string
                metadata?: { attachment?: { name: string; dataUrl: string } }
              }[]}
              agents={(agents || []) as { user_id: string; display_name: string | null; role: string }[]}
              events={bundle.events}
            />
          ) : (
            <AdminEmpty text="Välj ett ärende." />
          )}
        </div>
      )}
    </main>
  )
}
import Link from 'next/link'
