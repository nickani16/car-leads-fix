import { createPublicMetadata } from '@/lib/public-seo'
import VehicleLeadForm from '../components/VehicleLeadForm'

export const metadata = createPublicMetadata({
  title: 'Sälj din bil till handlare i Europa | Autorell',
  description:
    'Sälj en bil från 2018 eller nyare genom kostnadsfri registrering och budgivning från verifierade handlare i Sverige och Europa.',
  path: '/salj-bil',
})

export default function SwedishVehiclePage() {
  return <VehicleLeadForm locale="sv" />
}
