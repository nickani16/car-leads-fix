import type { Metadata } from 'next'
import BuyerMarketPage from '../components/BuyerMarketPage'

export const metadata: Metadata = {
  title: 'Schwedische Fahrzeuge für Händler | Autorell Deutschland',
  description:
    'Ausgewählte schwedische Fahrzeuge, strukturierte Daten und 24-Stunden-Auktionen für verifizierte Autohändler.',
}

export default function GermanVehiclePage() {
  return <BuyerMarketPage locale="de" />
}
