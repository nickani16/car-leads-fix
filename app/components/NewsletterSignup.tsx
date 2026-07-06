'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import { ArrowRight, Check, Mail } from 'lucide-react'
import { localizePublicHref, type PublicLocale } from '@/lib/public-i18n'

const newsletterCopy = {
  sv: {
    eyebrow: 'Nyheter från Autorell',
    title: 'Få de viktigaste fordonsnyheterna i inkorgen.',
    text: 'Anmäl dig för marknadsnyheter, guider och utvalda fordon från Autorell. Kort, relevant och byggt för smartare fordonsaffärer.',
    placeholder: 'Din e-postadress',
    button: 'Anmäl mig',
    consent: 'Jag godkänner att Autorell skickar nyheter och erbjudanden via e-post.',
    privacy: 'Läs vår integritetspolicy',
    success: 'Tack! Du är nu anmäld till Autorells nyhetsbrev.',
    error: 'Det gick inte att registrera e-postadressen. Försök igen.',
  },
  en: {
    eyebrow: 'News from Autorell',
    title: 'Get the most important vehicle news in your inbox.',
    text: 'Sign up for market updates, guides and selected vehicles from Autorell. Short, relevant and built for smarter vehicle deals.',
    placeholder: 'Your email address',
    button: 'Sign me up',
    consent: 'I agree to receive news and offers from Autorell by email.',
    privacy: 'Read our privacy policy',
    success: 'Thank you! You are now subscribed to Autorell news.',
    error: 'We could not register your email. Please try again.',
  },
  de: {
    eyebrow: 'Neuigkeiten von Autorell',
    title: 'Die wichtigsten Fahrzeug-News direkt ins Postfach.',
    text: 'Erhalten Sie Marktupdates, Ratgeber und ausgewählte Fahrzeuge von Autorell. Kurz, relevant und für bessere Fahrzeuggeschäfte gemacht.',
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
  category = 'footer',
  variant = 'section',
}: {
  locale: PublicLocale
  category?: string
  variant?: 'section' | 'footer' | 'home'
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

  if (variant === 'home') {
    return (
      <div className="relative overflow-hidden rounded-[20px] bg-[#f5f5f5] shadow-[0_18px_48px_rgba(16,24,40,.06)]">
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[34%] bg-[#0866ff] [clip-path:polygon(21%_0,100%_0,100%_100%,0_100%)] lg:block" />
        <div className="grid min-h-[292px] gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_410px] lg:items-center lg:p-10">
          <div className="relative z-10 max-w-[650px]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0866ff]">
              {copy.eyebrow}
            </p>
            <h2 className="mt-3 max-w-[590px] text-[30px] leading-[1.05] tracking-[-0.045em] text-[#101828] sm:text-[38px]">
              {copy.title}
            </h2>
            <p className="mt-4 max-w-[610px] text-sm leading-7 text-[#344054]">
              {copy.text}
            </p>

            <div className="relative mt-5 h-[150px] overflow-hidden rounded-[14px] bg-[#0866ff] lg:hidden">
              <div className="absolute inset-y-0 left-0 w-[58%] bg-white [clip-path:polygon(0_0,100%_0,82%_100%,0_100%)]" />
              <Image
                src="/autorell-newsletter-car-cutout.png"
                alt=""
                fill
                sizes="340px"
                className="relative object-contain object-center drop-shadow-[0_14px_18px_rgba(16,24,40,.16)]"
              />
            </div>

            <form onSubmit={submit} className="mt-6">
              <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
              <div className="grid gap-3 sm:grid-cols-[minmax(0,340px)_240px]">
                <label className="relative flex min-h-12 items-center">
                  <Mail className="pointer-events-none absolute left-4 h-4 w-4 text-[#718096]" />
                  <span className="sr-only">{copy.placeholder}</span>
                  <input
                    required
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder={copy.placeholder}
                    className="h-12 w-full rounded-[8px] border border-[#b8c4d4] bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10"
                  />
                </label>
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[8px] bg-[#0866ff] px-6 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(8,102,255,.18)] transition hover:bg-[#075bd8] disabled:cursor-wait disabled:opacity-65"
                >
                  {copy.button}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <label className="mt-5 flex max-w-[680px] items-start gap-3 text-xs leading-5 text-[#5d6b7d]">
                <input required type="checkbox" name="consent" className="mt-0.5 h-4 w-4 shrink-0 accent-[#0866ff]" />
                <span>
                  {copy.consent}{' '}
                  <Link href={localizePublicHref(locale, '/privacy')} className="font-semibold text-[#0866ff] underline underline-offset-2">
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

          <div className="relative z-10 hidden min-h-[230px] lg:block">
            <Image
              src="/autorell-newsletter-car-cutout.png"
              alt=""
              fill
              sizes="410px"
              className="object-contain object-center drop-shadow-[0_18px_24px_rgba(16,24,40,.18)]"
            />
          </div>
        </div>
      </div>
    )
  }

  const content = (
    <div className={`relative mx-auto overflow-hidden border border-[#cfe0fb] bg-[linear-gradient(135deg,#edf5ff_0%,#f8fbff_52%,#eef9f5_100%)] ${
      variant === 'footer'
        ? 'max-w-none rounded-[24px] px-5 py-8 sm:px-8 lg:px-10'
        : 'max-w-[var(--autorell-page-max)] rounded-[30px] px-6 py-10 sm:px-10 sm:py-12 lg:px-14'
    }`}>
      <div className="pointer-events-none absolute -right-20 -top-24 hidden h-64 w-64 rounded-full border-[46px] border-white/65 lg:block" aria-hidden="true" />
      <div className="relative grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0866ff]">
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
              className="inline-flex min-h-14 shrink-0 items-center justify-center gap-2 rounded-[14px] bg-[#0866ff] px-6 text-sm font-semibold text-white transition hover:bg-[#075bd8] disabled:cursor-wait disabled:opacity-65"
            >
              {copy.button}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <label className="mt-4 flex items-start gap-3 text-xs leading-5 text-[#5d6b7d]">
            <input required type="checkbox" name="consent" className="mt-0.5 h-4 w-4 shrink-0 accent-[#0866ff]" />
            <span>
              {copy.consent}{' '}
              <Link href={localizePublicHref(locale, '/privacy')} className="font-semibold text-[#0866ff] underline underline-offset-2">
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
  )

  if (variant === 'footer') return content

  return (
    <section className="bg-white px-5 pb-16 pt-3 sm:px-8 sm:pb-20">
      {content}
    </section>
  )
}
