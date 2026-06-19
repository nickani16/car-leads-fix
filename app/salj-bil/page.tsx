import { createPublicMetadata } from '@/lib/public-seo'
import VehicleLeadForm from '../components/VehicleLeadForm'

export const metadata = createPublicMetadata({
  title: 'Sälj din bil till handlare i Europa | Autorell',
  description:
    'Erbjud en svensk bil från 2018 eller nyare till Autorell. Vi bedömer europeisk efterfrågan och kan lämna ett villkorat inköpserbjudande.',
  path: '/salj-bil',
})

export default function SwedishVehiclePage() {
  return <VehicleLeadForm locale="sv" />
}
