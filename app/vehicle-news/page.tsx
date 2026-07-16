import type { Metadata } from 'next'
import VehicleNewsPage from '@/app/components/VehicleNewsPage'
import { getVehicleNews } from '@/lib/content/vehicle-news'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Vehicle news | Autorell',
  description: 'News, guides and market insights for Europe’s vehicle market.',
  alternates: { canonical: 'https://www.autorell.com/vehicle-news' },
}

export default async function EnglishVehicleNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const page = Math.max(1, Number((await searchParams).page || '1') || 1)
  const data = await getVehicleNews('en', page)
  return <VehicleNewsPage market="en" page={page} {...data} />
}
