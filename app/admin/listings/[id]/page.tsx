import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/admin-auth'
import AdminEntityActions from '../../AdminEntityActions'
import { AdminPageHeader, Badge, DetailCard, DetailGrid } from '../../AdminUI'
import { categoryLabel, formatDate, formatNumber, statusTone } from '../../admin-helpers'

export const dynamic = 'force-dynamic'

export default async function AdminListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { adminClient } = await requireAdmin()
  const [{ data: listing }, { data: identifiers }, { data: events }, { data: reports }] = await Promise.all([
    adminClient
      .from('marketplace_listings')
      .select(`
        id,
        seller_user_id,
        category,
        status,
        review_status,
        title,
        description,
        make,
        model,
        variant,
        registration_reference,
        model_year,
        mileage_km,
        operating_hours,
        fuel_type,
        gearbox,
        body_type,
        color,
        condition,
        known_faults,
        service_history,
        country_code,
        city,
        price,
        currency,
        images,
        seller_name,
        seller_type,
        vin,
        chassis_number,
        serial_number,
        risk_score,
        risk_flags,
        reference_number,
        listing_number,
        created_at,
        updated_at
      `)
      .eq('id', id)
      .maybeSingle(),
    adminClient
      .from('marketplace_listing_identifiers')
      .select('total_weight_kg,axle_configuration,machine_type,metadata')
      .eq('listing_id', id)
      .maybeSingle(),
    adminClient
      .from('marketplace_listing_events')
      .select('id,event_type,from_status,to_status,from_review_status,to_review_status,metadata,created_at')
      .eq('listing_id', id)
      .order('created_at', { ascending: false })
      .limit(20),
    adminClient
      .from('marketplace_reports')
      .select('id,category,status,details,contact_email,created_at')
      .eq('listing_id', id)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  if (!listing) notFound()

  const firstImage =
    Array.isArray(listing.images) && listing.images.length ? listing.images[0] : null
  const technicalData =
    isRecord(identifiers?.metadata) && isRecord(identifiers.metadata.technical_data)
      ? identifiers.metadata.technical_data
      : {}

  return (
    <main className="px-4 py-7 sm:px-6 lg:px-8">
      <AdminPageHeader
        eyebrow={categoryLabel(listing.category)}
        title={listing.title}
        description="Detaljvy för annonsen med tekniska uppgifter, säljare, rapporter och adminåtgärder."
        backHref="/admin/listings"
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="overflow-hidden rounded-[14px] border border-[#dce3ee] bg-white">
            {firstImage ? (
              <Image
                src={firstImage}
                alt=""
                width={1200}
                height={720}
                unoptimized
                className="h-[360px] w-full object-cover"
              />
            ) : (
              <div className="grid h-[240px] place-items-center bg-[#f8fafc] text-sm text-[#667085]">
                Ingen bild
              </div>
            )}
          </section>

          <DetailCard title="Specifikationer">
            <DetailGrid
              items={[
                { label: 'Kategori', value: categoryLabel(listing.category) },
                { label: 'Märke', value: listing.make },
                { label: 'Modell', value: listing.model },
                { label: 'Variant', value: listing.variant },
                { label: 'Årsmodell', value: listing.model_year },
                { label: 'Kilometer', value: listing.mileage_km ? `${formatNumber(listing.mileage_km)} km` : null },
                { label: 'Drifttimmar', value: listing.operating_hours },
                { label: 'Totalvikt', value: formatTechnicalValue(technicalData.totalWeightKg ?? identifiers?.total_weight_kg, 'kg') },
                { label: 'Lastvikt', value: formatTechnicalValue(technicalData.payloadKg, 'kg') },
                { label: 'Lastvolym', value: formatTechnicalValue(technicalData.cargoVolumeM3, 'm³') },
                { label: 'Lastutrymme längd', value: formatTechnicalValue(technicalData.loadLengthCm, 'cm') },
                { label: 'Tågvikt', value: formatTechnicalValue(technicalData.grossCombinationWeightKg, 'kg') },
                { label: 'Axelkonfiguration', value: identifiers?.axle_configuration },
                { label: 'Antal axlar', value: formatTechnicalValue(technicalData.axleCount, '') },
                { label: 'Bränsle', value: listing.fuel_type },
                { label: 'Växellåda', value: listing.gearbox },
                { label: 'Kaross / typ', value: listing.body_type },
                { label: 'Euroklass', value: formatTechnicalValue(technicalData.euroClass, '') },
                { label: 'Sovplatser', value: formatTechnicalValue(technicalData.sleepingPlaces, '') },
                { label: 'Längd', value: formatTechnicalValue(technicalData.lengthCm, 'cm') },
                { label: 'Motorvolym', value: formatTechnicalValue(technicalData.engineCc ?? technicalData.engineLiters, technicalData.engineCc ? 'cc' : 'L') },
                { label: 'Effekt', value: formatTechnicalValue(technicalData.powerHp, 'HK') },
                { label: 'Batterikapacitet', value: formatTechnicalValue(technicalData.batteryCapacityWh, 'Wh') },
                { label: 'Batterispänning', value: formatTechnicalValue(technicalData.batteryVoltageV, 'V') },
                { label: 'Räckvidd', value: formatTechnicalValue(technicalData.rangeKm, 'km') },
                { label: 'Motoreffekt', value: formatTechnicalValue(technicalData.motorPowerW, 'W') },
                { label: 'Maxhastighet', value: formatTechnicalValue(technicalData.maxSpeedKmh, 'km/h') },
                { label: 'Maskintyp', value: identifiers?.machine_type || formatTechnicalValue(technicalData.machineType, '') },
                { label: 'Maskinvikt', value: formatTechnicalValue(technicalData.operatingWeightKg, 'kg') },
                { label: 'Grävdjup', value: formatTechnicalValue(technicalData.diggingDepthCm, 'cm') },
                { label: 'Färg', value: listing.color },
                { label: 'Regnummer', value: listing.registration_reference },
                { label: 'VIN', value: listing.vin || listing.chassis_number },
                { label: 'Serienummer', value: listing.serial_number },
                { label: 'Skick', value: listing.condition },
                { label: 'Servicehistorik', value: listing.service_history },
              ]}
            />
          </DetailCard>

          <DetailCard title="Beskrivning">
            <p className="whitespace-pre-line text-sm leading-7 text-[#344054]">
              {listing.description}
            </p>
          </DetailCard>

          <DetailCard title="Rapporter">
            {reports?.length ? (
              <div className="space-y-3">
                {reports.map((report) => (
                  <article key={report.id} className="rounded-[12px] bg-[#f8fafc] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-bold">{report.category}</p>
                      <Badge label={report.status || 'new'} tone={statusTone(report.status)} />
                    </div>
                    <p className="mt-2 text-sm text-[#475467]">{report.details}</p>
                    <p className="mt-2 text-xs text-[#667085]">
                      {report.contact_email || 'Ingen kontakt'} · {formatDate(report.created_at)}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#667085]">Inga rapporter på annonsen.</p>
            )}
          </DetailCard>

          <DetailCard title="Historik">
            {events?.length ? (
              <div className="space-y-3">
                {events.map((event) => (
                  <article key={event.id} className="rounded-[12px] bg-[#f8fafc] p-4">
                    <p className="font-bold">{event.event_type}</p>
                    <p className="mt-1 text-xs text-[#667085]">
                      {event.from_status || '-'} → {event.to_status || '-'} · {formatDate(event.created_at)}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#667085]">Ingen historik ännu.</p>
            )}
          </DetailCard>
        </div>

        <aside className="space-y-6">
          <DetailCard title="Status">
            <div className="flex flex-wrap gap-2">
              <Badge label={listing.status || 'okänd'} tone={statusTone(listing.status)} />
              <Badge label={listing.review_status || 'ej satt'} tone={statusTone(listing.review_status)} />
            </div>
            <div className="mt-5 text-sm text-[#475467]">
              <p className="font-bold text-[#101828]">
                {formatNumber(Number(listing.price))} {listing.currency}
              </p>
              <p className="mt-2">{listing.city}, {listing.country_code}</p>
              <p className="mt-2">Skapad {formatDate(listing.created_at)}</p>
            </div>
          </DetailCard>

          <DetailCard title="Säljare">
            <Link href={`/admin/users/${listing.seller_user_id}`} className="font-bold text-[#0866ff]">
              {listing.seller_name}
            </Link>
            <p className="mt-2 text-sm text-[#667085]">{listing.seller_type}</p>
          </DetailCard>

          <DetailCard title="Admin actions">
            <AdminEntityActions
              endpoint={`/api/admin/marketplace-listings/${listing.id}`}
              actions={[
                { action: 'approve', label: 'Godkänn' },
                { action: 'mark_suspicious', label: 'Misstänkt', requiresReason: true },
                { action: 'pause', label: 'Pausa', requiresReason: true },
                {
                  action: 'unpublish',
                  label: 'Avpublicera',
                  tone: 'danger',
                  requiresReason: true,
                },
                {
                  action: 'delete',
                  label: 'Radera',
                  tone: 'danger',
                  requiresReason: true,
                  confirmTitle: 'Radera annons',
                  confirmText: 'Annonsen mjukraderas och döljs från publika sökresultat. Säljaren ansvarar fortsatt för lämnade uppgifter.',
                },
              ]}
            />
          </DetailCard>
        </aside>
      </div>
    </main>
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function formatTechnicalValue(value: unknown, suffix: string) {
  if (value === null || value === undefined || value === '') return null
  const text = typeof value === 'number' ? formatNumber(value) : String(value)
  return suffix ? `${text} ${suffix}` : text
}
