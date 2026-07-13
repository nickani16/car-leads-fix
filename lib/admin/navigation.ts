import type { AdminPermission } from './permissions'

export type AdminNavigationItem = {
  label: string
  href: string
  icon: string
  permission: AdminPermission
  available: boolean
  badge?: string
}

export type AdminNavigationGroup = {
  label: string
  items: AdminNavigationItem[]
}

export const ADMIN_NAVIGATION: AdminNavigationGroup[] = [
  {
    label: 'Överblick',
    items: [
      {
        label: 'Dashboard',
        href: '/admin',
        icon: 'dashboard',
        permission: 'dashboard.view',
        available: true,
      },
    ],
  },
  {
    label: 'Operativ drift',
    items: [
      { label: 'Användare', href: '/admin/users', icon: 'users', permission: 'users.read', available: true },
      { label: 'Företag', href: '/admin/companies', icon: 'companies', permission: 'companies.read', available: true },
      { label: 'Annonser', href: '/admin/listings', icon: 'listings', permission: 'listings.read', available: true },
      { label: 'Moderering', href: '/admin/moderation', icon: 'moderation', permission: 'moderation.read', available: true },
      { label: 'Rapporter', href: '/admin/reports', icon: 'reports', permission: 'reports.read', available: true },
      { label: 'Support', href: '/admin/support', icon: 'support', permission: 'support.read', available: true },
    ],
  },
  {
    label: 'Ekonomi',
    items: [
      { label: 'Betalningar', href: '/admin/payments', icon: 'payments', permission: 'payments.read', available: false, badge: 'Fas 3' },
      { label: 'Abonnemang & paket', href: '/admin/subscriptions', icon: 'subscriptions', permission: 'subscriptions.read', available: false, badge: 'Fas 3' },
    ],
  },
  {
    label: 'Innehåll',
    items: [
      { label: 'Innehåll & nyheter', href: '/admin/content', icon: 'content', permission: 'content.read', available: false, badge: 'Fas 4' },
      { label: 'Nyhetsbrev', href: '/admin/newsletters', icon: 'newsletter', permission: 'newsletters.read', available: false, badge: 'Fas 5' },
      { label: 'Media', href: '/admin/media', icon: 'media', permission: 'media.read', available: false, badge: 'Fas 4' },
    ],
  },
  {
    label: 'Plattform',
    items: [
      { label: 'Marknader & språk', href: '/admin/markets', icon: 'markets', permission: 'markets.read', available: false, badge: 'Planerad' },
      { label: 'Fordonsdata', href: '/admin/vehicle-data', icon: 'vehicle', permission: 'vehicle_data.read', available: false, badge: 'Planerad' },
      { label: 'Säkerhet', href: '/admin/security', icon: 'security', permission: 'security.read', available: false, badge: 'Fas 2' },
      { label: 'Statistik', href: '/admin/stats', icon: 'analytics', permission: 'analytics.read', available: true },
      { label: 'Systemstatus', href: '/admin/system', icon: 'system', permission: 'system.read', available: false, badge: 'Planerad' },
      { label: 'Audit-logg', href: '/admin/audit', icon: 'audit', permission: 'audit.read', available: true },
      { label: 'Inställningar', href: '/admin/settings', icon: 'settings', permission: 'settings.read', available: true },
      { label: 'Administratörer & roller', href: '/admin/administrators', icon: 'administrators', permission: 'administrators.read', available: true },
    ],
  },
]

export function navigationForPermissions(permissions: readonly string[]) {
  const allowed = new Set(permissions)
  return ADMIN_NAVIGATION.map((group) => ({
    ...group,
    items: group.items.filter((item) => allowed.has(item.permission)),
  })).filter((group) => group.items.length > 0)
}
