import HomepageCategoryLanding, {
  createHomepageCategoryMetadata,
} from '@/app/components/HomepageCategoryLanding'

export const generateMetadata = createHomepageCategoryMetadata('trucks')

export default function Page() {
  return <HomepageCategoryLanding category="trucks" />
}
