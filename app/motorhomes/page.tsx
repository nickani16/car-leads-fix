import CategoryLandingPage, { generateCategoryLandingMetadata } from '@/app/components/CategoryLandingPage'

export const generateMetadata = () => generateCategoryLandingMetadata('motorhomes')
export default function Page() { return <CategoryLandingPage slug="motorhomes" /> }
