import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import VehicleNewsPage from '@/app/components/VehicleNewsPage'
import { getEuBuyerMarket } from '@/lib/eu-buyer-markets'
import { getVehicleNews } from '@/lib/content/vehicle-news'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ market: string }> }): Promise<Metadata> {
  const { market } = await params
  return {
    title: market === 'se' ? 'Fordonsnyheter | Autorell' : 'Vehicle news | Autorell',
    description: 'Nyheter, guider och marknadsinsikter för Europas fordonsmarknad.',
    alternates: { canonical: `https://www.autorell.com/${market}/vehicle-news` },
  }
}

export default async function LocalizedVehicleNewsPage({ params, searchParams }: { params: Promise<{ market: string }>; searchParams: Promise<{ page?: string }> }) {
  const { market } = await params
  if (market !== 'se' && market !== 'de' && !getEuBuyerMarket(market)) notFound()
  const page = Math.max(1, Number((await searchParams).page || '1') || 1)
  const data = await getVehicleNews(market, page)
  return <VehicleNewsPage market={market} page={page} {...data} />
}
