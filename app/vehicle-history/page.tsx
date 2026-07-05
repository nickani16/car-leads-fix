import PublicInfoPage, { generatePublicInfoMetadata } from '@/app/components/PublicInfoPage'

export const generateMetadata = generatePublicInfoMetadata('vehicle-history')

export default function VehicleHistoryPage() {
  return <PublicInfoPage page="vehicle-history" />
}
