import PublicInfoPage, { generatePublicInfoMetadata } from '@/app/components/PublicInfoPage'

export const generateMetadata = generatePublicInfoMetadata('about')

export default function AboutPage() {
  return <PublicInfoPage page="about" />
}
