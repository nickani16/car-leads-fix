import {
  billingProductCatalog,
  formatMoneyMinor,
  getBillingProduct,
  getProductAmount,
  legacyListingPackageToProductKey,
  listingCategoryLabels,
  type BillingMarket,
  type ListingCategory,
} from '@/lib/billing/product-catalog'

export const marketplaceCategories = (Object.entries(listingCategoryLabels) as Array<[ListingCategory, string]>).map(
  ([slug, label]) => {
    const standard = getBillingProduct(`listing.${slug}.standard`)
    const premium = getBillingProduct(`listing.${slug}.premium`)
    return {
      slug,
      label,
      free: 0,
      standard: standard ? (standard.amountMinor.sek || 0) / 100 : 0,
      premium: premium ? (premium.amountMinor.sek || 0) / 100 : 0,
    }
  },
) as Array<{
  slug: ListingCategory
  label: string
  free: number
  standard: number
  premium: number
}>

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
  void accountType
  const productKey = legacyListingPackageToProductKey(category, packageId)
  const product = productKey ? getBillingProduct(productKey) : null
  return product ? (product.amountMinor.sek || 0) / 100 : 0
}

export function getListingPriceMinorForMarket(
  category: string,
  packageId: MarketplacePackage,
  market: BillingMarket,
) {
  const productKey = legacyListingPackageToProductKey(category, packageId)
  const product = productKey ? getBillingProduct(productKey) : null
  return product ? getProductAmount(product, market) : null
}

export function formatListingPrice(price: number) {
  return `${price.toLocaleString('sv-SE')} kr`
}

export function formatListingPriceForMarket(category: string, packageId: MarketplacePackage, market: BillingMarket, locale = 'sv-SE') {
  const price = getListingPriceMinorForMarket(category, packageId, market)
  if (!price) return ''
  if (price.amountMinor === 0) return locale.startsWith('sv') ? 'Gratis' : 'Free'
  return formatMoneyMinor(price.amountMinor, price.currency, locale)
}

export const listingPackageDetails = {
  free_7d: { durationDays: 7, priority: 0, label: 'Start' },
  standard_15d: { durationDays: 15, priority: 0, label: 'Standard' },
  premium_30d: { durationDays: 30, priority: 0, label: 'Premium', includedBoostDays: 7 },
} as const

export const marketplacePricingProducts = billingProductCatalog
