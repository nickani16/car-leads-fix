import PublicInfoPage, { generatePublicInfoMetadata } from '@/app/components/PublicInfoPage'

export const generateMetadata = generatePublicInfoMetadata('shipping-delivery')

export default function ShippingDeliveryPage() {
  return <PublicInfoPage page="shipping-delivery" />
}
