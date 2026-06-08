'use client'

import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { FormEvent, useState } from 'react'

export default function ContactForm() {
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSending(true)
    setError('')

    const form = event.currentTarget
    const response = await fetch('/api/contact', {
      method: 'POST',
      body: new FormData(form),
    })

    const result = await response.json().catch(() => ({}))
    setSending(false)

    if (!response.ok) {
      setError(result.error || 'Något gick fel. Försök igen.')
      return
    }

    form.reset()
    setSent(true)
  }

  if (sent) {
    return (
      <div className="flex min-h-[520px] flex-col items-center justify-center bg-white p-8 text-center sm:p-12">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-[#B4D9EF] text-[#242424]">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h2 className="mt-7 text-3xl tracking-[-0.035em] text-[#202124]">
          Tack för ditt meddelande.
        </h2>
        <p className="mt-4 max-w-md leading-7 text-[#66717b]">
          Vi har tagit emot din fråga och återkommer så snart vi kan.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-8 rounded-full border border-[#d7d7d2] px-6 py-3 text-sm"
        >
          Skicka ett nytt meddelande
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-7 sm:p-10 lg:p-12">
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Namn" name="name" autoComplete="name" required />
        <Field label="E-post" name="email" type="email" autoComplete="email" required />
        <Field label="Telefon" name="phone" type="tel" autoComplete="tel" />
        <label className="block">
          <span className="mb-2 block text-sm text-[#3d4247]">Vad gäller din fråga?</span>
          <select name="subject" required className="contact-control">
            <option value="">Välj ett ämne</option>
            <option value="Sälja bil">Sälja bil</option>
            <option value="Pågående ärende">Pågående ärende</option>
            <option value="Bilhandlare">Bilhandlare</option>
            <option value="Teknisk hjälp">Teknisk hjälp</option>
            <option value="Övrigt">Övrigt</option>
          </select>
        </label>
      </div>

      <label className="mt-6 block">
        <span className="mb-2 block text-sm text-[#3d4247]">Meddelande</span>
        <textarea
          name="message"
          required
          rows={7}
          placeholder="Berätta hur vi kan hjälpa dig..."
          className="contact-control resize-none"
        />
      </label>

      <label className="mt-5 flex items-start gap-3 text-xs leading-5 text-[#72777c]">
        <input type="checkbox" name="privacy" required className="mt-1 h-4 w-4 accent-[#242424]" />
        Jag godkänner att Autorell behandlar mina uppgifter för att besvara min fråga.
      </label>

      {error && (
        <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <button
        type="submit"
        disabled={sending}
        className="mt-7 inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#242424] px-8 text-white transition hover:bg-[#111111] disabled:cursor-wait disabled:opacity-60"
      >
        {sending ? 'Skickar...' : 'Skicka meddelande'}
        {!sending && <ArrowRight className="h-4 w-4" />}
      </button>
    </form>
  )
}

function Field({
  label,
  name,
  type = 'text',
  autoComplete,
  required = false,
}: {
  label: string
  name: string
  type?: string
  autoComplete?: string
  required?: boolean
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-[#3d4247]">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        className="contact-control"
      />
    </label>
  )
}
