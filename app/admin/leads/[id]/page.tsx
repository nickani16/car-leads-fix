import Image from 'next/image'
import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/admin-auth'
import { formatStockholmTimestamp } from '@/lib/date-time'
import {
  AdminPageHeader,
  Badge,
  DetailCard,
  DetailGrid,
} from '../../AdminUI'
import LeadLocationForm from './LeadLocationForm'
import LeadFinanceReviewForm from './LeadFinanceReviewForm'
import LeadReviewActions from './LeadReviewActions'
import LeadTranslationForm from './LeadTranslationForm'
import BidAdminControls from './BidAdminControls'

export default async function AdminLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { adminClient, adminUser } = await requireAdmin()
  const [{ data: lead }, { data: bids }, { data: deal }] = await Promise.all([
    adminClient.from('leads').select('*').eq('id', id).maybeSingle(),
    adminClient
      .from('bids')
      .select('id,amount,created_at,is_winner,dealer_id')
      .eq('lead_id', id)
      .order('amount', { ascending: false }),
    adminClient.from('deals').select('*').eq('lead_id', id).maybeSingle(),
  ])

  if (!lead) notFound()

  const images = Array.isArray(lead.images) ? (lead.images as string[]) : []
  const highestBid = bids?.length ? Number(bids[0].amount) : null

  return (
    <main className="mx-auto max-w-[1280px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <AdminPageHeader
        eyebrow="Lead detail"
        title={`${lead.make || 'Vehicle'} ${lead.model || ''}`}
        description={`${lead.reg || 'No registration'} · Lead ${lead.id}`}
        backHref="/admin/leads"
      />

      <LeadReviewActions leadId={lead.id} status={lead.status} />

      <LeadLocationForm
        leadId={lead.id}
        initialCity={lead.pickup_city}
        initialPostalCode={lead.pickup_postal_code}
        initialCountry={lead.origin_country || lead.source}
      />

      <LeadFinanceReviewForm
        leadId={lead.id}
        financeStatus={lead.finance_status}
        provider={lead.finance_provider}
        agreementReference={lead.finance_agreement_reference}
        estimatedBalance={lead.finance_estimated_balance}
        contactConsent={lead.finance_contact_consent}
        initialReviewStatus={lead.finance_review_status}
        initialSettlementAmount={lead.finance_settlement_amount}
        initialSettlementValidUntil={lead.finance_settlement_valid_until}
        initialReleaseReference={lead.finance_release_reference}
        initialNotes={lead.finance_admin_notes}
      />

      <LeadTranslationForm
        leadId={lead.id}
        originalDamage={lead.damage_description}
        originalEquipment={lead.equipment}
        initialDamageEnglish={lead.damage_description_en}
        initialEquipmentEnglish={lead.equipment_en}
        reviewedAt={lead.translation_reviewed_at}
      />

      <div className="mb-7 flex flex-wrap gap-2">
        <Badge label={lead.status || 'New'} />
        <Badge
          label={`${lead.origin_country || lead.source || 'Unknown market'}`}
          tone="gray"
        />
        <Badge
          label={highestBid ? `Highest bid €${highestBid.toLocaleString()}` : 'No bids'}
          tone={highestBid ? 'green' : 'amber'}
        />
        {deal && <Badge label={`Deal: ${deal.status}`} tone="blue" />}
      </div>

      <div className="grid gap-7 xl:grid-cols-[1fr_.8fr]">
        <div className="space-y-7">
          <DetailCard title="Customer contact">
            <DetailGrid
              items={[
                { label: 'Email', value: lead.email },
                { label: 'Phone', value: lead.phone },
                { label: 'Sell timing', value: lead.sellTime },
                {
                  label: 'Submitted',
                  value: formatStockholmTimestamp(lead.created_at),
                },
              ]}
            />
          </DetailCard>

          <DetailCard title="Vehicle identity">
            <DetailGrid
              items={[
                { label: 'Registration', value: lead.reg },
                { label: 'VIN', value: lead.vin },
                { label: 'Make', value: lead.make },
                { label: 'Model', value: lead.model },
                { label: 'Variant', value: lead.variant },
                { label: 'Model year', value: lead.model_year },
                { label: 'First registration', value: lead.first_registration },
                { label: 'Mileage', value: lead.miles },
                { label: 'Origin country', value: lead.origin_country },
                { label: 'Pickup city', value: lead.pickup_city },
                { label: 'Pickup postal code', value: lead.pickup_postal_code },
                { label: 'Source', value: lead.source },
              ]}
            />
          </DetailCard>

          <DetailCard title="Ownership and finance">
            <DetailGrid
              items={[
                { label: 'Seller declaration', value: lead.finance_status },
                { label: 'Finance provider', value: lead.finance_provider },
                {
                  label: 'Agreement reference',
                  value: lead.finance_agreement_reference,
                },
                {
                  label: 'Estimated outstanding balance',
                  value: lead.finance_estimated_balance,
                },
                {
                  label: 'Consent to contact provider',
                  value: lead.finance_contact_consent ? 'Yes' : 'No',
                },
                {
                  label: 'Finance review status',
                  value: lead.finance_review_status,
                },
                {
                  label: 'Confirmed settlement amount',
                  value: lead.finance_settlement_amount,
                },
                {
                  label: 'Settlement valid until',
                  value: lead.finance_settlement_valid_until,
                },
                {
                  label: 'Release reference',
                  value: lead.finance_release_reference,
                },
                {
                  label: 'Internal notes',
                  value: lead.finance_admin_notes,
                },
              ]}
            />
          </DetailCard>

          <DetailCard title="Technical information">
            <DetailGrid
              items={[
                { label: 'Body type', value: lead.body_type },
                { label: 'Fuel', value: lead.fuel_type },
                { label: 'Transmission', value: lead.gearbox },
                { label: 'Drivetrain', value: lead.drivetrain },
                { label: 'Power', value: lead.power_hp },
                { label: 'Engine', value: lead.engine_size },
                { label: 'Colour', value: lead.color },
                { label: 'Towbar', value: lead.towbar },
              ]}
            />
          </DetailCard>

          <DetailCard title="Condition and history">
            <DetailGrid
              items={[
                { label: 'Owners', value: lead.owners },
                { label: 'Service', value: lead.service },
                { label: 'Damage', value: lead.damage },
                { label: 'Damage details', value: lead.damage_description },
                { label: 'Warnings', value: lead.warnings },
                {
                  label: 'Driveable',
                  value:
                    lead.is_driveable === null ||
                    lead.is_driveable === undefined
                      ? undefined
                      : lead.is_driveable
                        ? 'Yes'
                        : 'No',
                },
                {
                  label: 'Engine or transmission issues',
                  value:
                    lead.has_engine_transmission_issues === null ||
                    lead.has_engine_transmission_issues === undefined
                      ? undefined
                      : lead.has_engine_transmission_issues
                        ? 'Yes'
                        : 'No',
                },
                {
                  label: 'Fluid leaks',
                  value:
                    lead.has_fluid_leaks === null ||
                    lead.has_fluid_leaks === undefined
                      ? undefined
                      : lead.has_fluid_leaks
                        ? 'Yes'
                        : 'No',
                },
                {
                  label: 'Serious collision damage',
                  value:
                    lead.has_serious_collision_damage === null ||
                    lead.has_serious_collision_damage === undefined
                      ? undefined
                      : lead.has_serious_collision_damage
                        ? 'Yes'
                        : 'No',
                },
                { label: 'Brakes', value: lead.brakes },
                { label: 'Tires', value: lead.tires },
                { label: 'Tire sets included', value: lead.tireset },
                { label: 'Keys', value: lead.keys_count },
                { label: 'Imported', value: lead.importCar },
                { label: 'Inspection', value: lead.inspection_valid_until },
                { label: 'Equipment', value: lead.equipment },
              ]}
            />
          </DetailCard>
        </div>

        <div className="space-y-7">
          <DetailCard title={`Images (${images.length})`}>
            {images.length ? (
              <div className="grid grid-cols-2 gap-3">
                {images.map((src) => (
                  <a key={src} href={src} target="_blank">
                    <Image
                      src={src}
                      alt="Vehicle"
                      width={500}
                      height={350}
                      unoptimized
                      className="aspect-[4/3] w-full rounded-[12px] object-cover"
                    />
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#73797c]">No images uploaded.</p>
            )}
          </DetailCard>

          <DetailCard title={`Bid history (${bids?.length || 0})`}>
            <div className="space-y-3">
              {bids?.map((bid) => (
                <div
                  key={bid.id}
                  className="flex items-center justify-between rounded-[14px] bg-[#f8f7f3] p-4"
                >
                  <div>
                    <p className="font-medium">
                      €{Number(bid.amount).toLocaleString()}
                    </p>
                    <p className="mt-1 text-xs text-[#73797c]">
                      {formatStockholmTimestamp(
                        bid.created_at,
                        'Bid time unavailable'
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {bid.is_winner && <Badge label="Winner" tone="green" />}
                    {adminUser.role === 'super_admin' && (
                      <BidAdminControls
                        bidId={bid.id}
                        amount={Number(bid.amount)}
                      />
                    )}
                  </div>
                </div>
              ))}
              {!bids?.length && (
                <p className="text-sm text-[#73797c]">No bids yet.</p>
              )}
            </div>
          </DetailCard>

          {deal && (
            <DetailCard title="Deal summary">
              <DetailGrid
                items={[
                  { label: 'Status', value: deal.status },
                  { label: 'Winning bid', value: `€${deal.winning_bid_amount}` },
                  { label: 'Commission', value: `€${deal.commission_amount}` },
                  { label: 'Inspection', value: `€${deal.inspection_fee || 0}` },
                  { label: 'Transport', value: `€${deal.transport_fee}` },
                  {
                    label: 'Documentation',
                    value: `€${deal.export_document_fee}`,
                  },
                  { label: 'Buyer total', value: `€${deal.buyer_total_amount}` },
                  {
                    label: 'Origin',
                    value:
                      [deal.origin_postal_code, deal.origin_city, deal.origin_country]
                        .filter(Boolean)
                        .join(' ') || 'Not provided',
                  },
                  {
                    label: 'Destination',
                    value:
                      [
                        deal.destination_postal_code,
                        deal.destination_city,
                        deal.destination_country,
                      ]
                        .filter(Boolean)
                        .join(' ') || 'Not provided',
                  },
                ]}
              />
            </DetailCard>
          )}
        </div>
      </div>
    </main>
  )
}
