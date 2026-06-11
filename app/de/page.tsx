import BuyerMarketPage from '../components/BuyerMarketPage'
import { createPublicMetadata } from '@/lib/public-seo'

export const metadata = createPublicMetadata({
  title: 'Schwedische Fahrzeuge für Händler | Autorell Deutschland',
  description:
    'Ausgewählte schwedische Fahrzeuge, strukturierte Daten und 24-Stunden-Auktionen für verifizierte Autohändler.',
  path: '/',
  locale: 'de',
})

export default function GermanVehiclePage() {
  return <BuyerMarketPage locale="de" />
}
