import CategoryLandingPage, { generateCategoryLandingMetadata } from '@/app/components/CategoryLandingPage'

export const generateMetadata = () => generateCategoryLandingMetadata('agriculture')
export default function Page() { return <CategoryLandingPage slug="agriculture" /> }
