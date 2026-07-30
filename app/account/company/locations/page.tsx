import { Building2, CheckCircle2, MapPin, Route, Store, type LucideIcon } from 'lucide-react'
import { CompanyPortalShell, getCompanyPortalContext } from '@/lib/company-portal'
import { createAdminClient } from '@/lib/supabase/admin'
import { translatePublicObject, type PublicLocale } from '@/lib/public-i18n'
import { generateAccountMetadata } from '@/lib/account-seo'
import { CompanyLocationForm } from './CompanyLocationForm'

export const generateMetadata = generateAccountMetadata('company-locations')

type LocationRow = {
  id: string
  name: string | null
  location_type: string | null
  country_code: string | null
  region: string | null
  municipality: string | null
  city: string | null
  postal_code: string | null
  address_line_1: string | null
  contact_email: string | null
  contact_phone: string | null
  is_primary: boolean | null
  is_active: boolean | null
}

const baseCopy = {
  title: 'Locations and branches',
  description: 'Separate branches, showrooms and storage locations so larger dealers can manage inventory without mixing every vehicle into one company profile.',
  primaryLocation: 'Primary location',
  activeLocation: 'Active location',
  branch: 'Branch',
  showroom: 'Showroom',
  storage: 'Storage',
  headquarters: 'Headquarters',
  service: 'Service',
  other: 'Other',
  noLocationsTitle: 'No separate branches yet',
  noLocationsText: 'Start with the company profile as the main location. Branch inventory can be split into separate locations as the dealership grows.',
  addBranch: 'Add branch',
  comingNext: 'Create branches here and use the same branch names in manual listings or CSV imports.',
  routingTitle: 'How this helps larger dealers',
  routingText: 'Each branch can keep its own city, municipality, address and contact details. Listings can then be routed to the right sales team and shown more accurately in marketplace filters, maps and company pages.',
  dataTitle: 'Branch data model',
  dataText: 'The database foundation is ready for headquarters, branches, showrooms, storage and service locations with address, geo and contact fields.',
  formIntro: 'Add one physical place at a time. For groups with many locations, use the same names in the CSV branch column.',
  name: 'Name',
  type: 'Type',
  countryCode: 'Country code',
  region: 'Region',
  municipality: 'Municipality',
  city: 'City',
  postalCode: 'Postal code',
  addressLine1: 'Street address',
  contactEmail: 'Contact email',
  contactPhone: 'Contact phone',
  saveBranch: 'Save branch',
  saving: 'Saving',
  saved: 'Branch saved',
}

export default async function CompanyLocationsPage({ localeOverride }: { localeOverride?: PublicLocale } = {}) {
  const context = await getCompanyPortalContext(localeOverride)
  const copy = translatePublicObject(context.locale, baseCopy)
  const admin = createAdminClient()
  const locations = await loadLocations(admin, context.profile.company_id)
  const fallbackLocation = !locations.length
    ? [{
        id: 'company-profile',
        name: context.profile.company_name || 'Autorell',
        location_type: 'headquarters',
        country_code: context.profile.country_code || null,
        region: null,
        municipality: null,
        city: null,
        postal_code: null,
        address_line_1: null,
        contact_email: context.profile.email || null,
        contact_phone: null,
        is_primary: true,
        is_active: true,
      }] satisfies LocationRow[]
    : []
  const visibleLocations = locations.length ? locations : fallbackLocation

  return (
    <CompanyPortalShell context={context} active="locations" title={copy.title} description={copy.description}>
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-[16px] border border-[#d9e2ef] bg-white p-5 shadow-[0_18px_50px_rgba(16,24,40,.045)] sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold tracking-[-.025em] text-[#101828]">{copy.title}</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-[#667085]">{copy.comingNext}</p>
          <div className="mt-5 grid gap-3">
            {visibleLocations.map((location) => (
              <LocationCard key={location.id} location={location} copy={copy} />
            ))}
          </div>
          {!locations.length ? (
            <div className="mt-4 rounded-[14px] border border-dashed border-[#b9cff7] bg-[#f7fbff] p-4">
              <p className="text-sm font-semibold text-[#101828]">{copy.noLocationsTitle}</p>
              <p className="mt-1 text-sm leading-6 text-[#667085]">{copy.noLocationsText}</p>
            </div>
          ) : null}
        </div>

        <aside className="grid gap-4">
          <CompanyLocationForm copy={copy} defaultCountryCode={(context.profile.country_code || 'SE').toUpperCase()} />
          <InfoCard icon={Route} title={copy.routingTitle} text={copy.routingText} />
          <InfoCard icon={Building2} title={copy.dataTitle} text={copy.dataText} />
        </aside>
      </section>
    </CompanyPortalShell>
  )
}

async function loadLocations(admin: ReturnType<typeof createAdminClient>, companyId: string | null): Promise<LocationRow[]> {
  if (!companyId) return []
  try {
    const { data, error } = await admin
      .from('marketplace_company_locations')
      .select('id,name,location_type,country_code,region,municipality,city,postal_code,address_line_1,contact_email,contact_phone,is_primary,is_active')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('is_primary', { ascending: false })
      .order('name', { ascending: true })
      .limit(50)
    if (error || !data) return []
    return data as LocationRow[]
  } catch {
    return []
  }
}

function LocationCard({ location, copy }: { location: LocationRow; copy: typeof baseCopy }) {
  const locationType = location.location_type && location.location_type in copy
    ? copy[location.location_type as keyof typeof baseCopy]
    : copy.branch
  const place = [location.address_line_1, location.postal_code, location.city, location.municipality, location.region, location.country_code]
    .filter(Boolean)
    .join(', ')
  const contact = [location.contact_email, location.contact_phone].filter(Boolean).join(' · ')

  return (
    <article className="rounded-[14px] border border-[#e4ebf5] bg-[#fbfdff] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[13px] bg-[#eef5ff] text-[#0866ff]">
            <Store className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-[#101828]">{location.name || copy.primaryLocation}</h3>
            <p className="mt-1 text-sm font-medium text-[#667085]">{place || locationType}</p>
            {contact ? <p className="mt-1 truncate text-sm text-[#667085]">{contact}</p> : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {location.is_primary ? <Badge label={copy.primaryLocation} icon={CheckCircle2} /> : null}
          <Badge label={String(locationType)} icon={MapPin} />
        </div>
      </div>
    </article>
  )
}

function InfoCard({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <section className="rounded-[16px] border border-[#d9e2ef] bg-white p-5 shadow-[0_18px_50px_rgba(16,24,40,.045)]">
      <span className="grid h-11 w-11 place-items-center rounded-[13px] bg-[#eef5ff] text-[#0866ff]">
        <Icon className="h-5 w-5" />
      </span>
      <h2 className="mt-4 text-lg font-semibold tracking-[-.025em] text-[#101828]">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-[#667085]">{text}</p>
    </section>
  )
}

function Badge({ label, icon: Icon }: { label: string; icon: LucideIcon }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eef5ff] px-3 py-1 text-xs font-bold text-[#0866ff]">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  )
}
