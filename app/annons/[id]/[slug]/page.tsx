import ListingDetailPage, { generateListingMetadata } from '@/app/listings/[slug]/ListingDetailPage'

type ListingAdPageProps = {
  params: Promise<{ id: string; slug: string; market?: string }>
}

function legacySlugParams(params: ListingAdPageProps['params']) {
  return params.then(({ id, slug, market }) => ({ slug: `${slug}-${id}`, market }))
}

export function generateMetadata({ params }: ListingAdPageProps) {
  return generateListingMetadata({ params: legacySlugParams(params) })
}

export default function ListingAdPage({ params }: ListingAdPageProps) {
  return ListingDetailPage({ params: legacySlugParams(params) })
}

