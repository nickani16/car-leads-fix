import HomepageCategoryLanding, {
  createHomepageCategoryMetadata,
} from '@/app/components/HomepageCategoryLanding'

export const generateMetadata = createHomepageCategoryMetadata('motorhomes')

export default function Page() {
  return <HomepageCategoryLanding category="motorhomes" />
}
