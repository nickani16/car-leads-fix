import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CarFront, Clock3, FileText, ImageIcon, ShieldCheck } from 'lucide-react'
import {
  CompanyPortalShell,
  EmptyPanel,
  LockedFeature,
  getCompanyPortalContext,
  planAllows,
} from '@/lib/company-portal'
import { localizePublicHref, translatePublicObject, type PublicLocale } from '@/lib/public-i18n'
import { createAdminClient } from '@/lib/supabase/admin'

const baseCopy = {
  title: 'Dealer offers',
  description: 'Review incoming sell-to-dealer requests with vehicle details, condition, photos and contact information.',
  lockedText: 'Dealer offer requests are available from Growth and above. Upgrade to receive seller requests directly in the company portal.',
  planBadge: 'Growth and above',
  introTitle: 'Incoming vehicle requests',
  introText: 'Sellers submit structured vehicle details, photos and contact information. New requests appear here for dealership follow-up.',
  noRequestsTitle: 'No dealer requests yet',
  noRequestsText: 'New seller requests appear here as soon as they are submitted.',
  viewPublicPage: 'View public page',
  workflowTitle: 'Recommended follow-up',
  workflow: [
    'Check VIN, make, model and mileage before contacting the seller.',
    'Review condition notes and photos before making an offer.',
    'Keep the response fast; dealership requests should feel quicker than a normal private listing.',
  ],
}

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
  const copy = translatePublicObject(context.locale, baseCopy)
  const plan = String(context.subscription?.plan_key || 'free')
  const leads = planAllows(plan, 'Growth') ? await getDealerVehicleLeads() : []

  return (
    <CompanyPortalShell context={context} active="dealerOffers" title={copy.title} description={copy.description}>
      {!planAllows(plan, 'Growth') ? (
        <LockedFeature locale={context.locale} requiredPlan="Growth" text={copy.lockedText} />
      ) : (
        <div className="grid gap-6">
          <section className="rounded-[18px] border border-[#b9cff7] bg-[#f7fbff] p-6 shadow-[0_18px_50px_rgba(16,24,40,.045)]">
            <div className="grid gap-4 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
              <span className="grid h-12 w-12 place-items-center rounded-[14px] bg-white text-[#0866ff]">
                <CarFront className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[.16em] text-[#0866ff]">{copy.planBadge}</p>
                <h2 className="mt-1 text-xl font-semibold tracking-[-.025em] text-[#101828]">{copy.introTitle}</h2>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-[#5f6b7a]">{copy.introText}</p>
              </div>
              <Link href={localizePublicHref(context.locale, '/sell-to-dealer')} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#0866ff] px-5 text-sm font-bold text-white">
                {copy.viewPublicPage}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>

          {leads.length ? (
            <div className="grid gap-5">
              {leads.map((lead) => (
                <article key={lead.id} className="rounded-[18px] border border-[#d9e2ef] bg-white p-5 shadow-[0_18px_50px_rgba(16,24,40,.045)]">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[.14em] text-[#0866ff]">{statusLabel(lead.status)} · {formatDate(lead.created_at, context.locale)}</p>
                      <h2 className="mt-1 text-2xl font-semibold tracking-[-.04em] text-[#101828]">{vehicleLabel(lead)}</h2>
                      <p className="mt-1 font-mono text-xs text-[#667085]">{lead.vin || lead.reference}</p>
                    </div>
                    <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#eef5ff] px-3 py-1 text-xs font-bold text-[#0866ff]">
                      <Clock3 className="h-3.5 w-3.5" />
                      {lead.reference}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-4 lg:grid-cols-3">
                    <InfoGroup title="Biluppgifter" items={[
                      ['Mätarställning', lead.mileage_km ? `${lead.mileage_km.toLocaleString('sv-SE')} km` : '-'],
                      ['Drivmedel', lead.fuel_type],
                      ['Växellåda', lead.transmission],
                      ['Karosstyp', lead.body_type],
                      ['Färg', lead.color],
                      ['Motoreffekt', lead.engine_power],
                      ['Tidigare ägare', lead.previous_owners?.toString()],
                      ['Nycklar', lead.key_count],
                      ['Servicebok', lead.service_book],
                      ['Senast servad', lead.last_service],
                      ['Sommarhjul', lead.summer_tires],
                      ['Vinterhjul', lead.winter_tires],
                      ['Besiktigad', lead.inspected],
                      ['Körbar', lead.drivable],
                      ['Finans/kredit', lead.finance_status],
                    ]} />
                    <InfoGroup title="Skick och historik" items={[
                      ['Synliga skador', lead.visible_damage],
                      ['Skadebeskrivning', lead.damage_description],
                      ['Repor/bucklor/lack', lead.cosmetic_damage],
                      ['Olycka', lead.accident_history],
                      ['Varningslampor', lead.warning_lights],
                      ['Tekniska problem', lead.technical_problems],
                      ['Motor/växellåda', lead.engine_transmission_problems],
                      ['Rost', lead.rust],
                      ['Servad enligt intervall', lead.serviced_by_schedule],
                      ['Rökfri', lead.smoke_free],
                      ['Invändigt slitage', lead.interior_damage],
                      ['Övrigt', lead.other_notes],
                    ]} />
                    <InfoGroup title="Kontaktuppgifter" items={[
                      ['Namn', lead.contact_name || [lead.first_name, lead.last_name].filter(Boolean).join(' ')],
                      ['E-post', lead.contact_email],
                      ['Telefon', lead.contact_phone],
                      ['Postnummer', lead.postal_code],
                      ['Ort', lead.city],
                      ['Kontaktväg', lead.preferred_contact],
                    ]} />
                  </div>

                  <div className="mt-5">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-[#101828]">
                      <ImageIcon className="h-4 w-4 text-[#0866ff]" />
                      Bilder ({lead.images.length})
                    </h3>
                    {lead.images.length ? (
                      <div className="mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        {lead.images.map((image) => (
                          <a key={image.id} href={image.webp_url} target="_blank" rel="noreferrer" className="group overflow-hidden rounded-[14px] border border-[#d9e2ef] bg-[#f8fbff]">
                            <span className="relative block aspect-[4/3]">
                              <Image src={image.webp_url} alt={image.label} fill sizes="220px" className="object-cover transition group-hover:scale-[1.03]" />
                            </span>
                            <span className="block px-3 py-2 text-xs font-bold text-[#344054]">{image.label}</span>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-[#667085]">Inga bilder uppladdade.</p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyPanel icon={FileText} title={copy.noRequestsTitle} text={copy.noRequestsText} />
          )}

          <section className="rounded-[18px] border border-[#d9e2ef] bg-white p-6 shadow-[0_18px_50px_rgba(16,24,40,.045)]">
            <h2 className="text-xl font-semibold tracking-[-.025em] text-[#101828]">{copy.workflowTitle}</h2>
            <div className="mt-4 grid gap-3">
              {copy.workflow.map((item) => (
                <p key={item} className="flex gap-3 text-sm leading-6 text-[#344054]">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#079455]" />
                  <span>{item}</span>
                </p>
              ))}
            </div>
          </section>
        </div>
      )}
    </CompanyPortalShell>
  )
}

function InfoGroup({ title, items }: { title: string; items: Array<[string, string | null | undefined]> }) {
  return (
    <section className="rounded-[16px] bg-[#f8fbff] p-4">
      <h3 className="text-sm font-bold text-[#101828]">{title}</h3>
      <dl className="mt-3 grid gap-2 text-xs leading-5">
        {items.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[125px_minmax(0,1fr)] gap-2">
            <dt className="font-semibold text-[#667085]">{label}</dt>
            <dd className="min-w-0 break-words text-[#101828]">{value || '-'}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

async function getDealerVehicleLeads(): Promise<DealerVehicleLead[]> {
  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('dealer_vehicle_leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('dealer_vehicle_leads select failed', error)
      return []
    }

    const leads = (data || []) as Omit<DealerVehicleLead, 'images'>[]
    const leadIds = leads.map((lead) => lead.id)
    const imagesByLead = new Map<string, DealerLeadImage[]>()
    if (leadIds.length) {
      const { data: images, error: imageError } = await admin
        .from('dealer_vehicle_lead_images')
        .select('id,lead_id,image_type,label,position,webp_url')
        .in('lead_id', leadIds)
        .order('position', { ascending: true })
      if (imageError) console.error('dealer_vehicle_lead_images select failed', imageError)
      for (const image of (images || []) as DealerLeadImage[]) {
        imagesByLead.set(image.lead_id, [...(imagesByLead.get(image.lead_id) || []), image])
      }
    }
    return leads.map((lead) => ({ ...lead, images: imagesByLead.get(lead.id) || [] }))
  } catch (error) {
    console.error('dealer_vehicle_leads select failed', error)
    return []
  }
}

function vehicleLabel(lead: DealerVehicleLead) {
  return [lead.make, lead.model, lead.model_year].filter(Boolean).join(' ') || lead.vin || lead.reference
}

function formatDate(value: string, locale: PublicLocale) {
  return new Intl.DateTimeFormat(locale === 'sv' ? 'sv-SE' : locale, { dateStyle: 'medium' }).format(new Date(value))
}

function statusLabel(status: string) {
  if (status === 'new') return 'Ny'
  if (status === 'contacted') return 'Kontaktad'
  if (status === 'offer_sent') return 'Bud lämnat'
  if (status === 'accepted') return 'Accepterad'
  if (status === 'closed') return 'Avslutad'
  return status
}
