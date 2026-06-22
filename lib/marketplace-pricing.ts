export const marketplaceCategories = [
  { slug: 'cars', label: 'Bilar', free: 0, standard: [79, 149], premium: [190, 290] },
  { slug: 'vans', label: 'Transportbilar', free: 0, standard: [129, 249], premium: [290, 490] },
  { slug: 'bikes', label: 'Motorcyklar', free: 0, standard: [99, 149], premium: [249, 399] },
  { slug: 'motorhomes', label: 'Husbilar', free: 0, standard: [149, 299], premium: [390, 690] },
  { slug: 'caravans', label: 'Husvagnar', free: 0, standard: [149, 249], premium: [290, 490] },
  { slug: 'trucks', label: 'Lastbilar', free: 0, standard: [199, 349], premium: [590, 990] },
  { slug: 'farm', label: 'Lantbruk', free: 0, standard: [199, 349], premium: [590, 990] },
  { slug: 'plant', label: 'Entreprenad', free: 0, standard: [249, 499], premium: [790, 1490] },
  { slug: 'electric-bikes', label: 'Elcyklar', free: 0, standard: [49, 99], premium: [149, 199] },
  { slug: 'e-scooters', label: 'Elsparkcyklar', free: 0, standard: [29, 59], premium: [99, 149] },
] as const

export type MarketplaceCategory = (typeof marketplaceCategories)[number]['slug']
export type MarketplaceAccountType = 'private' | 'business'
export type MarketplacePackage = 'free_7d' | 'standard_15d' | 'premium_30d'

export function getCategoryPricing(category: string) {
  return marketplaceCategories.find((item) => item.slug === category) || marketplaceCategories[0]
}

export function getListingPrice(
  category: string,
  packageId: MarketplacePackage,
  accountType: MarketplaceAccountType,
) {
  const pricing = getCategoryPricing(category)
  if (packageId === 'free_7d') return 0
  const range = packageId === 'standard_15d' ? pricing.standard : pricing.premium
  return accountType === 'business' ? range[1] : range[0]
}

export function formatPriceRange(range: readonly [number, number]) {
  return `${range[0].toLocaleString('sv-SE')}–${range[1].toLocaleString('sv-SE')} kr`
}

export const listingPackageDetails = {
  free_7d: { durationDays: 7, priority: 0, label: '7 dagar' },
  standard_15d: { durationDays: 15, priority: 40, label: '15 dagar' },
  premium_30d: { durationDays: 30, priority: 100, label: 'Premium' },
} as const
