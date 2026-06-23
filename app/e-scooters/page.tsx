import CategoryLandingPage, { generateCategoryLandingMetadata } from '@/app/components/CategoryLandingPage'

export const generateMetadata = () => generateCategoryLandingMetadata('e-scooters')
export default function Page() { return <CategoryLandingPage slug="e-scooters" /> }
