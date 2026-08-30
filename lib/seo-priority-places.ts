export const prioritySeoPlaceSlugs: Record<string, readonly string[]> = {
  AT: ['wien', 'graz', 'linz', 'salzburg', 'innsbruck'],
  BE: ['bruxelles-brussel', 'gent', 'charleroi', 'liege'],
  DE: ['berlin', 'hamburg', 'munchen', 'koln', 'frankfurt-am-main'],
  DK: ['k-benhavn', 'aarhus', 'odense', 'aalborg', 'esbjerg'],
  ES: ['madrid', 'barcelona', 'valencia', 'sevilla', 'zaragoza'],
  FI: ['helsinki', 'espoo', 'tampere', 'vantaa', 'oulu'],
  FR: ['paris', 'marseille', 'lyon', 'toulouse', 'nice'],
  IT: ['roma', 'milano', 'napoli', 'torino', 'palermo'],
  NL: ['amsterdam', 'rotterdam', 'den-haag', 'utrecht', 'eindhoven'],
  PL: ['warszawa', 'krakow', 'odz', 'wroc-aw', 'poznan'],
  SE: ['stockholm', 'goteborg', 'malmo', 'uppsala', 'vasteras'],
}

const prioritySeoPlaceSets = new Map(
  Object.entries(prioritySeoPlaceSlugs).map(([country, slugs]) => [country, new Set(slugs)]),
)

export function isPrioritySeoPlace(countryCode: string, slug: string) {
  return prioritySeoPlaceSets.get(countryCode.toUpperCase())?.has(slug) || false
}
