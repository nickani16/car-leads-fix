'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import BrandLogo from '@/app/components/BrandLogo'
import styles from '../login/login.module.css'
import { localeFromPath } from '@/lib/auth-locale'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setIsLoading(true)

    const response = await fetch('/api/auth/password-recovery', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim(),
        locale: localeFromPath(window.location.pathname),
      }),
    })
    const result = (await response.json().catch(() => ({}))) as {
      error?: string
    }

    if (!response.ok) {
      setErrorMessage(
        result.error || 'The reset email could not be sent. Please try again.',
      )
      setIsLoading(false)
      return
    }

    setSent(true)
    setIsLoading(false)
  }

  return (
    <main className={styles.page}>
      <div className={styles.backgroundGlowOne} />
      <div className={styles.backgroundGlowTwo} />

      <section className={styles.layout}>
        <div className={styles.introduction}>
          <Link href="/se" className={styles.logo} aria-label="Autorell home">
            <BrandLogo />
          </Link>
          <div className={styles.badge}>Secure account recovery</div>
          <h1 className={styles.heroTitle}>Recover your marketplace account.</h1>
          <p className={styles.heroText}>
            We will send a secure password reset link to the email address
            registered with your Autorell account.
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <p className={styles.eyebrow}>PASSWORD RECOVERY</p>
            <h2 className={styles.cardTitle}>
              {sent ? 'Check your inbox' : 'Reset your password'}
            </h2>
            <p className={styles.cardDescription}>
              {sent
                ? 'If the address matches an Autorell account, a reset link has been sent.'
                : 'Enter the email address you use to sign in.'}
            </p>
          </div>

          {sent ? (
            <div className={styles.form}>
              <div role="status" className={styles.statusMessage}>
                <strong>Reset email requested</strong>
                <span>
                  Open the email and follow the secure link. Check your spam
                  folder if it does not arrive.
                </span>
              </div>
              <Link href="/se" className={styles.button}>
                Return to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              <label className={styles.label}>
                Account email address
                <div className={styles.inputWrapper}>
                  <svg
                    className={styles.inputIcon}
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M4 6h16v12H4V6Zm0 1 8 6 8-6" />
                  </svg>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    placeholder="name@company.com"
                    required
                    className={styles.input}
                  />
                </div>
              </label>

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
                {isLoading ? 'Sending reset link...' : 'Send reset link'}
              </button>

              <p className={styles.helperText}>
                Forgot which email address was registered? Contact{' '}
                <a
                  href="mailto:info@autorell.com?subject=Marketplace%20account%20email"
                  className={styles.authLink}
                >
                  Autorell Support
                </a>
                .
              </p>
              <p className={styles.helperText}>
                <Link href="/se" className={styles.authLink}>
                  Back to sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </section>
    </main>
  )
}
