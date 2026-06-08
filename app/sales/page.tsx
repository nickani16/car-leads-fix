import Link from 'next/link'
import {
  AlertTriangle,
  ArrowRight,
  BadgeEuro,
  Building2,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Mail,
  Phone,
  UserRound,
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

type WorkflowStage = 'seller' | 'information' | 'contracts' | 'signing'

const stageOrder: WorkflowStage[] = [
  'seller',
  'information',
  'contracts',
  'signing',
]

const stageLabels: Record<WorkflowStage, string> = {
  seller: 'Seller decision',
  information: 'Missing information',
  contracts: 'Contract review',
  signing: 'Signature process',
}

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string }>
}) {
  const { stage } = await searchParams
  const selectedStage = stageOrder.includes(stage as WorkflowStage)
    ? (stage as WorkflowStage)
    : undefined
  const { adminClient } = await requireSales()
  const [
    { data: deals },
    { data: leads },
    { data: dealers },
    { data: packets },
    { data: documents },
    { data: contractParties },
  ] = await Promise.all([
    adminClient
      .from('deals')
      .select(
        'id,lead_id,buyer_dealer_id,status,winning_bid_amount,seller_net_amount,commission_amount,inspection_fee,transport_fee,export_document_fee,buyer_total_amount,origin_country,origin_city,origin_postal_code,destination_country,destination_city,destination_postal_code,seller_decision,seller_decision_at,created_at'
      )
      .order('created_at', { ascending: false }),
    adminClient
      .from('leads')
      .select('id,reg,make,model,model_year,miles,email,phone,source,origin_country,pickup_city,pickup_postal_code'),
    adminClient
      .from('dealers')
      .select('id,company_name,contact_person,email,phone,country,country_code'),
    adminClient
      .from('contract_packets')
      .select('id,deal_id,status,blockers,template_version,generated_at'),
    adminClient
      .from('contract_documents_v2')
      .select('id,deal_id,document_type,status,version,created_at')
      .neq('status', 'void')
      .order('created_at', { ascending: false }),
    adminClient
      .from('contract_parties')
      .select('deal_id,party_role,legal_name,registered_address,country_code')
      .eq('party_role', 'seller'),
  ])

  const leadMap = new Map((leads || []).map((lead) => [lead.id, lead]))
  const dealerMap = new Map((dealers || []).map((dealer) => [dealer.id, dealer]))
  const packetMap = new Map((packets || []).map((packet) => [packet.deal_id, packet]))
  const sellerPartyMap = new Map(
    (contractParties || []).map((party) => [party.deal_id, party])
  )
  const documentsByDeal = (documents || []).reduce<
    Record<string, NonNullable<typeof documents>>
  >((grouped, document) => {
    grouped[document.deal_id] = [...(grouped[document.deal_id] || []), document]
    return grouped
  }, {})

  const openDeals = (deals || []).filter(
    (deal) => !['completed', 'cancelled'].includes(deal.status)
  )
  const workItems = openDeals.map((deal) => {
    const packet = packetMap.get(deal.id)
    const dealDocuments = documentsByDeal[deal.id] || []
    return {
      deal,
      lead: leadMap.get(deal.lead_id),
      dealer: dealerMap.get(deal.buyer_dealer_id),
      packet,
      documents: dealDocuments,
      sellerParty: sellerPartyMap.get(deal.id),
      workflow: getWorkflow(deal.status, packet?.status, dealDocuments),
    }
  })
  const counts = stageOrder.reduce<Record<WorkflowStage, number>>(
    (result, currentStage) => {
      result[currentStage] = workItems.filter(
        (item) => item.workflow.stage === currentStage
      ).length
      return result
    },
    { seller: 0, information: 0, contracts: 0, signing: 0 }
  )
  const visibleItems = selectedStage
    ? workItems.filter((item) => item.workflow.stage === selectedStage)
    : workItems

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <AdminPageHeader
        eyebrow="Sales workspace"
        title="Transaction work queue"
        description="Each transaction shows the next required action. Work from the top of the queue and complete the highlighted step before moving forward."
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric icon={<Clock3 />} label="Awaiting seller decision" value={counts.seller} />
        <Metric
          icon={<AlertTriangle />}
          label="Missing contract information"
          value={counts.information}
        />
        <Metric
          icon={<FileCheck2 />}
          label="Drafts ready for review"
          value={counts.contracts}
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

      <nav className="mt-7 flex gap-2 overflow-x-auto pb-2" aria-label="Filter work queue">
        <QueueFilter href="/sales" active={!selectedStage} label="All open" count={workItems.length} />
        {stageOrder.map((item) => (
          <QueueFilter
            key={item}
            href={`/sales?stage=${item}`}
            active={selectedStage === item}
            label={stageLabels[item]}
            count={counts[item]}
          />
        ))}
      </nav>

      <section className="mt-4 space-y-5">
        {visibleItems.length ? (
          visibleItems.map(
            ({
              deal,
              lead,
              dealer,
              packet,
              documents: dealDocuments,
              sellerParty,
              workflow,
            }) => {
              const canRecordDecision = [
                'provisional_winner',
                'seller_review',
              ].includes(deal.status)
              const currentDocuments = dealDocuments.filter(
                (document) => document.status !== 'void'
              )
              const latestVersion = currentDocuments.reduce(
                (latest, document) =>
                  Math.max(latest, Number(document.version || 0)),
                0
              )
              const WorkflowIcon = workflow.icon

              return (
                <article
                  key={deal.id}
                  className="overflow-hidden rounded-[22px] border border-[#deddd7] bg-white shadow-[0_14px_38px_rgba(32,33,36,.05)]"
                >
                  <div className={`border-l-4 px-6 py-4 ${workflow.accent}`}>
                    <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
                      <div className="flex items-start gap-3">
                        <WorkflowIcon className="mt-0.5 shrink-0" size={20} />
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em]">
                            Next action
                          </p>
                          <h2 className="mt-1 text-base font-semibold">
                            {workflow.title}
                          </h2>
                          <p className="mt-1 text-sm opacity-75">
                            {workflow.description}
                          </p>
                        </div>
                      </div>
                      <Badge
                        label={stageLabels[workflow.stage]}
                        tone={workflow.tone}
                      />
                    </div>
                  </div>

                  <div className="grid border-t border-[#e9e7e1] xl:grid-cols-[1.25fr_.9fr_.9fr]">
                    <section className="p-6 xl:border-r xl:border-[#e9e7e1]">
                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.16em] text-[#7d8386]">
                            Transaction {deal.id.slice(0, 8).toUpperCase()}
                          </p>
                          <h3 className="mt-2 text-2xl font-semibold tracking-[-0.025em]">
                            {lead?.reg || 'Registration unavailable'}
                          </h3>
                          <p className="mt-1 text-sm text-[#697074]">
                            {[lead?.make, lead?.model, lead?.model_year]
                              .filter(Boolean)
                              .join(' ') || 'Vehicle details incomplete'}
                          </p>
                          <p className="mt-1 text-sm text-[#697074]">
                            {lead?.miles || 'Mileage unavailable'} ·{' '}
                            {[
                              deal.origin_city || lead?.pickup_city,
                              deal.origin_country ||
                                lead?.origin_country ||
                                lead?.source,
                            ]
                              .filter(Boolean)
                              .join(', ') || 'Unknown'}
                            {' → '}
                            {deal.destination_city ||
                              deal.destination_country ||
                              dealer?.country_code ||
                              'Unknown'}
                          </p>
                        </div>
                        <Badge
                          label={deal.status.replaceAll('_', ' ')}
                          tone="gray"
                        />
                      </div>

                      <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        <ContactCard
                          title="Seller"
                          name={sellerParty?.legal_name || 'Name not completed'}
                          email={lead?.email}
                          phone={lead?.phone}
                          icon={<UserRound size={17} />}
                        />
                        <ContactCard
                          title="Winning dealer"
                          name={
                            dealer?.company_name ||
                            dealer?.contact_person ||
                            'Dealer'
                          }
                          email={dealer?.email}
                          phone={dealer?.phone}
                          icon={<Building2 size={17} />}
                        />
                      </div>
                    </section>

                    <section className="border-t border-[#e9e7e1] p-6 xl:border-r xl:border-t-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7d8386]">
                        Transaction value
                      </p>
                      <div className="mt-4">
                        <MoneyLine
                          label="Seller receives"
                          value={deal.seller_net_amount}
                          strong
                        />
                        <MoneyLine
                          label="Winning bid"
                          value={deal.winning_bid_amount}
                        />
                        <MoneyLine
                          label="Autorell fee"
                          value={deal.commission_amount}
                        />
                        <MoneyLine
                          label="Verified inspection"
                          value={deal.inspection_fee}
                        />
                        <MoneyLine
                          label="Transport"
                          value={deal.transport_fee}
                        />
                        <MoneyLine
                          label="Export & documents"
                          value={deal.export_document_fee}
                        />
                        <MoneyLine
                          label="Buyer total"
                          value={deal.buyer_total_amount}
                          strong
                        />
                      </div>
                      <p className="mt-4 border-t border-[#e9e7e1] pt-4 text-xs text-[#7d8386]">
                        Opened {formatDate(deal.created_at)}
                      </p>
                      {deal.seller_decision_at && (
                        <p className="mt-1 text-xs text-[#7d8386]">
                          Seller decision {formatDate(deal.seller_decision_at)}
                        </p>
                      )}
                    </section>

                    <section className="border-t border-[#e9e7e1] bg-[#fafaf8] p-6 xl:border-t-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7d8386]">
                        Complete this step
                      </p>
                      {canRecordDecision ? (
                        <SellerDecisionActions dealId={deal.id} />
                      ) : (
                        <>
                          <ContractPacketStatus
                            packet={packet}
                            activeDocumentCount={currentDocuments.length}
                            latestVersion={latestVersion || 1}
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
                          {currentDocuments.length > 0 && (
                            <div className="mt-4 space-y-2">
                              {currentDocuments.slice(0, 2).map((document) => (
                                <Link
                                  key={document.id}
                                  href={`/sales/contracts/${document.id}`}
                                  className="flex items-center justify-between rounded-[12px] border border-[#deddd7] bg-white px-4 py-3 text-sm transition hover:border-[#8dbdd8]"
                                >
                                  <span>
                                    {document.document_type ===
                                    'seller_purchase_agreement'
                                      ? 'Seller agreement'
                                      : 'Buyer agreement'}
                                  </span>
                                  <ArrowRight size={15} />
                                </Link>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </section>
                  </div>
                </article>
              )
            }
          )
        ) : (
          <AdminEmpty text="No transactions are currently in this workflow stage." />
        )}
      </section>
    </main>
  )
}

function getWorkflow(
  dealStatus: string,
  packetStatus: string | undefined,
  documents: { status: string }[]
) {
  if (['provisional_winner', 'seller_review'].includes(dealStatus)) {
    return {
      stage: 'seller' as const,
      title: 'Contact the seller and record the decision',
      description:
        'Explain the winning net offer. Select accepted or declined after the seller has made a clear decision.',
      icon: Phone,
      tone: 'amber' as const,
      accent: 'border-amber-400 bg-amber-50 text-amber-950',
    }
  }

  if (!packetStatus || packetStatus === 'needs_information') {
    return {
      stage: 'information' as const,
      title: 'Complete the missing legal information',
      description:
        'Confirm the seller identity and address. The agreements cannot be sent before all blockers are cleared.',
      icon: AlertTriangle,
      tone: 'amber' as const,
      accent: 'border-amber-400 bg-amber-50 text-amber-950',
    }
  }

  if (
    packetStatus === 'draft_ready' ||
    documents.some((document) => ['draft', 'ready'].includes(document.status))
  ) {
    return {
      stage: 'contracts' as const,
      title: 'Review both agreements before signature',
      description:
        'Check vehicle, parties and amounts in the seller and buyer agreements. Do not send drafts with incorrect information.',
      icon: FileCheck2,
      tone: 'blue' as const,
      accent: 'border-[#79b7d8] bg-[#eff8fd] text-[#264d63]',
    }
  }

  const signedCount = documents.filter(
    (document) => document.status === 'signed'
  ).length
  return {
    stage: 'signing' as const,
    title:
      signedCount === documents.length && documents.length > 0
        ? 'Both agreements are signed'
        : 'Monitor buyer and seller signatures',
    description:
      signedCount === documents.length && documents.length > 0
        ? 'The transaction can move to payment and logistics after a final control.'
        : `${signedCount} of ${
            documents.length || 2
          } agreements signed. Follow up the party whose signature is still missing.`,
    icon: CheckCircle2,
    tone: 'green' as const,
    accent: 'border-emerald-400 bg-emerald-50 text-emerald-950',
  }
}

function QueueFilter({
  href,
  active,
  label,
  count,
}: {
  href: string
  active: boolean
  label: string
  count: number
}) {
  return (
    <Link
      href={href}
      className={`shrink-0 rounded-full border px-4 py-2.5 text-sm transition ${
        active
          ? 'border-[#242424] bg-[#242424] text-white'
          : 'border-[#d8d7d1] bg-white text-[#62686c] hover:border-[#9fa2a3]'
      }`}
    >
      {label} <span className="ml-1 opacity-65">{count}</span>
    </Link>
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

function ContactCard({
  title,
  name,
  email,
  phone,
  icon,
}: {
  title: string
  name: string
  email?: string | null
  phone?: string | null
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-[14px] border border-[#e4e2dc] bg-[#faf9f6] p-4">
      <p className="flex items-center gap-2 text-xs font-semibold text-[#596166]">
        {icon}
        {title}
      </p>
      <p className="mt-3 text-sm font-medium">{name}</p>
      {email && (
        <a
          href={`mailto:${email}`}
          className="mt-2 flex items-center gap-2 break-all text-xs text-[#405f70] hover:underline"
        >
          <Mail size={13} />
          {email}
        </a>
      )}
      {phone && (
        <a
          href={`tel:${phone}`}
          className="mt-2 flex items-center gap-2 text-xs text-[#405f70] hover:underline"
        >
          <Phone size={13} />
          {phone}
        </a>
      )}
    </div>
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
    <div
      className={`flex justify-between gap-4 py-1.5 text-sm ${
        strong ? 'font-semibold' : ''
      }`}
    >
      <span className="text-[#697074]">{label}</span>
      <span>{money.format(Number(value || 0))}</span>
    </div>
  )
}

function formatDate(value: string | null) {
  if (!value) return 'Not recorded'
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? 'Not recorded' : date.format(parsed)
}
