import HomepageCategoryLanding, {
  createHomepageCategoryMetadata,
} from '@/app/components/HomepageCategoryLanding'

export const generateMetadata = createHomepageCategoryMetadata('electric-bikes')

export default function Page() {
  return <HomepageCategoryLanding category="electric-bikes" />
}
