import type { MarketplaceCategorySlug } from '@/lib/marketplace'
import { localizePublicHref, stripLocalePrefix, type PublicLocale } from '@/lib/public-i18n'

export const homepageCategoryPaths = {
  cars: '/',
  vans: '/vans',
  trucks: '/trucks',
  motorcycles: '/motorcycles',
  construction: '/construction',
  motorhomes: '/motorhomes',
  caravans: '/caravans',
  agriculture: '/agriculture',
  'electric-bikes': '/electric-bikes',
} as const satisfies Record<MarketplaceCategorySlug, string>

export const homepageCategorySlugs = Object.keys(homepageCategoryPaths) as MarketplaceCategorySlug[]
export const homepageCategoryIndexPaths = homepageCategorySlugs
  .map((category) => homepageCategoryPaths[category])
  .filter((path) => path !== '/')

const categoryByPath = new Map<string, MarketplaceCategorySlug>(
  homepageCategorySlugs.map((category) => [homepageCategoryPaths[category], category] as const),
)

export function homepageCategoryPath(category: MarketplaceCategorySlug) {
  return homepageCategoryPaths[category]
}

export function homepageCategoryHref(locale: PublicLocale, category: MarketplaceCategorySlug) {
  return localizePublicHref(locale, homepageCategoryPath(category))
}

export function homepageCategoryFromPath(pathname: string) {
  const normalized = stripLocalePrefix(pathname).replace(/\/$/, '') || '/'
  return categoryByPath.get(normalized) || null
}
