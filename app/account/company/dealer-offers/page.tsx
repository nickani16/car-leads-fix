import Image from 'next/image'
import Link from 'next/link'
import { after } from 'next/server'
import { ArrowRight, CarFront, Clock3, FileText, ImageIcon, Mail, Phone, ShieldCheck } from 'lucide-react'
import {
  CompanyPortalShell,
  EmptyPanel,
  LockedFeature,
  getCompanyPortalContext,
} from '@/lib/company-portal'
import { localizePublicHref, translatePublic, type PublicLocale } from '@/lib/public-i18n'
import { createAdminClient } from '@/lib/supabase/admin'
import { getEuCountryName } from '@/lib/eu-countries'
import {
  DEALER_LEAD_COUNTRY_CODES,
  dealerLeadAccessStartsAt,
  getDealerLeadPreferences,
  normalizeDealerLeadCountryCode,
  resolveDealerLeadCountryScope,
  type DealerLeadCountryCode,
} from '@/lib/dealer-leads/access'
import { getDealerOffersCopy, type DealerOffersCopy } from '@/lib/dealer-leads/i18n'
import DealerLeadPreferencesForm from './DealerLeadPreferencesForm'

type DealerVehicleLead = {
  id: string
  reference: string
  vin: string | null
  make: string | null
  model: string | null
  model_year: number | null
  mileage_km: number | null
  fuel_type: string | null
  transmission: string | null
  body_type: string | null
  color: string | null
  engine_power: string | null
  previous_owners: number | null
  key_count: string | null
  service_book: string | null
  last_service: string | null
  summer_tires: string | null
  winter_tires: string | null
  inspected: string | null
  drivable: string | null
  finance_status: string | null
  visible_damage: string | null
  damage_description: string | null
  cosmetic_damage: string | null
  accident_history: string | null
  warning_lights: string | null
  technical_problems: string | null
  engine_transmission_problems: string | null
  rust: string | null
  serviced_by_schedule: string | null
  smoke_free: string | null
  interior_damage: string | null
  other_notes: string | null
  first_name: string | null
  last_name: string | null
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  postal_code: string | null
  city: string | null
  preferred_contact: string | null
  source_country_code: string
  status: string
  created_at: string
  images: DealerLeadImage[]
}

type DealerLeadImage = {
  id: string
  lead_id: string
  image_type: string
  label: string
  position: number
  webp_url: string
}

export default async function CompanyDealerOffersPage({ localeOverride }: { localeOverride?: PublicLocale } = {}) {
  const context = await getCompanyPortalContext(localeOverride)
  const copy = getDealerOffersCopy(context.locale)
  const accessStartsAt = dealerLeadAccessStartsAt(context.subscription)
  const unlocked = Boolean(accessStartsAt)
  const admin = createAdminClient()
  const homeCountry = normalizeDealerLeadCountryCode(context.profile.country_code)
  const preferences = unlocked ? await getDealerLeadPreferences(admin, {
    userId: context.userId,
    companyId: context.profile.company_id,
    homeCountry,
    profileEmail: context.profile.email,
  }) : null
  const countries = preferences ? resolveDealerLeadCountryScope(preferences, homeCountry) : []
  const leads = accessStartsAt ? await getDealerVehicleLeads(admin, countries, accessStartsAt) : []

  if (unlocked) {
    const seenAt = new Date().toISOString()
    after(async () => {
      const { error } = await admin.from('dealer_lead_notification_preferences').upsert({
        user_id: context.userId,
        company_id: context.profile.company_id,
        last_seen_at: seenAt,
        updated_at: seenAt,
      }, { onConflict: 'user_id' })
      if (error) console.error('dealer leads mark seen failed', error)
    })
  }

  const countryOptions = DEALER_LEAD_COUNTRY_CODES.map((code) => ({ code, name: getEuCountryName(code, context.locale) }))

  return (
    <CompanyPortalShell context={context} active="dealerOffers" title={copy.title} description={copy.description}>
      {!unlocked ? (
        <LockedFeature locale={context.locale} requiredPlan="Growth" text={copy.lockedText} />
      ) : (
        <div className="grid gap-6">
          <section className="rounded-[18px] border border-[#b9cff7] bg-[#f7fbff] p-6 shadow-[0_18px_50px_rgba(16,24,40,.045)]">
            <div className="grid gap-4 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
              <span className="grid h-12 w-12 place-items-center rounded-[14px] bg-white text-[#0866ff]"><CarFront className="h-5 w-5" /></span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[.16em] text-[#0866ff]">{copy.planBadge}</p>
                <h2 className="mt-1 text-xl font-semibold tracking-[-.025em] text-[#101828]">{copy.introTitle}</h2>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-[#5f6b7a]">{copy.introText}</p>
              </div>
              <Link href={localizePublicHref(context.locale, '/sell-to-dealer')} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#0866ff] px-5 text-sm font-bold text-white">
                {copy.viewPublicPage}<ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>

          {preferences ? (
            <DealerLeadPreferencesForm
              copy={copy}
              homeCountry={homeCountry}
              countries={countryOptions}
              initial={{
                emailEnabled: preferences.emailEnabled,
                notificationEmail: preferences.notificationEmail || '',
                allCountries: preferences.allCountries,
                countryCodes: preferences.countryCodes,
              }}
            />
          ) : null}

          {leads.length ? (
            <div className="grid gap-5">
              {leads.map((lead) => <LeadCard key={lead.id} lead={lead} copy={copy} locale={context.locale} />)}
            </div>
          ) : (
            <EmptyPanel icon={FileText} title={copy.noRequestsTitle} text={copy.noRequestsText} />
          )}

          <section className="rounded-[18px] border border-[#d9e2ef] bg-white p-6 shadow-[0_18px_50px_rgba(16,24,40,.045)]">
            <h2 className="text-xl font-semibold tracking-[-.025em] text-[#101828]">{copy.workflowTitle}</h2>
            <div className="mt-4 grid gap-3">
              {copy.workflow.map((item) => (
                <p key={item} className="flex gap-3 text-sm leading-6 text-[#344054]"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#079455]" /><span>{item}</span></p>
              ))}
            </div>
          </section>
        </div>
      )}
    </CompanyPortalShell>
  )
}

function LeadCard({ lead, copy, locale }: { lead: DealerVehicleLead; copy: DealerOffersCopy; locale: PublicLocale }) {
  const l = copy.labels
  const contactName = lead.contact_name || [lead.first_name, lead.last_name].filter(Boolean).join(' ')
  return (
    <article className="rounded-[18px] border border-[#d9e2ef] bg-white p-5 shadow-[0_18px_50px_rgba(16,24,40,.045)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.14em] text-[#0866ff]">{copy.statuses[lead.status] || lead.status} · {formatDate(lead.created_at, locale)}</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-.04em] text-[#101828]">{vehicleLabel(lead)}</h2>
          <p className="mt-1 font-mono text-xs text-[#667085]">{lead.vin || lead.reference}</p>
          <p className="mt-2 text-sm font-semibold text-[#475467]">{copy.country}: {getEuCountryName(lead.source_country_code, locale)}</p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#eef5ff] px-3 py-1 text-xs font-bold text-[#0866ff]"><Clock3 className="h-3.5 w-3.5" />{lead.reference}</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {lead.contact_phone ? <a href={`tel:${lead.contact_phone}`} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#0866ff] px-5 text-sm font-bold text-white"><Phone className="h-4 w-4" />{copy.call}</a> : null}
        {lead.contact_email ? <a href={`mailto:${lead.contact_email}?subject=${encodeURIComponent(`${lead.reference} - ${vehicleLabel(lead)}`)}`} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[#0866ff] px-5 text-sm font-bold text-[#0866ff]"><Mail className="h-4 w-4" />{copy.sendEmail}</a> : null}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <InfoGroup title={copy.vehicleDetails} items={[
          [l.mileage, lead.mileage_km ? `${new Intl.NumberFormat(localeTag(locale)).format(lead.mileage_km)} km` : '-'], [l.fuel, localizedLeadValue(locale, lead.fuel_type)], [l.transmission, localizedLeadValue(locale, lead.transmission)], [l.bodyType, localizedLeadValue(locale, lead.body_type)], [l.color, lead.color], [l.enginePower, lead.engine_power], [l.previousOwners, lead.previous_owners?.toString()], [l.keys, localizedLeadValue(locale, lead.key_count)], [l.serviceBook, localizedLeadValue(locale, lead.service_book)], [l.lastService, lead.last_service], [l.summerTires, localizedLeadValue(locale, lead.summer_tires)], [l.winterTires, localizedLeadValue(locale, lead.winter_tires)], [l.inspected, localizedLeadValue(locale, lead.inspected)], [l.drivable, localizedLeadValue(locale, lead.drivable)], [l.finance, localizedLeadValue(locale, lead.finance_status)],
        ]} />
        <InfoGroup title={copy.conditionHistory} items={[
          [l.visibleDamage, localizedLeadValue(locale, lead.visible_damage)], [l.damageDescription, lead.damage_description], [l.cosmetic, localizedLeadValue(locale, lead.cosmetic_damage)], [l.accident, localizedLeadValue(locale, lead.accident_history)], [l.warningLights, localizedLeadValue(locale, lead.warning_lights)], [l.technical, localizedLeadValue(locale, lead.technical_problems)], [l.engineTransmission, localizedLeadValue(locale, lead.engine_transmission_problems)], [l.rust, localizedLeadValue(locale, lead.rust)], [l.serviced, localizedLeadValue(locale, lead.serviced_by_schedule)], [l.smokeFree, localizedLeadValue(locale, lead.smoke_free)], [l.interior, localizedLeadValue(locale, lead.interior_damage)], [l.other, lead.other_notes],
        ]} />
        <InfoGroup title={copy.contactDetails} items={[
          [l.name, contactName], [l.email, lead.contact_email], [l.phone, lead.contact_phone], [l.postalCode, lead.postal_code], [l.city, lead.city], [copy.country, getEuCountryName(lead.source_country_code, locale)], [l.preferredContact, localizedLeadValue(locale, lead.preferred_contact)],
        ]} />
      </div>

      <div className="mt-5">
        <h3 className="flex items-center gap-2 text-sm font-bold text-[#101828]"><ImageIcon className="h-4 w-4 text-[#0866ff]" />{copy.images} ({lead.images.length})</h3>
        {lead.images.length ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {lead.images.map((image) => (
              <a key={image.id} href={image.webp_url} target="_blank" rel="noreferrer" className="group overflow-hidden rounded-[14px] border border-[#d9e2ef] bg-[#f8fbff]">
                <span className="relative block aspect-[4/3]"><Image src={image.webp_url} alt={image.label} fill sizes="220px" className="object-cover transition group-hover:scale-[1.03]" /></span>
                <span className="block px-3 py-2 text-xs font-bold text-[#344054]">{image.label}</span>
              </a>
            ))}
          </div>
        ) : <p className="mt-2 text-sm text-[#667085]">{copy.noImages}</p>}
      </div>
    </article>
  )
}

function InfoGroup({ title, items }: { title: string; items: Array<[string, string | null | undefined]> }) {
  return (
    <section className="rounded-[16px] bg-[#f8fbff] p-4">
      <h3 className="text-sm font-bold text-[#101828]">{title}</h3>
      <dl className="mt-3 grid gap-2 text-xs leading-5">
        {items.map(([label, value]) => <div key={label} className="grid grid-cols-[125px_minmax(0,1fr)] gap-2"><dt className="font-semibold text-[#667085]">{label}</dt><dd className="min-w-0 break-words text-[#101828]">{value || '-'}</dd></div>)}
      </dl>
    </section>
  )
}

async function getDealerVehicleLeads(
  admin: ReturnType<typeof createAdminClient>,
  countries: DealerLeadCountryCode[],
  accessStartsAt: string,
): Promise<DealerVehicleLead[]> {
  if (!countries.length) return []
  try {
    const { data, error } = await admin
      .from('dealer_vehicle_leads')
      .select('*')
      .in('source_country_code', countries)
      .gte('created_at', accessStartsAt)
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) throw error
    const leads = (data || []) as Omit<DealerVehicleLead, 'images'>[]
    const leadIds = leads.map((lead) => lead.id)
    const imagesByLead = new Map<string, DealerLeadImage[]>()
    if (leadIds.length) {
      const { data: images, error: imageError } = await admin.from('dealer_vehicle_lead_images').select('id,lead_id,image_type,label,position,webp_url').in('lead_id', leadIds).order('position', { ascending: true })
      if (imageError) throw imageError
      for (const image of (images || []) as DealerLeadImage[]) imagesByLead.set(image.lead_id, [...(imagesByLead.get(image.lead_id) || []), image])
    }
    return leads.map((lead) => ({ ...lead, images: imagesByLead.get(lead.id) || [] }))
  } catch (error) {
    console.error('dealer vehicle leads select failed', error)
    return []
  }
}

function vehicleLabel(lead: DealerVehicleLead) {
  return [lead.make, lead.model, lead.model_year].filter(Boolean).join(' ') || lead.vin || lead.reference
}

function formatDate(value: string, locale: PublicLocale) {
  return new Intl.DateTimeFormat(localeTag(locale), { dateStyle: 'medium' }).format(new Date(value))
}

function localeTag(locale: PublicLocale) {
  if (locale === 'sv') return 'sv-SE'
  if (locale === 'da') return 'da-DK'
  if (locale === 'fi') return 'fi-FI'
  if (locale === 'at') return 'de-AT'
  if (locale === 'be') return 'nl-BE'
  return locale
}

function localizedLeadValue(locale: PublicLocale, value: string | null | undefined) {
  return value ? translatePublic(locale, value) : value
}
