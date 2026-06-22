'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useState, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Home, Menu } from 'lucide-react'
import BrandLogo from '@/app/components/BrandLogo'
import styles from './login.module.css'
import { getAccountCopy } from '@/lib/account-i18n'
import type { PublicLocale } from '@/lib/public-i18n'

const REMEMBERED_LOGIN_KEY = 'autorell.rememberedLogin'

export default function LoginPage() {
  const router = useRouter()
  const locale = useSyncExternalStore(
    () => () => {},
    () => (document.documentElement.lang || 'en') as PublicLocale,
    () => 'en' as PublicLocale,
  )
  const copy = getAccountCopy(locale)

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
    <main className={styles.page}>
      <div className={styles.backgroundGlowOne} />
      <div className={styles.backgroundGlowTwo} />

      <nav className={styles.mobileNav} aria-label="Mobile navigation">
        <Link href="/" className={styles.mobileLogo} aria-label="Autorell home">
          <BrandLogo />
        </Link>
        <div className={styles.mobileNavActions}>
          <Link href="/" className={styles.mobileNavLink}>
            <Home size={16} />
            <span className={styles.mobileNavText}>Home</span>
          </Link>
          <Link href="/dealer-apply" className={styles.mobileMenuButton}>
            <Menu size={16} />
            Menu
          </Link>
        </div>
      </nav>

      <section className={styles.layout}>
        <div className={styles.introduction}>
          <Link href="/" className={styles.logo} aria-label="Autorell home">
            <BrandLogo />
          </Link>

          <div className={styles.badge}>European vehicle marketplace</div>

          <h1 className={styles.heroTitle}>
            Buy, sell and manage vehicles across Europe.
          </h1>

          <p className={styles.heroText}>
            One secure account for private sellers, companies, listings,
            saved searches and direct seller messages.
          </p>

          <div className={styles.features}>
            <div className={styles.feature}>
              <span className={styles.check}>&#10003;</span>
              Private and business accounts
            </div>

            <div className={styles.feature}>
              <span className={styles.check}>&#10003;</span>
              Secure direct messages
            </div>

            <div className={styles.feature}>
              <span className={styles.check}>&#10003;</span>
              Listings across all vehicle categories
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <p className={styles.eyebrow}>AUTORELL PORTAL</p>
            <h2 className={styles.cardTitle}>{copy.signIn}</h2>

            <p className={styles.cardDescription}>
              Sign in to access your authorised Autorell workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <label className={styles.label}>
              {copy.email}

              <div className={styles.inputWrapper}>
                <svg
                  className={styles.inputIcon}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M4 6h16v12H4V6Zm0 1 8 6 8-6" />
                </svg>

                <input
                  type="text"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="username"
                  placeholder={loginExample}
                  required
                  className={styles.input}
                />
              </div>
            </label>

            <div className={styles.passwordHeader}>
              <span>{copy.password}</span>
              <Link href="/forgot-password" className={styles.forgotLink}>
                Forgot password?
              </Link>
            </div>

            <div className={styles.inputWrapper}>
              <svg
                className={styles.inputIcon}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M7 10V8a5 5 0 0 1 10 0v2m-11 0h12v10H6V10Z" />
              </svg>

              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                placeholder="Enter your password"
                required
                className={styles.input}
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className={styles.passwordToggle}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <label className={styles.rememberRow}>
              <input
                type="checkbox"
                checked={rememberLogin}
                onChange={(event) => setRememberLogin(event.target.checked)}
              />
              <span>
                Remember me
                <small>Save this email or username on this device.</small>
              </span>
            </label>

            {statusMessage && (
              <div role="status" className={styles.statusMessage}>
                <strong>{statusHeading}</strong>
                <span>{statusMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div role="alert" className={styles.error}>
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={styles.button}
            >
              {isLoading ? (
                <>
                  <span className={styles.spinner} />
                  Signing in...
                </>
              ) : (
                <>
                  {copy.signIn}
                  <span aria-hidden="true">&rarr;</span>
                </>
              )}
            </button>

            <div className={styles.applySection}>
              <span>{copy.noAccount}</span>
              <Link href="/registrera">{copy.createAccount}</Link>
            </div>
          </form>

          <div className={styles.security}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3 5 6v5c0 4.8 2.9 8.2 7 10 4.1-1.8 7-5.2 7-10V6l-7-3Z" />
            </svg>

            Secure access for Autorell marketplace users
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        &copy; {new Date().getFullYear()} Autorell. All rights reserved.
      </footer>
    </main>
  )
}
