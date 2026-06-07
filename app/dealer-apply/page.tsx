'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import styles from './dealer-apply.module.css'

const initialForm = {
  companyName: '',
  vatNumber: '',
  country: '',
  contactPerson: '',
  email: '',
  phone: '',
  password: '',
}

export default function DealerApplyPage() {
  const [form, setForm] = useState(initialForm)
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')

    if (form.password.length < 8) {
      setErrorMessage('Password must contain at least 8 characters.')
      return
    }

    setIsLoading(true)

    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        data: {
          company_name: form.companyName.trim(),
          vat_number: form.vatNumber.trim(),
          country: form.country.trim(),
          contact_person: form.contactPerson.trim(),
          phone: form.phone.trim(),
        },
      },
    })

    if (error) {
      setErrorMessage(error.message)
      setIsLoading(false)
      return
    }

    await supabase.auth.signOut()

    setIsSubmitted(true)
    setIsLoading(false)
  }

  if (isSubmitted) {
    return (
      <main className={styles.page}>
        <section className={styles.successCard}>
          <div className={styles.successIcon}>✓</div>

          <p className={styles.eyebrow}>APPLICATION RECEIVED</p>

          <h1>Thank you for applying</h1>

          <p>
            Your dealer application has been submitted successfully. Our team
            will review your company information before activating your access.
          </p>

          <div className={styles.notice}>
            You will not be able to access the Dealer Portal until your
            application has been approved.
          </div>

          <Link href="/login" className={styles.secondaryButton}>
            Return to Dealer Login
          </Link>
        </section>
      </main>
    )
  }

  return (
    <main className={styles.page}>
      <div className={styles.glowOne} />
      <div className={styles.glowTwo} />

      <section className={styles.layout}>
        <div className={styles.introduction}>
          <p className={styles.brand}>AUTORELL</p>
          <p className={styles.eyebrow}>DEALER NETWORK</p>

          <h1>Join the Autorell dealer network.</h1>

          <p className={styles.introText}>
            Apply for access to verified vehicle opportunities across Europe.
            Every application is reviewed before access is granted.
          </p>

          <div className={styles.featureList}>
            <p><span>✓</span> Verified vehicle opportunities</p>
            <p><span>✓</span> Transparent 24-hour bidding</p>
            <p><span>✓</span> Secure professional dealer access</p>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <p className={styles.eyebrow}>DEALER APPLICATION</p>
            <h2>Create your dealer account</h2>
            <p>Enter your company details. All applications are reviewed.</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.twoColumns}>
              <label>
                Company name
                <input
                  value={form.companyName}
                  onChange={(event) =>
                    updateField('companyName', event.target.value)
                  }
                  placeholder="Company Ltd"
                  required
                />
              </label>

              <label>
                VAT number
                <input
                  value={form.vatNumber}
                  onChange={(event) =>
                    updateField('vatNumber', event.target.value)
                  }
                  placeholder="EU VAT number"
                  required
                />
              </label>
            </div>

            <div className={styles.twoColumns}>
              <label>
                Country
                <input
                  value={form.country}
                  onChange={(event) =>
                    updateField('country', event.target.value)
                  }
                  placeholder="Germany"
                  required
                />
              </label>

              <label>
                Contact person
                <input
                  value={form.contactPerson}
                  onChange={(event) =>
                    updateField('contactPerson', event.target.value)
                  }
                  placeholder="Full name"
                  required
                />
              </label>
            </div>

            <div className={styles.twoColumns}>
              <label>
                Business email
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    updateField('email', event.target.value)
                  }
                  placeholder="dealer@company.com"
                  autoComplete="email"
                  required
                />
              </label>

              <label>
                Phone number
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(event) =>
                    updateField('phone', event.target.value)
                  }
                  placeholder="+49 123 456 789"
                  autoComplete="tel"
                  required
                />
              </label>
            </div>

            <label>
              Password
              <input
                type="password"
                value={form.password}
                onChange={(event) =>
                  updateField('password', event.target.value)
                }
                placeholder="Minimum 8 characters"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>

            {errorMessage && (
              <div role="alert" className={styles.error}>
                {errorMessage}
              </div>
            )}

            <button disabled={isLoading} className={styles.submitButton}>
              {isLoading ? 'Submitting application...' : 'Submit application'}
            </button>

            <p className={styles.loginLink}>
              Already approved? <Link href="/login">Sign in here</Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  )
}