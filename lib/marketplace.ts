import {
  Bike,
  BusFront,
  CarFront,
  Construction,
  Scooter,
  Tractor,
  Truck,
  Warehouse,
  type LucideIcon,
} from 'lucide-react'
import type { PublicLocale } from './public-i18n'

export type MarketplaceCategorySlug =
  | 'cars'
  | 'vans'
  | 'motorcycles'
  | 'motorhomes'
  | 'caravans'
  | 'trucks'
  | 'agriculture'
  | 'construction'
  | 'electric-bikes'
  | 'e-scooters'

export type MarketplaceCategory = {
  slug: MarketplaceCategorySlug
  icon: LucideIcon
  labels: Record<'sv' | 'en' | 'de', string>
  singular: Record<'sv' | 'en' | 'de', string>
  keywords: string[]
}

export const marketplaceCategories: MarketplaceCategory[] = [
  { slug: 'cars', icon: CarFront, labels: { sv: 'Bilar', en: 'Cars', de: 'Autos' }, singular: { sv: 'bil', en: 'car', de: 'Auto' }, keywords: ['car', 'cars', 'bil', 'auto', 'suv', 'sedan', 'kombi', 'hatchback'] },
  { slug: 'vans', icon: BusFront, labels: { sv: 'Transportbilar', en: 'Vans', de: 'Transporter' }, singular: { sv: 'transportbil', en: 'van', de: 'Transporter' }, keywords: ['van', 'vans', 'transportbil', 'skåpbil', 'transporter'] },
  { slug: 'motorcycles', icon: Bike, labels: { sv: 'Motorcyklar', en: 'Motorcycles', de: 'Motorräder' }, singular: { sv: 'motorcykel', en: 'motorcycle', de: 'Motorrad' }, keywords: ['motorcycle', 'motorbike', 'motorcykel', 'mc', 'motorrad'] },
  { slug: 'motorhomes', icon: BusFront, labels: { sv: 'Husbilar', en: 'Motorhomes', de: 'Wohnmobile' }, singular: { sv: 'husbil', en: 'motorhome', de: 'Wohnmobil' }, keywords: ['motorhome', 'camper', 'husbil', 'wohnmobil'] },
  { slug: 'caravans', icon: Warehouse, labels: { sv: 'Husvagnar', en: 'Caravans', de: 'Wohnwagen' }, singular: { sv: 'husvagn', en: 'caravan', de: 'Wohnwagen' }, keywords: ['caravan', 'husvagn', 'wohnwagen'] },
  { slug: 'trucks', icon: Truck, labels: { sv: 'Lastbilar', en: 'Trucks', de: 'Lkw' }, singular: { sv: 'lastbil', en: 'truck', de: 'Lkw' }, keywords: ['truck', 'lastbil', 'lorry', 'lkw'] },
  { slug: 'agriculture', icon: Tractor, labels: { sv: 'Lantbruksmaskiner', en: 'Agricultural machinery', de: 'Landmaschinen' }, singular: { sv: 'lantbruksmaskin', en: 'agricultural machine', de: 'Landmaschine' }, keywords: ['tractor', 'traktor', 'agriculture', 'farm', 'lantbruk', 'landmaschine'] },
  { slug: 'construction', icon: Construction, labels: { sv: 'Entreprenadmaskiner', en: 'Construction machinery', de: 'Baumaschinen' }, singular: { sv: 'entreprenadmaskin', en: 'construction machine', de: 'Baumaschine' }, keywords: ['construction', 'entreprenad', 'excavator', 'grävmaskin', 'loader', 'baumaschine'] },
  { slug: 'electric-bikes', icon: Bike, labels: { sv: 'Cyklar', en: 'Bikes', de: 'Fahrräder' }, singular: { sv: 'cykel', en: 'bike', de: 'Fahrrad' }, keywords: ['bike', 'bicycle', 'cykel', 'e-bike', 'elcykel'] },
  { slug: 'e-scooters', icon: Scooter, labels: { sv: 'Sparkcyklar', en: 'Scooters', de: 'Scooter' }, singular: { sv: 'sparkcykel', en: 'scooter', de: 'Scooter' }, keywords: ['scooter', 'kick scooter', 'e-scooter', 'elsparkcykel'] },
]

export const marketplaceCategoryAliases: Record<string, MarketplaceCategorySlug> = {
  bikes: 'motorcycles',
  farm: 'agriculture',
  plant: 'construction',
}

export function categorySearchPath(value: MarketplaceCategorySlug | string) {
  return `/marketplace/${normalizeMarketplaceCategory(value)}`
}

export function normalizeMarketplaceCategory(value: string): MarketplaceCategorySlug {
  const normalized = marketplaceCategoryAliases[value] || value
  return marketplaceCategories.some((category) => category.slug === normalized)
    ? (normalized as MarketplaceCategorySlug)
    : 'cars'
}

export function getMarketplaceCategory(value: string) {
  const slug = normalizeMarketplaceCategory(value)
  return marketplaceCategories.find((category) => category.slug === slug)!
}

export function marketplaceLanguage(locale: PublicLocale): 'sv' | 'en' | 'de' {
  return locale === 'sv' || locale === 'de' ? locale : 'en'
}

export const supportedCurrencies = [
  'EUR',
  'SEK',
  'DKK',
  'PLN',
  'CZK',
  'HUF',
  'RON',
  'BGN',
  'NOK',
  'CHF',
  'GBP',
  'USD',
] as const

export const euCurrencies = supportedCurrencies

export type SupportedCurrency = (typeof supportedCurrencies)[number]
export type EuCurrency = SupportedCurrency

const currencyByCountry: Record<string, SupportedCurrency> = {
  SE: 'SEK',
  DK: 'DKK',
  PL: 'PLN',
  CZ: 'CZK',
  HU: 'HUF',
  RO: 'RON',
  BG: 'BGN',
  NO: 'NOK',
  CH: 'CHF',
  GB: 'GBP',
  UK: 'GBP',
  US: 'USD',
}

export function isSupportedCurrency(value?: string | null): value is SupportedCurrency {
  return supportedCurrencies.includes((value || '').toUpperCase() as SupportedCurrency)
}

export function currencyForCountry(countryCode?: string | null): SupportedCurrency {
  return currencyByCountry[(countryCode || '').toUpperCase()] || 'EUR'
}

export function formatMarketplacePrice(
  amount: number,
  currency: string,
  locale: PublicLocale,
) {
  void locale
  const normalizedCurrency = currency.toUpperCase()
  const formattedAmount = new Intl.NumberFormat('sv-SE', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
    useGrouping: true,
  }).format(Math.round(amount))
  const suffix = normalizedCurrency === 'EUR' ? '€' : normalizedCurrency

  return `${formattedAmount} ${suffix}`
}

export const marketplacePublicSelect =
  'id,seller_user_id,listing_number,reference_number,category,title,description,make,model,variant,model_year,mileage_km,operating_hours,fuel_type,gearbox,body_type,color,condition,known_faults,service_history,equipment,country_code,country,city,municipality,address,latitude,longitude,price,currency,images,seller_name,seller_type,phone_visibility,package_id,priority,created_at,published_at,expires_at'
