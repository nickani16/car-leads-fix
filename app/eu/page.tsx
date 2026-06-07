import type { Metadata } from 'next'
import VehicleLeadForm from '../components/VehicleLeadForm'

export const metadata: Metadata = {
  title: 'Sell your vehicle | Autorell Europe',
  description:
    'Sell your vehicle securely through Autorell’s European dealer network.',
}

export default function EuropeanVehiclePage() {
  return <VehicleLeadForm locale="en" />
}
