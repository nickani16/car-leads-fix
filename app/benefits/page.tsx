import { generateWhyChooseAutorellMetadata } from '@/app/components/WhyChooseAutorellPage'
import { permanentRedirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const generateMetadata = generateWhyChooseAutorellMetadata

export default function BenefitsPage() {
  permanentRedirect('/sell-car')
}
