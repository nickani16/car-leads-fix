import type { MarketplaceCategorySlug } from './marketplace'
import {
  categoryTechnicalFields,
  fieldsForCategoryAndSubcategory,
  categorySubcategoryFields,
  type ListingTechnicalField,
} from './listing-form-options'

export type OfferType = 'sale' | 'lease' | 'sale_and_lease'

export type ListingFieldGroup = 'identity' | 'technical' | 'equipment' | 'condition' | 'pricing' | 'leasing'
export type ListingInputType = 'text' | 'number' | 'select' | 'multi_select' | 'boolean' | 'date' | 'range'

export type ListingFieldDefinition = {
  id: string
  category: MarketplaceCategorySlug
  group: ListingFieldGroup
  inputType: ListingInputType
  label: string
  required: boolean
  searchable: boolean
  filterable: boolean
  unit?: string
  options?: Array<{ value: string; label: string }>
  min?: number
  max?: number
}

export type LeaseData = {
  monthlyPrice?: number
  currency?: string
  vatMode?: 'included' | 'excluded'
  termMonths?: number
  minTermMonths?: number
  maxTermMonths?: number
  initialPayment?: number
  deposit?: number
  setupFee?: number
  residualValue?: number
  serviceIncluded?: boolean
  insuranceIncluded?: boolean
  maintenanceIncluded?: boolean
  repairsIncluded?: boolean
  tyresIncluded?: boolean
  deliveryIncluded?: boolean
  availableFrom?: string
  privateLeasing?: boolean
  businessLeasing?: boolean
  operationalLeasing?: boolean
  financialLeasing?: boolean
  annualMileageKm?: number
  excessMileageCost?: number
  buyoutAvailable?: boolean
  operatorIncluded?: boolean
  transportIncluded?: boolean
}

export const offerTypeValues: Array<{ value: OfferType; label: string }> = [
  { value: 'sale', label: 'Till salu' },
  { value: 'lease', label: 'För leasing' },
]

export const marketplaceCategoryFieldDefinitions: Record<MarketplaceCategorySlug, ListingFieldDefinition[]> =
  Object.fromEntries(
    Object.entries(categoryTechnicalFields).map(([category, fields]) => [
      category,
      (fields as ListingTechnicalField[])
        .concat(
          Object.values(categorySubcategoryFields[category as MarketplaceCategorySlug] || {})
            .flat(),
        )
        .map((field) => ({
        id: field.name,
        category: category as MarketplaceCategorySlug,
        group: 'technical' as const,
        inputType: field.kind === 'chips' ? 'select' as const : field.kind === 'date' ? 'date' as const : field.kind,
        label: field.label,
        required: Boolean(field.required),
        searchable: true,
        filterable: field.kind === 'chips' || field.kind === 'number',
        unit: field.suffix,
        options: field.options,
        min: field.min,
        max: field.max,
        })),
    ]),
  ) as Record<MarketplaceCategorySlug, ListingFieldDefinition[]>

function fieldDefinition(category: MarketplaceCategorySlug, field: ListingTechnicalField): ListingFieldDefinition {
  return {
    id: field.name,
    category,
    group: 'technical',
    inputType: field.kind === 'chips' ? 'select' : field.kind === 'date' ? 'date' : field.kind,
    label: field.label,
    required: Boolean(field.required),
    searchable: true,
    filterable: field.kind === 'chips' || field.kind === 'number',
    unit: field.suffix,
    options: field.options,
    min: field.min,
    max: field.max,
  }
}

export function fieldsForCategory(
  category: MarketplaceCategorySlug,
  values: Record<string, unknown> = {},
) {
  return fieldsForCategoryAndSubcategory(category, values).map((field) => fieldDefinition(category, field))
}

export function isLeaseOffer(offerType: OfferType) {
  return offerType === 'lease' || offerType === 'sale_and_lease'
}

export function isSaleOffer(offerType: OfferType) {
  return offerType === 'sale' || offerType === 'sale_and_lease'
}

export function normalizeOfferType(value: unknown): OfferType {
  return value === 'lease' ? 'lease' : 'sale'
}

export function structuredDataFromValues(values: Record<string, unknown>, category: MarketplaceCategorySlug) {
  const allowed = new Set(fieldsForCategoryAndSubcategory(category, values).map((field) => field.name))
  return Object.fromEntries(
    Object.entries(values).filter(([key, value]) => allowed.has(key) && value !== '' && value !== null && value !== undefined),
  )
}

export function buildListingSearchDocument(input: {
  category: MarketplaceCategorySlug | string
  make?: string | null
  model?: string | null
  variant?: string | null
  offerType?: OfferType | string | null
  technicalData?: Record<string, unknown> | null
  equipment?: string | null
  leaseData?: LeaseData | null
}) {
  const values = [
    input.category,
    input.make,
    input.model,
    input.variant,
    normalizeOfferType(input.offerType),
    input.equipment,
    ...Object.entries(input.technicalData || {}).flatMap(([key, value]) => [key, value]),
    ...Object.entries(input.leaseData || {}).flatMap(([key, value]) => [key, value]),
  ]

  return values
    .flatMap((value) => Array.isArray(value) ? value : [value])
    .filter((value): value is string | number | boolean => ['string', 'number', 'boolean'].includes(typeof value))
    .map((value) => String(value).trim().toLowerCase())
    .filter(Boolean)
    .join(' ')
}
