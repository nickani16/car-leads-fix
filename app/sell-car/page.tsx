import WhyChooseAutorellPage, {
  generateWhyChooseAutorellMetadata,
} from '@/app/components/WhyChooseAutorellPage'

export const dynamic = 'force-dynamic'
export const generateMetadata = generateWhyChooseAutorellMetadata

export default function SellCarPage() {
  return <WhyChooseAutorellPage />
}
