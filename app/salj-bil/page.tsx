import type { Metadata } from 'next'
import VehicleLeadForm from '../components/VehicleLeadForm'

export const metadata: Metadata = {
  title: 'Kontrollera om din bil passar | Autorell Sverige',
  description:
    'För svenska bilar från 2018, högst 10 000 mil och gott tekniskt skick. Kostnadsfri registrering och europeisk dealerbudgivning.',
}

export default function SwedishVehiclePage() {
  return <VehicleLeadForm locale="sv" />
}
