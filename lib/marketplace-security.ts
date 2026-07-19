import type { MarketplaceCategorySlug } from './marketplace'

export const MARKETPLACE_TERMS_VERSION = 'marketplace-terms-v1.2-2026-06-25'
export const MARKETPLACE_PURCHASE_TERMS_VERSION = 'purchase-terms-v1.0-2026-06-25'
export const MARKETPLACE_PRIVACY_VERSION = 'marketplace-privacy-v1.2-2026-06-25'

export type ListingIdentifierInput = {
  registrationNumber: string
  vin: string
  chassisNumber: string
  serialNumber: string
  frameNumber: string
  batterySerialNumber: string
  totalWeightKg: number | null
  axleConfiguration: string
  machineType: string
  agricultureObjectType: string
}

export type ListingRequirement = {
  key: keyof ListingIdentifierInput
  label: string
  required: boolean
}

export const listingRequirementsByCategory: Record<
  MarketplaceCategorySlug,
  ListingRequirement[]
> = {
  cars: [
    { key: 'registrationNumber', label: 'Registreringsnummer, om relevant', required: false },
    { key: 'vin', label: 'VIN/chassinummer', required: false },
  ],
  vans: [
    { key: 'registrationNumber', label: 'Registreringsnummer, om relevant', required: false },
    { key: 'vin', label: 'VIN/chassinummer', required: false },
    { key: 'totalWeightKg', label: 'Totalvikt kg', required: true },
  ],
  motorcycles: [
    { key: 'registrationNumber', label: 'Registreringsnummer, om relevant', required: false },
    { key: 'vin', label: 'VIN/chassinummer', required: false },
  ],
  motorhomes: [
    { key: 'registrationNumber', label: 'Registreringsnummer, om relevant', required: false },
    { key: 'vin', label: 'VIN/chassinummer', required: false },
  ],
  caravans: [
    { key: 'registrationNumber', label: 'Registreringsnummer, om relevant', required: false },
    { key: 'vin', label: 'VIN/chassinummer', required: false },
    { key: 'totalWeightKg', label: 'Totalvikt kg', required: false },
  ],
  trucks: [
    { key: 'registrationNumber', label: 'Registreringsnummer, om relevant', required: false },
    { key: 'vin', label: 'VIN/chassinummer', required: false },
    { key: 'totalWeightKg', label: 'Totalvikt kg', required: true },
    { key: 'axleConfiguration', label: 'Axelkonfiguration', required: true },
  ],
  agriculture: [
    { key: 'agricultureObjectType', label: 'Typ av objekt', required: true },
    { key: 'registrationNumber', label: 'Registreringsnummer, om relevant', required: false },
    { key: 'vin', label: 'VIN/chassinummer', required: false },
    { key: 'serialNumber', label: 'Serienummer', required: false },
  ],
  construction: [
    { key: 'serialNumber', label: 'Serienummer', required: false },
    { key: 'vin', label: 'VIN/chassinummer om sådant finns', required: false },
    { key: 'machineType', label: 'Maskintyp', required: true },
  ],
  'electric-bikes': [
    { key: 'frameNumber', label: 'Ramnummer eller serienummer', required: false },
    { key: 'batterySerialNumber', label: 'Batteriserienummer om möjligt', required: false },
  ],
}

export const sellerListingConfirmationKeys = [
  'lawful_owner_or_right_to_sell',
  'listing_information_correct',
  'not_stolen_wanted_or_illegal',
  'marketplace_terms',
  'purchase_terms',
  'privacy_policy',
] as const

export const accountConfirmationKeys = [
  'adult_18',
  'marketplace_terms',
  'purchase_terms',
  'privacy_policy',
  'right_to_sell_only',
] as const

export const businessAccountConfirmationKeys = [
  'business_right_to_sell',
  'marketplace_terms',
  'purchase_terms',
  'privacy_policy',
] as const

export function normalizeIdentifier(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, '')
}

export function validateVin(value: string) {
  const normalized = normalizeIdentifier(value)
  return /^[A-HJ-NPR-Z0-9]{11,17}$/.test(normalized)
}

export function validateRequiredIdentifiers(
  category: MarketplaceCategorySlug,
  input: ListingIdentifierInput,
) {
  const missing = listingRequirementsByCategory[category]
    .filter((item) => item.required)
    .filter((item) => {
      const value = input[item.key]
      return typeof value === 'number'
        ? !Number.isFinite(value) || value <= 0
        : !String(value || '').trim()
    })

  if (missing.length) {
    return {
      valid: false,
      message: `Fyll i obligatoriska identifieringsfält: ${missing
        .map((item) => item.label)
        .join(', ')}.`,
    }
  }

  if (input.vin && !validateVin(input.vin)) {
    return {
      valid: false,
      message: 'VIN/chassinummer ska vara 11-17 tecken och får inte innehålla I, O eller Q.',
    }
  }

  return { valid: true, message: '' }
}

export function lowPriceThreshold(category: MarketplaceCategorySlug) {
  switch (category) {
    case 'electric-bikes':
      return 100
    case 'motorcycles':
      return 750
    case 'cars':
    case 'vans':
    case 'caravans':
      return 1000
    case 'motorhomes':
    case 'trucks':
    case 'agriculture':
    case 'construction':
      return 2500
    default:
      return 1000
  }
}
