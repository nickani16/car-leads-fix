'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import { ArrowRight, Check, Mail } from 'lucide-react'
import type { MarketplaceCategorySlug } from '@/lib/marketplace'
import { localizePublicHref, type PublicLocale } from '@/lib/public-locale'

const newsletterCopy = {
  sv: {
    eyebrow: 'Nyheter från Autorell',
    title: 'Få de viktigaste fordonsnyheterna i inkorgen.',
    text: 'Anmäl dig för marknadsnyheter, guider och utvalda fordon från Autorell. Kort, relevant och byggt för smartare fordonsaffärer.',
    formTitle: 'Prenumerera på Autorells nyhetsbrev',
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
    formTitle: 'Subscribe to the Autorell newsletter',
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
    formTitle: 'Autorell-Newsletter abonnieren',
    placeholder: 'Ihre E-Mail-Adresse',
    button: 'Jetzt anmelden',
    consent: 'Ich stimme Nachrichten und Angeboten von Autorell per E-Mail zu.',
    privacy: 'Datenschutzerklärung lesen',
    success: 'Vielen Dank! Sie erhalten jetzt Neuigkeiten von Autorell.',
    error: 'Die E-Mail-Adresse konnte nicht registriert werden. Bitte versuchen Sie es erneut.',
  },
  fr: {
    eyebrow: 'Actualités Autorell',
    title: 'Recevez les actualités véhicules importantes dans votre boîte mail.',
    text: 'Inscrivez-vous pour recevoir des tendances du marché, des guides et une sélection de véhicules Autorell. Court, pertinent et pensé pour de meilleures transactions.',
    formTitle: 'Abonnez-vous à la newsletter Autorell',
    placeholder: 'Votre adresse e-mail',
    button: 'Je m’inscris',
    consent: 'J’accepte de recevoir les actualités et offres d’Autorell par e-mail.',
    privacy: 'Lire notre politique de confidentialité',
    success: 'Merci ! Vous êtes inscrit aux actualités Autorell.',
    error: 'Nous n’avons pas pu enregistrer votre adresse e-mail. Réessayez.',
  },
  es: {
    eyebrow: 'Noticias de Autorell',
    title: 'Recibe las noticias de vehículos más importantes en tu correo.',
    text: 'Suscríbete para recibir novedades del mercado, guías y vehículos seleccionados de Autorell. Breve, relevante y pensado para mejores operaciones.',
    formTitle: 'Suscríbete al boletín de Autorell',
    placeholder: 'Tu correo electrónico',
    button: 'Suscribirme',
    consent: 'Acepto recibir noticias y ofertas de Autorell por correo electrónico.',
    privacy: 'Leer nuestra política de privacidad',
    success: '¡Gracias! Ya estás suscrito a las noticias de Autorell.',
    error: 'No pudimos registrar tu correo electrónico. Inténtalo de nuevo.',
  },
  it: {
    eyebrow: 'Notizie da Autorell',
    title: 'Ricevi le notizie più importanti sui veicoli nella tua casella.',
    text: 'Iscriviti per aggiornamenti di mercato, guide e veicoli selezionati da Autorell. Breve, rilevante e pensato per trattative più intelligenti.',
    formTitle: 'Iscriviti alla newsletter di Autorell',
    placeholder: 'Il tuo indirizzo e-mail',
    button: 'Iscrivimi',
    consent: 'Accetto di ricevere notizie e offerte da Autorell via e-mail.',
    privacy: 'Leggi la nostra informativa privacy',
    success: 'Grazie! Ora sei iscritto alle notizie Autorell.',
    error: 'Non siamo riusciti a registrare la tua e-mail. Riprova.',
  },
  nl: {
    eyebrow: 'Nieuws van Autorell',
    title: 'Ontvang het belangrijkste voertuignieuws in je inbox.',
    text: 'Schrijf je in voor marktupdates, gidsen en geselecteerde voertuigen van Autorell. Kort, relevant en gemaakt voor slimmere voertuigdeals.',
    formTitle: 'Meld je aan voor de Autorell-nieuwsbrief',
    placeholder: 'Je e-mailadres',
    button: 'Aanmelden',
    consent: 'Ik ga akkoord met nieuws en aanbiedingen van Autorell per e-mail.',
    privacy: 'Lees ons privacybeleid',
    success: 'Dank je! Je bent nu aangemeld voor Autorell-nieuws.',
    error: 'We konden je e-mailadres niet registreren. Probeer het opnieuw.',
  },
  pl: {
    eyebrow: 'Aktualności Autorell',
    title: 'Najważniejsze wiadomości motoryzacyjne prosto na e-mail.',
    text: 'Zapisz się, aby otrzymywać informacje rynkowe, poradniki i wybrane pojazdy od Autorell. Krótko, konkretnie i z myślą o lepszych transakcjach.',
    formTitle: 'Zapisz się do newslettera Autorell',
    placeholder: 'Twój adres e-mail',
    button: 'Zapisz mnie',
    consent: 'Zgadzam się otrzymywać wiadomości i oferty Autorell e-mailem.',
    privacy: 'Przeczytaj naszą politykę prywatności',
    success: 'Dziękujemy! Subskrybujesz teraz aktualności Autorell.',
    error: 'Nie udało się zapisać adresu e-mail. Spróbuj ponownie.',
  },
  da: {
    eyebrow: 'Nyheder fra Autorell',
    title: 'Få de vigtigste køretøjsnyheder i din indbakke.',
    text: 'Tilmeld dig markedsopdateringer, guides og udvalgte køretøjer fra Autorell. Kort, relevant og skabt til smartere handler.',
    formTitle: 'Tilmeld dig Autorells nyhedsbrev',
    placeholder: 'Din e-mailadresse',
    button: 'Tilmeld mig',
    consent: 'Jeg accepterer at modtage nyheder og tilbud fra Autorell via e-mail.',
    privacy: 'Læs vores privatlivspolitik',
    success: 'Tak! Du er nu tilmeldt Autorells nyheder.',
    error: 'Vi kunne ikke registrere din e-mailadresse. Prøv igen.',
  },
  fi: {
    eyebrow: 'Autorellin uutiset',
    title: 'Tärkeimmät ajoneuvouutiset suoraan sähköpostiisi.',
    text: 'Tilaa markkinapäivitykset, oppaat ja valitut ajoneuvot Autorelliltä. Lyhyesti, olennaisesti ja fiksumpia ajoneuvokauppoja varten.',
    formTitle: 'Tilaa Autorellin uutiskirje',
    placeholder: 'Sähköpostiosoitteesi',
    button: 'Tilaa',
    consent: 'Hyväksyn, että Autorell lähettää minulle uutisia ja tarjouksia sähköpostitse.',
    privacy: 'Lue tietosuojakäytäntömme',
    success: 'Kiitos! Olet nyt tilannut Autorellin uutiset.',
    error: 'Sähköpostiosoitteen rekisteröinti epäonnistui. Yritä uudelleen.',
  },
} as const

type NewsletterLanguage = keyof typeof newsletterCopy

const homeNewsletterImages: Record<MarketplaceCategorySlug, string> = {
  cars: '/newsletter-categories/cars.webp',
  vans: '/newsletter-categories/vans.webp',
  trucks: '/newsletter-categories/trucks.webp',
  motorcycles: '/newsletter-categories/motorcycles.webp',
  construction: '/newsletter-categories/construction.webp',
  motorhomes: '/newsletter-categories/motorhomes.webp',
  caravans: '/newsletter-categories/caravans.webp',
  agriculture: '/newsletter-categories/agriculture.webp',
  'electric-bikes': '/newsletter-categories/electric-bikes.webp',
}

const homeNewsletterImageLayout: Partial<Record<MarketplaceCategorySlug, { scale: number; x?: number; y?: number }>> = {
  cars: { scale: 0.94 },
  vans: { scale: 1.1 },
  trucks: { scale: 1.18 },
  motorcycles: { scale: 1.16 },
  construction: { scale: 1.2 },
  motorhomes: { scale: 1.08 },
  caravans: { scale: 0.98 },
  agriculture: { scale: 1.12 },
  'electric-bikes': { scale: 1.08 },
}

export default function NewsletterSignup({
  locale,
  category = 'footer',
  imageCategory = 'cars',
  variant = 'section',
}: {
  locale: PublicLocale
  category?: string
  imageCategory?: MarketplaceCategorySlug
  variant?: 'section' | 'footer' | 'home'
}) {
  const language = newsletterLanguage(locale)
  const copy = newsletterCopy[language]
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('loading')
    const formElement = event.currentTarget
    const form = new FormData(formElement)

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
      formElement.reset()
      setStatus('success')
      return true
    } catch {
      setStatus('error')
      return false
    }
  }

  if (variant === 'home') {
    const imageSrc = homeNewsletterImages[imageCategory] || homeNewsletterImages.cars
    const imageLayout = homeNewsletterImageLayout[imageCategory] || { scale: 1 }
    const imageTransform = `translate(${imageLayout.x || 0}px, ${imageLayout.y || 0}px) scale(${imageLayout.scale})`

    return (
      <div className="overflow-hidden border-y border-[#cfd8e4] bg-white px-5 py-8 sm:rounded-[8px] sm:border sm:px-7 sm:py-9">
        <p className="text-[12px] font-semibold uppercase text-[#0866ff]">{copy.eyebrow}</p>
        <h2 className="mt-2 max-w-[760px] text-[24px] font-semibold leading-tight text-[#101828] sm:text-[28px]">
          {copy.title}
        </h2>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,.78fr)_minmax(0,1.22fr)] lg:items-stretch">
          <div className="relative min-h-[286px] overflow-hidden rounded-[8px] bg-[#b8d3ff] px-5 pb-[150px] pt-5 sm:px-6 lg:min-h-[300px]">
            <p className="relative z-10 max-w-[390px] text-[15px] font-medium leading-6 text-[#1d2939] sm:text-[16px]">
              {copy.text}
            </p>
            <div className="absolute inset-x-0 bottom-0 h-[176px] sm:h-[190px]">
              <Image
                src={imageSrc}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 480px"
                className="object-contain object-bottom drop-shadow-[0_14px_16px_rgba(16,24,40,.16)]"
                style={{ transform: imageTransform, transformOrigin: 'bottom center' }}
              />
            </div>
          </div>

          <div className="flex min-w-0 flex-col justify-center py-1 lg:px-5">
            <h3 className="text-[20px] font-semibold leading-tight text-[#101828] sm:text-[22px]">
              {copy.formTitle}
            </h3>
            <NewsletterForm copy={copy} locale={locale} status={status} submit={submit} compact />
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
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0866ff]">{copy.eyebrow}</p>
          <h2 className="mt-4 max-w-2xl text-[34px] leading-[1.02] tracking-[-0.05em] text-[#101828] sm:text-[44px]">{copy.title}</h2>
          <p className="mt-4 max-w-xl text-sm leading-6 text-[#58677d] sm:text-base sm:leading-7">{copy.text}</p>
        </div>

        <div className="rounded-[22px] border border-white bg-white/90 p-4 shadow-[0_18px_45px_rgba(43,71,110,.1)] sm:p-5">
          <NewsletterForm copy={copy} locale={locale} status={status} submit={submit} />
        </div>
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

function NewsletterForm({
  copy,
  locale,
  status,
  submit,
  compact = false,
}: {
  copy: typeof newsletterCopy[NewsletterLanguage]
  locale: PublicLocale
  status: 'idle' | 'loading' | 'success' | 'error'
  submit: (event: FormEvent<HTMLFormElement>) => Promise<boolean>
  compact?: boolean
}) {
  const [emailValue, setEmailValue] = useState('')

  return (
    <form
      onSubmit={async (event) => {
        const succeeded = await submit(event)
        if (succeeded) setEmailValue('')
      }}
      className={compact ? 'mt-6' : ''}
    >
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div className={compact ? 'grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(160px,210px)]' : 'flex flex-col gap-3 sm:flex-row'}>
        <label className={compact ? 'relative flex min-h-12 items-center' : 'relative flex min-h-14 flex-1 items-center'}>
          <Mail className={`pointer-events-none absolute ${compact ? 'left-4 h-4 w-4' : 'left-4 h-5 w-5'} text-[#718096]`} />
          <span className="sr-only">{copy.placeholder}</span>
          {!emailValue ? (
            <span
              aria-hidden="true"
              className={`pointer-events-none absolute top-1/2 -translate-y-1/2 truncate font-normal text-[#7a8699] ${
                compact ? 'left-11 right-4 text-sm' : 'left-12 right-4 text-sm'
              }`}
            >
              {copy.placeholder}
            </span>
          ) : null}
          <input
            required
            type="email"
            name="email"
            autoComplete="email"
            aria-label={copy.placeholder}
            placeholder=""
            value={emailValue}
            onChange={(event) => setEmailValue(event.target.value)}
            className={compact
              ? 'h-12 w-full rounded-[8px] border border-[#b8c4d4] bg-white pl-11 pr-4 text-sm font-normal text-[#101828] outline-none transition focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10'
              : 'h-14 w-full rounded-[14px] border border-[#d7e0ec] bg-white pl-12 pr-4 text-sm font-normal text-[#101828] outline-none transition focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10'}
          />
        </label>
        <button
          type="submit"
          disabled={status === 'loading'}
          className={compact
            ? 'inline-flex min-h-12 items-center justify-center gap-2 rounded-[8px] bg-[#0866ff] px-6 text-sm font-semibold text-white transition hover:bg-[#075bd8] disabled:cursor-wait disabled:opacity-65'
            : 'inline-flex min-h-14 shrink-0 items-center justify-center gap-2 rounded-[14px] bg-[#0866ff] px-6 text-sm font-semibold text-white transition hover:bg-[#075bd8] disabled:cursor-wait disabled:opacity-65'}
        >
          {copy.button}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <label className={`${compact ? 'mt-5 max-w-[680px]' : 'mt-4'} flex items-start gap-3 text-xs leading-5 text-[#5d6b7d]`}>
        <input required type="checkbox" name="consent" className="mt-0.5 h-4 w-4 shrink-0 accent-[#0866ff]" />
        <span>
          {copy.consent}{' '}
          <Link href={localizePublicHref(locale, '/privacy')} className="font-semibold text-[#0866ff] underline underline-offset-2">
            {copy.privacy}
          </Link>
        </span>
      </label>

      <p aria-live="polite" className={`mt-4 flex min-h-5 items-center gap-2 text-sm font-semibold ${status === 'error' ? 'text-[#b42318]' : 'text-[#087b55]'}`}>
        {status === 'success' ? <Check className="h-4 w-4" /> : null}
        {status === 'success' ? copy.success : status === 'error' ? copy.error : ''}
      </p>
    </form>
  )
}

function newsletterLanguage(locale: PublicLocale): NewsletterLanguage {
  if (locale === 'sv' || locale === 'de' || locale === 'fr' || locale === 'es' || locale === 'it' || locale === 'nl' || locale === 'pl' || locale === 'da' || locale === 'fi') return locale
  return 'en'
}
