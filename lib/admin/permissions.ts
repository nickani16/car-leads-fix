export const ADMIN_ROLES = [
  'super_admin',
  'operations_admin',
  'moderator',
  'support_admin',
  'finance_admin',
  'content_editor',
  'analyst',
] as const

export type AdminRole = (typeof ADMIN_ROLES)[number]

export const ADMIN_PERMISSIONS = [
  'dashboard.view',
  'users.read',
  'users.manage',
  'users.delete',
  'companies.read',
  'companies.manage',
  'companies.verify',
  'listings.read',
  'listings.manage',
  'listings.delete',
  'moderation.read',
  'moderation.manage',
  'reports.read',
  'reports.manage',
  'payments.read',
  'payments.manage',
  'subscriptions.read',
  'subscriptions.manage',
  'support.read',
  'support.manage',
  'content.read',
  'content.manage',
  'newsletters.read',
  'newsletters.manage',
  'media.read',
  'media.manage',
  'markets.read',
  'markets.manage',
  'vehicle_data.read',
  'vehicle_data.manage',
  'security.read',
  'security.manage',
  'analytics.read',
  'system.read',
  'system.manage',
  'audit.read',
  'settings.read',
  'settings.manage',
  'administrators.read',
  'administrators.manage',
] as const

export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number]

const ALL_PERMISSIONS = new Set<AdminPermission>(ADMIN_PERMISSIONS)

const ROLE_PERMISSION_MATRIX: Record<AdminRole, readonly AdminPermission[]> = {
  super_admin: ADMIN_PERMISSIONS,
  operations_admin: [
    'dashboard.view',
    'users.read',
    'users.manage',
    'companies.read',
    'companies.manage',
    'companies.verify',
    'listings.read',
    'listings.manage',
    'listings.delete',
    'moderation.read',
    'moderation.manage',
    'reports.read',
    'reports.manage',
    'payments.read',
    'subscriptions.read',
    'support.read',
    'support.manage',
    'security.read',
    'analytics.read',
    'system.read',
    'settings.read',
  ],
  moderator: [
    'dashboard.view',
    'users.read',
    'companies.read',
    'listings.read',
    'listings.manage',
    'moderation.read',
    'moderation.manage',
    'reports.read',
    'reports.manage',
  ],
  support_admin: [
    'dashboard.view',
    'users.read',
    'users.manage',
    'companies.read',
    'listings.read',
    'reports.read',
    'support.read',
    'support.manage',
  ],
  finance_admin: [
    'dashboard.view',
    'users.read',
    'companies.read',
    'listings.read',
    'payments.read',
    'payments.manage',
    'subscriptions.read',
    'subscriptions.manage',
  ],
  content_editor: [
    'dashboard.view',
    'content.read',
    'content.manage',
    'newsletters.read',
    'newsletters.manage',
    'media.read',
    'media.manage',
  ],
  analyst: ['dashboard.view', 'analytics.read'],
}

const LEGACY_ROLE_MAP: Record<string, AdminRole> = {
  admin: 'operations_admin',
  operations: 'operations_admin',
  support: 'support_admin',
  finance: 'finance_admin',
  content: 'content_editor',
  sales: 'operations_admin',
  legal: 'operations_admin',
}

export function normalizeAdminRole(value: string): AdminRole | null {
  const normalized = value.trim().toLowerCase()
  if ((ADMIN_ROLES as readonly string[]).includes(normalized)) {
    return normalized as AdminRole
  }
  return LEGACY_ROLE_MAP[normalized] || null
}

export function permissionsForRoles(
  roles: readonly (AdminRole | string)[],
): AdminPermission[] {
  const permissions = new Set<AdminPermission>()

  for (const value of roles) {
    const role = normalizeAdminRole(String(value))
    if (!role) continue
    for (const permission of ROLE_PERMISSION_MATRIX[role]) {
      permissions.add(permission)
    }
  }

  return ADMIN_PERMISSIONS.filter((permission) => permissions.has(permission))
}

export function isAdminPermission(value: string): value is AdminPermission {
  return ALL_PERMISSIONS.has(value as AdminPermission)
}

export function hasAdminPermission(
  permissions: readonly (AdminPermission | string)[],
  required: AdminPermission,
) {
  return permissions.includes(required)
}

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: 'Super Admin',
  operations_admin: 'Operations Admin',
  moderator: 'Moderator',
  support_admin: 'Support Admin',
  finance_admin: 'Finance Admin',
  content_editor: 'Content Editor',
  analyst: 'Analyst',
}

export function permissionCountForRole(role: AdminRole) {
  return ROLE_PERMISSION_MATRIX[role].length
}
