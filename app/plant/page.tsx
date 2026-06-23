import CategoryLandingPage, { generateCategoryLandingMetadata } from '@/app/components/CategoryLandingPage'

export const generateMetadata = () => generateCategoryLandingMetadata('construction')
export default function Page() { return <CategoryLandingPage slug="construction" /> }
