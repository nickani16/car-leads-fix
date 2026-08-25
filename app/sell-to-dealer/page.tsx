import SellToDealerPage, { generateSellToDealerMetadata } from '@/app/components/SellToDealerPage'

export const dynamic = 'force-dynamic'
export async function generateMetadata() {
  return generateSellToDealerMetadata()
}

export default function SellToDealerRoute() {
  return <SellToDealerPage />
}
