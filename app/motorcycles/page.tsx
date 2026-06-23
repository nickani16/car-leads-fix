import CategoryLandingPage, { generateCategoryLandingMetadata } from '@/app/components/CategoryLandingPage'

export const generateMetadata = () => generateCategoryLandingMetadata('motorcycles')
export default function Page() { return <CategoryLandingPage slug="motorcycles" /> }
