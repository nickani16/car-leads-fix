import HomepageCategoryLanding, {
  createHomepageCategoryMetadata,
} from '@/app/components/HomepageCategoryLanding'

export const generateMetadata = createHomepageCategoryMetadata('construction')

export default function Page() {
  return <HomepageCategoryLanding category="construction" />
}
