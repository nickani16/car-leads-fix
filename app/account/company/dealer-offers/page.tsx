import Link from 'next/link'
import { ArrowRight, CarFront, Clock3, FileText, ShieldCheck } from 'lucide-react'
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
  description: 'Review incoming sell-to-dealer requests with VIN, make or model text and seller context.',
  lockedText: 'Dealer offer requests are available from Growth and above. Upgrade to receive VIN-based seller requests directly in the company portal.',
  planBadge: 'Growth and above',
  introTitle: 'Incoming vehicle requests',
  introText: 'When sellers submit VIN and free-text make or model, the details will appear here for dealership follow-up.',
  vin: 'VIN',
  vehicle: 'Vehicle',
  status: 'Status',
  received: 'Received',
  noRequestsTitle: 'No dealer requests yet',
  noRequestsText: 'No VIN requests match your company account yet. New seller requests appear here as soon as they are submitted.',
  viewPublicPage: 'View public page',
  workflowTitle: 'Recommended follow-up',
  workflow: [
    'Check VIN and the seller entered make or model before contacting them.',
    'Use internal valuation tools or paid VIN data providers when exact specifications are needed.',
    'Keep the response fast; dealership requests should feel quicker than a normal private listing.',
  ],
  sampleStatus: 'New request',
}

type DealerVehicleLead = {
  id: string
  reference: string
  vin: string | null
  make: string | null
  model: string | null
  model_year: number | null
  details: string | null
  status: string
  created_at: string
}

export default async function CompanyDealerOffersPage({ localeOverride }: { localeOverride?: PublicLocale } = {}) {
  const context = await getCompanyPortalContext(localeOverride)
  const copy = translatePublicObject(context.locale, baseCopy)
  const plan = String(context.subscription?.plan_key || 'free')
  const leads = planAllows(plan, 'Growth') ? await getDealerVehicleLeads() : []

  return (
    <CompanyPortalShell
      context={context}
      active="dealerOffers"
      title={copy.title}
      description={copy.description}
    >
      {!planAllows(plan, 'Growth') ? (
        <LockedFeature locale={context.locale} requiredPlan="Growth" text={copy.lockedText} />
      ) : (
        <div className="grid gap-6">
          <section className="rounded-[16px] border border-[#b9cff7] bg-[#f7fbff] p-6 shadow-[0_18px_50px_rgba(16,24,40,.045)]">
            <div className="grid gap-4 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
              <span className="grid h-12 w-12 place-items-center rounded-[14px] bg-white text-[#0866ff]">
                <CarFront className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[.16em] text-[#0866ff]">{copy.planBadge}</p>
                <h2 className="mt-1 text-xl font-semibold tracking-[-.025em] text-[#101828]">{copy.introTitle}</h2>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-[#5f6b7a]">{copy.introText}</p>
              </div>
              <Link
                href={localizePublicHref(context.locale, '/sell-to-dealer')}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[12px] bg-[#0866ff] px-4 text-sm font-bold text-white"
              >
                {copy.viewPublicPage}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>

          {leads.length ? (
            <section className="overflow-hidden rounded-[16px] border border-[#d9e2ef] bg-white shadow-[0_18px_50px_rgba(16,24,40,.045)]">
              <div className="grid min-w-[820px] grid-cols-[1fr_1.1fr_.8fr_.8fr] border-b border-[#e4eaf3] bg-[#f8fbff] px-5 py-3 text-xs font-bold uppercase tracking-[.12em] text-[#667085]">
                <span>{copy.vin}</span>
                <span>{copy.vehicle}</span>
                <span>{copy.status}</span>
                <span>{copy.received}</span>
              </div>
              <div className="overflow-x-auto">
                <div className="min-w-[820px]">
                  {leads.map((lead) => (
                    <div key={lead.id} className="grid grid-cols-[1fr_1.1fr_.8fr_.8fr] items-center border-b border-[#edf1f6] px-5 py-4 text-sm last:border-b-0">
                      <span className="font-mono font-semibold text-[#101828]">{lead.vin || lead.reference}</span>
                      <span>
                        <strong className="block text-[#101828]">{vehicleLabel(lead)}</strong>
                        {lead.details ? <span className="mt-1 line-clamp-1 block text-xs text-[#667085]">{lead.details}</span> : null}
                      </span>
                      <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#eef5ff] px-3 py-1 text-xs font-bold text-[#0866ff]">
                        <Clock3 className="h-3.5 w-3.5" />
                        {lead.status === 'new' ? copy.sampleStatus : lead.status}
                      </span>
                      <span className="text-[#667085]">{formatDate(lead.created_at, context.locale)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : (
            <EmptyPanel
              icon={FileText}
              title={copy.noRequestsTitle}
              text={copy.noRequestsText}
            />
          )}

          <section className="rounded-[16px] border border-[#d9e2ef] bg-white p-6 shadow-[0_18px_50px_rgba(16,24,40,.045)]">
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

async function getDealerVehicleLeads(): Promise<DealerVehicleLead[]> {
  try {
    const { data, error } = await createAdminClient()
      .from('dealer_vehicle_leads')
      .select('id,reference,vin,make,model,model_year,details,status,created_at')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('dealer_vehicle_leads select failed', error)
      return []
    }
    return data || []
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
