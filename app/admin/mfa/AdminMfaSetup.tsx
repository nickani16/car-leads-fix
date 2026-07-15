'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { CheckCircle2, KeyRound, LoaderCircle, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Enrollment = {
  factorId: string
  qrCode: string | null
  secret: string | null
  existing: boolean
}

export default function AdminMfaSetup() {
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function prepare() {
      const supabase = createClient()
      const assurance = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      if (assurance.data?.currentLevel === 'aal2') {
        window.location.replace('/admin')
        return
      }

      const factors = await supabase.auth.mfa.listFactors()
      if (factors.error) throw factors.error
      const verified = factors.data.totp.find((factor) => factor.status === 'verified')
      if (verified) {
        if (active) setEnrollment({ factorId: verified.id, qrCode: null, secret: null, existing: true })
        return
      }

      for (const factor of factors.data.all.filter(
        (item) => item.factor_type === 'totp' && item.status !== 'verified',
      )) {
        const unenrolled = await supabase.auth.mfa.unenroll({ factorId: factor.id })
        if (unenrolled.error) throw unenrolled.error
      }

      const enrolled = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Autorell Admin',
      })
      if (enrolled.error) throw enrolled.error
      if (active) {
        setEnrollment({
          factorId: enrolled.data.id,
          qrCode: enrolled.data.totp.qr_code.trimEnd(),
          secret: enrolled.data.totp.secret,
          existing: false,
        })
      }
    }

    void prepare()
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'MFA kunde inte förberedas.')
      })
      .finally(() => {
        if (active) setBusy(false)
      })

    return () => {
      active = false
    }
  }, [])

  async function verify() {
    if (!enrollment || code.length !== 6) return
    setBusy(true)
    setError('')
    const supabase = createClient()
    const challenge = await supabase.auth.mfa.challenge({ factorId: enrollment.factorId })
    if (challenge.error) {
      setError(challenge.error.message)
      setBusy(false)
      return
    }
    const verified = await supabase.auth.mfa.verify({
      factorId: enrollment.factorId,
      challengeId: challenge.data.id,
      code,
    })
    if (verified.error) {
      setError('Koden kunde inte verifieras. Kontrollera tiden i authenticator-appen och försök igen.')
      setBusy(false)
      return
    }
    await supabase.auth.refreshSession()
    window.location.replace('/admin')
  }

  return (
    <section className="mt-7 rounded-2xl border border-[#dce3ee] bg-white p-5 shadow-sm sm:p-7">
      {busy && !enrollment ? (
        <div className="flex items-center gap-3 text-sm font-semibold text-[#475467]">
          <LoaderCircle className="h-5 w-5 animate-spin text-[#0866ff]" /> Förbereder säker inloggning…
        </div>
      ) : null}

      {enrollment ? (
        <div>
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-[#0866ff]">
              {enrollment.existing ? <KeyRound className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
            </span>
            <div>
              <h2 className="font-black text-[#101828]">{enrollment.existing ? 'Verifiera din authenticator' : 'Skanna QR-koden'}</h2>
              <p className="mt-1 text-sm leading-6 text-[#667085]">
                {enrollment.existing ? 'Ange den aktuella sexsiffriga koden.' : 'Använd valfri TOTP-app och spara återställningsinformationen säkert.'}
              </p>
            </div>
          </div>

          {enrollment.qrCode ? (
            <div className="mt-5 grid justify-items-center rounded-xl border border-[#edf1f6] bg-[#f8fafc] p-5">
              <Image src={enrollment.qrCode} alt="QR-kod för Autorell Admin MFA" width={220} height={220} unoptimized />
              {enrollment.secret ? <code className="mt-4 break-all rounded-lg bg-white px-3 py-2 text-xs text-[#475467]">{enrollment.secret}</code> : null}
            </div>
          ) : null}

          <label className="mt-5 grid gap-2 text-sm font-bold text-[#344054]">
            Engångskod
            <input
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              className="h-12 rounded-xl border border-[#d7deea] px-4 text-lg tracking-[0.35em] outline-none focus:border-[#0866ff] focus:ring-2 focus:ring-blue-100"
              placeholder="000000"
            />
          </label>
          <button
            type="button"
            disabled={busy || code.length !== 6}
            onClick={() => void verify()}
            className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0866ff] px-5 text-sm font-bold text-white disabled:bg-[#98a2b3]"
          >
            {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Verifiera och öppna admin
          </button>
        </div>
      ) : null}

      {error ? <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">{error}</p> : null}
    </section>
  )
}
