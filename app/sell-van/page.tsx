import type { Metadata } from 'next'
import WhyChooseAutorellPage, {
  generateWhyChooseAutorellMetadata,
} from '@/app/components/WhyChooseAutorellPage'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  return generateWhyChooseAutorellMetadata(undefined, 'van')
}

export default function SellVanPage() {
  return <WhyChooseAutorellPage vehicleKind="van" />
}
