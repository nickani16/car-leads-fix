import MarketplaceCategoryPage, {
  generateMetadata as generateMarketplaceCategoryMetadata,
} from './[category]/page'

type MarketplacePageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export function generateMetadata({ searchParams }: MarketplacePageProps) {
  return generateMarketplaceCategoryMetadata({
    params: Promise.resolve({ category: 'vehicles' }),
    searchParams,
  })
}

export default function MarketplacePage({ searchParams }: MarketplacePageProps) {
  return MarketplaceCategoryPage({
    params: Promise.resolve({ category: 'vehicles' }),
    searchParams,
  })
}
