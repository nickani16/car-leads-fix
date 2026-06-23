'use client'

import { ArrowRight, Check, Mail } from 'lucide-react'
import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import type { PublicLocale } from '@/lib/public-i18n'

const newsletterCopy = {
  sv: {
    eyebrow: 'Nyheter från Autorell',
    title: 'Få marknadsnyheter och smartare fordonsaffärer i inkorgen.',
    text: 'Anmäl dig för relevanta nyheter, guider och utvalda kampanjer från Autorell. Inget brus.',
    placeholder: 'Din e-postadress',
    button: 'Anmäl mig',
    consent: 'Jag godkänner att Autorell skickar nyheter och erbjudanden via e-post.',
    privacy: 'Läs vår integritetspolicy',
    success: 'Tack! Du är nu anmäld till Autorells nyhetsbrev.',
    error: 'Det gick inte att registrera e-postadressen. Försök igen.',
  },
  en: {
    eyebrow: 'News from Autorell',
    title: 'Get marketplace news and smarter vehicle deals in your inbox.',
    text: 'Sign up for relevant news, guides and selected campaigns from Autorell. No noise.',
    placeholder: 'Your email address',
    button: 'Sign me up',
    consent: 'I agree to receive news and offers from Autorell by email.',
    privacy: 'Read our privacy policy',
    success: 'Thank you! You are now subscribed to Autorell news.',
    error: 'We could not register your email. Please try again.',
  },
  de: {
    eyebrow: 'Neuigkeiten von Autorell',
    title: 'Marktplatz-News und bessere Fahrzeuggeschäfte direkt ins Postfach.',
    text: 'Erhalten Sie relevante Neuigkeiten, Ratgeber und ausgewählte Kampagnen von Autorell.',
    placeholder: 'Ihre E-Mail-Adresse',
    button: 'Jetzt anmelden',
    consent: 'Ich stimme Nachrichten und Angeboten von Autorell per E-Mail zu.',
    privacy: 'Datenschutzerklärung lesen',
    success: 'Vielen Dank! Sie erhalten jetzt Neuigkeiten von Autorell.',
    error: 'Die E-Mail-Adresse konnte nicht registriert werden. Bitte versuchen Sie es erneut.',
  },
} as const

export default function NewsletterSignup({
  locale,
  category,
}: {
  locale: PublicLocale
  category: string
}) {
  const language = locale === 'sv' || locale === 'de' ? locale : 'en'
  const copy = newsletterCopy[language]
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('loading')
    const form = new FormData(event.currentTarget)

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.get('email'),
          consent: form.get('consent') === 'on',
          website: form.get('website'),
          locale,
          category,
          sourceUrl: window.location.href,
        }),
      })

      if (!response.ok) throw new Error('Newsletter request failed')
      event.currentTarget.reset()
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="bg-white px-5 pb-16 pt-3 sm:px-8 sm:pb-20">
      <div className="relative mx-auto max-w-[1280px] overflow-hidden rounded-[30px] border border-[#cfe0fb] bg-[linear-gradient(135deg,#edf5ff_0%,#f8fbff_52%,#eef9f5_100%)] px-6 py-10 sm:px-10 sm:py-12 lg:px-14">
        <div className="pointer-events-none absolute -right-20 -top-24 hidden h-64 w-64 rounded-full border-[46px] border-white/65 lg:block" aria-hidden="true" />
        <div className="relative grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0866ff]">
              {copy.eyebrow}
            </p>
            <h2 className="mt-4 max-w-2xl text-[34px] leading-[1.02] tracking-[-0.05em] text-[#101828] sm:text-[44px]">
              {copy.title}
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-[#58677d] sm:text-base sm:leading-7">
              {copy.text}
            </p>
          </div>

          <form onSubmit={submit} className="rounded-[22px] border border-white bg-white/90 p-4 shadow-[0_18px_45px_rgba(43,71,110,.1)] sm:p-5">
            <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="relative flex min-h-14 flex-1 items-center">
                <Mail className="pointer-events-none absolute left-4 h-5 w-5 text-[#718096]" />
                <span className="sr-only">{copy.placeholder}</span>
                <input
                  required
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder={copy.placeholder}
                  className="h-14 w-full rounded-[14px] border border-[#d7e0ec] bg-white pl-12 pr-4 text-sm outline-none transition focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10"
                />
              </label>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="inline-flex min-h-14 shrink-0 items-center justify-center gap-2 rounded-[14px] bg-[#0866ff] px-6 text-sm font-bold text-white transition hover:bg-[#075bd8] disabled:cursor-wait disabled:opacity-65"
              >
                {copy.button}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <label className="mt-4 flex items-start gap-3 text-xs leading-5 text-[#5d6b7d]">
              <input required type="checkbox" name="consent" className="mt-0.5 h-4 w-4 shrink-0 accent-[#0866ff]" />
              <span>
                {copy.consent}{' '}
                <Link href="/integritet" className="font-semibold text-[#0866ff] underline underline-offset-2">
                  {copy.privacy}
                </Link>
              </span>
            </label>

            <p aria-live="polite" className={`mt-4 flex min-h-5 items-center gap-2 text-sm font-semibold ${
              status === 'error' ? 'text-[#b42318]' : 'text-[#087b55]'
            }`}>
              {status === 'success' ? <Check className="h-4 w-4" /> : null}
              {status === 'success' ? copy.success : status === 'error' ? copy.error : ''}
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}
