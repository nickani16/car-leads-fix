import PublicInfoPage, { generatePublicInfoMetadata } from '@/app/components/PublicInfoPage'

export const generateMetadata = generatePublicInfoMetadata('buying-guide')

export default function BuyingGuidePage() {
  return <PublicInfoPage page="buying-guide" />
}
