'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Eye, EyeOff, MailCheck, X } from 'lucide-react'
import {
  localizePublicHref,
  type PublicLocale,
} from '@/lib/public-client-i18n'
import { createClient } from '@/lib/supabase/client'
import { isStrongPassword } from '@/lib/password-policy'
import { getAuthSpamHintCopy, getLocalizedAuthModalCopy } from '@/lib/auth-copy'
import { saveAccountIntent } from '@/lib/account-intent'
import { getBusinessIdentityCopy } from '@/lib/business-identity-i18n'

const REMEMBERED_LOGIN_KEY = 'autorell.rememberedLogin'

type AuthMode = 'login' | 'register'
type AuthView = AuthMode | 'forgot' | 'reset'
type SocialProvider = 'google' | 'azure' | 'facebook'

const socialProviders: Array<{
  provider: SocialProvider
  labelKey: 'continueWithGoogle' | 'continueWithMicrosoft' | 'continueWithFacebook'
}> = [
  { provider: 'google', labelKey: 'continueWithGoogle' },
  { provider: 'azure', labelKey: 'continueWithMicrosoft' },
  { provider: 'facebook', labelKey: 'continueWithFacebook' },
]

function SocialProviderLogo({ provider }: { provider: SocialProvider }) {
  if (provider === 'google') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
        <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41Z" />
        <path fill="#34A853" d="M12 22c2.7 0 4.98-.9 6.63-2.43l-3.24-2.54c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z" />
        <path fill="#FBBC05" d="M6.39 13.86A6.03 6.03 0 0 1 6.07 12c0-.65.11-1.28.32-1.86V7.52H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.48l3.35-2.62Z" />
        <path fill="#EA4335" d="M12 6.01c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.64 9.64 0 0 0 12 2a10 10 0 0 0-8.96 5.52l3.35 2.62C7.18 7.77 9.39 6.01 12 6.01Z" />
      </svg>
    )
  }

  if (provider === 'azure') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
        <path fill="#F25022" d="M2 2h9.5v9.5H2z" />
        <path fill="#7FBA00" d="M12.5 2H22v9.5h-9.5z" />
        <path fill="#00A4EF" d="M2 12.5h9.5V22H2z" />
        <path fill="#FFB900" d="M12.5 12.5H22V22h-9.5z" />
      </svg>
    )
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      <circle cx="12" cy="12" r="11" fill="#1877F2" />
      <path fill="#fff" d="M15.8 12.7h-2.4V21h-3.5v-8.3H8.2V9.8h1.7V8c0-2.3 1.1-4.6 4.8-4.6 1.1 0 1.9.1 1.9.1l-.1 3h-1.8c-1.2 0-1.3.6-1.3 1.6v1.7h3.2l-.8 2.9Z" />
    </svg>
  )
}

type AuthModalProps = {
  isOpen: boolean
  initialMode?: AuthMode
  initialView?: AuthView
  initialBusinessRegistration?: boolean
  postLoginDestination?: string
  locale: PublicLocale
  onClose: () => void
  onAuthenticated?: () => void
}

export default function AuthModal({
  isOpen,
  initialMode = 'login',
  initialView,
  initialBusinessRegistration = false,
  postLoginDestination,
  locale,
  onClose,
  onAuthenticated,
}: AuthModalProps) {
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [view, setView] = useState<AuthView>(initialView || initialMode)
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [authMethod, setAuthMethod] = useState<'password' | 'code'>('password')
  const [email, setEmail] = useState(() =>
    typeof window === 'undefined'
      ? ''
      : window.localStorage.getItem(REMEMBERED_LOGIN_KEY) || '',
  )
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isBusinessRegistration, setIsBusinessRegistration] = useState(
    initialMode === 'register' && initialBusinessRegistration,
  )
  const [companyName, setCompanyName] = useState('')
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [notice, setNotice] = useState('')
  const [confirmationEmail, setConfirmationEmail] = useState('')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<SocialProvider | null>(null)
  const [callbackStatus, setCallbackStatus] = useState<string | null>(() =>
    typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('status'),
  )
  const [retryAfter, setRetryAfter] = useState(0)
  const emailInputRef = useRef<HTMLInputElement | null>(null)
  const onCloseRef = useRef(onClose)
  const inputs = useRef<Array<HTMLInputElement | null>>([])
  const copy = getAuthModalCopy(locale, mode, view)
  const businessCopy = businessRegistrationCopy[locale] || businessRegistrationCopy.en
  const businessIdentityCopy = getBusinessIdentityCopy(locale)
  const callbackError =
    !error && isOpen && callbackStatus === 'oauth-cancelled'
      ? copy.oauthCancelled
      : !error && isOpen && callbackStatus === 'oauth-error'
        ? copy.oauthFailed
        : ''
  const displayedError = error || callbackError

  useEffect(() => {
    onCloseRef.current = () => {
      setConfirmationEmail('')
      onClose()
    }
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusTimer = window.setTimeout(() => emailInputRef.current?.focus(), 80)
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current()
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      window.clearTimeout(focusTimer)
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [initialMode, isOpen])

  useEffect(() => {
    if (!retryAfter) return
    const timer = window.setInterval(
      () => setRetryAfter((current) => Math.max(0, current - 1)),
      1000,
    )
    return () => window.clearInterval(timer)
  }, [retryAfter])

  function switchMode(nextMode: AuthMode) {
    setCallbackStatus(null)
    setMode(nextMode)
    setView(nextMode)
    setStep('email')
    setAuthMethod('password')
    setError('')
    setNotice('')
    setConfirmationEmail('')
    setPassword('')
    setConfirmPassword('')
    setDigits(['', '', '', '', '', ''])
    window.setTimeout(() => emailInputRef.current?.focus(), 40)
  }

  function switchView(nextView: AuthView) {
    setCallbackStatus(null)
    setView(nextView)
    if (nextView === 'login' || nextView === 'register') setMode(nextView)
    setStep('email')
    setAuthMethod('password')
    setError('')
    setNotice('')
    setConfirmationEmail('')
    setPassword('')
    setConfirmPassword('')
    setDigits(['', '', '', '', '', ''])
    window.setTimeout(() => emailInputRef.current?.focus(), 40)
  }

  function accountDestination() {
    return localizePublicHref(locale, '/account')
  }

  function oauthDestination() {
    return mode === 'register'
      ? registerDestination()
      : postLoginDestination || accountDestination()
  }

  function registerDestination() {
    if (postLoginDestination?.includes('/company/team/accept')) {
      return postLoginDestination
    }
    return postLoginDestination || accountDestination()
  }

  function rememberRegistrationIntent() {
    if (mode !== 'register') return
    saveAccountIntent(isBusinessRegistration ? 'business' : 'private', {
      companyName,
      registrationNumber,
    })
  }

  function registrationDetailsAreValid() {
    if (mode !== 'register' || !isBusinessRegistration) return true
    if (companyName.trim() && registrationNumber.trim()) return true
    setError(businessCopy.fieldsRequired)
    return false
  }

  function completeAuth(destination: string) {
    onAuthenticated?.()
    window.dispatchEvent(new CustomEvent('autorell:auth-changed'))
    onClose()
    router.replace(destination)
    router.refresh()
  }

  async function startSocialLogin(provider: SocialProvider) {
    setCallbackStatus(null)
    setError('')
    setNotice('')
    if (!registrationDetailsAreValid()) return
    rememberRegistrationIntent()
    setSocialLoading(provider)
    try {
      const redirectTo = new URL('/auth/callback', window.location.origin)
      redirectTo.searchParams.set('next', oauthDestination())
      redirectTo.searchParams.set('mode', mode)
      redirectTo.searchParams.set('flow', 'oauth')
      const queryParams =
        provider === 'google' || provider === 'azure'
          ? { prompt: 'select_account' }
          : undefined
      const supabase = createClient()
      const { data: oauthData, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectTo.toString(),
          queryParams,
          scopes: provider === 'azure' ? 'email' : undefined,
        },
      })
      if (oauthError) {
        setError(copy.socialError)
        setSocialLoading(null)
        return
      }
      if (oauthData.url) window.location.assign(oauthData.url)
    } catch {
      setError(copy.socialError)
      setSocialLoading(null)
    }
  }

  async function submitPassword(event: FormEvent) {
    event.preventDefault()
    setCallbackStatus(null)
    setError('')
    setNotice('')
    const cleanEmail = email.trim()
    if (!cleanEmail || !password) {
      setError(copy.invalidPassword)
      return
    }
    if (mode === 'register') {
      if (!registrationDetailsAreValid()) return
      if (!isStrongPassword(password)) {
        setError(copy.passwordRequirement)
        return
      }
      if (password !== confirmPassword) {
        setError(copy.passwordMismatch)
        return
      }
      rememberRegistrationIntent()
    }
    setLoading(true)
    try {
      if (remember) window.localStorage.setItem(REMEMBERED_LOGIN_KEY, cleanEmail)
      else window.localStorage.removeItem(REMEMBERED_LOGIN_KEY)

      if (mode === 'register') {
        const destination = registerDestination()
        const response = await fetch('/api/auth/password-signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: cleanEmail,
            password,
            confirmPassword,
            locale,
            next: destination,
            accountType: isBusinessRegistration ? 'business' : 'private',
            companyName: isBusinessRegistration ? companyName.trim() : '',
            registrationNumber: isBusinessRegistration ? registrationNumber.trim() : '',
          }),
        })
        const result = (await response.json()) as {
          success?: boolean
          sessionReady?: boolean
          destination?: string
          accountExists?: boolean
          code?: string
          error?: string
        }
        if (result.accountExists || result.code === 'auth_account_exists') {
          setMode('login')
          setView('login')
          setStep('email')
          setAuthMethod('password')
          setConfirmPassword('')
          setNotice(result.error || copy.signupError)
          return
        }
        if (!response.ok || !result.success) {
          setError(result.error || copy.signupError)
          return
        }
        if (result.sessionReady) {
          completeAuth(result.destination || destination)
          return
        }
        setConfirmationEmail(cleanEmail)
        return
      }

      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      })
      if (signInError) {
        setError(copy.invalidPassword)
        return
      }
      completeAuth(postLoginDestination || accountDestination())
    } catch {
      setError(copy.connectionError)
    } finally {
      setLoading(false)
    }
  }

  async function requestPasswordReset(event: FormEvent) {
    event.preventDefault()
    setCallbackStatus(null)
    setError('')
    setNotice('')
    const cleanEmail = email.trim()
    if (!cleanEmail) {
      setError(copy.emailRequired)
      return
    }
    setLoading(true)
    try {
      if (remember) window.localStorage.setItem(REMEMBERED_LOGIN_KEY, cleanEmail)
      const response = await fetch('/api/auth/password-recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, locale }),
      })
      await response.json().catch(() => undefined)
      setNotice(copy.resetSent)
    } catch {
      setError(copy.connectionError)
    } finally {
      setLoading(false)
    }
  }

  async function updateRecoveredPassword(event: FormEvent) {
    event.preventDefault()
    setCallbackStatus(null)
    setError('')
    setNotice('')
    if (!isStrongPassword(password)) {
      setError(copy.passwordRequirement)
      return
    }
    if (password !== confirmPassword) {
      setError(copy.passwordMismatch)
      return
    }
    setLoading(true)
    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) {
        setError(copy.resetError)
        return
      }
      await fetch('/api/auth/password-changed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale }),
      }).catch(() => undefined)
      await supabase.auth.signOut()
      setNotice(copy.passwordUpdated)
      setPassword('')
      setConfirmPassword('')
      window.setTimeout(() => switchView('login'), 900)
    } catch {
      setError(copy.connectionError)
    } finally {
      setLoading(false)
    }
  }

  async function requestCode(event?: FormEvent) {
    event?.preventDefault()
    setCallbackStatus(null)
    setError('')
    if (!registrationDetailsAreValid()) return
    rememberRegistrationIntent()
    setLoading(true)
    try {
      const response = await fetch('/api/auth/email-code/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, locale }),
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
      const destinationForAccount = accountDestination()
      const destinationForRegister = registerDestination()
      const response = await fetch('/api/auth/email-code/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          code,
          locale,
          registration: mode === 'register',
          next: mode === 'register' ? destinationForRegister : postLoginDestination || destinationForAccount,
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
      const destination = result.destination || (mode === 'register' ? destinationForRegister : destinationForAccount)
      completeAuth(destination)
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
        if (event.target === event.currentTarget) onCloseRef.current()
      }}
    >
      <div
        className="flex min-h-full items-start justify-center py-2 sm:items-center"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) onCloseRef.current()
        }}
      >
      <section className="relative w-full max-w-[390px] overflow-hidden rounded-[18px] border border-[#dce3ee] bg-white shadow-[0_30px_90px_rgba(16,24,40,.28)] sm:max-w-[640px] lg:max-w-[680px]">
        <button
          type="button"
          onClick={() => onCloseRef.current()}
          aria-label={copy.close}
          className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full text-[#667085] transition hover:bg-[#f2f4f7] hover:text-[#101828]"
        >
          <X className="h-4 w-4" />
        </button>

        {confirmationEmail ? (
          <div className="px-7 pb-8 pt-10 text-center sm:px-10 sm:pb-10 sm:pt-12">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#eaf2ff] text-[#0866ff] ring-8 ring-[#f5f8ff]">
              <MailCheck className="h-8 w-8" strokeWidth={1.8} aria-hidden="true" />
            </span>
            <h2 id="auth-modal-title" className="mx-auto mt-6 max-w-[480px] text-[26px] font-[600] leading-tight tracking-[-.04em] text-[#101828] sm:text-[30px]">
              {copy.confirmEmailTitle}
            </h2>
            <p className="mx-auto mt-3 max-w-[480px] text-sm leading-6 text-[#667085]">
              {copy.confirmEmailSent}
            </p>
            <div className="mx-auto mt-6 max-w-[440px] rounded-[13px] border border-[#cfe0ff] bg-[#f5f9ff] px-4 py-3 text-left">
              <span className="block text-xs font-[600] text-[#667085]">{copy.email}</span>
              <strong className="mt-1 block break-all text-sm font-[600] text-[#101828]">{confirmationEmail}</strong>
            </div>
            <p className="mx-auto mt-4 max-w-[440px] text-xs leading-5 text-[#667085]">
              {getAuthSpamHint(locale)}
            </p>
            <button
              type="button"
              onClick={() => onCloseRef.current()}
              className="mt-7 inline-flex min-h-12 w-full max-w-[440px] items-center justify-center rounded-[11px] bg-[#0866ff] px-5 text-sm font-[600] text-white transition hover:bg-[#075be4]"
            >
              {copy.confirmEmailClose}
            </button>
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="mt-4 w-full text-center text-sm font-[600] text-[#0866ff]"
            >
              {copy.backToLogin}
            </button>
          </div>
        ) : null}

        <div className={`${confirmationEmail ? 'hidden' : 'grid'} grid-cols-2 border-b border-[#e5eaf1] px-5 pt-5 text-[13px] font-[600] sm:px-7 sm:text-sm`}>
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

        <div className={confirmationEmail ? 'hidden' : 'px-7 pb-7 pt-6'}>
          <h2 id={confirmationEmail ? undefined : 'auth-modal-title'} className="text-[25px] font-[600] leading-tight tracking-[-.04em] text-[#101828]">
            {step === 'email' ? copy.title : copy.codeTitle}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#667085]">
            {step === 'email'
              ? view === 'login' || view === 'register'
                ? (authMethod === 'password' ? copy.passwordDescription : copy.description)
                : copy.description
              : `${copy.codeSent} ${email}`}
          </p>
          {step === 'code' ? (
            <p className="mt-3 rounded-[11px] border border-[#dbe7ff] bg-[#f5f9ff] px-3 py-2 text-xs leading-5 text-[#475467]">
              {getAuthSpamHint(locale)}
            </p>
          ) : null}

          {view === 'forgot' ? (
            <form onSubmit={requestPasswordReset} className="mt-6">
              <label className="block text-xs font-[600] text-[#344054]">
                {copy.email}
                <div className="relative mt-2 flex h-12 items-center rounded-[11px] border border-[#ccd5e2] bg-white px-3 transition focus-within:border-[#0866ff] focus-within:ring-4 focus-within:ring-[#0866ff]/10">
                  <input
                    ref={emailInputRef}
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    inputMode="email"
                    required
                    placeholder=""
                    aria-label={copy.emailPlaceholder}
                    className="relative z-10 min-w-0 flex-1 bg-transparent text-sm font-[400] text-[#101828] outline-none"
                  />
                  {email ? null : (
                    <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 z-20 -translate-y-1/2 text-sm font-[400] text-[#767676]">
                      {copy.emailPlaceholder}
                    </span>
                  )}
                </div>
              </label>
              {displayedError ? <AuthError message={displayedError} /> : null}
              {notice ? <p className="mt-4 rounded-[11px] border border-[#cfe3ff] bg-[#f5f9ff] px-3 py-2.5 text-sm text-[#175cd3]">{notice}</p> : null}
              <button
                disabled={loading}
                className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[11px] bg-[#0866ff] px-5 text-sm font-[600] text-white transition hover:bg-[#075be4] disabled:opacity-60"
              >
                {loading ? copy.sendingReset : copy.sendReset}
                {!loading ? <ArrowRight className="h-4 w-4" /> : null}
              </button>
              <button type="button" onClick={() => switchView('login')} className="mt-4 w-full text-center text-sm font-[600] text-[#0866ff]">
                {copy.backToLogin}
              </button>
            </form>
          ) : view === 'reset' ? (
            <form onSubmit={updateRecoveredPassword} className="mt-6">
              <label className="block text-xs font-[600] text-[#344054]">
                {copy.password}
                <div className="mt-2 flex h-12 items-center rounded-[11px] border border-[#ccd5e2] bg-white px-3 transition focus-within:border-[#0866ff] focus-within:ring-4 focus-within:ring-[#0866ff]/10">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="new-password"
                    required
                    className="min-w-0 flex-1 bg-transparent text-sm font-[400] text-[#101828] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? copy.hidePassword : copy.showPassword}
                    className="grid h-8 w-8 place-items-center rounded-full text-[#667085] transition hover:bg-[#f2f4f7] hover:text-[#101828]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>
              <label className="mt-4 block text-xs font-[600] text-[#344054]">
                {copy.confirmPassword}
                <div className="mt-2 flex h-12 items-center rounded-[11px] border border-[#ccd5e2] bg-white px-3 transition focus-within:border-[#0866ff] focus-within:ring-4 focus-within:ring-[#0866ff]/10">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    autoComplete="new-password"
                    required
                    className="min-w-0 flex-1 bg-transparent text-sm font-[400] text-[#101828] outline-none"
                  />
                </div>
              </label>
              <p className="mt-3 text-xs leading-5 text-[#667085]">{copy.passwordRequirement}</p>
              {displayedError ? <AuthError message={displayedError} /> : null}
              {notice ? <p className="mt-4 rounded-[11px] border border-[#cfe3ff] bg-[#f5f9ff] px-3 py-2.5 text-sm text-[#175cd3]">{notice}</p> : null}
              <button
                disabled={loading}
                className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[11px] bg-[#0866ff] px-5 text-sm font-[600] text-white transition hover:bg-[#075be4] disabled:opacity-60"
              >
                {loading ? copy.savingPassword : copy.savePassword}
                {!loading ? <CheckCircle2 className="h-4 w-4" /> : null}
              </button>
            </form>
          ) : step === 'email' ? (
            <>
            {mode === 'register' ? (
              <div className="mt-5 rounded-[13px] border border-[#dbe3ef] bg-[#f8faff] p-4">
                <button
                  type="button"
                  role="switch"
                  aria-checked={isBusinessRegistration}
                  onClick={() => {
                    setIsBusinessRegistration((current) => {
                      const next = !current
                      saveAccountIntent(next ? 'business' : 'private')
                      return next
                    })
                    setError('')
                  }}
                  className="flex min-h-11 w-full items-center justify-between gap-4 text-left outline-none focus-visible:ring-4 focus-visible:ring-[#0866ff]/12"
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-[600] text-[#101828]">{businessCopy.switchLabel}</span>
                    <span className="mt-0.5 block text-xs font-[400] leading-5 text-[#667085]">{businessCopy.switchDescription}</span>
                  </span>
                  <span
                    aria-hidden="true"
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                      isBusinessRegistration ? 'bg-[#0866ff]' : 'bg-[#c8d0dc]'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                        isBusinessRegistration ? 'translate-x-[22px]' : 'translate-x-0.5'
                      }`}
                    />
                  </span>
                </button>
                {isBusinessRegistration ? (
                  <div className="mt-4 grid gap-4 border-t border-[#e1e7f0] pt-4 sm:grid-cols-2 sm:gap-5">
                    <label className="min-w-0 text-xs font-[600] text-[#344054]">
                      {businessIdentityCopy.companyName}
                      <div className="relative mt-2 flex h-12 items-center rounded-[11px] border border-[#ccd5e2] bg-white px-3 transition focus-within:border-[#0866ff] focus-within:ring-4 focus-within:ring-[#0866ff]/10">
                        <input
                          value={companyName}
                          onChange={(event) => {
                            setCompanyName(event.target.value)
                            setError('')
                          }}
                          required
                          autoComplete="organization"
                          placeholder=""
                          aria-label={businessIdentityCopy.companyNamePlaceholder}
                          className="autorell-account-input relative z-10 min-w-0 flex-1 bg-transparent text-sm font-[400] text-[#101828] outline-none"
                        />
                        {companyName ? null : (
                          <span
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-x-3 top-1/2 z-20 -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap text-sm font-[400] text-[#767676]"
                          >
                            {businessIdentityCopy.companyNamePlaceholder}
                          </span>
                        )}
                      </div>
                    </label>
                    <label className="min-w-0 text-xs font-[600] text-[#344054]">
                      {businessIdentityCopy.registrationNumber}
                      <div className="relative mt-2 flex h-12 items-center rounded-[11px] border border-[#ccd5e2] bg-white px-3 transition focus-within:border-[#0866ff] focus-within:ring-4 focus-within:ring-[#0866ff]/10">
                        <input
                          value={registrationNumber}
                          onChange={(event) => {
                            setRegistrationNumber(event.target.value)
                            setError('')
                          }}
                          required
                          autoComplete="off"
                          placeholder=""
                          aria-label={businessIdentityCopy.registrationNumberPlaceholder}
                          className="autorell-account-input relative z-10 min-w-0 flex-1 bg-transparent text-sm font-[400] text-[#101828] outline-none"
                        />
                        {registrationNumber ? null : (
                          <span
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-x-3 top-1/2 z-20 -translate-y-1/2 overflow-hidden text-ellipsis whitespace-nowrap text-sm font-[400] text-[#767676]"
                          >
                            {businessIdentityCopy.registrationNumberPlaceholder}
                          </span>
                        )}
                      </div>
                      <span className="mt-1.5 block break-words text-[11px] font-[400] leading-4 text-[#667085]">
                        {businessIdentityCopy.registrationNumberHelper}
                      </span>
                    </label>
                  </div>
                ) : null}
              </div>
            ) : null}
            <div className="mt-6 grid gap-2.5">
              {socialProviders.map(({ provider, labelKey }) => (
                <button
                  key={provider}
                  type="button"
                  disabled={loading || Boolean(socialLoading)}
                  onClick={() => void startSocialLogin(provider)}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-[11px] border border-[#d5dde8] bg-white px-4 text-sm font-[600] text-[#101828] transition hover:border-[#b8c6d8] hover:bg-[#f8fbff] disabled:opacity-60"
                >
                  <span className="grid h-6 w-6 place-items-center">
                    <SocialProviderLogo provider={provider} />
                  </span>
                  {socialLoading === provider ? copy.socialLoading : copy[labelKey]}
                </button>
              ))}
            </div>
            <div className="mt-5 flex items-center gap-3 text-xs font-[600] text-[#98a2b3]">
              <span className="h-px flex-1 bg-[#edf1f6]" />
              <span>{copy.socialSeparator}</span>
              <span className="h-px flex-1 bg-[#edf1f6]" />
            </div>
            <form onSubmit={authMethod === 'password' ? submitPassword : requestCode} className="mt-5">
              <label className="block text-xs font-[600] text-[#344054]">
                {copy.email}
                <div className="relative mt-2 flex h-12 items-center rounded-[11px] border border-[#ccd5e2] bg-white px-3 transition focus-within:border-[#0866ff] focus-within:ring-4 focus-within:ring-[#0866ff]/10">
                  <input
                    ref={emailInputRef}
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    inputMode="email"
                    required
                    placeholder=""
                    aria-label={copy.emailPlaceholder}
                    style={{ color: email ? '#101828' : '#767676' }}
                    className="relative z-10 min-w-0 flex-1 bg-transparent text-sm font-[400] text-[#101828] outline-none"
                  />
                  {email ? null : (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute left-3 top-1/2 z-20 -translate-y-1/2 text-sm font-[400] text-[#767676]"
                    >
                      {copy.emailPlaceholder}
                    </span>
                  )}
                </div>
              </label>

              {authMethod === 'password' ? (
                <>
                  <label className="mt-4 block text-xs font-[600] text-[#344054]">
                    {copy.password}
                    <div className="mt-2 flex h-12 items-center rounded-[11px] border border-[#ccd5e2] bg-white px-3 transition focus-within:border-[#0866ff] focus-within:ring-4 focus-within:ring-[#0866ff]/10">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                        required
                        className="min-w-0 flex-1 bg-transparent text-sm font-[400] text-[#101828] outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        aria-label={showPassword ? copy.hidePassword : copy.showPassword}
                        className="grid h-8 w-8 place-items-center rounded-full text-[#667085] transition hover:bg-[#f2f4f7] hover:text-[#101828]"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </label>

                  {mode === 'register' ? (
                    <>
                      <label className="mt-4 block text-xs font-[600] text-[#344054]">
                        {copy.confirmPassword}
                        <div className="mt-2 flex h-12 items-center rounded-[11px] border border-[#ccd5e2] bg-white px-3 transition focus-within:border-[#0866ff] focus-within:ring-4 focus-within:ring-[#0866ff]/10">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            autoComplete="new-password"
                            required
                            className="min-w-0 flex-1 bg-transparent text-sm font-[400] text-[#101828] outline-none"
                          />
                        </div>
                      </label>
                      <p className="mt-3 text-xs leading-5 text-[#667085]">{copy.passwordRequirement}</p>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => switchView('forgot')}
                      className="mt-3 inline-block text-sm font-[600] text-[#0866ff]"
                    >
                      {copy.forgotPassword}
                    </button>
                  )}
                </>
              ) : null}

              <button
                type="button"
                role="checkbox"
                aria-checked={remember}
                onClick={() => setRemember((current) => !current)}
                className="mt-4 flex min-h-11 w-full items-center justify-between gap-4 rounded-[11px] text-left text-sm text-[#475467] outline-none transition focus-visible:ring-4 focus-visible:ring-[#0866ff]/12"
              >
                <span>{copy.remember}</span>
                <span
                  aria-hidden="true"
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-[7px] border transition ${
                    remember
                      ? 'border-[#0866ff] bg-[#0866ff] text-white'
                      : 'border-[#b8c5d8] bg-white text-transparent'
                  }`}
                >
                  <Check className="h-3.5 w-3.5" />
                </span>
              </button>

              {displayedError ? <AuthError message={displayedError} /> : null}
              {notice ? <p className="mt-4 rounded-[11px] border border-[#cfe3ff] bg-[#f5f9ff] px-3 py-2.5 text-sm text-[#175cd3]">{notice}</p> : null}

              <button
                disabled={loading || Boolean(socialLoading)}
                className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[11px] bg-[#0866ff] px-5 text-sm font-[600] text-white transition hover:bg-[#075be4] disabled:opacity-60"
              >
                {loading ? (authMethod === 'password' ? copy.passwordLoading : copy.sending) : (authMethod === 'password' ? copy.passwordSubmit : copy.continue)}
                {!loading ? <ArrowRight className="h-4 w-4" /> : null}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMethod((current) => (current === 'password' ? 'code' : 'password'))
                  setError('')
                  setNotice('')
                }}
                className="mt-4 w-full text-center text-sm font-[600] text-[#0866ff]"
              >
                {authMethod === 'password' ? copy.useCodeInstead : copy.usePasswordInstead}
              </button>
            </form>
            </>
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
                    className="h-12 min-w-0 rounded-[10px] border border-[#c8d2df] text-center text-xl font-[600] outline-none transition focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10"
                  />
                ))}
              </div>

              {displayedError ? <AuthError message={displayedError} /> : null}

              <button
                type="button"
                disabled={loading || digits.join('').length !== 6}
                onClick={() => void verifyCode()}
                className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[11px] bg-[#0866ff] px-5 text-sm font-[600] text-white transition hover:bg-[#075be4] disabled:opacity-45"
              >
                {loading ? copy.verifying : copy.submitCode}
                {!loading ? <CheckCircle2 className="h-4 w-4" /> : null}
              </button>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
                <button
                  type="button"
                  disabled={retryAfter > 0 || loading}
                  onClick={() => void requestCode()}
                  className="font-[600] text-[#0866ff] disabled:text-[#98a2b3]"
                >
                  {retryAfter ? `${copy.resendIn} ${retryAfter}s` : copy.resend}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep('email')
                    setError('')
                  }}
                  className="inline-flex items-center gap-1.5 font-[600] text-[#475467]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {copy.back}
                </button>
              </div>
            </div>
          )}

          {view === 'login' || view === 'register' ? <p className="mt-6 border-t border-[#edf1f6] pt-5 text-center text-sm text-[#667085]">
            {mode === 'login' ? copy.newHere : copy.haveAccount}{' '}
            <button
              type="button"
              onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
              className="font-[600] text-[#0866ff]"
            >
              {mode === 'login' ? copy.registerTab : copy.loginTab}
            </button>
          </p> : null}
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

function getAuthModalCopy(locale: PublicLocale, mode: AuthMode, view: AuthView = mode) {
  return getLocalizedAuthModalCopy(locale, mode, view)
}

function getAuthSpamHint(locale: PublicLocale) {
  return getAuthSpamHintCopy(locale)
}

type BusinessRegistrationCopy = {
  switchLabel: string
  switchDescription: string
  fieldsRequired: string
}

const businessRegistrationCopy: Record<PublicLocale, BusinessRegistrationCopy> = {
  sv: { switchLabel: 'Jag är företag', switchDescription: 'Skapa ett företagskonto med företagets registrerade uppgifter.', fieldsRequired: 'Fyll i företagsnamn och organisationsnummer.' },
  en: { switchLabel: 'I represent a business', switchDescription: 'Create a business account using the company’s registered details.', fieldsRequired: 'Enter the company name and registration number.' },
  de: { switchLabel: 'Ich vertrete ein Unternehmen', switchDescription: 'Erstellen Sie ein Unternehmenskonto mit den eingetragenen Firmendaten.', fieldsRequired: 'Geben Sie Firmenname und Registernummer ein.' },
  at: { switchLabel: 'Ich vertrete ein Unternehmen', switchDescription: 'Erstellen Sie ein Unternehmenskonto mit den eingetragenen Firmendaten.', fieldsRequired: 'Geben Sie Firmenname und Firmenbuchnummer ein.' },
  be: { switchLabel: 'Ik vertegenwoordig een bedrijf', switchDescription: 'Maak een bedrijfsaccount met de officiële bedrijfsgegevens.', fieldsRequired: 'Vul de bedrijfsnaam en het ondernemingsnummer in.' },
  fr: { switchLabel: 'Je représente une entreprise', switchDescription: 'Créez un compte entreprise avec les informations officielles.', fieldsRequired: 'Saisissez la raison sociale et le numéro SIREN.' },
  es: { switchLabel: 'Represento a una empresa', switchDescription: 'Crea una cuenta de empresa con los datos registrados.', fieldsRequired: 'Introduce la denominación social y el NIF de la empresa.' },
  it: { switchLabel: 'Rappresento un’azienda', switchDescription: 'Crea un account aziendale con i dati registrati.', fieldsRequired: 'Inserisci la denominazione e il codice fiscale dell’impresa.' },
  pl: { switchLabel: 'Reprezentuję firmę', switchDescription: 'Utwórz konto firmowe przy użyciu danych rejestrowych.', fieldsRequired: 'Wpisz nazwę firmy i jej oficjalny identyfikator.' },
  nl: { switchLabel: 'Ik vertegenwoordig een bedrijf', switchDescription: 'Maak een bedrijfsaccount met de officiële bedrijfsgegevens.', fieldsRequired: 'Vul de bedrijfsnaam en het KVK-nummer in.' },
  fi: { switchLabel: 'Edustan yritystä', switchDescription: 'Luo yritystili yrityksen rekisteröidyillä tiedoilla.', fieldsRequired: 'Anna yrityksen nimi ja Y-tunnus.' },
  da: { switchLabel: 'Jeg repræsenterer en virksomhed', switchDescription: 'Opret en virksomhedskonto med de registrerede oplysninger.', fieldsRequired: 'Indtast virksomhedsnavn og CVR-nummer.' },
}
