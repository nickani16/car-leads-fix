'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useState, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, BadgeCheck, Eye, EyeOff, Heart, LockKeyhole, MessageCircle } from 'lucide-react'
import PublicFooter from '@/app/components/PublicFooter'
import PublicHeader from '@/app/components/PublicHeader'
import { getAccountCopy } from '@/lib/account-i18n'
import { translatePublicObject, type PublicLocale } from '@/lib/public-i18n'

const REMEMBERED_LOGIN_KEY = 'autorell.rememberedLogin'

export default function LoginPage() {
  const router = useRouter()
  const locale = useSyncExternalStore(
    () => () => {},
    () => (document.documentElement.lang || 'en') as PublicLocale,
    () => 'en' as PublicLocale,
  )
  const copy = getAccountCopy(locale)
  const ui = getLoginUi(locale)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [statusHeading, setStatusHeading] = useState('Account access')
  const [isLoading, setIsLoading] = useState(false)
  const [requestedPath, setRequestedPath] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberLogin, setRememberLogin] = useState(false)
  const [loginExample, setLoginExample] = useState('')

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const rememberedLogin = window.localStorage.getItem(REMEMBERED_LOGIN_KEY)
      const searchParams = new URLSearchParams(window.location.search)
      const status = searchParams.get('status')
      const next = searchParams.get('next')

      if (rememberedLogin) {
        setEmail(rememberedLogin)
        setRememberLogin(true)
      }

      if (next === '/admin' || next === '/dealer' || next === '/sales' || next === '/konto') {
        setRequestedPath(next)
      }

      if (status === 'account-created') {
        setStatusMessage('Your account is ready. Sign in to continue.')
      }

      if (status === 'pending') {
        setStatusMessage(
          'Your application is under review. Access will be available once your dealer account has been approved.'
        )
      }

      if (status === 'dealer-not-found') {
        setStatusMessage(
          'No dealer profile was found for this account. Please contact Autorell support.'
        )
      }

      if (status === 'password-updated') {
        setStatusMessage(
          'Your password has been updated. You can now sign in with your new password.'
        )
      }

      if (status === 'admin-required') {
        setStatusMessage(
          'This account does not have access to the Autorell Admin Portal.'
        )
      }

      if (status === 'sales-required') {
        setStatusMessage(
          'This account does not have access to the Autorell Sales Portal.'
        )
      }

      if (status === 'inactive') {
        setStatusHeading('Session ended securely')
        setStatusMessage(
          'You were signed out automatically after 15 minutes without activity. Sign in again to continue.'
        )
      }
    }, 0)

    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const examples = ['dealer@company.com', 'or username']
    let exampleIndex = 0
    let characterIndex = 0
    let deleting = false
    let timer: ReturnType<typeof setTimeout>

    function animate() {
      const example = examples[exampleIndex]

      if (!deleting) {
        characterIndex += 1
        setLoginExample(example.slice(0, characterIndex))
        if (characterIndex === example.length) {
          deleting = true
          timer = setTimeout(animate, 1450)
          return
        }
      } else {
        characterIndex -= 1
        setLoginExample(example.slice(0, characterIndex))
        if (characterIndex === 0) {
          deleting = false
          exampleIndex = (exampleIndex + 1) % examples.length
          timer = setTimeout(animate, 350)
          return
        }
      }

      timer = setTimeout(animate, deleting ? 45 : 85)
    }

    timer = setTimeout(animate, 500)
    return () => clearTimeout(timer)
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setErrorMessage('')
    setStatusMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        cache: 'no-store',
        body: JSON.stringify({
          email,
          password,
          next: requestedPath || undefined,
        }),
      })
      const result = (await response.json().catch(() => ({}))) as {
        success?: boolean
        destination?: string
        error?: string
      }

      if (!response.ok || !result.success) {
        setErrorMessage(result.error || 'Invalid email or password.')
        return
      }

      if (rememberLogin) {
        window.localStorage.setItem(REMEMBERED_LOGIN_KEY, email.trim())
      } else {
        window.localStorage.removeItem(REMEMBERED_LOGIN_KEY)
      }

      router.replace(result.destination || '/dealer')
      router.refresh()
    } catch {
      setErrorMessage(
        'The connection was interrupted. Check your network and try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f8fb] text-[#101828]">
      <PublicHeader locale={locale} />
      <section className="relative overflow-hidden border-b border-[#e4e7ec] bg-white">
        <div className="market-blob absolute -right-40 -top-48 h-[520px] w-[520px] bg-[#edf3ff]" />
        <div className="relative mx-auto grid max-w-[1240px] gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1fr_480px] lg:items-center lg:px-12 lg:py-20">
          <div className="hidden lg:block">
            <span className="inline-flex items-center gap-2 rounded-[13px] bg-[#edf3ff] px-4 py-2 text-xs font-bold text-[#0866ff]">
              <BadgeCheck className="h-4 w-4" />
              {ui.eyebrow}
            </span>
            <h1 className="mt-7 max-w-2xl text-[58px] leading-[1.02] tracking-[-0.055em]">
              {ui.title}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[#667085]">
              {ui.intro}
            </p>
            <div className="mt-9 grid max-w-xl gap-3 sm:grid-cols-3">
              {[
                [Heart, ui.saved],
                [MessageCircle, ui.messages],
                [LockKeyhole, ui.secure],
              ].map(([Icon, label]) => {
                const FeatureIcon = Icon as typeof Heart
                return (
                  <div key={label as string} className="rounded-[18px] border border-[#e4e7ec] bg-white p-4 shadow-[0_12px_35px_rgba(16,24,40,.05)]">
                    <FeatureIcon className="h-5 w-5 text-[#0866ff]" />
                    <p className="mt-3 text-sm font-semibold">{label as string}</p>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-[24px] border border-[#dfe4ec] bg-white p-6 shadow-[0_24px_70px_rgba(16,24,40,.1)] sm:p-9">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0866ff]">
              {ui.portal}
            </p>
            <h2 className="mt-3 text-3xl tracking-[-0.045em]">{copy.signIn}</h2>
            <p className="mt-3 text-sm leading-6 text-[#667085]">{ui.description}</p>

            <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
              <label className="grid gap-2 text-sm font-semibold">
                {copy.email}
                <input
                  type="text"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="username"
                  placeholder={loginExample}
                  required
                  className="h-14 rounded-[15px] border border-[#d0d5dd] bg-[#fbfcfe] px-4 text-base font-normal outline-none transition focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10"
                />
              </label>

              <label className="grid gap-2 text-sm font-semibold">
                <span className="flex items-center justify-between gap-4">
                  {copy.password}
                  <Link href="/forgot-password" className="text-xs font-bold text-[#0866ff]">
                    {ui.forgot}
                  </Link>
                </span>
                <span className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    placeholder={ui.passwordPlaceholder}
                    required
                    className="h-14 w-full rounded-[15px] border border-[#d0d5dd] bg-[#fbfcfe] px-4 pr-12 text-base font-normal outline-none transition focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-[12px] text-[#667085] hover:bg-[#edf3ff]"
                    aria-label={showPassword ? ui.hidePassword : ui.showPassword}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </span>
              </label>

              <label className="flex items-start gap-3 text-sm text-[#475467]">
                <input
                  type="checkbox"
                  checked={rememberLogin}
                  onChange={(event) => setRememberLogin(event.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-[#0866ff]"
                />
                {ui.remember}
              </label>

              {statusMessage && (
                <div role="status" className="rounded-[14px] border border-[#bfdbfe] bg-[#eff6ff] p-4 text-sm text-[#475467]">
                  <strong className="block text-[#101828]">{statusHeading}</strong>
                  <span className="mt-1 block">{statusMessage}</span>
                </div>
              )}
              {errorMessage && (
                <div role="alert" className="rounded-[14px] border border-[#fecaca] bg-[#fef2f2] p-4 text-sm text-[#b91c1c]">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-[15px] bg-[#0866ff] px-6 text-sm font-bold text-white shadow-[0_12px_30px_rgba(8,102,255,.22)] disabled:opacity-60"
              >
                {isLoading ? ui.signingIn : copy.signIn}
                {!isLoading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 border-t border-[#eaecf0] pt-6 text-sm text-[#667085]">
              {copy.noAccount}
              <Link href="/registrera" className="font-bold text-[#0866ff]">
                {copy.createAccount}
              </Link>
            </div>
          </div>
        </div>
      </section>
      <PublicFooter locale={locale} />
    </main>
  )
}

function getLoginUi(locale: PublicLocale) {
  const en = {
    eyebrow: 'One account across Europe',
    title: 'Your vehicles, saved listings and conversations in one place.',
    intro: 'Sign in as a private seller or business to manage listings, save vehicles and contact sellers securely.',
    saved: 'Saved vehicles',
    messages: 'Direct messages',
    secure: 'Secure account',
    portal: 'Autorell account',
    description: 'Use the same account whether you buy, sell privately or represent a business.',
    forgot: 'Forgot password?',
    remember: 'Remember my email on this device',
    passwordPlaceholder: 'Enter your password',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    signingIn: 'Signing in…',
  }
  if (locale === 'sv') {
    return {
      ...en,
      eyebrow: 'Ett konto i hela Europa',
      title: 'Dina fordon, sparade annonser och meddelanden på ett ställe.',
      intro: 'Logga in som privatperson eller företag för att hantera annonser, spara fordon och kontakta säljare tryggt.',
      saved: 'Sparade fordon',
      messages: 'Direkta meddelanden',
      secure: 'Tryggt konto',
      portal: 'Autorell-konto',
      description: 'Samma konto fungerar när du köper, säljer privat eller representerar ett företag.',
      forgot: 'Glömt lösenordet?',
      remember: 'Kom ihåg min e-post på den här enheten',
      passwordPlaceholder: 'Ange ditt lösenord',
      showPassword: 'Visa lösenord',
      hidePassword: 'Dölj lösenord',
      signingIn: 'Loggar in…',
    }
  }
  if (locale === 'de') {
    return {
      ...en,
      eyebrow: 'Ein Konto in ganz Europa',
      title: 'Fahrzeuge, gespeicherte Anzeigen und Nachrichten an einem Ort.',
      intro: 'Als Privatperson oder Unternehmen anmelden, Anzeigen verwalten, Fahrzeuge speichern und Verkäufer sicher kontaktieren.',
      saved: 'Gespeicherte Fahrzeuge',
      messages: 'Direkte Nachrichten',
      secure: 'Sicheres Konto',
      portal: 'Autorell-Konto',
      description: 'Dasselbe Konto für Kauf, privaten Verkauf und Unternehmen.',
      forgot: 'Passwort vergessen?',
      remember: 'E-Mail auf diesem Gerät speichern',
      passwordPlaceholder: 'Passwort eingeben',
      showPassword: 'Passwort anzeigen',
      hidePassword: 'Passwort ausblenden',
      signingIn: 'Anmeldung…',
    }
  }
  return locale === 'en' ? en : translatePublicObject(locale, en)
}
