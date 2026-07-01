import EditListingPage from '@/app/account/listings/[id]/edit/page'

type LegacyEditListingPageProps = {
  params: Promise<{ id: string }>
}

export default async function LegacyEditListingPage({
  params,
}: LegacyEditListingPageProps) {
  const { id } = await params
  return <EditListingPage params={Promise.resolve({ id })} />
}
