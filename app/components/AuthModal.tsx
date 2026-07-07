'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, CheckCircle2, Globe2, X } from 'lucide-react'
import {
  localizePublicHref,
  translatePublicObject,
  type PublicLocale,
} from '@/lib/public-i18n'

const REMEMBERED_LOGIN_KEY = 'autorell.rememberedLogin'

type AuthMode = 'login' | 'register'

type AuthModalProps = {
  isOpen: boolean
  initialMode?: AuthMode
  postLoginDestination?: string
  locale: PublicLocale
  onClose: () => void
  onAuthenticated?: () => void
}

export default function AuthModal({
  isOpen,
  initialMode = 'login',
  postLoginDestination,
  locale,
  onClose,
  onAuthenticated,
}: AuthModalProps) {
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState(() =>
    typeof window === 'undefined'
      ? ''
      : window.localStorage.getItem(REMEMBERED_LOGIN_KEY) || '',
  )
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [retryAfter, setRetryAfter] = useState(0)
  const emailInputRef = useRef<HTMLInputElement | null>(null)
  const inputs = useRef<Array<HTMLInputElement | null>>([])
  const copy = getAuthModalCopy(locale, mode)

  useEffect(() => {
    if (!isOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusTimer = window.setTimeout(() => emailInputRef.current?.focus(), 80)
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      window.clearTimeout(focusTimer)
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [initialMode, isOpen, onClose])

  useEffect(() => {
    if (!retryAfter) return
    const timer = window.setInterval(
      () => setRetryAfter((current) => Math.max(0, current - 1)),
      1000,
    )
    return () => window.clearInterval(timer)
  }, [retryAfter])

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode)
    setStep('email')
    setError('')
    setDigits(['', '', '', '', '', ''])
    window.setTimeout(() => emailInputRef.current?.focus(), 40)
  }

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
      const accountDestination = localizePublicHref(locale, '/account')
      const registerDestination = localizePublicHref(
        locale,
        postLoginDestination?.includes('account=business')
          ? '/register?onboarding=1&account=business'
          : '/register?onboarding=1',
      )
      const response = await fetch('/api/auth/email-code/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          code,
          next: mode === 'register' ? registerDestination : accountDestination,
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
      onAuthenticated?.()
      window.dispatchEvent(new CustomEvent('autorell:auth-changed'))
      onClose()
      const destination = result.destination || (mode === 'register' ? registerDestination : accountDestination)
      router.replace(destination)
      router.refresh()
    } catch {
      setError(copy.connectionError)
    } finally {
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

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-[300] overflow-y-auto bg-[#101828]/55 px-4 py-4 backdrop-blur-[2px] sm:py-8"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        className="flex min-h-full items-start justify-center py-2 sm:items-center"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) onClose()
        }}
      >
      <section className="relative w-full max-w-[390px] overflow-hidden rounded-[18px] border border-[#dce3ee] bg-white shadow-[0_30px_90px_rgba(16,24,40,.28)]">
        <button
          type="button"
          onClick={onClose}
          aria-label={copy.close}
          className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full text-[#667085] transition hover:bg-[#f2f4f7] hover:text-[#101828]"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid grid-cols-2 border-b border-[#e5eaf1] px-7 pt-5 text-sm font-bold">
          {(['login', 'register'] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => switchMode(item)}
              className={`relative min-h-11 border-b-2 transition ${
                mode === item
                  ? 'border-[#0866ff] text-[#0866ff]'
                  : 'border-transparent text-[#475467] hover:text-[#101828]'
              }`}
            >
              {item === 'login' ? copy.loginTab : copy.registerTab}
            </button>
          ))}
        </div>

        <div className="px-7 pb-7 pt-6">
          <h2 id="auth-modal-title" className="text-[25px] font-bold leading-tight tracking-[-.04em] text-[#101828]">
            {step === 'email' ? copy.title : copy.codeTitle}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#667085]">
            {step === 'email' ? copy.description : `${copy.codeSent} ${email}`}
          </p>
          {step === 'code' ? (
            <p className="mt-3 rounded-[11px] border border-[#dbe7ff] bg-[#f5f9ff] px-3 py-2 text-xs leading-5 text-[#475467]">
              {getAuthSpamHint(locale)}
            </p>
          ) : null}

          {step === 'email' ? (
            <form onSubmit={requestCode} className="mt-6">
              <label className="block text-xs font-bold text-[#344054]">
                {copy.email}
                <div className="mt-2 flex h-12 items-center rounded-[11px] border border-[#ccd5e2] bg-white px-3 transition focus-within:border-[#0866ff] focus-within:ring-4 focus-within:ring-[#0866ff]/10">
                  <input
                    ref={emailInputRef}
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    inputMode="email"
                    required
                    placeholder={copy.emailPlaceholder}
                    className="min-w-0 flex-1 bg-transparent text-sm font-normal text-[#101828] outline-none placeholder:font-normal placeholder:text-[#98a2b3]"
                  />
                </div>
              </label>

              <label className="mt-4 flex items-center justify-between gap-4 text-sm text-[#475467]">
                {copy.remember}
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                  className="h-5 w-5 accent-[#0866ff]"
                />
              </label>

              {error ? <AuthError message={error} /> : null}

              <button
                disabled={loading}
                className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[11px] bg-[#0866ff] px-5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(8,102,255,.24)] transition hover:bg-[#075be4] disabled:opacity-60"
              >
                {loading ? copy.sending : copy.continue}
                {!loading ? <ArrowRight className="h-4 w-4" /> : null}
              </button>
            </form>
          ) : (
            <div className="mt-6">
              <div
                className="grid grid-cols-6 gap-2"
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
                    className="h-12 min-w-0 rounded-[10px] border border-[#c8d2df] text-center text-xl font-bold outline-none transition focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10"
                  />
                ))}
              </div>

              {error ? <AuthError message={error} /> : null}

              <button
                type="button"
                disabled={loading || digits.join('').length !== 6}
                onClick={() => void verifyCode()}
                className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[11px] bg-[#0866ff] px-5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(8,102,255,.24)] transition hover:bg-[#075be4] disabled:opacity-45"
              >
                {loading ? copy.verifying : copy.submitCode}
                {!loading ? <CheckCircle2 className="h-4 w-4" /> : null}
              </button>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
                <button
                  type="button"
                  disabled={retryAfter > 0 || loading}
                  onClick={() => void requestCode()}
                  className="font-bold text-[#0866ff] disabled:text-[#98a2b3]"
                >
                  {retryAfter ? `${copy.resendIn} ${retryAfter}s` : copy.resend}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep('email')
                    setError('')
                  }}
                  className="inline-flex items-center gap-1.5 font-bold text-[#475467]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {copy.back}
                </button>
              </div>
            </div>
          )}

          <p className="mt-6 border-t border-[#edf1f6] pt-5 text-center text-sm text-[#667085]">
            {mode === 'login' ? copy.newHere : copy.haveAccount}{' '}
            <button
              type="button"
              onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
              className="font-bold text-[#0866ff]"
            >
              {mode === 'login' ? copy.registerTab : copy.loginTab}
            </button>
          </p>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('autorell:open-market'))}
            className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-[11px] border border-[#d9e2f0] bg-[#f8fbff] px-4 text-sm font-bold text-[#0866ff] transition hover:border-[#9dbdff] hover:bg-[#eef5ff]"
          >
            <Globe2 className="h-4 w-4" />
            {copy.chooseMarket}
          </button>
        </div>
      </section>
      </div>
    </div>
  )
}

function AuthError({ message }: { message: string }) {
  return (
    <p role="alert" className="mt-4 rounded-[11px] border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
      {message}
    </p>
  )
}

function getAuthModalCopy(locale: PublicLocale, mode: AuthMode) {
  const en = {
    loginTab: 'Log in',
    registerTab: 'Create account',
    close: 'Close',
    title: mode === 'login' ? 'Welcome back' : 'Create your account',
    description:
      mode === 'login'
        ? 'Enter your email and we will send you a one-time login code.'
        : 'Use your email to start. We will send a code before you continue.',
    email: 'Email',
    emailPlaceholder: 'Enter your email',
    remember: 'Remember my email',
    continue: 'Send login code',
    sending: 'Sending code...',
    codeTitle: 'Enter your code',
    codeSent: 'We sent a six-digit code to',
    digit: 'Code digit',
    submitCode: mode === 'login' ? 'Log in' : 'Continue',
    verifying: 'Checking code...',
    resend: 'Send a new code',
    resendIn: 'New code in',
    back: 'Change email',
    newHere: 'New to Autorell?',
    haveAccount: 'Already have an account?',
    sendError: 'The code could not be sent.',
    codeError: 'The code is incorrect or has expired.',
    connectionError: 'The connection was interrupted. Try again.',
    chooseMarket: 'Choose language and market',
  }
  if (locale === 'sv') {
    return {
      ...en,
      loginTab: 'Logga in',
      registerTab: 'Skapa konto',
      close: 'Stäng',
      title: mode === 'login' ? 'Välkommen tillbaka' : 'Skapa ditt konto',
      description:
        mode === 'login'
          ? 'Ange din mejladress så skickar vi en engångskod.'
          : 'Börja med din mejladress. Vi skickar en kod innan du fortsätter.',
      email: 'Mejl',
      emailPlaceholder: 'Ange din mejladress',
      remember: 'Kom ihåg min mejladress',
      continue: 'Skicka inloggningskod',
      sending: 'Skickar kod...',
      codeTitle: 'Ange din kod',
      codeSent: 'Vi skickade en sexsiffrig kod till',
      submitCode: mode === 'login' ? 'Logga in' : 'Fortsätt',
      verifying: 'Kontrollerar kod...',
      resend: 'Skicka en ny kod',
      resendIn: 'Ny kod om',
      back: 'Byt mejladress',
      newHere: 'Ny på Autorell?',
      haveAccount: 'Har du redan ett konto?',
      sendError: 'Koden kunde inte skickas.',
      codeError: 'Koden är felaktig eller har gått ut.',
      connectionError: 'Anslutningen avbröts. Försök igen.',
      chooseMarket: 'Välj språk och marknad',
    }
  }
  if (locale === 'de') {
    return {
      ...en,
      loginTab: 'Anmelden',
      registerTab: 'Konto erstellen',
      title: mode === 'login' ? 'Willkommen zurück' : 'Konto erstellen',
      description:
        mode === 'login'
          ? 'E-Mail eingeben und wir senden einen einmaligen Anmeldecode.'
          : 'Mit Ihrer E-Mail starten. Wir senden einen Code, bevor es weitergeht.',
      email: 'E-Mail',
      emailPlaceholder: 'E-Mail eingeben',
      remember: 'E-Mail merken',
      continue: 'Anmeldecode senden',
      sending: 'Code wird gesendet...',
      codeTitle: 'Code eingeben',
      codeSent: 'Wir haben einen sechsstelligen Code gesendet an',
      submitCode: mode === 'login' ? 'Anmelden' : 'Weiter',
      verifying: 'Code wird geprüft...',
      resend: 'Neuen Code senden',
      resendIn: 'Neuer Code in',
      back: 'E-Mail ändern',
      newHere: 'Neu bei Autorell?',
      haveAccount: 'Bereits registriert?',
      sendError: 'Der Code konnte nicht gesendet werden.',
      codeError: 'Der Code ist falsch oder abgelaufen.',
      connectionError: 'Die Verbindung wurde unterbrochen. Erneut versuchen.',
      chooseMarket: 'Sprache und Markt wählen',
    }
  }
  if (locale === 'es') {
    return {
      ...en,
      loginTab: 'Iniciar sesión',
      registerTab: 'Crear cuenta',
      close: 'Cerrar',
      title: mode === 'login' ? 'Bienvenido de nuevo' : 'Crea tu cuenta',
      description:
        mode === 'login'
          ? 'Introduce tu correo electrónico y te enviaremos un código de inicio de sesión de un solo uso.'
          : 'Empieza con tu correo electrónico. Te enviaremos un código antes de continuar.',
      email: 'Correo electrónico',
      emailPlaceholder: 'Introduce tu correo electrónico',
      remember: 'Recordar mi correo electrónico',
      continue: 'Enviar código',
      sending: 'Enviando código...',
      codeTitle: 'Introduce tu código',
      codeSent: 'Hemos enviado un código de seis dígitos a',
      digit: 'Dígito del código',
      submitCode: mode === 'login' ? 'Iniciar sesión' : 'Continuar',
      verifying: 'Comprobando código...',
      resend: 'Enviar un nuevo código',
      resendIn: 'Nuevo código en',
      back: 'Cambiar correo electrónico',
      newHere: '¿Nuevo en Autorell?',
      haveAccount: '¿Ya tienes una cuenta?',
      sendError: 'No se pudo enviar el código.',
      codeError: 'El código es incorrecto o ha caducado.',
      connectionError: 'La conexión se interrumpió. Inténtalo de nuevo.',
      chooseMarket: 'Elegir idioma y mercado',
    }
  }
  return locale === 'en' ? en : translatePublicObject(locale, en)
}

function getAuthSpamHint(locale: PublicLocale) {
  if (locale === 'sv') {
    return 'Om mejlet inte syns, kontrollera skräppost eller skräpkorgen.'
  }
  if (locale === 'de') {
    return 'Wenn die E-Mail nicht sichtbar ist, prüfen Sie bitte den Spam- oder Junk-Ordner.'
  }
  if (locale === 'es') {
    return 'Si no encuentras el correo, revisa la carpeta de spam o correo no deseado.'
  }
  return 'If you cannot find the email, check your spam or junk folder.'
}
