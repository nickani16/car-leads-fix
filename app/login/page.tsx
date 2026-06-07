'use client'

import Image from 'next/image'
import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import styles from './login.module.css'

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const status = new URLSearchParams(window.location.search).get('status')

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
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setErrorMessage('')
    setStatusMessage('')
    setIsLoading(true)

    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) {
      setErrorMessage('Invalid email or password.')
      setIsLoading(false)
      return
    }

    router.replace('/dealer')
    router.refresh()
  }

  return (
    <main className={styles.page}>
      <div className={styles.backgroundGlowOne} />
      <div className={styles.backgroundGlowTwo} />

      <section className={styles.layout}>
        <div className={styles.introduction}>
          <Image
            src="/autorell-logo.png"
            alt="Autorell"
            width={190}
            height={55}
            priority
            className={styles.logo}
          />

          <div className={styles.badge}>European dealer network</div>

          <h1 className={styles.heroTitle}>
            The smarter way to source quality vehicles.
          </h1>

          <p className={styles.heroText}>
            Access verified vehicle opportunities, place competitive bids and
            manage your purchases from one secure platform.
          </p>

          <div className={styles.features}>
            <div className={styles.feature}>
              <span className={styles.check}>&#10003;</span>
              Verified vehicle opportunities
            </div>

            <div className={styles.feature}>
              <span className={styles.check}>&#10003;</span>
              Transparent 24-hour bidding
            </div>

            <div className={styles.feature}>
              <span className={styles.check}>&#10003;</span>
              Built for professional European dealers
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <p className={styles.eyebrow}>DEALER PORTAL</p>
            <h2 className={styles.cardTitle}>Welcome back</h2>

            <p className={styles.cardDescription}>
              Sign in to access available vehicles and manage your bids.
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <label className={styles.label}>
              Email address

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
                  placeholder="dealer@company.com"
                  required
                  className={styles.input}
                />
              </div>
            </label>

            <label className={styles.label}>
              Password

              <div className={styles.inputWrapper}>
                <svg
                  className={styles.inputIcon}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M7 10V8a5 5 0 0 1 10 0v2m-11 0h12v10H6V10Z" />
                </svg>

                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  required
                  className={styles.input}
                />
              </div>
            </label>

            {statusMessage && (
              <div role="status" className={styles.statusMessage}>
                <strong>Account access pending</strong>
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
                  Sign in to Dealer Portal
                  <span aria-hidden="true">&rarr;</span>
                </>
              )}
            </button>

            <div className={styles.applySection}>
              <span>Not a member of the Autorell dealer network?</span>
              <Link href="/dealer-apply">Apply for dealer access</Link>
            </div>
          </form>

          <div className={styles.security}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3 5 6v5c0 4.8 2.9 8.2 7 10 4.1-1.8 7-5.2 7-10V6l-7-3Z" />
            </svg>

            Secure access for authorised dealers only
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        &copy; {new Date().getFullYear()} Autorell. All rights reserved.
      </footer>
    </main>
  )
}