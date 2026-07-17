export const SAVED_SEARCHES_KEY = 'autorell-saved-searches'
export const SAVED_SEARCHES_EVENT = 'autorell:saved-searches'

type SavedSearchCountResult = { authenticated: boolean; count: number }

let savedSearchCountRequest: Promise<SavedSearchCountResult> | null = null

export function readSavedSearchCount() {
  if (typeof window === 'undefined') return 0
  try {
    const value = JSON.parse(window.localStorage.getItem(SAVED_SEARCHES_KEY) || '[]')
    return Array.isArray(value) ? value.length : 0
  } catch {
    return 0
  }
}

export function writeSavedSearchIds(ids: string[]) {
  window.localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify([...new Set(ids)]))
  window.dispatchEvent(new CustomEvent(SAVED_SEARCHES_EVENT))
}

export async function fetchSavedSearchCount() {
  if (savedSearchCountRequest) return savedSearchCountRequest
  savedSearchCountRequest = fetch('/api/saved-searches', {
    credentials: 'same-origin',
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  })
    .then(async (response): Promise<SavedSearchCountResult> => {
      if (response.status === 401) return { authenticated: false, count: 0 }
      if (!response.ok) throw new Error('Could not load saved searches')
      const payload = (await response.json()) as { searches?: Array<{ id?: unknown }> }
      const ids = Array.isArray(payload.searches)
        ? payload.searches.map((search) => search.id).filter((id): id is string => typeof id === 'string')
        : []
      window.localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(ids))
      return { authenticated: true, count: ids.length }
    })
    .finally(() => {
      savedSearchCountRequest = null
    })
  return savedSearchCountRequest
}
