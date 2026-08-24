const BUSINESS_REGISTRATION_DRAFT_KEY = 'autorell.businessRegistrationDraft.v1'

export type BusinessRegistrationDraft = {
  companyName: string
  registrationNumber: string
}

export function readBusinessRegistrationDraft(): BusinessRegistrationDraft | null {
  if (typeof window === 'undefined') return null

  try {
    const value = window.sessionStorage.getItem(BUSINESS_REGISTRATION_DRAFT_KEY)
    if (!value) return null
    const parsed = JSON.parse(value) as Partial<BusinessRegistrationDraft>
    if (typeof parsed.companyName !== 'string' || typeof parsed.registrationNumber !== 'string') {
      return null
    }
    return {
      companyName: parsed.companyName,
      registrationNumber: parsed.registrationNumber,
    }
  } catch {
    return null
  }
}

export function saveBusinessRegistrationDraft(draft: BusinessRegistrationDraft) {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(BUSINESS_REGISTRATION_DRAFT_KEY, JSON.stringify(draft))
}

export function clearBusinessRegistrationDraft() {
  if (typeof window === 'undefined') return
  window.sessionStorage.removeItem(BUSINESS_REGISTRATION_DRAFT_KEY)
}
