import PublicInfoPage, { generatePublicInfoMetadata } from '@/app/components/PublicInfoPage'

export const generateMetadata = generatePublicInfoMetadata('safety-tips')

export default function SafetyTipsPage() {
  return <PublicInfoPage page="safety-tips" />
}
