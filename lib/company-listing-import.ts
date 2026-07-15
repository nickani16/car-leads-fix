import { euCountryCodes, getEuCountryName } from '@/lib/eu-countries'
import {
  currencyForCountry,
  isSupportedCurrency,
  marketplaceCategories,
  normalizeMarketplaceCategory,
  type MarketplaceCategorySlug,
  type SupportedCurrency,
} from '@/lib/marketplace'
import { inferMarketplaceLocation } from '@/lib/marketplace-locations'

export const COMPANY_IMPORT_MAX_FILE_SIZE = 1024 * 1024
export const COMPANY_IMPORT_MAX_ROWS = 250

export const COMPANY_IMPORT_HEADERS = [
  'reference_number',
  'category',
  'make',
  'model',
  'model_year',
  'price',
  'currency',
  'country_code',
  'city',
  'mileage_km',
  'registration_reference',
  'description',
  'image_1',
  'image_2',
  'image_3',
] as const

type CompanyImportHeader = (typeof COMPANY_IMPORT_HEADERS)[number]

export type CompanyImportError = {
  field: string
  message: string
}

export type CompanyImportPreviewRow = {
  rowNumber: number
  valid: boolean
  errors: CompanyImportError[]
  data: {
    referenceNumber: string | null
    category: MarketplaceCategorySlug
    make: string
    model: string
    modelYear: number | null
    price: number | null
    currency: SupportedCurrency
    countryCode: string
    country: string
    city: string
    municipality: string | null
    title: string
    mileageKm: number | null
    registrationReference: string | null
    description: string
    imageUrls: string[]
  }
}

export type CompanyImportPreview = {
  rows: CompanyImportPreviewRow[]
  validRows: number
  invalidRows: number
  errors: CompanyImportError[]
}

const headerAliases: Record<string, CompanyImportHeader> = {
  ref: 'reference_number',
  reference: 'reference_number',
  category_slug: 'category',
  year: 'model_year',
  modelyear: 'model_year',
  mileage: 'mileage_km',
  km: 'mileage_km',
  registration: 'registration_reference',
  reg: 'registration_reference',
  reg_number: 'registration_reference',
  text: 'description',
  image: 'image_1',
  image_url: 'image_1',
}

export function parseCompanyListingImportCsv(csv: string): CompanyImportPreview {
  const matrix = parseCsv(csv)
  const errors: CompanyImportError[] = []
  if (matrix.length < 2) {
    return {
      rows: [],
      validRows: 0,
      invalidRows: 0,
      errors: [{ field: 'file', message: 'CSV file must contain a header row and at least one listing row.' }],
    }
  }

  const headers = matrix[0].map(normalizeHeader)
  const missingHeaders = COMPANY_IMPORT_HEADERS.filter((header) => !headers.includes(header))
  if (missingHeaders.length) {
    errors.push({
      field: 'headers',
      message: `Missing required columns: ${missingHeaders.join(', ')}.`,
    })
  }

  const seenReferenceNumbers = new Set<string>()
  const rows = matrix
    .slice(1)
    .filter((cells) => cells.some((cell) => cell.trim()))
    .slice(0, COMPANY_IMPORT_MAX_ROWS)
    .map((cells, index) => {
      const raw = Object.fromEntries(headers.map((header, cellIndex) => [header, cells[cellIndex] || '']))
      const row = normalizeCompanyImportRow(raw, index + 2)
      const refKey = row.data.referenceNumber?.toLowerCase()
      if (refKey) {
        if (seenReferenceNumbers.has(refKey)) {
          row.errors.push({ field: 'reference_number', message: 'Reference number is duplicated in this file.' })
        }
        seenReferenceNumbers.add(refKey)
      }
      row.valid = row.errors.length === 0
      return row
    })

  if (matrix.length - 1 > COMPANY_IMPORT_MAX_ROWS) {
    errors.push({
      field: 'file',
      message: `Only the first ${COMPANY_IMPORT_MAX_ROWS} rows can be imported at once.`,
    })
  }

  return {
    rows,
    validRows: rows.filter((row) => row.valid).length,
    invalidRows: rows.filter((row) => !row.valid).length,
    errors,
  }
}

function normalizeCompanyImportRow(raw: Record<string, string>, rowNumber: number): CompanyImportPreviewRow {
  const errors: CompanyImportError[] = []
  const text = (key: CompanyImportHeader) => String(raw[key] || '').trim()
  const categoryInput = text('category') || 'cars'
  const category = normalizeMarketplaceCategory(categoryInput)
  if (
    categoryInput &&
    category === 'cars' &&
    !marketplaceCategories.some((item) => item.slug === categoryInput) &&
    !['car', 'cars', 'bil', 'bilar'].includes(categoryInput.toLowerCase())
  ) {
    errors.push({ field: 'category', message: 'Category is not supported.' })
  }

  const make = text('make')
  const model = text('model')
  if (!make) errors.push({ field: 'make', message: 'Make is required.' })
  if (!model) errors.push({ field: 'model', message: 'Model is required.' })

  const modelYearText = text('model_year')
  const modelYear = modelYearText ? Number(modelYearText) : null
  if (modelYear !== null && (!Number.isInteger(modelYear) || modelYear < 1950 || modelYear > 2027)) {
    errors.push({ field: 'model_year', message: 'Model year must be between 1950 and 2027.' })
  }

  const priceText = text('price').replace(/\s/g, '').replace(',', '.')
  const price = priceText ? Number(priceText) : null
  if (price === null || !Number.isFinite(price) || price <= 0) {
    errors.push({ field: 'price', message: 'Price must be a positive number.' })
  }

  const requestedCountryCode = text('country_code').toUpperCase()
  const countryCode = euCountryCodes.has(requestedCountryCode) ? requestedCountryCode : ''
  if (!countryCode) errors.push({ field: 'country_code', message: 'Country code must be one of Autorells active markets.' })

  const requestedCurrency = text('currency').toUpperCase()
  const currency = isSupportedCurrency(requestedCurrency)
    ? requestedCurrency
    : currencyForCountry(countryCode || requestedCountryCode)

  const city = text('city')
  if (!city) errors.push({ field: 'city', message: 'City is required.' })
  const normalizedLocation = inferMarketplaceLocation({ countryCode: countryCode || 'SE', city })

  const mileageText = text('mileage_km').replace(/\s/g, '').replace(',', '.')
  const mileageKm = mileageText ? Number(mileageText) : null
  if (mileageKm !== null && (!Number.isFinite(mileageKm) || mileageKm < 0)) {
    errors.push({ field: 'mileage_km', message: 'Mileage must be zero or higher.' })
  }

  const imageUrls = ['image_1', 'image_2', 'image_3']
    .map((key) => text(key as CompanyImportHeader))
    .filter(Boolean)
  const invalidImageUrl = imageUrls.find((url) => !isSafeHttpUrl(url))
  if (invalidImageUrl) errors.push({ field: 'image_1', message: 'Image links must start with http:// or https://.' })

  const description = text('description') || `Imported Autorell draft: ${[make, model].filter(Boolean).join(' ') || 'vehicle'}.`

  return {
    rowNumber,
    valid: false,
    errors,
    data: {
      referenceNumber: text('reference_number') || null,
      category,
      make,
      model,
      modelYear,
      price,
      currency,
      countryCode: countryCode || requestedCountryCode || 'SE',
      country: countryCode ? getEuCountryName(countryCode, 'en') : '',
      city,
      municipality: normalizedLocation.municipality || null,
      title: [make, model, modelYear].filter(Boolean).join(' '),
      mileageKm: mileageKm === null ? null : Math.round(mileageKm),
      registrationReference: text('registration_reference') || null,
      description,
      imageUrls,
    },
  }
}

function normalizeHeader(value: string): CompanyImportHeader {
  const key = value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
  return headerAliases[key] || (COMPANY_IMPORT_HEADERS.includes(key as CompanyImportHeader) ? key as CompanyImportHeader : key as CompanyImportHeader)
}

function parseCsv(csv: string) {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false

  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index]
    const next = csv[index + 1]
    if (char === '"' && quoted && next === '"') {
      cell += '"'
      index += 1
    } else if (char === '"') {
      quoted = !quoted
    } else if (char === ',' && !quoted) {
      row.push(cell)
      cell = ''
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') index += 1
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else {
      cell += char
    }
  }

  row.push(cell)
  if (row.some((value) => value.trim())) rows.push(row)
  return rows
}

function isSafeHttpUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}
