'use client'

import { FormEvent, useState } from 'react'
import { AlertTriangle, Trash2 } from 'lucide-react'
import {
  translatePublicObject,
  type PublicLocale,
} from '@/lib/public-i18n'

export default function DeleteAccountPanel({
  locale,
  homeHref,
}: {
  locale: PublicLocale
  homeHref: string
}) {
  const copy = getDeleteAccountCopy(locale)
  const [confirmText, setConfirmText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const canSubmit = confirmText.trim().toUpperCase() === copy.confirmWord

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit || isSubmitting) return
    setIsSubmitting(true)
    setMessage('')

    try {
      const response = await fetch('/api/account/delete-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: copy.confirmWord }),
      })
      const result = (await response.json()) as { error?: string }
      if (!response.ok) {
        setMessage(result.error || copy.error)
        setIsSubmitting(false)
        return
      }
      setMessage(copy.success)
      window.setTimeout(() => {
        window.location.assign(homeHref)
      }, 900)
    } catch {
      setMessage(copy.error)
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mt-10 rounded-[22px] border border-red-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-red-50 text-red-600">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-semibold tracking-[-.02em]">
              {copy.title}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#667085]">
              {copy.text}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="mt-6 grid gap-4 sm:max-w-[520px]">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[#344054]">
            {copy.confirmLabel}
          </span>
          <input
            value={confirmText}
            onChange={(event) => setConfirmText(event.target.value)}
            placeholder={copy.confirmWord}
            className="h-12 w-full rounded-[14px] border border-[#d7deed] bg-white px-4 text-sm outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
          />
        </label>
        {message && (
          <p className="text-sm leading-6 text-[#475467]">{message}</p>
        )}
        <button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] bg-red-600 px-5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-[#d0d5dd]"
        >
          <Trash2 className="h-4 w-4" />
          {isSubmitting ? copy.submitting : copy.button}
        </button>
      </form>
    </section>
  )
}

function getDeleteAccountCopy(locale: PublicLocale) {
  const en = {
    title: 'Delete account',
    text:
      'This creates an account deletion request for private and business accounts. Published listings are removed from public search while Autorell reviews the request. Payment, invoice, safety and legal records may be retained where required by law.',
    confirmLabel: 'Type DELETE to confirm',
    confirmWord: 'DELETE',
    button: 'Request account deletion',
    submitting: 'Sending request...',
    success: 'Your deletion request has been received. You will now be signed out.',
    error: 'The deletion request could not be sent. Contact Autorell support if the problem continues.',
  }
  if (locale === 'sv') {
    return {
      ...en,
      title: 'Radera konto',
      text:
        'Detta skapar en begäran om radering för privat- och företagskonton. Publicerade annonser tas bort från publik sökning medan Autorell granskar begäran. Betalnings-, faktura-, säkerhets- och juridiska uppgifter kan sparas när lagen kräver det.',
      confirmLabel: 'Skriv RADERA för att bekräfta',
      confirmWord: 'RADERA',
      button: 'Begär radering av konto',
      submitting: 'Skickar begäran...',
      success: 'Din raderingsbegäran har tagits emot. Du loggas nu ut.',
      error: 'Raderingsbegäran kunde inte skickas. Kontakta Autorells support om problemet kvarstår.',
    }
  }
  if (locale === 'es') {
    return {
      ...en,
      title: 'Eliminar cuenta',
      text:
        'Esto crea una solicitud de eliminación para cuentas particulares y de empresa. Los anuncios publicados se retiran de la búsqueda pública mientras Autorell revisa la solicitud. Los datos de pago, factura, seguridad y registros legales pueden conservarse cuando la ley lo exige.',
      confirmLabel: 'Escribe ELIMINAR para confirmar',
      confirmWord: 'ELIMINAR',
      button: 'Solicitar eliminación de cuenta',
      submitting: 'Enviando solicitud...',
      success: 'Hemos recibido tu solicitud. Ahora se cerrará la sesión.',
      error: 'No se pudo enviar la solicitud. Contacta con soporte si el problema continúa.',
    }
  }
  if (locale === 'en') return en
  return translatePublicObject(locale, en)
}
