import { requireAdmin } from '@/lib/admin-auth'
import {
  AdminEmpty,
  AdminFilters,
  AdminPageHeader,
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
import { fetchTicketBundle, type SupportTicket } from '@/lib/support/tickets'

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
  const { adminClient } = await requireAdmin()

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

  const [{ data: tickets }, { data: agents }] = await Promise.all([
    query,
    adminClient
      .from('support_agent_profiles')
      .select('user_id,display_name,role,languages,is_active')
      .eq('is_active', true)
      .order('display_name', { ascending: true }),
  ])

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
      <AdminFilters search={q} searchPlaceholder="Sök ämne, kund eller e-post">
        <FilterSelect
          name="status"
          value={status}
          label="Status"
          options={[
            { value: 'open', label: 'Open' },
            { value: 'waiting_customer', label: 'Väntar kund' },
            { value: 'waiting_internal', label: 'Väntar internt' },
            { value: 'resolved', label: 'Löst' },
            { value: 'closed', label: 'Stängt' },
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
            />
          ) : (
            <AdminEmpty text="Välj ett ärende." />
          )}
        </div>
      )}
    </main>
  )
}
