import ProfileDetail from '../../ProfileDetail'

export const dynamic = 'force-dynamic'

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <ProfileDetail userId={id} backHref="/admin/users" />
}
