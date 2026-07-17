import type { Metadata } from 'next'
import VehicleNewsPage from '@/app/components/VehicleNewsPage'
import { getVehicleNews, getVehicleNewsFeaturedListings } from '@/lib/content/vehicle-news'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Vehicle news | Autorell',
  description: 'News, guides and market insights for Europe’s vehicle market.',
  alternates: { canonical: 'https://www.autorell.com/vehicle-news' },
}

export default async function EnglishVehicleNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>
}) {
  const resolvedSearchParams = await searchParams
  const page = Math.max(1, Number(resolvedSearchParams.page || '1') || 1)
  const [data, featuredListings] = await Promise.all([
    getVehicleNews('en', page),
    getVehicleNewsFeaturedListings('en'),
  ])
  return <VehicleNewsPage market="en" page={page} activeCategory={resolvedSearchParams.category || 'all'} featuredListings={featuredListings} {...data} />
}
