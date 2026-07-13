import { permanentRedirect } from 'next/navigation'

export default async function LegacyLocalizedVehicleNewsPage({ params }: { params: Promise<{ market: string }> }) {
  const { market } = await params
  permanentRedirect(`/${market}/vehicle-news`)
}
