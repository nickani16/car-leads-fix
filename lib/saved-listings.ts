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
