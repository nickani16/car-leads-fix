import SellVehicleSeoPage, { generateSellVehicleMetadata } from '@/app/components/SellVehicleSeoPage'

export const dynamic = 'force-dynamic'
export const generateMetadata = generateSellVehicleMetadata

export default function SellVehiclePage() {
  return <SellVehicleSeoPage />
}
