import MarketplaceCategoryRoutePage from './[category]/page'
import type { GeoLandingRoute } from '@/lib/seo-geo-landings'

type MarketplaceCategoryPageProps = {
  params: Promise<{ category: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
  seoLanding?: GeoLandingRoute | null
}

export default function MarketplaceCategoryPage(props: MarketplaceCategoryPageProps) {
  return MarketplaceCategoryRoutePage(
    props as Parameters<typeof MarketplaceCategoryRoutePage>[0],
  )
}
