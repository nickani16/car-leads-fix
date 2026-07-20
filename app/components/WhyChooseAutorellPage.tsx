import Link from 'next/link'
import { headers } from 'next/headers'
import type { Metadata } from 'next'
import PublicFooter from '@/app/components/PublicFooter'
import PublicHeader from '@/app/components/PublicHeader'
import {
  isPublicLanguage,
  localizePublicHref,
  type PublicLocale,
} from '@/lib/public-i18n'
import { cleanSeoText } from '@/lib/market-seo'

type BenefitsCopy = {
  metaTitle: string
  metaDescription: string
  eyebrow: string
  title: string
  intro: string
  primaryCta: string
  secondaryCta: string
  proof: string
  listingEyebrow: string
  freeBadge: string
  listingFields: readonly string[]
  listingStats: readonly string[]
  stepsTitle: string
  steps: readonly { title: string; text: string }[]
  comparisonEyebrow: string
  comparisonHeaders: readonly [string, string, string]
  compareTitle: string
  compareIntro: string
  comparison: readonly { label: string; autorell: string; old: string }[]
  valueTitle: string
  values: readonly { title: string; text: string }[]
  seoTitle: string
  seoText: string
  faqTitle: string
  faqs: readonly { question: string; answer: string }[]
  dealerTitle: string
  dealerText: string
  dealerCta: string
  supportTitle: string
  supportText: string
  supportCta: string
}

const copyByLocale: Record<'en' | 'sv', BenefitsCopy> = {
  sv: {
    metaTitle: 'Varför sälja på Autorell | Gratis fordonsannonser i Europa',
    metaDescription:
      'Sälj bil, husbil, motorcykel, lastbil och andra fordon på Autorell. Skapa gratis annons, nå köpare i Europa och betala bara för längre publicering eller extra synlighet.',
    eyebrow: 'Sälj på Autorell',
    title: 'Sälj ditt fordon gratis och nå köpare i flera europeiska marknader.',
    intro:
      'Autorell är byggt för privatpersoner och företag som vill publicera tydliga fordonsannonser utan krångliga steg, dolda avgifter eller onödig friktion.',
    primaryCta: 'Skapa gratis annons',
    secondaryCta: 'Se priser',
    proof: 'Gratis grundannons i 5 dagar. Betala bara när du vill annonsera längre eller få mer synlighet.',
    listingEyebrow: 'Autorell-annons',
    freeBadge: 'Gratis',
    listingFields: ['Märke eller tillverkare', 'Modell', 'Version / variant', 'Årsmodell', 'Pris'],
    listingStats: ['Bilder', 'Marknad', 'Publicera'],
    stepsTitle: 'Tre enkla steg till en publicerad annons',
    steps: [
      {
        title: 'Fyll i fordonet',
        text: 'Lägg in kategori, märke, modell, pris, plats och bilder i ett flöde som fungerar på både mobil och desktop.',
      },
      {
        title: 'Publicera gratis',
        text: 'Grundannonsen publiceras kostnadsfritt. Vill du ligga ute längre väljer du ett betalt paket innan publicering.',
      },
      {
        title: 'Få seriösa kontakter',
        text: 'Köpare kan hitta annonsen via sök, kategori och marknad. Du håller själv kontroll på pris, text och kontakt.',
      },
    ],
    compareTitle: 'Autorell jämfört med traditionella annonssajter',
    comparisonEyebrow: 'Jämförelse',
    comparisonHeaders: ['Område', 'Autorell', 'Traditionellt'],
    compareIntro:
      'Skillnaden ska kännas i själva flödet: tydligare annonser, lokala marknader, rätt valuta och en modernare väg från publicering till kontakt.',
    comparison: [
      { label: 'Privat annons', autorell: 'Gratis start i 5 dagar', old: 'Avgift ofta direkt' },
      { label: 'Synlighet', autorell: 'Betala bara vid behov', old: 'Svårare att förstå vad du får' },
      { label: 'Marknader', autorell: 'Byggt för Europa', old: 'Ofta en lokal marknad först' },
      { label: 'Företag', autorell: 'Manuellt flöde eller CSV-import', old: 'Mindre lagerkontroll' },
      { label: 'Mobil', autorell: 'Skapat för snabb publicering', old: 'Ofta längre gamla flöden' },
    ],
    valueTitle: 'Gör varje försäljning tydligare',
    values: [
      {
        title: 'Värt pengarna',
        text: 'Du kan börja gratis och välja extra exponering först när annonsen behöver mer räckvidd.',
      },
      {
        title: 'Värt tiden',
        text: 'Annonsflödet samlar det viktigaste först så att du snabbare kommer till en komplett annons.',
      },
      {
        title: 'Värt förtroendet',
        text: 'Verifieringar, moderering och rapportering hjälper marknadsplatsen att kännas tryggare för både köpare och säljare.',
      },
    ],
    seoTitle: 'Byggt för att säljare ska kunna hittas',
    seoText:
      'Autorells sidor är strukturerade för fordonskategorier, marknader och tydliga sökintentioner. Det gör att säljare kan möta köpare som söker efter bil, husbil, motorcykel, transportbil, lastbil, lantbruk och entreprenad på rätt språk och marknad.',
    faqTitle: 'Vanliga frågor om att sälja på Autorell',
    faqs: [
      {
        question: 'Är det gratis att sälja fordon på Autorell?',
        answer:
          'Ja. Grundannonsen är gratis i 5 dagar. Du betalar bara om du väljer längre publicering eller extra synlighet.',
      },
      {
        question: 'Vilka fordon kan jag annonsera?',
        answer:
          'Du kan annonsera bilar, transportbilar, motorcyklar, husbilar, husvagnar, lastbilar, lantbruksmaskiner och entreprenadmaskiner.',
      },
      {
        question: 'Kan företag använda Autorell?',
        answer:
          'Ja. Företag kan skapa annonser manuellt direkt i Autorell eller importera många fordon via CSV när lagret är större.',
      },
      {
        question: 'Måste jag välja ett betalt paket?',
        answer:
          'Nej. Betalda paket är frivilliga och används när du vill ha längre annonstid eller mer synlighet.',
      },
      {
        question: 'Fungerar sidan i flera länder?',
        answer:
          'Ja. Autorell är byggt för flera europeiska marknader med lokala språk, valutor och marknadssidor.',
      },
    ],
    dealerTitle: 'Säljer du fordon professionellt?',
    dealerText:
      'Samla annonser, team och lagerkontroll i ett företagskonto. Publicera manuellt när det passar, eller importera större lager via CSV.',
    dealerCta: 'Kom igång som företag',
    supportTitle: 'Har du en annan fråga?',
    supportText: 'Vi hjälper dig med konto, annonser, företagspaket och publicering.',
    supportCta: 'Besök hjälpcenter',
  },
  en: {
    metaTitle: 'Why sell on Autorell | Free vehicle listings in Europe',
    metaDescription:
      'Sell cars, motorhomes, motorcycles, trucks and other vehicles on Autorell. Create a free listing, reach European buyers and pay only for longer publishing or extra visibility.',
    eyebrow: 'Sell on Autorell',
    title: 'Sell your vehicle for free and reach buyers across European markets.',
    intro:
      'Autorell is built for private sellers and companies that want clear vehicle listings without confusing steps, hidden fees or unnecessary friction.',
    primaryCta: 'Create free listing',
    secondaryCta: 'View pricing',
    proof: 'Free core listing for 5 days. Pay only when you want a longer listing or more visibility.',
    listingEyebrow: 'Autorell listing',
    freeBadge: 'Free',
    listingFields: ['Make or manufacturer', 'Model', 'Version / variant', 'Model year', 'Price'],
    listingStats: ['Images', 'Market', 'Publish'],
    stepsTitle: 'Three simple steps to a published listing',
    steps: [
      {
        title: 'Enter the vehicle',
        text: 'Add category, make, model, price, location and images in a flow that works on mobile and desktop.',
      },
      {
        title: 'Publish for free',
        text: 'The core listing is free. Choose a paid package only if you want the listing to stay online longer.',
      },
      {
        title: 'Get serious contacts',
        text: 'Buyers can find the listing through search, category and market pages while you stay in control.',
      },
    ],
    compareTitle: 'Autorell compared with traditional listing sites',
    comparisonEyebrow: 'Comparison',
    comparisonHeaders: ['Signal', 'Autorell', 'Traditional'],
    compareIntro:
      'The difference should be visible in the product: clearer listings, local markets, correct currency and a modern route from publishing to contact.',
    comparison: [
      { label: 'Private listing', autorell: 'Free start for 5 days', old: 'Fees often start early' },
      { label: 'Visibility', autorell: 'Pay only when needed', old: 'Harder to see what you get' },
      { label: 'Markets', autorell: 'Built for Europe', old: 'Often local first' },
      { label: 'Business', autorell: 'Manual flow or CSV import', old: 'Less inventory control' },
      { label: 'Mobile', autorell: 'Made for fast publishing', old: 'Often longer old flows' },
    ],
    valueTitle: 'Make every sale clearer',
    values: [
      {
        title: 'Worth the money',
        text: 'Start for free and choose extra exposure only when the listing needs more reach.',
      },
      {
        title: 'Worth your time',
        text: 'The listing flow collects the most important information first so you can publish faster.',
      },
      {
        title: 'Worth the trust',
        text: 'Verification, moderation and reporting help the marketplace feel safer for buyers and sellers.',
      },
    ],
    seoTitle: 'Built so sellers can be found',
    seoText:
      'Autorell pages are structured around vehicle categories, markets and clear search intent. That helps sellers meet buyers searching for cars, motorhomes, motorcycles, vans, trucks, agricultural machinery and construction machinery in the right language and market.',
    faqTitle: 'Sell on Autorell FAQs',
    faqs: [
      {
        question: 'Is it free to sell a vehicle on Autorell?',
        answer:
          'Yes. The core listing is free for 5 days. You only pay if you choose longer publishing or extra visibility.',
      },
      {
        question: 'Which vehicles can I list?',
        answer:
          'You can list cars, vans, motorcycles, motorhomes, caravans, trucks, agricultural machinery and construction machinery.',
      },
      {
        question: 'Can companies use Autorell?',
        answer:
          'Yes. Companies can create listings manually in Autorell or import many vehicles by CSV when the inventory is larger.',
      },
      {
        question: 'Do I have to choose a paid package?',
        answer:
          'No. Paid packages are optional and used when you want a longer listing period or more visibility.',
      },
      {
        question: 'Does Autorell work in multiple countries?',
        answer:
          'Yes. Autorell is built for several European markets with local languages, currencies and market pages.',
      },
    ],
    dealerTitle: 'Do you sell vehicles professionally?',
    dealerText:
      'Bring listings, team access and inventory control into one business account. Publish manually when it fits, or import larger stock by CSV.',
    dealerCta: 'Start as a company',
    supportTitle: 'Got another question?',
    supportText: 'We can help with accounts, listings, business plans and publishing.',
    supportCta: 'Visit help center',
  },
}

export async function generateWhyChooseAutorellMetadata(localeOverride?: PublicLocale): Promise<Metadata> {
  const headerStore = await headers()
  const locale = localeOverride || getRequestedLocale(headerStore)
  const copy = getBenefitsCopy(locale)
  const canonical = `https://www.autorell.com${localizePublicHref(locale, '/benefits')}`

  return {
    title: cleanSeoText(copy.metaTitle, 62),
    description: cleanSeoText(copy.metaDescription, 158),
    alternates: { canonical },
    openGraph: {
      title: cleanSeoText(copy.metaTitle, 62),
      description: cleanSeoText(copy.metaDescription, 158),
      url: canonical,
      type: 'website',
    },
  }
}

export default async function WhyChooseAutorellPage({
  localeOverride,
  marketCodeOverride,
}: {
  localeOverride?: PublicLocale
  marketCodeOverride?: string
}) {
  const headerStore = await headers()
  const locale = localeOverride || getRequestedLocale(headerStore)
  const marketCode = marketCodeOverride || headerStore.get('x-autorell-market') || marketCodeForLocale(locale)
  const copy = getBenefitsCopy(locale)

  return (
    <main className="w-full overflow-x-hidden bg-[#f5f7fb] text-[#101828]">
      <PublicHeader locale={locale} marketCode={marketCode} />

      <section className="relative overflow-hidden bg-[#eef4ff]">
        <div className="absolute inset-x-0 top-0 h-px bg-[#cddcf2]" />
        <div className="mx-auto grid min-h-[680px] max-w-[var(--autorell-page-max)] items-center gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(360px,.78fr)] lg:py-20">
          <div className="relative z-10">
            <p className="text-xs font-semibold uppercase tracking-[.22em] text-[#0866ff]">{copy.eyebrow}</p>
            <h1 className="mt-7 max-w-5xl text-[44px] font-semibold leading-[.94] tracking-[-.055em] text-[#101828] sm:text-[78px] lg:text-[92px]">
              {copy.title}
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#526071] sm:text-xl sm:leading-9">{copy.intro}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href={localizePublicHref(locale, '/account/listings/new')}
                className="group inline-flex min-h-12 items-center justify-center rounded-[7px] bg-[#0866ff] px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#075ce5]"
              >
                {copy.primaryCta}
                <span className="ml-3 transition group-hover:translate-x-1">→</span>
              </Link>
              <Link
                href={localizePublicHref(locale, '/pricing')}
                className="inline-flex min-h-12 items-center justify-center rounded-[7px] border border-[#cbd8ea] bg-white px-5 text-sm font-semibold text-[#101828] transition hover:-translate-y-0.5 hover:border-[#0866ff] hover:text-[#0866ff]"
              >
                {copy.secondaryCta}
              </Link>
            </div>
            <p className="mt-5 max-w-xl text-sm leading-6 text-[#667085]">{copy.proof}</p>
          </div>

          <div className="relative z-10 rounded-[10px] border border-[#cbd8ea] bg-white p-4 shadow-[0_24px_80px_rgba(16,24,40,.08)] sm:p-5">
            <div className="rounded-[8px] border border-[#dce6f3] bg-[#f8fbff] p-4">
              <div className="flex items-center justify-between border-b border-[#dce6f3] pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#0866ff]">{copy.listingEyebrow}</p>
                  <p className="mt-2 text-2xl font-semibold tracking-[-.04em]">Audi A5 Avant</p>
                </div>
                <p className="rounded-full bg-[#e9f2ff] px-3 py-1 text-xs font-semibold text-[#0866ff]">{copy.freeBadge}</p>
              </div>
              <div className="grid gap-3 py-4">
                {copy.listingFields.map((label, index) => (
                  <div key={label} className="rounded-[7px] border border-[#d8e2ef] bg-white px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#7a8797]">{label}</p>
                    <p className="mt-1 text-sm font-medium text-[#101828]">
                      {['Audi', 'A5', 'Avant', '2024', '68 000'][index]}
                    </p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2 border-t border-[#dce6f3] pt-4">
                {copy.listingStats.map((label, index) => (
                  <div key={label} className="rounded-[6px] bg-white p-3 text-center">
                    <p className="text-2xl font-semibold text-[#0866ff]">{index + 1}</p>
                    <p className="mt-1 text-[11px] font-medium text-[#667085]">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-[var(--autorell-page-max)] px-5 sm:px-8">
          <h2 className="mx-auto max-w-4xl text-center text-[40px] font-semibold leading-[1.02] tracking-[-.05em] sm:text-6xl">
            {copy.stepsTitle}
          </h2>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {copy.steps.map((step, index) => (
              <article key={step.title} className="rounded-[8px] border border-[#dce6f3] bg-white p-5 shadow-[0_18px_55px_rgba(16,24,40,.055)] sm:p-6">
                <div className="mb-6 grid h-10 w-10 place-items-center rounded-[7px] bg-[#0866ff] text-sm font-semibold text-white">
                  {index + 1}
                </div>
                <h3 className="text-2xl font-semibold tracking-[-.035em]">{step.title}</h3>
                <p className="mt-4 text-base leading-7 text-[#526071]">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#dfe7f2] bg-[#f5f7fb] py-16 sm:py-24">
        <div className="mx-auto max-w-[var(--autorell-page-max)] px-5 sm:px-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#0866ff]">{copy.comparisonEyebrow}</p>
              <h2 className="mt-5 max-w-2xl text-4xl font-semibold leading-[1.04] tracking-[-.045em] sm:text-6xl">
                {copy.compareTitle}
              </h2>
              <p className="mt-6 max-w-xl text-base leading-8 text-[#526071]">{copy.compareIntro}</p>
            </div>
            <div className="overflow-hidden rounded-[8px] border border-[#dce6f3] bg-white shadow-[0_22px_70px_rgba(16,24,40,.06)]">
              <div className="grid grid-cols-[minmax(0,.75fr)_minmax(0,1fr)_minmax(0,1fr)] gap-3 border-b border-[#edf2f7] bg-[#f8fbff] px-4 py-4 text-xs font-semibold uppercase tracking-[.14em] text-[#7a8797] sm:px-6">
                {copy.comparisonHeaders.map((header) => (
                  <span key={header}>{header}</span>
                ))}
              </div>
              {copy.comparison.map((row) => (
                <div key={row.label} className="grid grid-cols-[minmax(0,.75fr)_minmax(0,1fr)_minmax(0,1fr)] gap-3 border-b border-[#edf2f7] px-4 py-4 text-sm last:border-b-0 sm:px-6">
                  <p className="font-semibold text-[#101828]">{row.label}</p>
                  <p className="font-medium text-[#0866ff]">{row.autorell}</p>
                  <p className="text-[#667085]">{row.old}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-[var(--autorell-page-max)] px-5 sm:px-8">
          <h2 className="text-center text-[40px] font-semibold leading-[1.03] tracking-[-.045em] sm:text-6xl">
            {copy.valueTitle}
          </h2>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {copy.values.map((item) => (
              <article key={item.title} className="text-center">
                <div className="mx-auto mb-6 h-14 w-14 rounded-[8px] border border-[#dce6f3] bg-[#f8fbff]" />
                <h3 className="text-2xl font-semibold tracking-[-.035em]">{item.title}</h3>
                <p className="mx-auto mt-4 max-w-sm text-base leading-7 text-[#526071]">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0866ff] py-16 text-white sm:py-24">
        <div className="mx-auto grid max-w-[var(--autorell-page-max)] gap-8 px-5 sm:px-8 lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)] lg:items-center">
          <h2 className="max-w-2xl text-4xl font-semibold leading-[1.03] tracking-[-.05em] sm:text-6xl">
            {copy.seoTitle}
          </h2>
          <p className="max-w-2xl text-lg leading-8 text-white/84">{copy.seoText}</p>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <h2 className="text-center text-[40px] font-semibold leading-[1.04] tracking-[-.045em] sm:text-6xl">
            {copy.faqTitle}
          </h2>
          <div className="mt-10 overflow-hidden rounded-[8px] border border-[#dce6f3]">
            {copy.faqs.map((faq) => (
              <details key={faq.question} className="group border-b border-[#edf2f7] bg-white last:border-b-0">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 text-lg font-semibold tracking-[-.02em] marker:hidden sm:px-6">
                  {faq.question}
                  <span className="text-2xl font-medium text-[#0866ff] transition group-open:rotate-45">+</span>
                </summary>
                <p className="px-5 pb-6 text-base leading-7 text-[#526071] sm:px-6">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#dfe7f2] bg-[#f5f7fb] py-16 sm:py-24">
        <div className="mx-auto grid max-w-[var(--autorell-page-max)] gap-8 px-5 sm:px-8 lg:grid-cols-2">
          <article className="rounded-[8px] border border-[#dce6f3] bg-white p-6 shadow-[0_18px_55px_rgba(16,24,40,.055)] sm:p-8">
            <h2 className="text-3xl font-semibold tracking-[-.04em]">{copy.dealerTitle}</h2>
            <p className="mt-5 text-base leading-8 text-[#526071]">{copy.dealerText}</p>
            <Link href={localizePublicHref(locale, '/business')} className="mt-7 inline-flex min-h-12 items-center rounded-[7px] bg-[#101828] px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5">
              {copy.dealerCta}
            </Link>
          </article>
          <article className="rounded-[8px] border border-[#dce6f3] bg-white p-6 shadow-[0_18px_55px_rgba(16,24,40,.055)] sm:p-8">
            <h2 className="text-3xl font-semibold tracking-[-.04em]">{copy.supportTitle}</h2>
            <p className="mt-5 text-base leading-8 text-[#526071]">{copy.supportText}</p>
            <Link href={localizePublicHref(locale, '/help-center')} className="mt-7 inline-flex min-h-12 items-center rounded-[7px] border border-[#cbd8ea] px-5 text-sm font-semibold text-[#101828] transition hover:border-[#0866ff] hover:text-[#0866ff]">
              {copy.supportCta}
            </Link>
          </article>
        </div>
      </section>

      <PublicFooter locale={locale} />
    </main>
  )
}

function getBenefitsCopy(locale: PublicLocale) {
  return locale === 'sv' ? copyByLocale.sv : copyByLocale.en
}

function getRequestedLocale(headerStore: Awaited<ReturnType<typeof headers>>): PublicLocale {
  const requested = headerStore.get('x-autorell-language') || 'en'
  if (requested === 'sv' || requested === 'de' || isPublicLanguage(requested)) {
    return requested
  }
  const pathname = headerStore.get('x-autorell-pathname') || ''
  const prefix = pathname.split('/').filter(Boolean)[0]
  const localeByPrefix: Record<string, PublicLocale> = {
    se: 'sv',
    de: 'de',
    at: 'at',
    be: 'be',
    fr: 'fr',
    es: 'es',
    it: 'it',
    pl: 'pl',
    nl: 'nl',
    fi: 'fi',
    dk: 'da',
  }
  return localeByPrefix[prefix] || 'en'
}

function marketCodeForLocale(locale: PublicLocale) {
  const codes: Record<PublicLocale, string> = {
    en: 'EU',
    sv: 'SE',
    de: 'DE',
    at: 'AT',
    be: 'BE',
    fr: 'FR',
    es: 'ES',
    it: 'IT',
    pl: 'PL',
    nl: 'NL',
    fi: 'FI',
    da: 'DK',
  }
  return codes[locale] || 'EU'
}
