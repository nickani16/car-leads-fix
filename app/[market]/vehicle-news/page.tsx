import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import VehicleNewsPage from '@/app/components/VehicleNewsPage'
import { getEuBuyerMarket } from '@/lib/eu-buyer-markets'
import { getVehicleNews } from '@/lib/content/vehicle-news'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ market: string }> }): Promise<Metadata> {
  const { market } = await params
  const copy = vehicleNewsMetadataCopy(market)
  return {
    title: `${copy.title} | Autorell`,
    description: copy.description,
    alternates: { canonical: `https://www.autorell.com/${market}/vehicle-news` },
  }
}

export default async function LocalizedVehicleNewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ market: string }>
  searchParams: Promise<{ category?: string; page?: string }>
}) {
  const { market } = await params
  if (market !== 'se' && market !== 'de' && !getEuBuyerMarket(market)) notFound()
  const resolvedSearchParams = await searchParams
  const page = Math.max(1, Number(resolvedSearchParams.page || '1') || 1)
  const data = await getVehicleNews(market, page)
  return <VehicleNewsPage market={market} page={page} activeCategory={resolvedSearchParams.category || 'all'} {...data} />
}

function vehicleNewsMetadataCopy(market: string) {
  const language = marketLanguage(market)
  const labels = {
    sv: { title: 'Fordonsnyheter', description: 'Nyheter, guider och marknadsinsikter för Europas fordonsmarknad.' },
    en: { title: 'Vehicle news', description: 'News, guides and market insights for Europe’s vehicle market.' },
    de: { title: 'Fahrzeugnews', description: 'News, Ratgeber und Marktanalysen für Europas Fahrzeugmarkt.' },
    fr: { title: 'Actualités véhicules', description: 'Actualités, guides et analyses du marché européen des véhicules.' },
    es: { title: 'Noticias de vehículos', description: 'Noticias, guías e información del mercado europeo de vehículos.' },
    it: { title: 'Notizie veicoli', description: 'Notizie, guide e approfondimenti sul mercato europeo dei veicoli.' },
    nl: { title: 'Voertuignieuws', description: 'Nieuws, gidsen en marktinzichten voor de Europese voertuigmarkt.' },
    pl: { title: 'Aktualności pojazdów', description: 'Aktualności, poradniki i analizy europejskiego rynku pojazdów.' },
    da: { title: 'Køretøjsnyheder', description: 'Nyheder, guides og markedsindsigt for Europas køretøjsmarked.' },
    fi: { title: 'Ajoneuvouutiset', description: 'Uutisia, oppaita ja markkinanäkemyksiä Euroopan ajoneuvomarkkinoille.' },
  }
  return labels[language]
}

function marketLanguage(market: string): 'sv' | 'en' | 'de' | 'fr' | 'es' | 'it' | 'nl' | 'pl' | 'da' | 'fi' {
  const normalized = market.toLowerCase()
  if (normalized === 'se') return 'sv'
  if (normalized === 'de' || normalized === 'at') return 'de'
  if (normalized === 'fr') return 'fr'
  if (normalized === 'es') return 'es'
  if (normalized === 'it') return 'it'
  if (normalized === 'nl' || normalized === 'be') return 'nl'
  if (normalized === 'pl') return 'pl'
  if (normalized === 'dk') return 'da'
  if (normalized === 'fi') return 'fi'
  return 'en'
}
