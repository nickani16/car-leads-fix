import HomepageCategoryLanding, {
  createHomepageCategoryMetadata,
} from '@/app/components/HomepageCategoryLanding'

export const generateMetadata = createHomepageCategoryMetadata('caravans')

export default function Page() {
  return <HomepageCategoryLanding category="caravans" />
}
