import BuyerMarketPage from '../components/BuyerMarketPage'
import { createPublicMetadata } from '@/lib/public-seo'

export const metadata = createPublicMetadata({
  title: 'Moderne Fahrzeuge für Autohändler | Autorell Deutschland',
  description:
    'B2B-Fahrzeugmarkt für Händler: ausgewählte Fahrzeuge ab 2018, unter 100.000 km, strukturierte Daten und digitale Auktionen in Europa.',
  path: '/',
  locale: 'de',
  keywords: [
    'B2B Fahrzeugmarkt',
    'Fahrzeugbörse für Händler',
    'Autoauktion Händler',
    'Fahrzeugeinkauf Europa',
    'Gebrauchtwagen Großhandel',
    'digitale Fahrzeugauktion',
    'Autohändler Plattform',
    'Elektroautos für Händler',
    'junge Gebrauchtwagen B2B',
  ],
})

export default function GermanVehiclePage() {
  return <BuyerMarketPage locale="de" />
}
