'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Heart,
  LockKeyhole,
  Mail,
  MessageCircle,
} from 'lucide-react'
import BrandLogo from './BrandLogo'
import { createClient } from '@/lib/supabase/client'
import { translatePublicObject, type PublicLocale } from '@/lib/public-i18n'

const REMEMBERED_LOGIN_KEY = 'autorell.rememberedLogin'

export default function EmailCodeAuth({
  locale,
  mode = 'login',
  variant = 'page',
  onModeChange,
}: {
  locale: PublicLocale
  mode?: 'login' | 'register'
  variant?: 'page' | 'modal'
  onModeChange?: (mode: 'login' | 'register') => void
}) {
  const router = useRouter()
  const copy = getCopy(locale, mode)
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [remember, setRemember] = useState(true)
  const [requestedPath, setRequestedPath] = useState('')
  const [retryAfter, setRetryAfter] = useState(0)
  const inputs = useRef<Array<HTMLInputElement | null>>([])
  const isModal = variant === 'modal'

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search)
      const next = params.get('next')
      const remembered = window.localStorage.getItem(REMEMBERED_LOGIN_KEY)
      if (remembered) setEmail(remembered)
      if (next === '/admin' || next?.startsWith('/konto')) setRequestedPath(next)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!retryAfter) return
    const timer = window.setInterval(
      () => setRetryAfter((current) => Math.max(0, current - 1)),
      1000,
    )
    return () => window.clearInterval(timer)
  }, [retryAfter])

  async function requestCode(event?: FormEvent) {
    event?.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await fetch('/api/auth/email-code/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const result = (await response.json()) as {
        error?: string
        retryAfter?: number
      }
      if (!response.ok) {
        setError(result.error || copy.sendError)
        return
      }
      if (remember) window.localStorage.setItem(REMEMBERED_LOGIN_KEY, email.trim())
      else window.localStorage.removeItem(REMEMBERED_LOGIN_KEY)
      setDigits(['', '', '', '', '', ''])
      setRetryAfter(result.retryAfter || 20)
      setStep('code')
      window.setTimeout(() => inputs.current[0]?.focus(), 80)
    } catch {
      setError(copy.connectionError)
    } finally {
      setLoading(false)
    }
  }

  async function verifyCode(code = digits.join('')) {
    if (code.length !== 6) return
    setError('')
    setLoading(true)
    try {
      const response = await fetch('/api/auth/email-code/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          code,
          next: requestedPath || undefined,
        }),
      })
      const result = (await response.json()) as {
        success?: boolean
        destination?: string
        error?: string
      }
      if (!response.ok || !result.success) {
        setError(result.error || copy.codeError)
        return
      }
      router.replace(result.destination || '/konto')
      router.refresh()
    } catch {
      setError(copy.connectionError)
    } finally {
      setLoading(false)
    }
  }

  async function signInWithProvider(provider: 'google' | 'facebook' | 'apple') {
    setError('')
    setLoading(true)
    const next = requestedPath || '/konto'
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
    const { error: providerError } = await createClient().auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    })
    if (providerError) {
      setError(copy.connectionError)
      setLoading(false)
    }
  }

  function updateDigit(index: number, value: string) {
    const clean = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = clean
    setDigits(next)
    if (clean && index < 5) inputs.current[index + 1]?.focus()
    if (clean && index === 5 && next.every(Boolean)) void verifyCode(next.join(''))
  }

  function pasteCode(value: string) {
    const code = value.replace(/\D/g, '').slice(0, 6)
    if (code.length !== 6) return
    const next = code.split('')
    setDigits(next)
    inputs.current[5]?.focus()
    void verifyCode(code)
  }

  return (
    <main className={isModal ? 'text-[#101828]' : 'min-h-screen bg-[#f5f6f8] px-5 py-8 text-[#101828] sm:py-12'}>
      <div className={isModal ? 'mx-auto max-w-[430px]' : 'mx-auto max-w-[1160px]'}>
        {!isModal ? <Link href="/" aria-label="Autorell" className="inline-flex">
          <BrandLogo />
        </Link> : null}

        <div className={isModal ? 'overflow-hidden rounded-[28px] bg-white' : 'mt-9 grid overflow-hidden rounded-[28px] border border-[#dfe3e8] bg-white shadow-[0_30px_90px_rgba(16,24,40,.10)] lg:grid-cols-[1fr_520px]'}>
          <section className="relative hidden min-h-[650px] overflow-hidden border-r border-[#e5e7eb] bg-[#f8faff] p-12 lg:block">
            <div className="absolute -bottom-28 -right-24 h-96 w-96 rounded-full bg-[#e4edff]" />
            <span className="relative inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#0866ff] shadow-sm">
              <BadgeCheck className="h-4 w-4" />
              {copy.eyebrow}
            </span>
            <h1 className="relative mt-8 max-w-lg text-[54px] leading-[1.03] tracking-[-.055em]">
              {copy.title}
            </h1>
            <p className="relative mt-5 max-w-md text-base leading-7 text-[#667085]">
              {copy.intro}
            </p>
            <div className="relative mt-10 grid max-w-md gap-3">
              {[
                [MessageCircle, copy.messages],
                [Heart, copy.saved],
                [LockKeyhole, copy.secure],
              ].map(([Icon, text]) => {
                const FeatureIcon = Icon as typeof Heart
                return (
                  <div key={text as string} className="flex items-center gap-4 rounded-[17px] border border-[#e1e6ee] bg-white p-4">
                    <span className="grid h-10 w-10 place-items-center rounded-[12px] bg-[#eef4ff] text-[#0866ff]">
                      <FeatureIcon className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-semibold">{text as string}</span>
                  </div>
                )
              })}
            </div>
          </section>

          <section className={isModal ? 'p-6 sm:p-7' : 'flex min-h-[560px] items-center p-6 sm:p-10 lg:min-h-[650px] lg:p-12'}>
            <div className="mx-auto w-full max-w-[410px]">
              <span className="grid h-12 w-12 place-items-center rounded-[17px] bg-[#0866ff] text-white">
                <Mail className="h-5 w-5" />
              </span>
              <p className="mt-7 text-xs font-bold uppercase tracking-[.17em] text-[#0866ff]">
                {copy.account}
              </p>
              <h2 className="mt-3 text-4xl tracking-[-.05em]">
                {step === 'email' ? copy.signIn : copy.checkInbox}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#667085]">
                {step === 'email'
                  ? copy.description
                  : `${copy.codeSent} ${email}`}
              </p>

              {step === 'email' ? (
                <>
                  <div className="mt-7 grid gap-3">
                    {[
                      ['google', 'Google', 'G'],
                      ['facebook', 'Facebook', 'f'],
                      ['apple', 'Apple', ''],
                    ].map(([provider, label, mark]) => (
                      <button
                        key={provider}
                        type="button"
                        onClick={() => void signInWithProvider(provider as 'google' | 'facebook' | 'apple')}
                        className="inline-flex min-h-12 items-center justify-center gap-3 rounded-[16px] border border-[#cfd7e6] bg-white px-4 text-sm font-bold text-[#172033] transition hover:border-[#0866ff] hover:bg-[#f8fbff]"
                      >
                        <span className="grid h-6 w-6 place-items-center rounded-full text-base font-black text-[#0866ff]">
                          {mark}
                        </span>
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="my-6 flex items-center gap-3 text-xs font-medium text-[#98a2b3]">
                    <span className="h-px flex-1 bg-[#e4e7ec]" />
                    {copy.or}
                    <span className="h-px flex-1 bg-[#e4e7ec]" />
                  </div>
                </>
              ) : null}

              {step === 'email' ? (
                <form onSubmit={requestCode}>
                  <label className="block text-sm font-semibold">
                    {copy.email}
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      autoComplete="email"
                      inputMode="email"
                      placeholder="namn@exempel.se"
                      required
                      autoFocus
                      className="mt-2 h-14 w-full rounded-[14px] border border-[#cfd5df] bg-white px-4 text-base outline-none transition focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10"
                    />
                  </label>
                  <label className="mt-5 flex items-center justify-between gap-4 text-sm text-[#475467]">
                    {copy.remember}
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(event) => setRemember(event.target.checked)}
                      className="h-5 w-5 accent-[#0866ff]"
                    />
                  </label>
                  {error ? <ErrorMessage message={error} /> : null}
                  <button
                    disabled={loading}
                    className="mt-7 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-[14px] bg-[#202124] px-6 text-sm font-bold text-white disabled:opacity-60"
                  >
                    {loading ? copy.sending : copy.continue}
                    {!loading ? <ArrowRight className="h-4 w-4" /> : null}
                  </button>
                </form>
              ) : (
                <div className="mt-8">
                  <div
                    className="grid grid-cols-6 gap-2 sm:gap-3"
                    onPaste={(event) => {
                      event.preventDefault()
                      pasteCode(event.clipboardData.getData('text'))
                    }}
                  >
                    {digits.map((digit, index) => (
                      <input
                        key={index}
                        ref={(node) => {
                          inputs.current[index] = node
                        }}
                        value={digit}
                        onChange={(event) => updateDigit(index, event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Backspace' && !digits[index] && index > 0) {
                            inputs.current[index - 1]?.focus()
                          }
                        }}
                        aria-label={`${copy.digit} ${index + 1}`}
                        inputMode="numeric"
                        autoComplete={index === 0 ? 'one-time-code' : 'off'}
                        maxLength={1}
                        className="h-14 min-w-0 rounded-[13px] border border-[#bfc6d2] text-center text-2xl font-semibold outline-none transition focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10 sm:h-16"
                      />
                    ))}
                  </div>
                  {error ? <ErrorMessage message={error} /> : null}
                  <button
                    type="button"
                    disabled={loading || digits.join('').length !== 6}
                    onClick={() => void verifyCode()}
                    className="mt-7 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-[14px] bg-[#202124] px-6 text-sm font-bold text-white disabled:opacity-45"
                  >
                    {loading ? copy.verifying : copy.signIn}
                    {!loading ? <ArrowRight className="h-4 w-4" /> : null}
                  </button>
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
                    <button
                      type="button"
                      disabled={retryAfter > 0 || loading}
                      onClick={() => void requestCode()}
                      className="font-semibold text-[#0866ff] disabled:text-[#98a2b3]"
                    >
                      {retryAfter ? `${copy.resendIn} ${retryAfter}s` : copy.resend}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStep('email')
                        setError('')
                      }}
                      className="inline-flex items-center gap-1.5 font-semibold text-[#475467]"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      {copy.back}
                    </button>
                  </div>
                </div>
              )}

              <p className="mt-8 border-t border-[#eaecf0] pt-6 text-center text-sm text-[#667085]">
                {mode === 'login' ? copy.newHere : copy.haveAccount}{' '}
                <Link
                  href={mode === 'login' ? '/registrera' : '/login'}
                  onClick={(event) => {
                    if (!onModeChange) return
                    event.preventDefault()
                    setStep('email')
                    setError('')
                    onModeChange(mode === 'login' ? 'register' : 'login')
                  }}
                  className="font-bold text-[#0866ff]"
                >
                  {mode === 'login' ? copy.createAccount : copy.signIn}
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <p role="alert" className="mt-5 rounded-[13px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {message}
    </p>
  )
}

function getCopy(locale: PublicLocale, mode: 'login' | 'register') {
  const en = {
    eyebrow: 'One secure account across Europe',
    title: 'Listings, messages and saved vehicles in one place.',
    intro: 'No password to remember. We send a fresh six-digit code to your email whenever you sign in.',
    messages: 'Message buyers and sellers',
    saved: 'Save vehicles and searches',
    secure: 'Secure passwordless access',
    account: 'Autorell account',
    signIn: mode === 'login' ? 'Sign in' : 'Create account',
    description: 'Enter your email address and we will send you a six-digit sign-in code.',
    email: 'Email address',
    remember: 'Remember my email',
    continue: 'Continue',
    or: 'or',
    sending: 'Sending code…',
    checkInbox: 'Check your inbox',
    codeSent: 'Enter the code we sent to',
    digit: 'Code digit',
    verifying: 'Signing in…',
    resend: 'Send a new code',
    resendIn: 'New code in',
    back: 'Change email',
    newHere: 'New to Autorell?',
    haveAccount: 'Already have an account?',
    createAccount: 'Create account',
    sendError: 'The code could not be sent.',
    codeError: 'The code is incorrect or has expired.',
    connectionError: 'The connection was interrupted. Try again.',
  }
  if (locale === 'sv') {
    return {
      ...en,
      eyebrow: 'Ett tryggt konto i hela Europa',
      title: 'Annonser, meddelanden och sparade fordon på ett ställe.',
      intro: 'Inget lösenord att komma ihåg. Vi skickar en ny sexsiffrig kod till din e-post när du loggar in.',
      messages: 'Skriv med köpare och säljare',
      saved: 'Spara fordon och sökningar',
      secure: 'Trygg inloggning utan lösenord',
      account: 'Autorell-konto',
      signIn: mode === 'login' ? 'Logga in' : 'Skapa konto',
      description: 'Ange din e-postadress så skickar vi en sexsiffrig inloggningskod.',
      email: 'Mejladress',
      remember: 'Kom ihåg min mejladress',
      continue: 'Fortsätt',
      or: 'eller',
      sending: 'Skickar kod…',
      checkInbox: 'Titta i din inkorg',
      codeSent: 'Ange koden vi skickade till',
      digit: 'Siffra i koden',
      verifying: 'Loggar in…',
      resend: 'Skicka en ny kod',
      resendIn: 'Ny kod om',
      back: 'Byt mejladress',
      newHere: 'Inte registrerad ännu?',
      haveAccount: 'Har du redan ett konto?',
      createAccount: 'Skapa konto',
      sendError: 'Koden kunde inte skickas.',
      codeError: 'Koden är felaktig eller har gått ut.',
      connectionError: 'Anslutningen avbröts. Försök igen.',
    }
  }
  if (locale === 'de') {
    return {
      ...en,
      eyebrow: 'Ein sicheres Konto in ganz Europa',
      title: 'Anzeigen, Nachrichten und gespeicherte Fahrzeuge an einem Ort.',
      intro: 'Kein Passwort erforderlich. Bei jeder Anmeldung senden wir einen neuen sechsstelligen Code per E-Mail.',
      messages: 'Käufern und Verkäufern schreiben',
      saved: 'Fahrzeuge und Suchen speichern',
      secure: 'Sicherer Zugang ohne Passwort',
      account: 'Autorell-Konto',
      signIn: mode === 'login' ? 'Anmelden' : 'Konto erstellen',
      description: 'E-Mail-Adresse eingeben und einen sechsstelligen Anmeldecode erhalten.',
      email: 'E-Mail-Adresse',
      remember: 'E-Mail-Adresse merken',
      continue: 'Weiter',
      or: 'oder',
      sending: 'Code wird gesendet…',
      checkInbox: 'Posteingang prüfen',
      codeSent: 'Geben Sie den Code ein, den wir gesendet haben an',
      digit: 'Codeziffer',
      verifying: 'Anmeldung…',
      resend: 'Neuen Code senden',
      resendIn: 'Neuer Code in',
      back: 'E-Mail ändern',
      newHere: 'Noch nicht registriert?',
      haveAccount: 'Bereits registriert?',
      createAccount: 'Konto erstellen',
      sendError: 'Der Code konnte nicht gesendet werden.',
      codeError: 'Der Code ist falsch oder abgelaufen.',
      connectionError: 'Die Verbindung wurde unterbrochen. Erneut versuchen.',
    }
  }
  return locale === 'en' ? en : translatePublicObject(locale, en)
}
