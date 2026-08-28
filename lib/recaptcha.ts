import 'server-only'

type VerifyRecaptchaResult =
  | { ok: true; enabled: boolean; score?: number }
  | { ok: false; enabled: true; reason: 'configuration' | 'missing_token' | 'request_failed' | 'rejected' }

type SiteVerifyResponse = {
  success?: boolean
  score?: number
  action?: string
}

export async function verifyRecaptcha(token: unknown, expectedAction: string): Promise<VerifyRecaptchaResult> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY?.trim()
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim()

  if (!secretKey && !siteKey) return { ok: true, enabled: false }
  if (!secretKey || !siteKey) return { ok: false, enabled: true, reason: 'configuration' }
  if (typeof token !== 'string' || !token.trim()) {
    return { ok: false, enabled: true, reason: 'missing_token' }
  }

  const body = new URLSearchParams({ secret: secretKey, response: token.trim() })
  let response: Response
  try {
    response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      cache: 'no-store',
    })
  } catch {
    return { ok: false, enabled: true, reason: 'request_failed' }
  }

  if (!response.ok) return { ok: false, enabled: true, reason: 'request_failed' }

  const result = (await response.json().catch(() => null)) as SiteVerifyResponse | null
  const configuredThreshold = Number(process.env.RECAPTCHA_MIN_SCORE || '0.5')
  const minimumScore = Number.isFinite(configuredThreshold) ? configuredThreshold : 0.5
  if (!result?.success || result.action !== expectedAction || typeof result.score !== 'number' || result.score < minimumScore) {
    return { ok: false, enabled: true, reason: 'rejected' }
  }

  return { ok: true, enabled: true, score: result.score }
}
