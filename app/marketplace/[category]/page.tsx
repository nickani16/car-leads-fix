import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import MarketplaceCategoryBrowser, {
  type MarketplaceListing,
} from '@/app/components/MarketplaceCategoryBrowser'
import MarketplaceChannelNav from '@/app/components/MarketplaceChannelNav'
import PublicFooter from '@/app/components/PublicFooter'
import PublicHeader from '@/app/components/PublicHeader'
import { createAdminClient } from '@/lib/supabase/admin'

const categories = {
  cars: {
    slug: 'cars',
    label: 'Bilar',
    singular: 'en bil',
    description: 'Nya och begagnade bilar från privatpersoner och företag i hela Europa.',
    filters: ['Nya', 'Begagnade', 'El', 'Hybrid', 'SUV', 'Pris', 'Miltal'],
    matches: ['car', 'bil', 'sedan', 'suv', 'kombi', 'hatchback', 'coupe'],
  },
  vans: {
    slug: 'vans',
    label: 'Transportbilar',
    singular: 'en transportbil',
    description: 'Transportbilar och lätta nyttofordon från säljare i hela Europa.',
    filters: ['Nya', 'Begagnade', 'Skåpbil', 'Pickup', 'El', 'Pris', 'Miltal'],
    matches: ['van', 'skåpbil', 'transport'],
  },
  bikes: {
    slug: 'bikes',
    label: 'Motorcyklar',
    singular: 'en motorcykel',
    description: 'Motorcyklar för pendling, touring och fritid på en europeisk marknad.',
    filters: ['Nya', 'Begagnade', 'Touring', 'Sport', 'Cruiser', 'Pris', 'Effekt'],
    matches: ['motorcycle', 'motorcykel', 'bike'],
  },
  motorhomes: {
    slug: 'motorhomes',
    label: 'Husbilar',
    singular: 'en husbil',
    description: 'Husbilar från privatpersoner och företag i flera europeiska länder.',
    filters: ['Nya', 'Begagnade', 'Helintegrerad', 'Halvintegrerad', 'Pris', 'Sovplatser'],
    matches: ['motorhome', 'husbil'],
  },
  caravans: {
    slug: 'caravans',
    label: 'Husvagnar',
    singular: 'en husvagn',
    description: 'Jämför husvagnar, planlösningar och säljare över hela Europa.',
    filters: ['Nya', 'Begagnade', 'Enkelaxel', 'Dubbelaxel', 'Pris', 'Sovplatser'],
    matches: ['caravan', 'husvagn'],
  },
  trucks: {
    slug: 'trucks',
    label: 'Lastbilar',
    singular: 'en lastbil',
    description: 'Tunga fordon och transportlösningar för professionella köpare.',
    filters: ['Dragbil', 'Distributionsbil', 'Tippbil', 'Kranbil', 'Pris', 'Euroklass'],
    matches: ['truck', 'lastbil'],
  },
  farm: {
    slug: 'farm',
    label: 'Lantbruk',
    singular: 'ett lantbruksfordon',
    description: 'Traktorer och lantbruksmaskiner från europeiska säljare.',
    filters: ['Traktorer', 'Skörd', 'Redskap', 'Nya', 'Begagnade', 'Pris', 'Drifttimmar'],
    matches: ['tractor', 'traktor', 'farm'],
  },
  plant: {
    slug: 'plant',
    label: 'Entreprenad',
    singular: 'en entreprenadmaskin',
    description: 'Entreprenadmaskiner och utrustning för bygg, mark och anläggning.',
    filters: ['Grävmaskin', 'Hjullastare', 'Dumper', 'Nya', 'Begagnade', 'Pris', 'Drifttimmar'],
    matches: ['plant', 'excavator', 'construction', 'entreprenad'],
  },
  'electric-bikes': {
    slug: 'electric-bikes',
    label: 'Elcyklar',
    singular: 'en elcykel',
    description: 'Elcyklar för stad, pendling och fritid från hela Europa.',
    filters: ['City', 'Lastcykel', 'Mountainbike', 'Nya', 'Begagnade', 'Pris', 'Räckvidd'],
    matches: ['electric bike', 'elcykel', 'e-bike'],
  },
  'e-scooters': {
    slug: 'e-scooters',
    label: 'Elsparkcyklar',
    singular: 'en elsparkcykel',
    description: 'Elsparkcyklar och elektrisk mikromobilitet från europeiska säljare.',
    filters: ['Pendling', 'Lång räckvidd', 'Hopfällbar', 'Nya', 'Begagnade', 'Pris'],
    matches: ['scooter', 'elsparkcykel', 'e-scooter'],
  },
} as const

export default async function MarketplaceCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category } = await params
  const config = categories[category as keyof typeof categories]
  if (!config) notFound()
  const requestHeaders = await headers()
  const hostname = (
    requestHeaders.get('host') ||
    requestHeaders.get('x-forwarded-host') ||
    ''
  ).toLowerCase()
  const locale = hostname.includes('autorell.de')
    ? 'de'
    : hostname.includes('autorell.com')
      ? 'en'
      : 'sv'

  const now = new Date().toISOString()
  const { data } = await createAdminClient()
    .from('leads')
    .select(
      'id,make,model,model_year,miles,fuel_type,body_type,origin_country,source,sale_format,buy_now_price,seller_target_price,images,seller_user_id,seller_public_name,seller_is_trader,vehicle_category',
    )
    .eq('status', 'Active')
    .is('auction_closed_at', null)
    .gt('auction_ends_at', now)
    .order('listing_priority', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(80)

  const listings: MarketplaceListing[] = (data || [])
    .filter((lead) => {
      const haystack = `${lead.body_type || ''} ${lead.make || ''} ${lead.model || ''}`.toLowerCase()
      return lead.vehicle_category === category || (category === 'cars' && !lead.vehicle_category) || config.matches.some((match) => haystack.includes(match))
    })
    .map((lead) => {
      const mileage = Number(lead.miles)
      const price = Number(lead.buy_now_price || lead.seller_target_price)
      const images = Array.isArray(lead.images) ? lead.images : []
      return {
        id: lead.id,
        make: lead.make || '',
        model: lead.model || '',
        title: `${lead.make || config.label} ${lead.model || ''}`.trim(),
        year: lead.model_year,
        mileageKm: Number.isFinite(mileage) ? mileage * 10 : null,
        fuelType: lead.fuel_type,
        country: normalizeCountry(lead.origin_country || lead.source),
        saleFormat: lead.sale_format === 'marketplace' ? 'marketplace' : 'auction',
        priceLabel:
          Number.isFinite(price) && price > 0
            ? `Pris visas efter verifiering`
            : 'Kontakta säljaren',
        priceValue: Number.isFinite(price) && price > 0 ? price : null,
        imageAvailable: typeof images[0] === 'string',
        imageUrl: typeof images[0] === 'string' ? images[0] : null,
        sellerName: lead.seller_public_name || 'Autorell',
        sellerIsTrader: Boolean(lead.seller_is_trader),
        messagingEnabled: Boolean(lead.seller_user_id),
      }
    })

  return (
    <main className="min-h-screen w-full min-w-0 max-w-full overflow-x-hidden bg-[#f7f8fb] text-[#101828]">
      <PublicHeader
        locale={locale}
        marketplaceChannel={{
          slug: config.slug,
          label: localizedChannelLabel(config.slug, config.label, locale),
        }}
      />
      <MarketplaceChannelNav
        slug={config.slug}
        label={localizedChannelLabel(config.slug, config.label, locale)}
        locale={locale}
      />
      <MarketplaceCategoryBrowser category={config} listings={listings} locale={locale} />
      <PublicFooter locale={locale} />
    </main>
  )
}

function localizedChannelLabel(slug: string, fallback: string, locale: 'sv' | 'en' | 'de') {
  if (locale === 'sv') return fallback
  const labels: Record<string, { en: string; de: string }> = {
    cars: { en: 'Cars', de: 'Autos' },
    vans: { en: 'Vans', de: 'Transporter' },
    bikes: { en: 'Motorcycles', de: 'Motorräder' },
    motorhomes: { en: 'Motorhomes', de: 'Wohnmobile' },
    caravans: { en: 'Caravans', de: 'Wohnwagen' },
    trucks: { en: 'Trucks', de: 'Lkw' },
    farm: { en: 'Farm machinery', de: 'Landmaschinen' },
    plant: { en: 'Construction machinery', de: 'Baumaschinen' },
    'electric-bikes': { en: 'Electric bikes', de: 'E-Bikes' },
    'e-scooters': { en: 'E-scooters', de: 'E-Scooter' },
  }
  return labels[slug]?.[locale] || fallback
}

function normalizeCountry(value: string | null) {
  const normalized = (value || 'SE').trim().toUpperCase()
  const aliases: Record<string, string> = {
    SWEDEN: 'SE',
    SVERIGE: 'SE',
    GERMANY: 'DE',
    DEUTSCHLAND: 'DE',
    DENMARK: 'DK',
    DANMARK: 'DK',
    FINLAND: 'FI',
  }
  return aliases[normalized] || normalized.slice(0, 2)
}
