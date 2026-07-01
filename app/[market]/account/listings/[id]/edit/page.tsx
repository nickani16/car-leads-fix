import EditListingPage from '@/app/account/listings/[id]/edit/page'

type LocalizedEditListingPageProps = {
  params: Promise<{ market: string; id: string }>
}

export default async function LocalizedEditListingPage({
  params,
}: LocalizedEditListingPageProps) {
  const { id } = await params
  return <EditListingPage params={Promise.resolve({ id })} />
}
