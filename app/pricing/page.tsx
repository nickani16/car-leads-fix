import PublicInfoPage, { generatePublicInfoMetadata } from '@/app/components/PublicInfoPage'

export const generateMetadata = generatePublicInfoMetadata('pricing')

export default function PricingPage() {
  return <PublicInfoPage page="pricing" />
}
