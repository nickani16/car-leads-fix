import PublicInfoPage, { generatePublicInfoMetadata } from '@/app/components/PublicInfoPage'

export const generateMetadata = generatePublicInfoMetadata('sell-vehicle')

export default function SellVehiclePage() {
  return <PublicInfoPage page="sell-vehicle" />
}
