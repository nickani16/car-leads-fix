import PublicInfoPage, { generatePublicInfoMetadata } from '@/app/components/PublicInfoPage'

export const generateMetadata = generatePublicInfoMetadata('dealer-solutions')

export default function DealerSolutionsPage() {
  return <PublicInfoPage page="dealer-solutions" />
}
