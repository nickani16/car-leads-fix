import HomepageCategoryLanding, {
  createHomepageCategoryMetadata,
} from '@/app/components/HomepageCategoryLanding'

export const generateMetadata = createHomepageCategoryMetadata('vans')

export default function Page() {
  return <HomepageCategoryLanding category="vans" />
}
