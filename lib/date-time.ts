const stockholmDateTime = new Intl.DateTimeFormat('sv-SE', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Europe/Stockholm',
})

export function parseDatabaseTimestamp(value: string | null | undefined) {
  if (!value) return null

  const trimmed = value.trim()
  const normalized = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(trimmed)
    ? trimmed
    : `${trimmed.replace(' ', 'T')}Z`
  const date = new Date(normalized)

  return Number.isNaN(date.getTime()) ? null : date
}

export function formatStockholmTimestamp(
  value: string | null | undefined,
  fallback = 'Äldre lead – tid saknas'
) {
  const date = parseDatabaseTimestamp(value)
  return date ? stockholmDateTime.format(date) : fallback
}
