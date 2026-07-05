import PublicInfoPage, { generatePublicInfoMetadata } from '@/app/components/PublicInfoPage'

export const generateMetadata = generatePublicInfoMetadata('compare-vehicles')

export default function CompareVehiclesPage() {
  return <PublicInfoPage page="compare-vehicles" />
}
