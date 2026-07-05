import PublicInfoPage, { generatePublicInfoMetadata } from '@/app/components/PublicInfoPage'

export const generateMetadata = generatePublicInfoMetadata('payments')

export default function PaymentsPage() {
  return <PublicInfoPage page="payments" />
}
