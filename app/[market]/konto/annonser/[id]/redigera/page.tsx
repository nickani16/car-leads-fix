import EditListingPage from '@/app/account/listings/[id]/edit/page'

type LocalizedLegacyEditListingPageProps = {
  params: Promise<{ market: string; id: string }>
}

export default async function LocalizedLegacyEditListingPage({
  params,
}: LocalizedLegacyEditListingPageProps) {
  const { id } = await params
  return <EditListingPage params={Promise.resolve({ id })} />
}
