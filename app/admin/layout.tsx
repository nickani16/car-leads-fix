import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import InactivityLogout from '@/app/components/InactivityLogout'
import AdminShell from './AdminShell'

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/admin')
  }

  const { data: adminUser, error } = await supabase
    .from('admin_users')
    .select('role,is_active')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle()

  if (error || !adminUser) {
    redirect('/login?status=admin-required')
  }

  return (
    <>
      <InactivityLogout />
      <AdminShell role={adminUser.role} email={user.email || 'Admin'}>
        {children}
      </AdminShell>
    </>
  )
}
