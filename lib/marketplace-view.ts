export type MarketplaceViewMode = 'map' | 'list'

export function normalizeMarketplaceView(
  value: string | string[] | null | undefined,
): MarketplaceViewMode {
  const normalized = (Array.isArray(value) ? value[0] : value || '')
    .trim()
    .toLowerCase()

  return normalized === 'list' ? 'list' : 'map'
}

export function withMarketplaceView(
  searchParams: URLSearchParams,
  view: MarketplaceViewMode,
) {
  const nextParams = new URLSearchParams(searchParams)
  if (view === 'list') {
    nextParams.set('view', 'list')
  } else {
    nextParams.delete('view')
  }
  return nextParams
}
