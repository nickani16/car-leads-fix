import { notFound, redirect } from 'next/navigation'
import { AccountBreadcrumbs } from '@/app/account/AccountBreadcrumbs'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { isAllowedAdminEmail } from '@/lib/admin-allowlist'
import { getRequestLocale } from '@/lib/request-locale'
import { localizePublicHref, translatePublic, type PublicLocale } from '@/lib/public-i18n'
import { normalizeMarketplaceCategory } from '@/lib/marketplace'
import { generateAccountMetadata } from '@/lib/account-seo'
import { resolveBusinessAccountScope } from '@/lib/billing/business-account-scope'
import type { ListingIdentifierInput } from '@/lib/marketplace-security'
import EditListingForm from './EditListingForm'

type EditListingPageProps = {
  params: Promise<{ id: string }>
}

export const generateMetadata = generateAccountMetadata('edit-listing')

export default async function EditListingPage({ params }: EditListingPageProps) {
  const locale = await getRequestLocale()
  const copy = getEditListingCopy(locale)
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(localizePublicHref(locale, '/'))

  const admin = createAdminClient()
  const { data: listing } = await admin
    .from('marketplace_listings')
    .select('id,title,category,price,currency,city,country_code,country,address,latitude,longitude,description,equipment,structured_data,status,seller_user_id,seller_type,phone_visibility,make,model,variant,model_year,mileage_km,operating_hours,body_type,fuel_type,gearbox,condition,known_faults,service_history,images')
    .eq('id', id)
    .maybeSingle()

  if (!listing) notFound()

  const scope = listing.seller_type === 'business'
    ? await resolveBusinessAccountScope(user.id, admin)
    : null
  const isOwner = listing.seller_user_id === user.id || Boolean(scope?.listingOwnerUserIds.includes(String(listing.seller_user_id)))
  const isAdmin = await isActiveAdmin(admin, user.id, user.email)
  if (!isOwner && !isAdmin) notFound()

  const { data: identifiers } = await admin
    .from('marketplace_listing_identifiers')
    .select('registration_number,vin,chassis_number,serial_number,frame_number,battery_serial_number,total_weight_kg,axle_configuration,machine_type,metadata')
    .eq('listing_id', listing.id)
    .maybeSingle()
  const category = normalizeMarketplaceCategory(listing.category)
  const metadata = isRecord(identifiers?.metadata) ? identifiers.metadata : {}
  const technicalMetadata = isRecord(metadata.technical_data) ? metadata.technical_data : {}
  const listingStructuredData = isRecord(listing.structured_data) ? listing.structured_data : {}
  const technicalData = {
    ...listingStructuredData,
    ...technicalMetadata,
    bodyType: listing.body_type || technicalMetadata.bodyType,
    fuelType: listing.fuel_type || technicalMetadata.fuelType,
    gearbox: listing.gearbox || technicalMetadata.gearbox,
    condition: listing.condition || technicalMetadata.condition,
    damageStatus: listing.known_faults || technicalMetadata.damageStatus,
    serviceHistory: listing.service_history || technicalMetadata.serviceHistory,
  }
  const identifierData: ListingIdentifierInput = {
    registrationNumber: identifiers?.registration_number || '',
    vin: identifiers?.vin || '',
    chassisNumber: identifiers?.chassis_number || '',
    serialNumber: identifiers?.serial_number || '',
    frameNumber: identifiers?.frame_number || '',
    batterySerialNumber: identifiers?.battery_serial_number || '',
    totalWeightKg: identifiers?.total_weight_kg ? Number(identifiers.total_weight_kg) : null,
    axleConfiguration: identifiers?.axle_configuration || '',
    machineType: identifiers?.machine_type || '',
    agricultureObjectType: String(metadata.agriculture_object_type || 'tractor'),
  }

  return (
    <main className="mx-auto max-w-[980px] px-5 py-8 sm:px-8 lg:py-12">
      <AccountBreadcrumbs
        locale={locale}
        items={[
          { key: 'account', href: '/account' },
          { key: 'listings', href: '/account/listings' },
          { key: 'editListing' },
        ]}
      />
      <section className="mt-6 overflow-hidden rounded-[26px] border border-[#dfe6f1] bg-white shadow-[0_22px_65px_rgba(16,24,40,.065)]">
        <div className="border-b border-[#edf1f6] bg-[#f7faff] p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#0866ff]">
            {copy.eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-.045em] sm:text-5xl">
            {listing.title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#667085]">
            {copy.intro}
          </p>
        </div>
        <EditListingForm
          locale={locale}
          listing={{
            id: listing.id,
            category,
            title: listing.title,
            make: listing.make || '',
            model: listing.model || '',
            variant: listing.variant || '',
            modelYear: listing.model_year ? Number(listing.model_year) : null,
            price: Number(listing.price),
            currency: listing.currency,
            city: listing.city,
            country: listing.country || listing.country_code,
            address: listing.address || '',
            latitude: typeof listing.latitude === 'number' ? listing.latitude : null,
            longitude: typeof listing.longitude === 'number' ? listing.longitude : null,
            description: editableDescription(listing.description),
            equipmentKeys: extractEquipmentKeys(listingStructuredData, technicalMetadata, listing.equipment),
            sellerType: listing.seller_type,
            phoneVisibility: listing.phone_visibility || 'public',
            mileage: listing.mileage_km ? Number(listing.mileage_km) : null,
            operatingHours: listing.operating_hours ? Number(listing.operating_hours) : null,
            technicalData,
            identifiers: identifierData,
            images: Array.isArray(listing.images) ? listing.images : [],
          }}
          backHref={localizePublicHref(locale, '/account/listings')}
        />
      </section>
    </main>
  )
}

function extractEquipmentKeys(
  structuredData: Record<string, unknown>,
  technicalMetadata: Record<string, unknown>,
  equipmentText: string | null,
) {
  const values = [
    structuredData.equipment_keys,
    technicalMetadata.equipment_keys,
  ]
  for (const value of values) {
    if (Array.isArray(value)) {
      return value.map(String).filter(Boolean)
    }
  }
  if (!equipmentText) return []
  return []
}

const savedPlaceholderPatterns = [
  /^Strukturerad Autorell-annons:/i,
  /^Skriv bara egen fritext/i,
  /^Write only your own free text/i,
  /^Schreiben Sie hier nur Ihren eigenen Freitext/i,
  /^Rédigez uniquement votre texte libre/i,
  /^Escribe aquí solo tu texto libre/i,
  /^Scrivi qui solo il tuo testo libero/i,
  /^Schrijf hier alleen uw eigen vrije tekst/i,
  /^Wpisz tutaj tylko własny tekst/i,
  /^Kirjoita tähän vain oma vapaatekstisi/i,
  /^Skriv kun din egen fritekst/i,
]

function editableDescription(value: string | null) {
  const text = String(value || '').trim()
  if (!text) return ''
  if (savedPlaceholderPatterns.some((pattern) => pattern.test(text))) return ''
  return value || ''
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

async function isActiveAdmin(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  email?: string | null,
) {
  if (!isAllowedAdminEmail(email)) return false

  const { data } = await admin
    .from('admin_users')
    .select('user_id')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle()

  return Boolean(data)
}

function getEditListingCopy(locale: PublicLocale) {
  const en = {
    back: 'Back to listings',
    eyebrow: 'Edit listing',
    intro: 'Changes are saved directly. Price changes are logged and shown on the listing when the price has clearly been reduced.',
  }
  if (locale === 'sv') {
    return {
      back: 'Tillbaka till annonser',
      eyebrow: 'Redigera annons',
      intro: 'Ändringar sparas direkt. Prisändringar loggas och visas på annonsen när priset har sänkts tydligt.',
    }
  }
  if (locale === 'de') {
    return {
      back: 'Zurück zu Anzeigen',
      eyebrow: 'Anzeige bearbeiten',
      intro: 'Änderungen werden direkt gespeichert. Preisänderungen werden protokolliert und in der Anzeige gezeigt, wenn der Preis deutlich gesenkt wurde.',
    }
  }
  return Object.fromEntries(
    Object.entries(en).map(([key, value]) => [key, translatePublic(locale, value)]),
  ) as typeof en
}
