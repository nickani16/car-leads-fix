import SellToDealerPage, { generateSellToDealerMetadata } from '@/app/components/SellToDealerPage'

export const dynamic = 'force-dynamic'
export const generateMetadata = generateSellToDealerMetadata

export default function SellToDealerRoute() {
  return <SellToDealerPage />
}
