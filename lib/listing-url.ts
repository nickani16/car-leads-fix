type ListingUrlSource = {
  id: string
  title?: string | null
  make?: string | null
  model?: string | null
  model_year?: number | string | null
  year?: number | string | null
  city?: string | null
  country_code?: string | null
}

const uuidPattern =
  /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i

export function extractListingIdFromSlug(slug: string) {
  return slug.match(uuidPattern)?.[0] || null
}

export function buildListingSlug(listing: ListingUrlSource) {
  const parts = [
    listing.title,
    !listing.title ? listing.make : null,
    !listing.title ? listing.model : null,
    listing.model_year ?? listing.year,
    listing.city,
  ]
    .filter(Boolean)
    .join(' ')

  const readable = slugifyListingPart(parts) || 'listing'
  return `${readable}-${listing.id}`
}

export function buildListingPath(listing: ListingUrlSource) {
  const readableSlug = buildListingSlug(listing).replace(new RegExp(`-${listing.id}$`, 'i'), '')
  const market = listingMarketPath(listing.country_code)
  return `${market.prefix}/${market.adSegment}/${listing.id}/${readableSlug}`
}

export function listingMarketPath(countryCode?: string | null) {
  const code = (countryCode || '').toUpperCase()
  const markets: Record<string, { prefix: string; adSegment: string }> = {
    SE: { prefix: '/se', adSegment: 'annons' },
    DE: { prefix: '/de', adSegment: 'anzeige' },
    ES: { prefix: '/es', adSegment: 'anuncio' },
    FR: { prefix: '/fr', adSegment: 'annonce' },
    IT: { prefix: '/it', adSegment: 'annuncio' },
    NL: { prefix: '/nl', adSegment: 'advertentie' },
    BE: { prefix: '/be', adSegment: 'advertentie' },
    PL: { prefix: '/pl', adSegment: 'ogloszenie' },
    AT: { prefix: '/at', adSegment: 'anzeige' },
    DK: { prefix: '/dk', adSegment: 'annonce' },
    FI: { prefix: '/fi', adSegment: 'ilmoitus' },
  }
  return markets[code] || { prefix: '', adSegment: 'annons' }
}

function slugifyListingPart(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/å/g, 'a')
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 90)
}
