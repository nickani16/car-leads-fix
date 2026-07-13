import { redirect } from 'next/navigation'
import type { AdminPermission } from '@/lib/admin/permissions'
import { contextHasPermission, getAdminContext } from '@/lib/admin/context'

export async function requireAdmin() {
  const context = await getAdminContext()
  if (!context) redirect('/se')

  return {
    ...context,
    adminUser: {
      role: context.primaryRole,
      is_active: true,
    },
  }
}

export async function requireAdminPermission(permission: AdminPermission) {
  const context = await requireAdmin()
  if (!contextHasPermission(context, permission)) {
    redirect('/admin?status=forbidden')
  }
  return context
}

export async function requireSuperAdmin() {
  return requireAdminPermission('administrators.manage')
}
