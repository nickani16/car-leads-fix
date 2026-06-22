import {
  Bike,
  BusFront,
  CarFront,
  Construction,
  Leaf,
  Tractor,
  Truck,
  Warehouse,
  Zap,
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
  { slug: 'electric-bikes', icon: Leaf, labels: { sv: 'Elcyklar', en: 'Electric bikes', de: 'E-Bikes' }, singular: { sv: 'elcykel', en: 'electric bike', de: 'E-Bike' }, keywords: ['electric bike', 'e-bike', 'elcykel'] },
  { slug: 'e-scooters', icon: Zap, labels: { sv: 'Elsparkcyklar', en: 'E-scooters', de: 'E-Scooter' }, singular: { sv: 'elsparkcykel', en: 'e-scooter', de: 'E-Scooter' }, keywords: ['e-scooter', 'elsparkcykel', 'scooter'] },
]

export const marketplaceCategoryAliases: Record<string, MarketplaceCategorySlug> = {
  bikes: 'motorcycles',
  farm: 'agriculture',
  plant: 'construction',
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

export const euCurrencies = [
  'EUR', 'SEK', 'DKK', 'PLN', 'CZK', 'HUF', 'RON', 'BGN',
] as const

export type EuCurrency = (typeof euCurrencies)[number]

const currencyByCountry: Record<string, EuCurrency> = {
  SE: 'SEK',
  DK: 'DKK',
  PL: 'PLN',
  CZ: 'CZK',
  HU: 'HUF',
  RO: 'RON',
  BG: 'BGN',
}

export function currencyForCountry(countryCode?: string | null): EuCurrency {
  return currencyByCountry[(countryCode || '').toUpperCase()] || 'EUR'
}

export function formatMarketplacePrice(
  amount: number,
  currency: string,
  locale: PublicLocale,
) {
  return new Intl.NumberFormat(locale === 'sv' ? 'sv-SE' : locale === 'de' ? 'de-DE' : locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export const marketplacePublicSelect =
  'id,category,title,make,model,variant,model_year,mileage_km,operating_hours,fuel_type,gearbox,body_type,condition,country_code,city,price,currency,images,seller_name,seller_type,created_at,published_at'

