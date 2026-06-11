import BuyerMarketPage from '../components/BuyerMarketPage'
import { createPublicMetadata } from '@/lib/public-seo'

export const metadata = createPublicMetadata({
  title: 'B2B Fahrzeugmarkt für Autohändler | Autorell Deutschland',
  description:
    'Digitaler B2B-Fahrzeugmarkt für Autohändler: geprüfte Fahrzeuge, strukturierte Daten, Online-Auktionen und europaweite Beschaffung mit Autorell.',
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
  ],
})

export default function GermanVehiclePage() {
  return <BuyerMarketPage locale="de" />
}
