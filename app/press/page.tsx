import PublicInfoPage, { generatePublicInfoMetadata } from '@/app/components/PublicInfoPage'

export const generateMetadata = generatePublicInfoMetadata('press')

export default function PressPage() {
  return <PublicInfoPage page="press" />
}
