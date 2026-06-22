export const marketplaceCategories = [
  { slug: 'cars', label: 'Bilar', free: 0, standard: 129, premium: 249 },
  { slug: 'vans', label: 'Transportbilar', free: 0, standard: 199, premium: 399 },
  { slug: 'bikes', label: 'Motorcyklar', free: 0, standard: 129, premium: 349 },
  { slug: 'motorhomes', label: 'Husbilar', free: 0, standard: 249, premium: 590 },
  { slug: 'caravans', label: 'Husvagnar', free: 0, standard: 199, premium: 390 },
  { slug: 'trucks', label: 'Lastbilar', free: 0, standard: 299, premium: 790 },
  { slug: 'farm', label: 'Lantbruk', free: 0, standard: 299, premium: 790 },
  { slug: 'plant', label: 'Entreprenad', free: 0, standard: 399, premium: 1190 },
  { slug: 'electric-bikes', label: 'Elcyklar', free: 0, standard: 79, premium: 179 },
  { slug: 'e-scooters', label: 'Elsparkcyklar', free: 0, standard: 49, premium: 129 },
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
  void accountType
  if (packageId === 'free_7d') return 0
  return packageId === 'standard_15d' ? pricing.standard : pricing.premium
}

export function formatListingPrice(price: number) {
  return `${price.toLocaleString('sv-SE')} kr`
}

export const listingPackageDetails = {
  free_7d: { durationDays: 7, priority: 0, label: '7 dagar' },
  standard_15d: { durationDays: 15, priority: 40, label: '15 dagar' },
  premium_30d: { durationDays: 30, priority: 100, label: 'Premium' },
} as const
