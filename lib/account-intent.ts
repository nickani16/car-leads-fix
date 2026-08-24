export const ACCOUNT_INTENT_COOKIE = 'autorell_account_intent'

export type AccountIntent = 'private' | 'business'

export function saveAccountIntent(intent: AccountIntent) {
  if (typeof document === 'undefined') return
  document.cookie = `${ACCOUNT_INTENT_COOKIE}=${intent}; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax${secureCookieAttribute()}`
}

export function clearAccountIntent() {
  if (typeof document === 'undefined') return
  document.cookie = `${ACCOUNT_INTENT_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${secureCookieAttribute()}`
}

export function normalizeAccountIntent(value: unknown): AccountIntent {
  return value === 'business' ? 'business' : 'private'
}

function secureCookieAttribute() {
  return typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : ''
}
