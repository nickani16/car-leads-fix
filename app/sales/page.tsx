import {
  BadgeEuro,
  Building2,
  CarFront,
  CheckCircle2,
  Clock3,
  Mail,
  Phone,
} from 'lucide-react'
import { requireSales } from '@/lib/sales-auth'
import { AdminEmpty, AdminPageHeader, Badge } from '@/app/admin/AdminUI'
import SellerDecisionActions from './SellerDecisionActions'
import ContractPacketStatus from './ContractPacketStatus'
import SellerContractIdentityForm from './SellerContractIdentityForm'

const money = new Intl.NumberFormat('en-IE', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

const date = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export default async function SalesPage() {
  const { adminClient } = await requireSales()
  const [
    { data: deals },
    { data: leads },
    { data: dealers },
    { data: packets },
    { data: documents },
    { data: contractParties },
  ] =
    await Promise.all([
      adminClient
        .from('deals')
        .select(
          'id,lead_id,buyer_dealer_id,status,winning_bid_amount,seller_net_amount,commission_amount,buyer_total_amount,origin_country,destination_country,seller_decision,seller_decision_at,created_at'
        )
        .order('created_at', { ascending: false }),
      adminClient
        .from('leads')
        .select('id,reg,make,model,model_year,miles,email,phone,source,origin_country'),
      adminClient
        .from('dealers')
        .select('id,company_name,contact_person,email,phone,country,country_code'),
      adminClient
        .from('contract_packets')
        .select('id,deal_id,status,blockers,template_version,generated_at'),
      adminClient
        .from('contract_documents_v2')
        .select('id,deal_id,document_type,status,version'),
      adminClient
        .from('contract_parties')
        .select(
          'deal_id,party_role,legal_name,registered_address,country_code'
        )
        .eq('party_role', 'seller'),
    ])

  const leadMap = new Map((leads || []).map((lead) => [lead.id, lead]))
  const dealerMap = new Map(
    (dealers || []).map((dealer) => [dealer.id, dealer])
  )
  const packetMap = new Map(
    (packets || []).map((packet) => [packet.deal_id, packet])
  )
  const activeDocumentCountMap = (documents || []).reduce<Record<string, number>>(
    (counts, document) => {
      if (document.status !== 'void') {
        counts[document.deal_id] = (counts[document.deal_id] || 0) + 1
      }
      return counts
    },
    {}
  )
  const latestVersionMap = (documents || []).reduce<Record<string, number>>(
    (versions, document) => {
      versions[document.deal_id] = Math.max(
        versions[document.deal_id] || 0,
        Number(document.version || 0)
      )
      return versions
    },
    {}
  )
  const sellerPartyMap = new Map(
    (contractParties || []).map((party) => [party.deal_id, party])
  )
  const openDeals = (deals || []).filter(
    (deal) => !['completed', 'cancelled'].includes(deal.status)
  )
  const sellerReview = openDeals.filter(
    (deal) => deal.status === 'provisional_winner' || deal.status === 'seller_review'
  )

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <AdminPageHeader
        eyebrow="Sales workspace"
        title="Winning bid pipeline"
        description="Follow up sellers, review the winning dealer and move accepted transactions toward digital contracts."
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric icon={<Clock3 />} label="Seller follow-up" value={sellerReview.length} />
        <Metric icon={<CarFront />} label="Open deals" value={openDeals.length} />
        <Metric
          icon={<CheckCircle2 />}
          label="Accepted"
          value={openDeals.filter((deal) => deal.status === 'seller_accepted').length}
        />
        <Metric
          icon={<BadgeEuro />}
          label="Open seller value"
          value={money.format(
            openDeals.reduce(
              (total, deal) => total + Number(deal.seller_net_amount || 0),
              0
            )
          )}
        />
      </section>

      <section className="mt-7 space-y-4">
        {openDeals.length ? (
          openDeals.map((deal) => {
            const lead = leadMap.get(deal.lead_id)
            const dealer = dealerMap.get(deal.buyer_dealer_id)
            const packet = packetMap.get(deal.id)
            const sellerParty = sellerPartyMap.get(deal.id)
            const canRecordDecision = [
              'provisional_winner',
              'seller_review',
            ].includes(deal.status)

            return (
              <article
                key={deal.id}
                className="overflow-hidden rounded-[22px] border border-[#deddd7] bg-white shadow-[0_14px_38px_rgba(32,33,36,.05)]"
              >
                <div className="flex flex-col justify-between gap-5 border-b border-[#e9e7e1] px-6 py-5 lg:flex-row lg:items-center">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.15em] text-[#7d8386]">
                      {lead?.reg || deal.id}
                    </p>
                    <h2 className="mt-2 text-xl font-semibold">
                      {lead?.make || 'Vehicle'} {lead?.model || ''}{' '}
                      {lead?.model_year || ''}
                    </h2>
                    <p className="mt-1 text-sm text-[#697074]">
                      {lead?.miles || 'Mileage unavailable'} ·{' '}
                      {deal.origin_country || lead?.origin_country || lead?.source || 'Unknown'}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge label={deal.status.replaceAll('_', ' ')} />
                    <Badge
                      label={`${deal.origin_country || '—'} → ${deal.destination_country || '—'}`}
                      tone="gray"
                    />
                  </div>
                </div>

                <div className="grid gap-6 p-6 xl:grid-cols-[1fr_1fr_.8fr]">
                  <section>
                    <p className="mb-4 flex items-center gap-2 text-sm font-semibold">
                      <CarFront size={17} />
                      Seller
                    </p>
                    <ContactLine icon={<Mail size={15} />} value={lead?.email} href={`mailto:${lead?.email || ''}`} />
                    <ContactLine icon={<Phone size={15} />} value={lead?.phone} href={`tel:${lead?.phone || ''}`} />
                    <p className="mt-4 text-xs text-[#858a8c]">
                      Contact the seller and record acceptance before contracts are generated.
                    </p>
                  </section>

                  <section>
                    <p className="mb-4 flex items-center gap-2 text-sm font-semibold">
                      <Building2 size={17} />
                      Winning dealer
                    </p>
                    <p className="text-sm font-medium">
                      {dealer?.company_name || dealer?.contact_person || 'Dealer'}
                    </p>
                    <p className="mt-1 text-sm text-[#697074]">
                      {dealer?.contact_person || dealer?.email || 'Contact unavailable'}
                    </p>
                    <p className="mt-1 text-sm text-[#697074]">
                      {dealer?.country || dealer?.country_code || 'Country unavailable'}
                    </p>
                  </section>

                  <section className="rounded-[16px] bg-[#f6f8f9] p-5">
                    <MoneyLine label="Seller receives" value={deal.seller_net_amount} />
                    <MoneyLine label="Winning bid" value={deal.winning_bid_amount} />
                    <MoneyLine label="Autorell fee" value={deal.commission_amount} />
                    <MoneyLine label="Buyer total" value={deal.buyer_total_amount} strong />
                    <p className="mt-4 border-t border-[#deddd7] pt-3 text-xs text-[#7d8386]">
                      Created {date.format(new Date(deal.created_at))}
                    </p>
                    {canRecordDecision ? (
                      <SellerDecisionActions dealId={deal.id} />
                    ) : (
                      <>
                        <p className="mt-5 rounded-[12px] bg-white p-3 text-xs text-[#697074]">
                          Seller decision:{' '}
                          {deal.seller_decision ||
                            deal.status.replaceAll('_', ' ')}
                        </p>
                        <ContractPacketStatus
                          packet={packet}
                          activeDocumentCount={
                            activeDocumentCountMap[deal.id] || 0
                          }
                          latestVersion={latestVersionMap[deal.id] || 1}
                        />
                        {packet?.status === 'needs_information' && (
                          <SellerContractIdentityForm
                            dealId={deal.id}
                            initialName={sellerParty?.legal_name}
                            initialAddress={sellerParty?.registered_address}
                            initialCountry={
                              sellerParty?.country_code ||
                              deal.origin_country ||
                              'SE'
                            }
                          />
                        )}
                      </>
                    )}
                  </section>
                </div>
              </article>
            )
          })
        ) : (
          <AdminEmpty text="No open winning-bid deals require sales follow-up." />
        )}
      </section>
    </main>
  )
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
}) {
  return (
    <div className="rounded-[18px] border border-[#deddd7] bg-white p-5">
      <div className="mb-4 text-[#52768a]">{icon}</div>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-[#73797c]">{label}</p>
    </div>
  )
}

function ContactLine({
  icon,
  value,
  href,
}: {
  icon: React.ReactNode
  value?: string | null
  href: string
}) {
  if (!value) {
    return <p className="mt-2 text-sm text-[#929799]">Not provided</p>
  }

  return (
    <a
      href={href}
      className="mt-2 flex items-center gap-2 text-sm text-[#405f70] hover:underline"
    >
      {icon}
      {value}
    </a>
  )
}

function MoneyLine({
  label,
  value,
  strong = false,
}: {
  label: string
  value: number | string | null
  strong?: boolean
}) {
  return (
    <div className={`flex justify-between gap-4 py-1.5 text-sm ${strong ? 'font-semibold' : ''}`}>
      <span className="text-[#697074]">{label}</span>
      <span>{money.format(Number(value || 0))}</span>
    </div>
  )
}
