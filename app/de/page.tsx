import BuyerMarketPage from '../components/BuyerMarketPage'
import { createPublicMetadata } from '@/lib/public-seo'

export const metadata = createPublicMetadata({
  title: 'B2B Fahrzeugmarkt für Autohändler | Autorell',
  description:
    'Moderne Fahrzeuge über digitale B2B-Auktionen einkaufen. Autorell koordiniert Prüfung, Zahlung, Dokumente, Abholung und europaweiten Export.',
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
    'Fahrzeugimport Schweden',
    'Gebrauchtwagen Import Händler',
    'Fahrzeugprüfung vor Export',
    'Elektroautos für Händler',
    'junge Gebrauchtwagen B2B',
  ],
})

export default function GermanVehiclePage() {
  return <BuyerMarketPage locale="de" />
}
