'use client'

import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { FormEvent, useState } from 'react'

export default function BusinessFleetForm() {
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSending(true)
    setError('')

    const form = event.currentTarget
    const data = new FormData(form)
    const company = String(data.get('company') || '')

    data.set('subject', `Företagsförsäljning – ${company}`)
    data.set(
      'message',
      [
        `Företag: ${company}`,
        `Antal fordon: ${data.get('fleet_size') || 'Ej angivet'}`,
        `Typ av fordon: ${data.get('vehicle_type') || 'Ej angivet'}`,
        `Önskad tidsplan: ${data.get('timeline') || 'Ej angivet'}`,
        '',
        'Övrig information:',
        String(data.get('details') || 'Ej angivet'),
      ].join('\n'),
    )

    const response = await fetch('/api/contact', {
      method: 'POST',
      body: data,
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
      <div className="flex min-h-[520px] min-w-0 flex-col items-center justify-center bg-white p-6 text-center sm:min-h-[610px] sm:p-12">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-[#B4D9EF]">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <p className="mt-8 text-xs font-medium uppercase tracking-[0.18em] text-[#71818a]">
          Förfrågan mottagen
        </p>
        <h2 className="mt-3 max-w-md break-words text-[28px] tracking-[-0.04em] sm:text-3xl">
          Vi återkommer med ett första upplägg.
        </h2>
        <p className="mt-4 max-w-md leading-7 text-[#65737b]">
          En ansvarig kontaktperson går igenom fordonsvolymen och kontaktar er
          för nästa steg.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="min-w-0 bg-white/95 p-5 backdrop-blur sm:p-9 lg:p-10">
      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#71818a]">
          Starta ett pilotflöde
        </p>
        <h2 className="mt-3 break-words text-[27px] leading-tight tracking-[-0.04em] text-[#202124] sm:text-3xl">
          Beskriv volymen. Vi föreslår nästa steg.
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-[#65737b]">
          Börja med en mindre portfölj eller ett återkommande flöde. Ingen
          bindning och ingen lång implementation.
        </p>
      </div>

      <div className="grid min-w-0 gap-5 sm:grid-cols-2">
        <Field label="Företagsnamn" name="company" required />
        <Field
          label="Kontaktperson"
          name="name"
          autoComplete="name"
          required
        />
        <Field
          label="E-post"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
        <Field
          label="Telefon"
          name="phone"
          type="tel"
          autoComplete="tel"
          required
        />
        <Select
          label="Ungefärligt antal fordon"
          name="fleet_size"
          options={['1–5', '6–20', '21–50', '51–100', '100+']}
        />
        <Select
          label="Typ av fordon"
          name="vehicle_type"
          options={[
            'Personbilar',
            'Transportbilar',
            'Blandad fordonsflotta',
            'Leasingreturer',
            'Annat',
          ]}
        />
        <label className="block min-w-0 sm:col-span-2">
          <span className="mb-2 block text-sm text-[#3d4247]">
            Önskad tidsplan
          </span>
          <select name="timeline" required className="contact-control">
            <option value="">Välj tidsplan</option>
            <option value="Så snart som möjligt">Så snart som möjligt</option>
            <option value="Inom 1–3 månader">Inom 1–3 månader</option>
            <option value="Inom 3–6 månader">Inom 3–6 månader</option>
            <option value="Löpande behov">Löpande behov</option>
            <option value="Utforskar alternativ">Utforskar alternativ</option>
          </select>
        </label>
      </div>

      <label className="mt-5 block min-w-0">
        <span className="mb-2 block text-sm text-[#3d4247]">
          Övrig information
        </span>
        <textarea
          name="details"
          rows={5}
          placeholder="Exempelvis bilmärken, modellår, geografisk placering eller särskilda önskemål."
          className="contact-control resize-none"
        />
      </label>

      <label className="mt-5 flex min-w-0 items-start gap-3 text-xs leading-5 text-[#72777c]">
        <input
          type="checkbox"
          name="privacy"
          required
          className="mt-1 h-4 w-4 accent-[#242424]"
        />
        <span className="min-w-0 break-words">
          Jag har läst{' '}
          <Link href="/integritet" target="_blank" className="underline">
            integritetspolicyn
          </Link>{' '}
          och godkänner att Autorell kontaktar mig om denna förfrågan.
        </span>
      </label>

      {error && (
        <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={sending}
        className="mt-7 inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-[#242424] px-8 text-sm font-medium text-white transition hover:bg-[#111111] disabled:cursor-wait disabled:opacity-60 sm:w-auto"
      >
        {sending ? 'Skickar...' : 'Få ett konkret pilotupplägg'}
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
    <label className="block min-w-0">
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

function Select({
  label,
  name,
  options,
}: {
  label: string
  name: string
  options: string[]
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-sm text-[#3d4247]">{label}</span>
      <select name={name} required className="contact-control">
        <option value="">Välj ett alternativ</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}
