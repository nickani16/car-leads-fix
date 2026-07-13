import 'server-only'

import { cache } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAllowedAdminEmail } from '@/lib/admin-allowlist'
import {
  hasAdminPermission,
  isAdminPermission,
  normalizeAdminRole,
  permissionsForRoles,
  type AdminPermission,
  type AdminRole,
} from './permissions'

export type AdminContext = {
  user: User
  roles: AdminRole[]
  primaryRole: AdminRole
  permissions: AdminPermission[]
  assuranceLevel: string | null
  nextAssuranceLevel: string | null
  accessSource: 'rbac' | 'legacy'
  adminClient: ReturnType<typeof createAdminClient>
}

const ROLE_PRIORITY: AdminRole[] = [
  'super_admin',
  'operations_admin',
  'moderator',
  'support_admin',
  'finance_admin',
  'content_editor',
  'analyst',
]

function isMissingFoundationError(error: { code?: string; message?: string } | null) {
  if (!error) return false
  return (
    ['42P01', 'PGRST205'].includes(error.code || '') ||
    /schema cache|does not exist|could not find the table/i.test(error.message || '')
  )
}

function sortRoles(roles: Iterable<AdminRole>) {
  const roleSet = new Set(roles)
  return ROLE_PRIORITY.filter((role) => roleSet.has(role))
}

async function readRbacAccess(
  adminClient: ReturnType<typeof createAdminClient>,
  userId: string,
) {
  const now = new Date().toISOString()
  const { data: assignments, error: assignmentError } = await adminClient
    .from('user_admin_roles')
    .select('role_key,is_active,expires_at')
    .eq('user_id', userId)
    .eq('is_active', true)
    .or(`expires_at.is.null,expires_at.gt.${now}`)

  if (assignmentError) {
    if (isMissingFoundationError(assignmentError)) return null
    throw new Error(`Admin role lookup failed: ${assignmentError.message}`)
  }

  const roles = sortRoles(
    (assignments || [])
      .map((assignment) => normalizeAdminRole(String(assignment.role_key || '')))
      .filter((role): role is AdminRole => Boolean(role)),
  )

  if (!roles.length) return { roles, permissions: [] as AdminPermission[] }

  const { data: grants, error: grantError } = await adminClient
    .from('admin_role_permissions')
    .select('role_key,permission_key')
    .in('role_key', roles)

  if (grantError) {
    if (isMissingFoundationError(grantError)) {
      return { roles, permissions: permissionsForRoles(roles) }
    }
    throw new Error(`Admin permission lookup failed: ${grantError.message}`)
  }

  const permissions = Array.from(
    new Set(
      (grants || [])
        .map((grant) => String(grant.permission_key || ''))
        .filter(isAdminPermission),
    ),
  )

  return { roles, permissions }
}

async function readLegacyAccess(
  adminClient: ReturnType<typeof createAdminClient>,
  userId: string,
) {
  const { data: legacyAdmin, error } = await adminClient
    .from('admin_users')
    .select('role,is_active')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle()

  if (error) throw new Error(`Legacy admin lookup failed: ${error.message}`)
  const role = legacyAdmin?.role
    ? normalizeAdminRole(String(legacyAdmin.role))
    : null
  if (!role) return null

  return {
    roles: [role],
    permissions: permissionsForRoles([role]),
  }
}

export const getAdminContext = cache(async (): Promise<AdminContext | null> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !isAllowedAdminEmail(user.email)) return null

  const adminClient = createAdminClient()
  const rbacAccess = await readRbacAccess(adminClient, user.id)
  const access = rbacAccess?.roles.length
    ? { ...rbacAccess, source: 'rbac' as const }
    : await readLegacyAccess(adminClient, user.id).then((legacy) =>
        legacy ? { ...legacy, source: 'legacy' as const } : null,
      )

  if (!access?.roles.length || !access.permissions.length) return null

  const assurance = await supabase.auth.mfa
    .getAuthenticatorAssuranceLevel()
    .then(({ data }) => data)
    .catch(() => null)

  return {
    user,
    roles: access.roles,
    primaryRole: access.roles[0],
    permissions: access.permissions,
    assuranceLevel: assurance?.currentLevel || null,
    nextAssuranceLevel: assurance?.nextLevel || null,
    accessSource: access.source,
    adminClient,
  }
})

export function contextHasPermission(
  context: Pick<AdminContext, 'permissions'>,
  permission: AdminPermission,
) {
  return hasAdminPermission(context.permissions, permission)
}
