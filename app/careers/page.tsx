import PublicInfoPage, { generatePublicInfoMetadata } from '@/app/components/PublicInfoPage'

export const generateMetadata = generatePublicInfoMetadata('careers')

export default function CareersPage() {
  return <PublicInfoPage page="careers" />
}
