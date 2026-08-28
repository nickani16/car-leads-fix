'use client'

type RecaptchaApi = {
  ready: (callback: () => void) => void
  execute: (siteKey: string, options: { action: string }) => Promise<string>
}

declare global {
  interface Window {
    grecaptcha?: RecaptchaApi
  }
}

let recaptchaScriptPromise: Promise<void> | null = null

function loadRecaptcha(siteKey: string) {
  if (window.grecaptcha) return Promise.resolve()
  if (recaptchaScriptPromise) return recaptchaScriptPromise

  recaptchaScriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-autorell-recaptcha]')
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('Could not load reCAPTCHA')), { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`
    script.async = true
    script.defer = true
    script.dataset.autorellRecaptcha = 'true'
    script.addEventListener('load', () => resolve(), { once: true })
    script.addEventListener('error', () => reject(new Error('Could not load reCAPTCHA')), { once: true })
    document.head.appendChild(script)
  })

  return recaptchaScriptPromise
}

export async function getRecaptchaToken(action: string) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim()
  if (!siteKey) return null

  await loadRecaptcha(siteKey)
  const recaptcha = window.grecaptcha
  if (!recaptcha) throw new Error('reCAPTCHA is unavailable')

  await new Promise<void>((resolve) => recaptcha.ready(resolve))
  return recaptcha.execute(siteKey, { action })
}
