export const SAVED_LISTINGS_KEY = 'autorell-saved-listings'
export const SAVED_LISTINGS_EVENT = 'autorell:saved-listings'

export function readSavedListingIds() {
  if (typeof window === 'undefined') return []
  try {
    const value = JSON.parse(window.localStorage.getItem(SAVED_LISTINGS_KEY) || '[]')
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : []
  } catch {
    return []
  }
}

export function writeSavedListingIds(ids: string[]) {
  window.localStorage.setItem(SAVED_LISTINGS_KEY, JSON.stringify([...new Set(ids)]))
  window.dispatchEvent(new CustomEvent(SAVED_LISTINGS_EVENT))
}

export async function fetchSavedListingIds() {
  const response = await fetch('/api/saved-listings', {
    credentials: 'same-origin',
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  })
  if (response.status === 401) return { authenticated: false, ids: [] as string[] }
  if (!response.ok) throw new Error('Could not load saved listings')
  const payload = (await response.json()) as { listingIds?: unknown }
  const ids = Array.isArray(payload.listingIds)
    ? payload.listingIds.filter((id): id is string => typeof id === 'string')
    : []
  window.localStorage.setItem(SAVED_LISTINGS_KEY, JSON.stringify(ids))
  window.dispatchEvent(new CustomEvent(SAVED_LISTINGS_EVENT, { detail: { ids } }))
  return { authenticated: true, ids }
}

export async function saveListingId(listingId: string) {
  const response = await fetch('/api/saved-listings', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ listingId }),
  })
  if (response.status === 401) return { authenticated: false }
  if (!response.ok) throw new Error('Could not save listing')
  const current = readSavedListingIds()
  writeSavedListingIds([...current, listingId])
  return { authenticated: true }
}

export async function removeSavedListingId(listingId: string) {
  const response = await fetch(`/api/saved-listings?listingId=${encodeURIComponent(listingId)}`, {
    method: 'DELETE',
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
  })
  if (response.status === 401) return { authenticated: false }
  if (!response.ok) throw new Error('Could not remove saved listing')
  writeSavedListingIds(readSavedListingIds().filter((id) => id !== listingId))
  return { authenticated: true }
}
