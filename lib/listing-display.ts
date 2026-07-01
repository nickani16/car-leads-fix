import { translatePublic, type PublicLocale } from './public-i18n'
import { vehicleValueInEnglish } from './vehicle-translation'

type ListingChipInput = {
  fuelType?: string | null
  gearbox?: string | null
  mileageKm?: number | null
  modelYear?: string | number | null
}

export type ListingSpecChip = {
  key: string
  label: string
}

export function translateListingVehicleValue(locale: PublicLocale, value?: string | null) {
  if (!value) return ''
  const english = vehicleValueInEnglish(value)
  const direct = english ? staticVehicleTranslations[locale]?.[english] : undefined
  if (direct) return direct
  return english ? translatePublic(locale, english) : value
}

export function formatKilometers(value: number | null | undefined, locale: PublicLocale) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return ''
  return `${value.toLocaleString(numberLocale(locale))} km`
}

export function formatMileageAsMil(value: number | null | undefined, locale: PublicLocale) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return ''
  if (locale !== 'sv') return formatKilometers(value, locale)
  return `${Math.round(value / 10).toLocaleString('sv-SE')} mil`
}

export function buildListingSpecChips(input: ListingChipInput, locale: PublicLocale): ListingSpecChip[] {
  return [
    input.fuelType
      ? { key: 'fuel', label: translateListingVehicleValue(locale, input.fuelType) }
      : null,
    input.gearbox
      ? { key: 'gearbox', label: translateListingVehicleValue(locale, input.gearbox) }
      : null,
    input.mileageKm
      ? { key: 'mileage', label: formatMileageAsMil(input.mileageKm, locale) }
      : null,
    input.modelYear
      ? { key: 'year', label: String(input.modelYear) }
      : null,
  ].filter((chip): chip is ListingSpecChip => Boolean(chip?.label))
}

function numberLocale(locale: PublicLocale) {
  if (locale === 'sv') return 'sv-SE'
  if (locale === 'de') return 'de-DE'
  return 'en-GB'
}

const staticVehicleTranslations: Partial<Record<PublicLocale, Record<string, string>>> = {
  sv: {
    'All-wheel drive': 'Fyrhjulsdrift',
    'Front-wheel drive': 'Framhjulsdrift',
    'Rear-wheel drive': 'Bakhjulsdrift',
    Automatic: 'Automat',
    Manual: 'Manuell',
    Petrol: 'Bensin',
    Diesel: 'Diesel',
    Electric: 'El',
    Hybrid: 'Hybrid',
    'Plug-in hybrid': 'Laddhybrid',
    'Estate / Wagon': 'Kombi',
    Hatchback: 'Halvkombi',
  },
  de: {
    'All-wheel drive': 'Allradantrieb',
    'Front-wheel drive': 'Frontantrieb',
    'Rear-wheel drive': 'Heckantrieb',
    Automatic: 'Automatik',
    Manual: 'Schaltgetriebe',
    Petrol: 'Benzin',
    Diesel: 'Diesel',
    Electric: 'Elektro',
    Hybrid: 'Hybrid',
    'Plug-in hybrid': 'Plug-in-Hybrid',
    'Estate / Wagon': 'Kombi',
    Hatchback: 'Schrägheck',
  },
}
