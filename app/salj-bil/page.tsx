import type { Metadata } from 'next'
import VehicleLeadForm from '../components/VehicleLeadForm'

export const metadata: Metadata = {
  title: 'Sälj din bil | Autorell Sverige',
  description:
    'Sälj din bil tryggt till Autorells europeiska handlarnätverk.',
}

export default function SwedishVehiclePage() {
  return <VehicleLeadForm locale="sv" />
}
