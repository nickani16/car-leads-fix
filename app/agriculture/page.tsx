import HomepageCategoryLanding, {
  createHomepageCategoryMetadata,
} from '@/app/components/HomepageCategoryLanding'

export const generateMetadata = createHomepageCategoryMetadata('agriculture')

export default function Page() {
  return <HomepageCategoryLanding category="agriculture" />
}
