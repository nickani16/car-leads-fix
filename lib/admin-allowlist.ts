import 'server-only'

const DEFAULT_ADMIN_EMAILS = [
  'nikolai.parkkila@hotmail.com',
  'nikolai.parkkila@outlook.com',
]

export function getAllowedAdminEmails() {
  const configured = (process.env.ADMIN_EMAILS || '')
    .split(/[,\s;]+/)
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)

  return new Set([...DEFAULT_ADMIN_EMAILS, ...configured])
}

export function isAllowedAdminEmail(email?: string | null) {
  if (!email) return false
  return getAllowedAdminEmails().has(email.trim().toLowerCase())
}
