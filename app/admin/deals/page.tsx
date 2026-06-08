import { requireAdmin } from '@/lib/admin-auth'
import {
  AdminEmpty,
  AdminFilters,
  AdminPageHeader,
  Badge,
  FilterSelect,
} from '../AdminUI'
import SellerDecisionActions from '@/app/sales/SellerDecisionActions'
import ContractPacketStatus from '@/app/sales/ContractPacketStatus'
import PlatformLegalEntityForm from '../PlatformLegalEntityForm'

type SearchParams = Promise<{
  q?: string
  status?: string
  country?: string
}>

export default async function AdminDealsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const { adminClient } = await requireAdmin()
  const [
    { data: deals },
    { data: dealers },
    { data: leads },
    { data: packets },
    { data: documents },
    { data: platformEntity },
  ] =
    await Promise.all([
      adminClient.from('deals').select('*').order('created_at', {
        ascending: false,
      }),
      adminClient
        .from('dealers')
        .select('id,company_name,contact_person,email'),
      adminClient.from('leads').select('id,reg,make,model'),
      adminClient
        .from('contract_packets')
        .select('id,deal_id,status,blockers,template_version,generated_at'),
      adminClient
        .from('contract_documents_v2')
        .select('id,deal_id,document_type,status'),
      adminClient
        .from('platform_legal_entities')
        .select(
          'legal_name,registration_number,vat_number,registered_address,country_code,email'
        )
        .eq('is_active', true)
        .maybeSingle(),
    ])

  const dealerMap = new Map(
    (dealers || []).map((dealer) => [dealer.id, dealer])
  )
  const leadMap = new Map((leads || []).map((lead) => [lead.id, lead]))
  const packetMap = new Map(
    (packets || []).map((packet) => [packet.deal_id, packet])
  )
  const documentCountMap = (documents || []).reduce<Record<string, number>>(
    (counts, document) => {
      counts[document.deal_id] = (counts[document.deal_id] || 0) + 1
      return counts
    },
    {}
  )
  const query = (params.q || '').toLowerCase().trim()
  const filtered = (deals || []).filter((deal) => {
    const dealer = dealerMap.get(deal.buyer_dealer_id)
    const lead = leadMap.get(deal.lead_id)
    return (
      (!query ||
        [
          deal.id,
          lead?.reg,
          lead?.make,
          lead?.model,
          dealer?.company_name,
          dealer?.contact_person,
          dealer?.email,
        ].some((value) =>
          String(value || '').toLowerCase().includes(query)
        )) &&
      (!params.status || deal.status === params.status) &&
      (!params.country ||
        deal.origin_country === params.country ||
        deal.destination_country === params.country)
    )
  })

  const statuses = Array.from(
    new Set((deals || []).map((deal) => deal.status))
  ).sort()
  const countries = Array.from(
    new Set(
      (deals || [])
        .flatMap((deal) => [deal.origin_country, deal.destination_country])
        .filter((value): value is string => Boolean(value))
    )
  ).sort()

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <AdminPageHeader
        eyebrow="Transaction operations"
        title="All deals"
        description="Track every provisional and completed transaction, buyer, seller value, commission and cross-border route."
      />
      <PlatformLegalEntityForm entity={platformEntity} />
      <AdminFilters
        search={params.q}
        searchPlaceholder="Search deal ID, registration, vehicle or dealer"
      >
        <FilterSelect
          name="status"
          value={params.status}
          label="All statuses"
          options={statuses.map((status) => ({
            value: status,
            label: status,
          }))}
        />
        <FilterSelect
          name="country"
          value={params.country}
          label="All countries"
          options={countries.map((country) => ({
            value: country,
            label: country,
          }))}
        />
      </AdminFilters>

      {filtered.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {filtered.map((deal) => {
            const dealer = dealerMap.get(deal.buyer_dealer_id)
            const lead = leadMap.get(deal.lead_id)
            return (
              <article
                key={deal.id}
                className="rounded-[20px] border border-[#deddd7] bg-white p-6 shadow-[0_10px_30px_rgba(32,33,36,.045)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-[#858a8c]">
                      {lead?.reg || deal.id}
                    </p>
                    <h2 className="mt-2 text-xl font-semibold">
                      {lead?.make || 'Vehicle'} {lead?.model || ''}
                    </h2>
                    <p className="mt-1 text-sm text-[#62686c]">
                      Buyer: {dealer?.company_name || dealer?.email || 'Unknown'}
                    </p>
                  </div>
                  <Badge label={deal.status} />
                </div>

                <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    ['Winning bid', `€${Number(deal.winning_bid_amount).toLocaleString()}`],
                    ['Commission', `€${Number(deal.commission_amount).toLocaleString()}`],
                    ['Transport', `€${Number(deal.transport_fee).toLocaleString()}`],
                    ['Buyer total', `€${Number(deal.buyer_total_amount).toLocaleString()}`],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-[13px] bg-[#f8f7f3] p-3">
                      <dt className="text-[10px] uppercase tracking-[0.1em] text-[#858a8c]">
                        {label}
                      </dt>
                      <dd className="mt-1 text-sm font-medium">{value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-5 flex flex-wrap gap-2 text-xs text-[#62686c]">
                  <Badge label={`${deal.origin_country} → ${deal.destination_country}`} tone="gray" />
                  <Badge label={deal.vat_treatment || 'VAT review pending'} tone="amber" />
                  <Badge label={deal.bid_is_binding ? 'Binding bid' : 'Non-binding'} tone="green" />
                </div>
                {['provisional_winner', 'seller_review'].includes(
                  deal.status
                ) && <SellerDecisionActions dealId={deal.id} />}
                {[
                  'seller_accepted',
                  'contracts_pending',
                  'contracts_ready',
                ].includes(deal.status) && (
                  <ContractPacketStatus
                    packet={packetMap.get(deal.id)}
                    documentCount={documentCountMap[deal.id] || 0}
                  />
                )}
              </article>
            )
          })}
        </div>
      ) : (
        <AdminEmpty text="No deals match these filters." />
      )}
    </main>
  )
}
