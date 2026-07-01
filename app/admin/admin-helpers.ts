import { marketplaceCategories } from '@/lib/marketplace'

export type AdminSearchParams = Promise<Record<string, string | string[] | undefined>>

export const PAGE_SIZE = 20

export function getParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = params[key]
  return Array.isArray(value) ? value[0] || '' : value || ''
}

export function getPage(params: Record<string, string | string[] | undefined>) {
  const page = Number(getParam(params, 'page') || '1')
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1
}

export function queryToUrlSearchParams(
  params: Record<string, string | string[] | undefined>,
) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (key === 'page') return
    const normalized = Array.isArray(value) ? value[0] : value
    if (normalized) query.set(key, normalized)
  })
  return query
}

export function formatDate(value?: string | null) {
  if (!value) return 'Saknas'
  return new Intl.DateTimeFormat('sv-SE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function formatNumber(value?: number | null) {
  return new Intl.NumberFormat('sv-SE').format(value || 0)
}

export function categoryLabel(value?: string | null) {
  return (
    marketplaceCategories.find((category) => category.slug === value)?.labels.sv ||
    value ||
    'Okänd'
  )
}

export function statusTone(
  status?: string | null,
): 'blue' | 'green' | 'amber' | 'red' | 'gray' {
  if (!status) return 'gray'
  if (['published', 'approved', 'resolved', 'closed', 'standard'].includes(status)) {
    return 'green'
  }
  if (['new', 'pending_review', 'pending_payment', 'reviewing', 'in_progress'].includes(status)) {
    return 'blue'
  }
  if (['paused', 'waiting_customer', 'review', 'restricted', 'flagged'].includes(status)) {
    return 'amber'
  }
  if (['rejected', 'blocked', 'removed', 'deleted', 'suspended'].includes(status)) {
    return 'red'
  }
  return 'gray'
}

export function profileName(profile: {
  account_type?: string | null
  display_name?: string | null
  company_name?: string | null
  legal_name?: string | null
}) {
  if (profile.account_type === 'business') {
    return profile.company_name || profile.legal_name || profile.display_name || 'Företag'
  }
  return profile.display_name || profile.legal_name || 'Privatperson'
}

export function pageRange(page: number) {
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1
  return { from, to }
}
