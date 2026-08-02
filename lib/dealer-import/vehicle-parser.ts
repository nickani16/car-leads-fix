import 'server-only'

import crypto from 'node:crypto'
import { load } from 'cheerio'

type ConfidenceField = { confidence: number; source: 'json_ld' | 'open_graph' | 'specification_table' | 'generic_dom' | 'derived' }

export type ParsedVehicle = {
  sourceExternalId: string | null
  canonicalUrl: string
  sourceStatus: 'present' | 'sold' | 'unknown'
  contentHash: string
  vinFingerprint: string | null
  registrationFingerprint: string | null
  rawPayload: Record<string, unknown>
  normalizedPayload: Record<string, unknown>
  fieldConfidence: Record<string, ConfidenceField>
  parseConfidence: number
  warnings: string[]
  originalImageUrls: string[]
}

export function parseVehicleHtml(html: string, sourceUrl: string): ParsedVehicle | null {
  const $ = load(html)
  const candidates: Record<string, unknown>[] = []
  $('script[type="application/ld+json"]').each((_index, element) => {
    const text = $(element).text().trim()
    if (!text || text.length > 750_000) return
    try { collectJsonLdObjects(JSON.parse(text), candidates) } catch { /* Invalid JSON-LD is ignored and recorded through fallback confidence. */ }
  })

  const candidate = candidates
    .filter(isVehicleCandidate)
    .sort((left, right) => vehicleCandidateScore(right) - vehicleCandidateScore(left))[0] || null
  const specs = collectSpecificationValues($)
  const fieldConfidence: Record<string, ConfidenceField> = {}
  const originalValues: Record<string, unknown> = {}

  const setConfidence = (field: string, confidence: number, source: ConfidenceField['source']) => {
    fieldConfidence[field] = { confidence, source }
  }
  const jsonValue = (keys: string[]) => firstDefined(candidate, keys)
  const specValue = (keys: string[]) => findSpec(specs, keys)
  const og = (property: string) => $(`meta[property="${property}"],meta[name="${property}"]`).first().attr('content')?.trim() || ''

  const title = cleanText(stringValue(jsonValue(['name', 'headline'])) || og('og:title') || $('h1').first().text(), 240)
  setConfidence('title', candidate && stringValue(jsonValue(['name', 'headline'])) ? 0.97 : og('og:title') ? 0.78 : 0.62, candidate && stringValue(jsonValue(['name', 'headline'])) ? 'json_ld' : og('og:title') ? 'open_graph' : 'generic_dom')

  const makeRaw = nestedName(jsonValue(['brand', 'manufacturer'])) || specValue(['make', 'brand', 'märke', 'marke', 'marque', 'marca', 'merkki', 'mærke', 'marka'])
  const modelRaw = nestedName(jsonValue(['model', 'vehicleModel'])) || specValue(['model', 'modell', 'modèle', 'modello'])
  const make = cleanText(makeRaw, 100)
  const model = cleanText(modelRaw, 140)
  if (make) setConfidence('make', candidate && nestedName(jsonValue(['brand', 'manufacturer'])) ? 0.96 : 0.72, candidate && nestedName(jsonValue(['brand', 'manufacturer'])) ? 'json_ld' : 'specification_table')
  if (model) setConfidence('model', candidate && nestedName(jsonValue(['model', 'vehicleModel'])) ? 0.94 : 0.7, candidate && nestedName(jsonValue(['model', 'vehicleModel'])) ? 'json_ld' : 'specification_table')

  if (!title && !make && !model) return null

  const offer = asObject(Array.isArray(candidate?.offers) ? candidate?.offers[0] : candidate?.offers)
  const priceRaw = firstDefined(offer, ['price', 'lowPrice']) || specValue(['price', 'pris', 'preis', 'prix', 'precio', 'prezzo', 'prijs', 'hinta', 'cena']) || og('product:price:amount')
  const price = parseLocalizedNumber(priceRaw)
  const currency = cleanText(stringValue(firstDefined(offer, ['priceCurrency'])) || og('product:price:currency') || inferCurrency(String(priceRaw || '')), 3).toUpperCase() || null
  if (price != null) { originalValues.price = priceRaw; setConfidence('price', offer?.price != null ? 0.98 : og('product:price:amount') ? 0.82 : 0.68, offer?.price != null ? 'json_ld' : og('product:price:amount') ? 'open_graph' : 'specification_table') }

  const yearRaw = jsonValue(['vehicleModelDate', 'modelDate', 'productionDate']) || specValue(['model year', 'year', 'årsmodell', 'baujahr', 'année', 'año', 'anno', 'bouwjaar', 'vuosimalli', 'årgang', 'rok produkcji'])
  const modelYear = parseYear(yearRaw || title)
  if (modelYear) setConfidence('modelYear', yearRaw ? 0.88 : 0.58, candidate && jsonValue(['vehicleModelDate', 'modelDate', 'productionDate']) ? 'json_ld' : yearRaw ? 'specification_table' : 'derived')

  const mileageObject = asObject(jsonValue(['mileageFromOdometer']))
  const mileageRaw = mileageObject?.value || specValue(['mileage', 'odometer', 'miltal', 'kilometerstand', 'kilométrage', 'kilometraje', 'chilometraggio', 'kilometerstand', 'ajomäärä', 'kilometertal', 'przebieg'])
  const mileageKm = normalizeMileage(mileageRaw, stringValue(mileageObject?.unitCode || mileageObject?.unitText))
  if (mileageKm != null) { originalValues.mileage = mileageRaw; setConfidence('mileageKm', mileageObject?.value != null ? 0.96 : 0.72, mileageObject?.value != null ? 'json_ld' : 'specification_table') }

  const fuelRaw = jsonValue(['fuelType']) || specValue(['fuel', 'bränsle', 'kraftstoff', 'carburant', 'combustible', 'carburante', 'brandstof', 'polttoaine', 'brændstof', 'paliwo'])
  const transmissionRaw = jsonValue(['vehicleTransmission']) || specValue(['transmission', 'gearbox', 'växellåda', 'getriebe', 'boîte de vitesses', 'cambio', 'versnellingsbak', 'vaihteisto', 'gearkasse', 'skrzynia biegów'])
  const fuel = normalizeFuel(stringValue(fuelRaw))
  const transmission = normalizeTransmission(stringValue(transmissionRaw))
  if (fuel) { originalValues.fuel = fuelRaw; setConfidence('fuel', candidate && jsonValue(['fuelType']) ? 0.92 : 0.68, candidate && jsonValue(['fuelType']) ? 'json_ld' : 'specification_table') }
  if (transmission) { originalValues.transmission = transmissionRaw; setConfidence('transmission', candidate && jsonValue(['vehicleTransmission']) ? 0.92 : 0.68, candidate && jsonValue(['vehicleTransmission']) ? 'json_ld' : 'specification_table') }

  const imageValues = firstDefined(candidate, ['image', 'photos']) || og('og:image')
  const images = collectImageUrls(imageValues, sourceUrl).slice(0, 10)
  if (images.length) setConfidence('images', candidate && firstDefined(candidate, ['image', 'photos']) ? 0.94 : 0.72, candidate && firstDefined(candidate, ['image', 'photos']) ? 'json_ld' : 'open_graph')

  const description = cleanText(stringValue(jsonValue(['description'])) || og('og:description') || $('[itemprop="description"]').first().text(), 5000)
  if (description) setConfidence('description', candidate && jsonValue(['description']) ? 0.92 : og('og:description') ? 0.74 : 0.58, candidate && jsonValue(['description']) ? 'json_ld' : og('og:description') ? 'open_graph' : 'generic_dom')

  const variant = cleanText(stringValue(jsonValue(['vehicleConfiguration', 'additionalType'])) || specValue(['variant', 'version', 'utförande', 'ausführung', 'finition', 'versión', 'versione', 'uitvoering', 'malliversio', 'variant', 'wersja']), 160)
  const color = cleanText(stringValue(jsonValue(['color'])) || specValue(['color', 'colour', 'färg', 'farbe', 'couleur', 'color', 'colore', 'kleur', 'väri', 'farve', 'kolor']), 80)
  const bodyType = cleanText(stringValue(jsonValue(['bodyType', 'vehicleBodyType'])) || specValue(['body type', 'kaross', 'karosserie', 'carrosserie', 'carrocería', 'carrozzeria', 'carrosserie', 'korimalli', 'karrosseri', 'nadwozie']), 100)
  const doors = parseInteger(jsonValue(['numberOfDoors']) || specValue(['doors', 'dörrar', 'türen', 'portes', 'puertas', 'porte', 'deuren', 'ovet', 'døre', 'drzwi']))
  const seats = parseInteger(jsonValue(['vehicleSeatingCapacity']) || specValue(['seats', 'säten', 'sitze', 'places', 'plazas', 'posti', 'zitplaatsen', 'istuimet', 'sæder', 'miejsca']))
  const powerKw = normalizePower(jsonValue(['vehicleEngine']) || specValue(['power', 'effekt', 'leistung', 'puissance', 'potencia', 'potenza', 'vermogen', 'teho', 'ydelse', 'moc']))
  const firstRegistrationDate = cleanDate(jsonValue(['dateVehicleFirstRegistered', 'releaseDate']) || specValue(['first registration', 'första registrering', 'erstzulassung', 'mise en circulation', 'primera matriculación', 'prima immatricolazione', 'eerste registratie', 'ensirekisteröinti', 'første registrering', 'pierwsza rejestracja']))
  const address = asObject(firstDefined(asObject(candidate?.seller), ['address']) || candidate?.address)
  const city = cleanText(stringValue(address?.addressLocality) || specValue(['city', 'ort', 'stadt', 'ville', 'ciudad', 'città', 'plaats', 'kaupunki', 'by', 'miasto']), 120)
  const region = cleanText(stringValue(address?.addressRegion) || specValue(['region', 'region', 'bundesland', 'région', 'región', 'regione', 'regio', 'maakunta', 'region', 'województwo']), 120)
  const country = normalizeCountry(stringValue(address?.addressCountry) || specValue(['country', 'land', 'land', 'pays', 'país', 'paese', 'land', 'maa', 'land', 'kraj']))

  const canonicalUrl = canonicalSourceUrl($('link[rel="canonical"]').first().attr('href'), sourceUrl)
  const sourceExternalId = cleanText(stringValue(jsonValue(['sku', 'productID', 'mpn', '@id'])) || extractIdFromUrl(canonicalUrl), 220) || null
  const vin = cleanText(stringValue(jsonValue(['vehicleIdentificationNumber'])) || specValue(['vin', 'chassis number', 'chassinummer', 'fahrgestellnummer']), 40).toUpperCase()
  const registration = cleanText(specValue(['registration number', 'registration', 'registreringsnummer', 'kennzeichen', 'immatriculation', 'matrícula', 'targa', 'kenteken', 'rekisteritunnus', 'registreringsnummer', 'numer rejestracyjny']), 30).toUpperCase()
  const availability = stringValue(offer?.availability).toLowerCase()
  const sourceStatus = /outofstock|sold|discontinued/.test(availability) ? 'sold' : availability ? 'present' : 'unknown'

  const normalizedPayload = compactObject({
    category: inferCategory(candidate, title),
    title: title || [make, model, variant].filter(Boolean).join(' '),
    make,
    model,
    variant,
    model_year: modelYear,
    first_registration_date: firstRegistrationDate,
    price,
    currency,
    mileage_km: mileageKm,
    fuel,
    transmission,
    drivetrain: cleanText(stringValue(jsonValue(['driveWheelConfiguration'])) || specValue(['drivetrain', 'drivlina', 'antrieb', 'transmission intégrale', 'tracción', 'trazione', 'aandrijving', 'vetotapa', 'træk', 'napęd']), 80),
    power_kw: powerKw,
    body_type: bodyType,
    color,
    doors,
    seats,
    equipment: collectEquipment(candidate, specs),
    description,
    city,
    region,
    country_code: country,
    images,
    source_external_id: sourceExternalId,
    source_published_at: cleanDate(jsonValue(['datePublished', 'uploadDate'])),
    source_updated_at: cleanDate(jsonValue(['dateModified'])),
    original_values: originalValues,
  })

  const confidenceValues = Object.values(fieldConfidence).map((item) => item.confidence)
  const requiredConfidence = ['title', 'make', 'model', 'price', 'modelYear']
    .map((field) => fieldConfidence[field]?.confidence)
    .filter((value): value is number => typeof value === 'number')
  const parseConfidence = roundConfidence(requiredConfidence.length ? average(requiredConfidence) : average(confidenceValues))
  const warnings = [
    !make ? 'MAKE_MISSING' : '',
    !model ? 'MODEL_MISSING' : '',
    price == null ? 'PRICE_MISSING' : '',
    !modelYear ? 'MODEL_YEAR_MISSING' : '',
    !images.length ? 'IMAGES_MISSING' : '',
    parseConfidence < 0.75 ? 'LOW_PARSE_CONFIDENCE' : '',
  ].filter(Boolean)

  return {
    sourceExternalId,
    canonicalUrl,
    sourceStatus,
    contentHash: crypto.createHash('sha256').update(stableStringify(normalizedPayload)).digest('hex'),
    vinFingerprint: identifierFingerprint(vin),
    registrationFingerprint: identifierFingerprint(registration),
    rawPayload: candidate ? sanitizeRawPayload(candidate) : { open_graph: compactObject({ title: og('og:title'), description: og('og:description'), image: og('og:image') }) },
    normalizedPayload,
    fieldConfidence,
    parseConfidence,
    warnings,
    originalImageUrls: images,
  }
}

function collectJsonLdObjects(value: unknown, output: Record<string, unknown>[]) {
  if (Array.isArray(value)) { for (const item of value) collectJsonLdObjects(item, output); return }
  const object = asObject(value)
  if (!object) return
  output.push(object)
  if (object['@graph']) collectJsonLdObjects(object['@graph'], output)
  if (object.itemListElement) collectJsonLdObjects(object.itemListElement, output)
  if (object.item) collectJsonLdObjects(object.item, output)
}

function isVehicleCandidate(value: Record<string, unknown>) {
  const types = arrayValue(value['@type']).map((type) => String(type).toLowerCase())
  return types.some((type) => ['vehicle', 'car', 'product'].includes(type)) && Boolean(value.name || value.model || value.vehicleModel || value.offers)
}

function vehicleCandidateScore(value: Record<string, unknown>) {
  return ['name', 'brand', 'model', 'vehicleModel', 'offers', 'image', 'mileageFromOdometer', 'vehicleModelDate'].reduce((score, key) => score + Number(value[key] != null), 0)
}

function collectSpecificationValues($: ReturnType<typeof load>) {
  const values = new Map<string, string>()
  $('tr').slice(0, 300).each((_index, row) => {
    const cells = $(row).find('th,td')
    if (cells.length < 2) return
    const label = normalizeLabel($(cells[0]).text())
    const value = cleanText($(cells[cells.length - 1]).text(), 1000)
    if (label && value && !values.has(label)) values.set(label, value)
  })
  $('dt').slice(0, 300).each((_index, element) => {
    const label = normalizeLabel($(element).text())
    const value = cleanText($(element).next('dd').text(), 1000)
    if (label && value && !values.has(label)) values.set(label, value)
  })
  return values
}

function findSpec(specs: Map<string, string>, labels: string[]) {
  for (const label of labels) {
    const exact = specs.get(normalizeLabel(label))
    if (exact) return exact
  }
  for (const [key, value] of specs) {
    if (labels.some((label) => key.includes(normalizeLabel(label)))) return value
  }
  return ''
}

function normalizeLabel(value: string) {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function firstDefined(object: Record<string, unknown> | null, keys: string[]) {
  if (!object) return undefined
  for (const key of keys) if (object[key] != null && object[key] !== '') return object[key]
  return undefined
}

function nestedName(value: unknown): string {
  if (typeof value === 'string') return value
  const object = asObject(value)
  return stringValue(object?.name || object?.model || object?.value)
}

function collectImageUrls(value: unknown, sourceUrl: string): string[] {
  const values = arrayValue(value).flatMap((item) => {
    if (typeof item === 'string') return [item]
    const object = asObject(item)
    return object ? [object.url, object.contentUrl].filter((entry): entry is string => typeof entry === 'string') : []
  })
  const unique = new Set<string>()
  for (const value of values) {
    try {
      const url = new URL(value, sourceUrl)
      if (['http:', 'https:'].includes(url.protocol) && !url.username && !url.password) { url.hash = ''; unique.add(url.toString()) }
    } catch { /* Ignore malformed image URLs. */ }
  }
  return [...unique]
}

function canonicalSourceUrl(value: string | undefined, sourceUrl: string) {
  try {
    const source = new URL(sourceUrl)
    const canonical = new URL(value || sourceUrl, source)
    if (!['http:', 'https:'].includes(canonical.protocol) || canonical.hostname.toLowerCase() !== source.hostname.toLowerCase()) return source.toString()
    canonical.hash = ''
    for (const key of [...canonical.searchParams.keys()]) if (/^(utm_|fbclid|gclid)/i.test(key)) canonical.searchParams.delete(key)
    return canonical.toString()
  } catch { return sourceUrl }
}

function parseLocalizedNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.round(value)
  const text = String(value || '').replace(/[^0-9,.-]/g, '')
  if (!text) return null
  const separators = [...text.matchAll(/[,.]/g)]
  let normalized = text
  const last = separators.at(-1)?.index
  if (last != null && text.length - last - 1 === 2) {
    normalized = text.slice(0, last).replace(/[,.]/g, '') + '.' + text.slice(last + 1)
  } else normalized = text.replace(/[,.]/g, '')
  const number = Number(normalized)
  return Number.isFinite(number) && number >= 0 ? Math.round(number) : null
}

function normalizeMileage(value: unknown, unit: string) {
  const number = parseLocalizedNumber(value)
  if (number == null) return null
  const combined = `${String(value || '')} ${unit}`.toLowerCase()
  if (/\bmil\b/.test(combined) && !/mile/.test(combined)) return number * 10
  if (/mile|smi/.test(combined)) return Math.round(number * 1.609344)
  return number
}

function normalizePower(value: unknown) {
  const object = asObject(value)
  const raw = object ? firstDefined(object, ['enginePower', 'value', 'name']) : value
  const number = parseLocalizedNumber(raw)
  if (number == null) return null
  const text = String(raw || '').toLowerCase()
  if (/\bhp\b|\bps\b|\bhk\b/.test(text)) return Math.round(number * 0.735499)
  return number
}

function normalizeFuel(value: string) {
  const normalized = normalizeLabel(value)
  if (!normalized) return null
  const electric = /electric|elektr|elbil|sahko|(^|\s)el($|\s)/.test(normalized)
  const combustion = /petrol|gasoline|bensin|benzin|essence|gasolina|benzina|diesel/.test(normalized)
  if (/plug|phev|laddhybrid|ladattava/.test(normalized)) return 'plug_in_hybrid'
  if (electric && combustion) return 'plug_in_hybrid'
  if (/hybrid|hybride|hibrid|ibrid/.test(normalized)) return 'hybrid'
  if (electric) return 'electric'
  if (/diesel/.test(normalized)) return 'diesel'
  if (/petrol|gasoline|bensin|benzin|essence|gasolina|benzina/.test(normalized)) return 'petrol'
  if (/hydrogen|vatgas|wasserstoff|hydrogene/.test(normalized)) return 'hydrogen'
  return normalized.replace(/\s+/g, '_').slice(0, 80)
}

function normalizeTransmission(value: string) {
  const normalized = normalizeLabel(value)
  if (!normalized) return null
  if (/automatic|automat|automatique|automatico|automatisch/.test(normalized)) return 'automatic'
  if (/manual|manuell|manuelle|manuaal|handgeschakeld/.test(normalized)) return 'manual'
  return normalized.replace(/\s+/g, '_').slice(0, 80)
}

function normalizeCountry(value: string) {
  const raw = value.trim().toUpperCase()
  if (/^[A-Z]{2}$/.test(raw)) return raw
  const normalized = normalizeLabel(value)
  return ({
    austria: 'AT', osterreich: 'AT', belgium: 'BE', belgique: 'BE', belgie: 'BE',
    denmark: 'DK', danmark: 'DK', finland: 'FI', suomi: 'FI', france: 'FR',
    germany: 'DE', deutschland: 'DE', tyskland: 'DE', allemagne: 'DE',
    italy: 'IT', italia: 'IT', netherlands: 'NL', nederland: 'NL',
    poland: 'PL', polska: 'PL', spain: 'ES', espana: 'ES',
    sweden: 'SE', sverige: 'SE', suede: 'SE', schweden: 'SE',
  } as Record<string, string>)[normalized] || ''
}

function inferCurrency(value: string) {
  if (/\bSEK\b/i.test(value)) return 'SEK'
  if (/\bDKK\b/i.test(value)) return 'DKK'
  if (/\bPLN\b|zł/i.test(value)) return 'PLN'
  if (/€|\bEUR\b/i.test(value)) return 'EUR'
  return ''
}

function inferCategory(candidate: Record<string, unknown> | null, title: string) {
  const types = arrayValue(candidate?.['@type']).join(' ').toLowerCase()
  const text = `${types} ${title}`.toLowerCase()
  if (/motorcycle|motorcykel|motorrad/.test(text)) return 'motorcycles'
  if (/truck|lastbil|lkw/.test(text)) return 'trucks'
  if (/van|transportbil/.test(text)) return 'vans'
  if (/motorhome|husbil|wohnmobil/.test(text)) return 'motorhomes'
  return 'cars'
}

function collectEquipment(candidate: Record<string, unknown> | null, specs: Map<string, string>) {
  const value = firstDefined(candidate, ['vehicleSpecialUsage', 'additionalProperty'])
  const fromJson = arrayValue(value).flatMap((item) => typeof item === 'string' ? [item] : [stringValue(asObject(item)?.name || asObject(item)?.value)]).filter(Boolean)
  const fromSpecs = findSpec(specs, ['equipment', 'utrustning', 'ausstattung', 'équipements', 'equipamiento', 'dotazioni', 'uitrusting', 'varusteet', 'udstyr', 'wyposażenie']).split(/[,;\n]/).map((item) => cleanText(item, 120)).filter(Boolean)
  return [...new Set([...fromJson, ...fromSpecs])].slice(0, 120)
}

function sanitizeRawPayload(value: Record<string, unknown>) {
  const blocked = /vin|vehicleidentification|registration(number)?|licenseplate|numberplate/i
  const sanitize = (input: unknown, depth = 0): unknown => {
    if (depth > 8) return '[depth-limited]'
    if (Array.isArray(input)) return input.slice(0, 100).map((item) => sanitize(item, depth + 1))
    const object = asObject(input)
    if (!object) return typeof input === 'string' ? input.slice(0, 5000) : input
    return Object.fromEntries(Object.entries(object).filter(([key]) => !blocked.test(key)).slice(0, 200).map(([key, item]) => [key, sanitize(item, depth + 1)]))
  }
  return sanitize(value) as Record<string, unknown>
}

function identifierFingerprint(value: string) {
  const normalized = value.replace(/[^A-Z0-9]/g, '')
  const secret = process.env.AUTORELL_IMPORT_IDENTIFIER_SECRET || process.env.AUTORELL_FINGERPRINT_SECRET
  if (!normalized || !secret) return null
  return crypto.createHmac('sha256', secret).update(normalized).digest('hex')
}

function extractIdFromUrl(value: string) {
  try { return new URL(value).pathname.split('/').filter(Boolean).at(-1) || '' } catch { return '' }
}

function parseYear(value: unknown) {
  const match = String(value || '').match(/\b(19\d{2}|20\d{2})\b/)
  const year = match ? Number(match[1]) : null
  return year && year >= 1900 && year <= new Date().getUTCFullYear() + 2 ? year : null
}

function parseInteger(value: unknown) {
  const match = String(value || '').match(/\d+/)
  return match ? Number(match[0]) : null
}

function cleanDate(value: unknown) {
  const text = stringValue(value).trim()
  if (!text) return null
  const date = new Date(text)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

function cleanText(value: unknown, maxLength: number) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, maxLength)
}

function stringValue(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  return ''
}

function arrayValue(value: unknown): unknown[] {
  return value == null ? [] : Array.isArray(value) ? value : [value]
}

function asObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null
}

function compactObject(value: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== null && item !== undefined && item !== '' && (!Array.isArray(item) || item.length)))
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`
  const object = asObject(value)
  if (object) return `{${Object.keys(object).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(object[key])}`).join(',')}}`
  return JSON.stringify(value)
}

function average(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0
}

function roundConfidence(value: number) {
  return Math.round(Math.max(0, Math.min(1, value)) * 10000) / 10000
}
