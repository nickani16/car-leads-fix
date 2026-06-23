import CategoryLandingPage, { generateCategoryLandingMetadata } from '@/app/components/CategoryLandingPage'

export const generateMetadata = () => generateCategoryLandingMetadata('electric-bikes')
export default function Page() { return <CategoryLandingPage slug="electric-bikes" /> }
