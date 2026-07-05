import PublicInfoPage, { generatePublicInfoMetadata } from '@/app/components/PublicInfoPage'

export const generateMetadata = generatePublicInfoMetadata('partners')

export default function PartnersPage() {
  return <PublicInfoPage page="partners" />
}
