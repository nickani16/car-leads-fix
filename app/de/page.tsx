import BuyerMarketPage from '../components/BuyerMarketPage'
import { createPublicMetadata } from '@/lib/public-seo'

export const metadata = createPublicMetadata({
  title: 'Geprüfter Fahrzeugimport für Autohändler | Autorell',
  description:
    'Fahrzeuge aus Schweden sicher einkaufen: B2B-Gebote, Zahlung an Autorell, Vor-Ort-Prüfung, Exportdokumente und koordinierte Lieferung.',
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
