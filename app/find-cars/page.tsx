import { headers } from 'next/headers'
import {
  ArrowRight,
  BadgeCheck,
  Globe2,
  LockKeyhole,
  Search,
} from 'lucide-react'
import Link from 'next/link'
import PublicFooter from '@/app/components/PublicFooter'
import PublicHeader from '@/app/components/PublicHeader'
import { createAdminClient } from '@/lib/supabase/admin'
import { createPublicMetadata } from '@/lib/public-seo'
import PublicVehicleBrowser, {
  type PublicVehicle,
} from './PublicVehicleBrowser'

export const dynamic = 'force-dynamic'

type Locale = 'sv' | 'de' | 'en'

const pageCopy = {
  sv: {
    title: 'Hitta bilar till salu | Autorell',
    description:
      'Se aktuella fordon från Sverige och Europa. Verifierade bilhandlare får tillgång till fullständiga fordonsdata, priser och budgivning.',
    eyebrow: 'Publikt fordonsutbud',
    heading: 'Hitta bilar till salu just nu.',
    text: 'Utforska svenska fordon som Autorell erbjuder till verifierade bilhandlare i Europa. Fullständig fordonsdata, pris och budgivning kräver godkänt konto.',
    apply: 'Ansök som bilhandlare',
    login: 'Logga in',
    signals: ['Svenska exportfordon', 'Verifierade professionella köpare', 'Autorell som avtalspart'],
    live: 'publicerade fordon',
  },
  de: {
    title: 'Aktuelle Fahrzeuge finden | Autorell',
    description:
      'Entdecken Sie aktuelle Fahrzeuge aus Schweden und Europa. Verifizierte Händler erhalten vollständige Fahrzeugdaten, Preise und Gebotszugang.',
    eyebrow: 'Öffentliches Fahrzeugangebot',
    heading: 'Fahrzeuge finden, die jetzt verfügbar sind.',
    text: 'Entdecken Sie aktuelles Angebot aus unseren europäischen Märkten. Vollständige Fahrzeugdaten, Preise und Gebote sind verifizierten Händlern vorbehalten.',
    apply: 'Händlerzugang beantragen',
    login: 'Anmelden',
    signals: ['Fahrzeuge aus mehreren Märkten', 'Verifizierte professionelle Käufer', 'Sicherer Handel über Autorell'],
    live: 'veröffentlichte Fahrzeuge',
  },
  en: {
    title: 'Find cars for sale right now | Autorell',
    description:
      'Explore current vehicles from Sweden and Europe. Verified dealers get complete vehicle data, pricing and bidding access.',
    eyebrow: 'Public vehicle supply',
    heading: 'Find cars for sale right now.',
    text: 'Explore Swedish vehicles offered by Autorell to verified dealers across Europe. Complete vehicle data, pricing and bidding require an approved account.',
    apply: 'Apply for dealer access',
    login: 'Dealer login',
    signals: ['Swedish export vehicles', 'Verified professional buyers', 'Autorell as contracting seller'],
    live: 'live vehicles',
  },
} as const

function localeFromHost(host: string): Locale {
  if (host.includes('autorell.de')) return 'de'
  if (host.includes('autorell.com') || host.includes('autorell.eu')) return 'en'
  return 'sv'
}

function normalizeCountry(value: string | null) {
  const normalized = (value || 'SE').trim().toUpperCase()
  const names: Record<string, string> = {
    SWEDEN: 'SE',
    SVERIGE: 'SE',
    GERMANY: 'DE',
    DEUTSCHLAND: 'DE',
    DENMARK: 'DK',
    DANMARK: 'DK',
    NORWAY: 'NO',
    NORGE: 'NO',
    FINLAND: 'FI',
  }
  return names[normalized] || normalized.slice(0, 2)
}

function getPriceBand(value: number | string | null) {
  const price = Number(value)
  if (!Number.isFinite(price) || price <= 0) return null
  if (price < 15_000) return 'under-15' as const
  if (price < 30_000) return '15-30' as const
  if (price < 50_000) return '30-50' as const
  return '50-plus' as const
}

export async function generateMetadata() {
  const headerStore = await headers()
  const locale = localeFromHost(headerStore.get('host') || '')
  const t = pageCopy[locale]

  return createPublicMetadata({
    title: t.title,
    description: t.description,
    path:
      locale === 'sv'
        ? '/hitta-bilar'
        : locale === 'de'
          ? '/fahrzeuge-finden'
          : '/find-cars',
    locale,
    languagePaths: {
      sv: '/hitta-bilar',
      de: '/fahrzeuge-finden',
      en: '/find-cars',
    },
  })
}

export default async function FindCarsPage() {
  const headerStore = await headers()
  const locale = localeFromHost(headerStore.get('host') || '')
  const t = pageCopy[locale]
  const dealerAccessHref =
    locale === 'sv'
      ? '/bli-bilhandlare'
      : locale === 'de'
        ? '/haendlerzugang'
        : '/dealer-apply'
  const now = new Date().toISOString()

  const { data } = await createAdminClient()
    .from('leads')
    .select(
      'id,make,model,model_year,miles,fuel_type,body_type,origin_country,source,sale_format,buy_now_price,seller_target_price,images'
    )
    .eq('status', 'Active')
    .is('auction_closed_at', null)
    .gt('auction_ends_at', now)
    .order('listing_priority', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(120)

  const vehicles: PublicVehicle[] = (data || []).map((lead) => {
    const images = Array.isArray(lead.images) ? lead.images : []
    const miles = Number(lead.miles)

    return {
      id: lead.id,
      make: lead.make,
      model: lead.model,
      modelYear: lead.model_year,
      mileageKm: Number.isFinite(miles) ? miles * 10 : null,
      fuelType: lead.fuel_type,
      bodyType: lead.body_type,
      originCountry: normalizeCountry(lead.origin_country || lead.source),
      saleFormat:
        lead.sale_format === 'marketplace' ? 'marketplace' : 'auction',
      priceBand: getPriceBand(lead.buy_now_price || lead.seller_target_price),
      imageAvailable: typeof images[0] === 'string',
    }
  })

  return (
    <main className="overflow-hidden bg-[#f7f5f0] text-[#202124]">
      <PublicHeader locale={locale} />

      <section className="relative overflow-hidden border-b border-[#dfe6e8] bg-[linear-gradient(145deg,#fbf8f1_0%,#edf6f9_58%,#e3f0f5_100%)]">
        <div className="absolute -left-36 -top-44 h-[430px] w-[430px] rounded-full border-[62px] border-white/55" />
        <div className="absolute -bottom-48 right-[-90px] h-[420px] w-[420px] rounded-full border-[58px] border-[#B4D9EF]/35" />
        <div className="relative mx-auto grid min-w-0 max-w-[1320px] gap-12 px-5 pb-16 pt-14 sm:px-8 sm:pb-24 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:px-12 lg:pb-28 lg:pt-20">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#c6dbe4] bg-white/75 px-4 py-2 text-xs font-medium text-[#496878] shadow-sm backdrop-blur">
              <Search className="h-4 w-4" />
              {t.eyebrow}
            </span>
            <h1 className="mt-6 max-w-3xl break-words text-[40px] leading-[.99] tracking-[-0.055em] min-[420px]:text-[43px] sm:text-6xl lg:text-[76px]">
              {t.heading}
            </h1>
            <p className="mt-6 max-w-2xl text-[17px] leading-8 text-[#526b78] sm:text-xl">
              {t.text}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={dealerAccessHref}
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#242424] px-7 text-sm font-medium text-white"
              >
                {t.apply}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full border border-[#bfcfd7] bg-white/75 px-7 text-sm font-medium"
              >
                {t.login}
                <LockKeyhole className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="relative min-w-0">
            <div className="rounded-[28px] border border-[#cfe0e7] bg-white/88 p-6 text-[#202124] shadow-[0_30px_80px_rgba(62,94,108,.14)] backdrop-blur-xl sm:p-8">
              <div className="flex items-center justify-between border-b border-[#dce8ed] pb-6">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#4f8298]">
                    Autorell Dealer Network
                  </p>
                  <p className="mt-2 text-2xl tracking-[-0.04em]">
                    {vehicles.length} {t.live}
                  </p>
                </div>
                <span className="grid h-11 w-11 place-items-center rounded-full bg-[#B4D9EF] text-[#202124]">
                  <Globe2 className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-6 grid gap-3">
                {t.signals.map((signal) => (
                  <div
                    key={signal}
                    className="flex min-w-0 items-center gap-4 rounded-[15px] border border-[#d9e5ea] bg-[#f6fafb] px-4 py-4"
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#B4D9EF] text-[#202124]">
                      <BadgeCheck className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 text-sm text-[#526b78]">{signal}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicVehicleBrowser vehicles={vehicles} locale={locale} />
      <PublicFooter locale={locale} />
    </main>
  )
}
