import PublicInfoPage, { generatePublicInfoMetadata } from '@/app/components/PublicInfoPage'

export const generateMetadata = generatePublicInfoMetadata('saved-searches')

export default function SavedSearchesPage() {
  return <PublicInfoPage page="saved-searches" />
}
