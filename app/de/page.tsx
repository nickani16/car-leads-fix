import type { Metadata } from 'next'
import VehicleLeadForm from '../components/VehicleLeadForm'

export const metadata: Metadata = {
  title: 'Auto verkaufen | Autorell Deutschland',
  description:
    'Verkaufen Sie Ihr Fahrzeug sicher an das europäische Händlernetz von Autorell.',
}

export default function GermanVehiclePage() {
  return <VehicleLeadForm locale="de" />
}
