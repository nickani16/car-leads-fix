'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import BrandLogo from '@/app/components/BrandLogo'
import styles from '../login/login.module.css'
import {
  isStrongPassword,
  PASSWORD_REQUIREMENTS,
} from '@/lib/password-policy'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')

    if (!isStrongPassword(password)) {
      setErrorMessage(PASSWORD_REQUIREMENTS)
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('The passwords do not match.')
      return
    }

    setIsLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setErrorMessage(
        'The password could not be updated. Request a new reset link.'
      )
      setIsLoading(false)
      return
    }

    await fetch('/api/auth/password-changed', {
      method: 'POST',
      credentials: 'same-origin',
    })
    await supabase.auth.signOut()
    router.replace('/login?status=password-updated')
    router.refresh()
  }

  return (
    <main className={styles.page}>
      <div className={styles.backgroundGlowOne} />
      <div className={styles.backgroundGlowTwo} />

      <section className={styles.layout}>
        <div className={styles.introduction}>
          <Link href="/" className={styles.logo} aria-label="Autorell home">
            <BrandLogo />
          </Link>
          <div className={styles.badge}>Secure dealer access</div>
          <h1 className={styles.heroTitle}>Choose a new password.</h1>
          <p className={styles.heroText}>
            Use a strong, unique password to protect your company account and
            bidding activity.
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <p className={styles.eyebrow}>NEW PASSWORD</p>
            <h2 className={styles.cardTitle}>Update your password</h2>
            <p className={styles.cardDescription}>
              {PASSWORD_REQUIREMENTS}
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <label className={styles.label}>
              New password
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
                  autoComplete="new-password"
                  minLength={8}
                  pattern="(?=.*[A-Z])(?=.*\d).{8,}"
                  title={PASSWORD_REQUIREMENTS}
                  required
                  className={styles.input}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className={styles.passwordToggle}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            <label className={styles.label}>
              Confirm new password
              <div className={styles.inputWrapper}>
                <svg
                  className={styles.inputIcon}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M7 10V8a5 5 0 0 1 10 0v2m-11 0h12v10H6V10Z" />
                </svg>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  autoComplete="new-password"
                  minLength={8}
                  pattern="(?=.*[A-Z])(?=.*\d).{8,}"
                  title={PASSWORD_REQUIREMENTS}
                  required
                  className={styles.input}
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((current) => !current)
                  }
                  className={styles.passwordToggle}
                  aria-label={
                    showConfirmPassword ? 'Hide password' : 'Show password'
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
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
              {isLoading ? 'Updating password...' : 'Update password'}
            </button>

            <p className={styles.helperText}>
              <Link href="/forgot-password" className={styles.authLink}>
                Request a new reset link
              </Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  )
}
