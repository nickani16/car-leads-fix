export const MARKET_CURRENCIES = {
  se: 'sek',
  de: 'eur',
  fr: 'eur',
  it: 'eur',
  es: 'eur',
  nl: 'eur',
  be: 'eur',
  at: 'eur',
  fi: 'eur',
  dk: 'dkk',
  pl: 'pln',
} as const

export type BillingMarket = keyof typeof MARKET_CURRENCIES
export type BillingCurrency = (typeof MARKET_CURRENCIES)[BillingMarket]
export type ListingPackage = 'start' | 'standard' | 'premium'
export type BusinessPlan = 'starter' | 'growth' | 'professional' | 'enterprise'
export type ListingCategory =
  | 'cars'
  | 'vans'
  | 'motorcycles'
  | 'motorhomes'
  | 'caravans'
  | 'trucks'
  | 'agriculture'
  | 'construction'
  | 'electric-bikes'
  | 'e-scooters'

export type BillingProductKind = 'listing_package' | 'addon' | 'subscription'
export type BillingType = 'payment' | 'subscription'

export type BillingProduct = {
  productKey: string
  kind: BillingProductKind
  billingType: BillingType
  category?: ListingCategory
  package?: ListingPackage
  addon?:
    | 'top_placement_3'
    | 'top_placement_7'
    | 'top_placement_14'
    | 'featured_7'
    | 'featured_30'
    | 'refresh_single'
    | 'refresh_pack_5'
    | 'refresh_pack_10'
  businessPlan?: BusinessPlan
  durationDays?: number
  includedBoostDays?: number
  refreshCredits?: number
  activeListingLimit?: number
  billingInterval?: 'month'
  amountMinor: Record<BillingCurrency, number | null>
  taxBehavior: 'inclusive' | 'exclusive' | 'unspecified'
  priceDisplayMode: 'inclusive' | 'exclusive' | 'unspecified'
}

export const billingMarkets = Object.keys(MARKET_CURRENCIES) as BillingMarket[]
export const billingCurrencies: BillingCurrency[] = ['sek', 'eur', 'dkk', 'pln']

export const listingCategoryLabels: Record<ListingCategory, string> = {
  cars: 'Bilar',
  vans: 'Transportbilar',
  motorcycles: 'Motorcyklar',
  motorhomes: 'Husbilar',
  caravans: 'Husvagnar',
  trucks: 'Lastbilar',
  agriculture: 'Lantbruksmaskiner',
  construction: 'Entreprenadmaskiner',
  'electric-bikes': 'Cyklar',
  'e-scooters': 'Sparkcyklar',
}

const listingPrices: Record<
  ListingCategory,
  {
    standard: Record<BillingCurrency, number>
    premium: Record<BillingCurrency, number>
  }
> = {
  cars: {
    standard: { sek: 9900, eur: 899, dkk: 6900, pln: 3900 },
    premium: { sek: 19900, eur: 1799, dkk: 13900, pln: 7900 },
  },
  vans: {
    standard: { sek: 14900, eur: 1299, dkk: 9900, pln: 5900 },
    premium: { sek: 29900, eur: 2599, dkk: 19900, pln: 11900 },
  },
  motorcycles: {
    standard: { sek: 9900, eur: 899, dkk: 6900, pln: 3900 },
    premium: { sek: 24900, eur: 2199, dkk: 16900, pln: 9900 },
  },
  motorhomes: {
    standard: { sek: 19900, eur: 1799, dkk: 13900, pln: 7900 },
    premium: { sek: 39900, eur: 3499, dkk: 27900, pln: 15900 },
  },
  caravans: {
    standard: { sek: 14900, eur: 1299, dkk: 9900, pln: 5900 },
    premium: { sek: 29900, eur: 2599, dkk: 19900, pln: 11900 },
  },
  trucks: {
    standard: { sek: 24900, eur: 2199, dkk: 16900, pln: 9900 },
    premium: { sek: 49900, eur: 4399, dkk: 33900, pln: 19900 },
  },
  agriculture: {
    standard: { sek: 24900, eur: 2199, dkk: 16900, pln: 9900 },
    premium: { sek: 49900, eur: 4399, dkk: 33900, pln: 19900 },
  },
  construction: {
    standard: { sek: 29900, eur: 2599, dkk: 19900, pln: 11900 },
    premium: { sek: 69900, eur: 5999, dkk: 47900, pln: 27900 },
  },
  'electric-bikes': {
    standard: { sek: 7900, eur: 699, dkk: 5500, pln: 2900 },
    premium: { sek: 17900, eur: 1599, dkk: 11900, pln: 6900 },
  },
  'e-scooters': {
    standard: { sek: 4900, eur: 449, dkk: 3500, pln: 1900 },
    premium: { sek: 12900, eur: 1099, dkk: 8900, pln: 4900 },
  },
}

const products: BillingProduct[] = [
  ...Object.entries(listingPrices).flatMap(([category, prices]) => {
    const typedCategory = category as ListingCategory
    return [
      listingProduct(typedCategory, 'start', 7, {
        sek: 0,
        eur: 0,
        dkk: 0,
        pln: 0,
      }),
      listingProduct(typedCategory, 'standard', 15, prices.standard),
      listingProduct(typedCategory, 'premium', 30, prices.premium, 7),
    ]
  }),
  addonProduct('top_placement_3', 'addon.top_placement.3_days', 3, {
    sek: 3900,
    eur: 349,
    dkk: 2900,
    pln: 1500,
  }),
  addonProduct('top_placement_7', 'addon.top_placement.7_days', 7, {
    sek: 6900,
    eur: 599,
    dkk: 4900,
    pln: 2900,
  }),
  addonProduct('top_placement_14', 'addon.top_placement.14_days', 14, {
    sek: 11900,
    eur: 999,
    dkk: 7900,
    pln: 4900,
  }),
  addonProduct('featured_7', 'addon.featured.7_days', 7, {
    sek: 9900,
    eur: 899,
    dkk: 6900,
    pln: 3900,
  }),
  addonProduct('featured_30', 'addon.featured.30_days', 30, {
    sek: 19900,
    eur: 1799,
    dkk: 13900,
    pln: 7900,
  }),
  refreshProduct('refresh_single', 'addon.refresh.single', 1, {
    sek: 1900,
    eur: 199,
    dkk: 1500,
    pln: 900,
  }),
  refreshProduct('refresh_pack_5', 'addon.refresh.pack_5', 5, {
    sek: 7900,
    eur: 699,
    dkk: 5500,
    pln: 3500,
  }),
  refreshProduct('refresh_pack_10', 'addon.refresh.pack_10', 10, {
    sek: 14900,
    eur: 1299,
    dkk: 9900,
    pln: 5900,
  }),
  subscriptionProduct('starter', 25, {
    sek: 49900,
    eur: 4499,
    dkk: 34900,
    pln: 19900,
  }),
  subscriptionProduct('growth', 100, {
    sek: 99900,
    eur: 8999,
    dkk: 69900,
    pln: 39900,
  }),
  subscriptionProduct('professional', 500, {
    sek: 199900,
    eur: 17999,
    dkk: 139900,
    pln: 79900,
  }),
  {
    productKey: 'subscription.business.enterprise.monthly',
    kind: 'subscription',
    billingType: 'subscription',
    businessPlan: 'enterprise',
    billingInterval: 'month',
    activeListingLimit: undefined,
    amountMinor: { sek: null, eur: null, dkk: null, pln: null },
    taxBehavior: 'unspecified',
    priceDisplayMode: 'unspecified',
  },
]

export const billingProductCatalog = products

export function isBillingMarket(value: string): value is BillingMarket {
  return value in MARKET_CURRENCIES
}

export function normalizeBillingMarket(value: string | null | undefined): BillingMarket {
  const lower = String(value || '').toLowerCase()
  return isBillingMarket(lower) ? lower : 'se'
}

export function currencyForMarket(market: BillingMarket): BillingCurrency {
  return MARKET_CURRENCIES[market]
}

export function getBillingProduct(productKey: string) {
  return billingProductCatalog.find((item) => item.productKey === productKey) || null
}

export function getProductAmount(product: BillingProduct, market: BillingMarket) {
  const currency = currencyForMarket(market)
  const amountMinor = product.amountMinor[currency]
  if (amountMinor === null || amountMinor === undefined) return null
  return { currency, amountMinor }
}

export function getStripePriceEnvName(productKey: string, currency: BillingCurrency) {
  const normalizedKey = productKey.toUpperCase().replace(/[^A-Z0-9]+/g, '_')
  return `STRIPE_PRICE_${normalizedKey}_${currency.toUpperCase()}`
}

export function getConfiguredStripePriceId(productKey: string, currency: BillingCurrency) {
  const envName = getStripePriceEnvName(productKey, currency)
  return process.env[envName] || null
}

export function legacyListingPackageToProductKey(category: string, packageId: string) {
  const normalizedCategory = normalizeListingCategory(category)
  if (!normalizedCategory) return null
  if (packageId === 'free_7d') return `listing.${normalizedCategory}.start`
  if (packageId === 'standard_15d') return `listing.${normalizedCategory}.standard`
  if (packageId === 'premium_30d') return `listing.${normalizedCategory}.premium`
  return null
}

export function productToLegacyListingPackage(product: BillingProduct) {
  if (product.package === 'start') return 'free_7d'
  if (product.package === 'standard') return 'standard_15d'
  if (product.package === 'premium') return 'premium_30d'
  return null
}

export function normalizeListingCategory(value: string): ListingCategory | null {
  if (value === 'bikes') return 'motorcycles'
  if (value === 'farm') return 'agriculture'
  if (value === 'plant') return 'construction'
  return Object.prototype.hasOwnProperty.call(listingCategoryLabels, value)
    ? (value as ListingCategory)
    : null
}

export function formatMoneyMinor(amountMinor: number, currency: BillingCurrency, locale = 'sv-SE') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency.toUpperCase(),
    maximumFractionDigits: ['sek', 'dkk', 'pln'].includes(currency) ? 0 : 2,
  }).format(amountMinor / 100)
}

function listingProduct(
  category: ListingCategory,
  packageName: ListingPackage,
  durationDays: number,
  amountMinor: Record<BillingCurrency, number>,
  includedBoostDays?: number,
): BillingProduct {
  return {
    productKey: `listing.${category}.${packageName}`,
    kind: 'listing_package',
    billingType: 'payment',
    category,
    package: packageName,
    durationDays,
    includedBoostDays,
    amountMinor,
    taxBehavior: 'unspecified',
    priceDisplayMode: 'unspecified',
  }
}

function addonProduct(
  addon: NonNullable<BillingProduct['addon']>,
  productKey: string,
  durationDays: number,
  amountMinor: Record<BillingCurrency, number>,
): BillingProduct {
  return {
    productKey,
    kind: 'addon',
    billingType: 'payment',
    addon,
    durationDays,
    amountMinor,
    taxBehavior: 'unspecified',
    priceDisplayMode: 'unspecified',
  }
}

function refreshProduct(
  addon: NonNullable<BillingProduct['addon']>,
  productKey: string,
  refreshCredits: number,
  amountMinor: Record<BillingCurrency, number>,
): BillingProduct {
  return {
    productKey,
    kind: 'addon',
    billingType: 'payment',
    addon,
    refreshCredits,
    amountMinor,
    taxBehavior: 'unspecified',
    priceDisplayMode: 'unspecified',
  }
}

function subscriptionProduct(
  businessPlan: Exclude<BusinessPlan, 'enterprise'>,
  activeListingLimit: number,
  amountMinor: Record<BillingCurrency, number>,
): BillingProduct {
  return {
    productKey: `subscription.business.${businessPlan}.monthly`,
    kind: 'subscription',
    billingType: 'subscription',
    businessPlan,
    billingInterval: 'month',
    activeListingLimit,
    amountMinor,
    taxBehavior: 'unspecified',
    priceDisplayMode: 'unspecified',
  }
}
