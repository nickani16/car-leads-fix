import InactivityLogout from '@/app/components/InactivityLogout'
import { requireAdmin } from '@/lib/admin-auth'
import AdminShell from './AdminShell'

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const auth = await requireAdmin()

  return (
    <>
      <InactivityLogout />
      <AdminShell
        roles={auth.roles}
        permissions={auth.permissions}
        email={auth.user.email || 'Admin'}
        assuranceLevel={auth.assuranceLevel}
        accessSource={auth.accessSource}
      >
        {children}
      </AdminShell>
    </>
  )
}
