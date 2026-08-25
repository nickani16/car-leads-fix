export const ACCOUNT_INTENT_COOKIE = 'autorell_account_intent'

export type AccountIntent = 'private' | 'business'

export type AccountIntentDetails = {
  accountType: AccountIntent
  companyName: string
  registrationNumber: string
}

export function saveAccountIntent(
  intent: AccountIntent,
  details?: { companyName?: string; registrationNumber?: string },
) {
  if (typeof document === 'undefined') return
  const value = encodeURIComponent(JSON.stringify({
    accountType: intent,
    companyName: cleanIntentValue(details?.companyName),
    registrationNumber: cleanIntentValue(details?.registrationNumber),
  }))
  document.cookie = `${ACCOUNT_INTENT_COOKIE}=${value}; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax${secureCookieAttribute()}`
}

export function clearAccountIntent() {
  if (typeof document === 'undefined') return
  document.cookie = `${ACCOUNT_INTENT_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${secureCookieAttribute()}`
}

export function normalizeAccountIntent(value: unknown): AccountIntent {
  return readAccountIntent(value).accountType
}

export function readAccountIntent(value: unknown): AccountIntentDetails {
  const raw = String(value || '').trim()
  if (raw === 'business' || raw === 'private') {
    return { accountType: raw, companyName: '', registrationNumber: '' }
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Record<string, unknown>
    return {
      accountType: parsed.accountType === 'business' ? 'business' : 'private',
      companyName: cleanIntentValue(parsed.companyName),
      registrationNumber: cleanIntentValue(parsed.registrationNumber),
    }
  } catch {
    return { accountType: 'private', companyName: '', registrationNumber: '' }
  }
}

function cleanIntentValue(value: unknown) {
  return String(value || '').trim().slice(0, 180)
}

function secureCookieAttribute() {
  return typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : ''
}
