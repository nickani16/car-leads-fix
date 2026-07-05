import PublicInfoPage, { generatePublicInfoMetadata } from '@/app/components/PublicInfoPage'

export const generateMetadata = generatePublicInfoMetadata('how-selling-works')

export default function HowSellingWorksPage() {
  return <PublicInfoPage page="how-selling-works" />
}
