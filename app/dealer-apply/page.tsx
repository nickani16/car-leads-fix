'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import PublicHeader from '@/app/components/PublicHeader'
import styles from './dealer-apply.module.css'

const initialForm = {
  companyName: '',
  vatNumber: '',
  country: '',
  deliveryCity: '',
  deliveryPostalCode: '',
  contactPerson: '',
  email: '',
  phone: '',
  password: '',
  acceptsDealerTerms: false,
  acknowledgesPrivacyNotice: false,
}

export default function DealerApplyPage() {
  const [form, setForm] = useState(initialForm)
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  function updateField(
    field: keyof typeof form,
    value: string | boolean
  ) {
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

    if (!form.acceptsDealerTerms || !form.acknowledgesPrivacyNotice) {
      setErrorMessage(
        'Accept the Dealer Terms and acknowledge the Privacy Notice.'
      )
      return
    }

    setIsLoading(true)

    const response = await fetch('/api/dealer-apply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form),
    })

    const result = (await response.json()) as {
      success?: boolean
      error?: string
    }

    if (!response.ok || !result.success) {
      setErrorMessage(result.error || 'The application could not be submitted.')
      setIsLoading(false)
      return
    }

    setIsSubmitted(true)
    setIsLoading(false)
  }

  if (isSubmitted) {
    return (
      <>
        <PublicHeader />
        <main className={styles.page}>
          <section className={styles.successCard}>
            <div className={styles.successIcon}>&#10003;</div>

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
      </>
    )
  }

  return (
    <>
      <PublicHeader />
      <main className={styles.page}>
        <section className={styles.layout}>
          <div className={styles.introduction}>
            <p className={styles.eyebrow}>DEALER NETWORK</p>

            <h1>Join the Autorell dealer network.</h1>

            <p className={styles.introText}>
              Apply for access to verified vehicle opportunities across Europe.
              Every application is reviewed before access is granted.
            </p>

            <div className={styles.featureList}>
              <p><span>&#10003;</span> Verified vehicle opportunities</p>
              <p><span>&#10003;</span> Transparent 24-hour bidding</p>
              <p><span>&#10003;</span> Secure professional dealer access</p>
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
                Delivery city
                <input
                  value={form.deliveryCity}
                  onChange={(event) =>
                    updateField('deliveryCity', event.target.value)
                  }
                  placeholder="Berlin"
                  autoComplete="address-level2"
                  required
                />
              </label>

              <label>
                Delivery postal code
                <input
                  value={form.deliveryPostalCode}
                  onChange={(event) =>
                    updateField(
                      'deliveryPostalCode',
                      event.target.value.toUpperCase()
                    )
                  }
                  placeholder="10115"
                  autoComplete="postal-code"
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

            <div className={styles.legalBox}>
              <label className={styles.legalChoice}>
                <input
                  type="checkbox"
                  checked={form.acceptsDealerTerms}
                  onChange={(event) =>
                    updateField('acceptsDealerTerms', event.target.checked)
                  }
                  required
                />
                <span>
                  I have read and accept the{' '}
                  <Link href="/dealer-terms#dealer-terms" target="_blank">
                    Dealer Terms &amp; Conditions
                  </Link>
                  , including the{' '}
                  <Link href="/dealer-terms#binding-bids" target="_blank">
                    Binding Bid Rules
                  </Link>{' '}
                  and{' '}
                  <Link href="/dealer-terms#fees" target="_blank">
                    Buyer Fee Policy
                  </Link>
                  .
                </span>
              </label>

              <label className={styles.legalChoice}>
                <input
                  type="checkbox"
                  checked={form.acknowledgesPrivacyNotice}
                  onChange={(event) =>
                    updateField(
                      'acknowledgesPrivacyNotice',
                      event.target.checked
                    )
                  }
                  required
                />
                <span>
                  I acknowledge that I have read the{' '}
                  <Link href="/dealer-terms#privacy" target="_blank">
                    Dealer Privacy Notice
                  </Link>
                  .
                </span>
              </label>

              <p>
                We record the accepted document versions, time, account holder,
                IP address and browser information for legal evidence.
              </p>
            </div>

            {errorMessage && (
              <div role="alert" className={styles.error}>
                {errorMessage}
              </div>
            )}

            <button
              disabled={
                isLoading ||
                !form.acceptsDealerTerms ||
                !form.acknowledgesPrivacyNotice
              }
              className={styles.submitButton}
            >
              {isLoading ? 'Submitting application...' : 'Submit application'}
            </button>

            <p className={styles.loginLink}>
              Already approved? <Link href="/login">Sign in here</Link>
            </p>
            </form>
          </div>
        </section>
      </main>
    </>
  )
}
