import PublicBusinessVehicleForm from '@/app/components/PublicBusinessVehicleForm'
import PublicFooter from '@/app/components/PublicFooter'
import PublicHeader from '@/app/components/PublicHeader'

export default function SellStockPage() {
  return <main className="bg-[#f7f5f0] text-[#202124]"><PublicHeader locale="en" /><div className="mx-auto max-w-[1180px] px-5 py-12 sm:px-8 lg:px-12 lg:py-20"><PublicBusinessVehicleForm locale="en" /></div><PublicFooter locale="en" /></main>
}
