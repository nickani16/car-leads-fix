'use client'

import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Quote,
  ShieldCheck,
  Star,
} from 'lucide-react'
import { useEffect, useState } from 'react'

const questions = [
  {
    question: 'Vilka bilar tar Autorell emot?',
    answer:
      'Vi arbetar med en tydlig köpbox för plats, årsmodell, miltal och tekniskt skick. De aktuella gränserna visas när du registrerar bilen.',
  },
  {
    question: 'Är registrering och budgivning kostnadsfri?',
    answer:
      'Ja. Det kostar ingenting att registrera bilen, se kriterierna eller ta emot dealerbud.',
  },
  {
    question: 'Måste jag acceptera ett erbjudande?',
    answer:
      'Nej. Du bestämmer alltid själv om och när du vill sälja bilen.',
  },
  {
    question: 'Hur länge pågår budgivningen?',
    answer:
      'När fordonsprofilen har granskats kan den publiceras för en fokuserad budgivning på upp till 24 timmar.',
  },
  {
    question: 'Vad händer efter ett accepterat bud?',
    answer:
      'Avtal och nästa steg dokumenteras. Bilen behöver motsvara deklarationen innan betalning, hämtning och export kan slutföras.',
  },
  {
    question: 'Vilka personuppgifter ser bilhandlarna?',
    answer:
      'Under budgivningen bedömer handlarna fordonsprofilen, inte dina privata kontaktuppgifter. Ditt namn, telefonnummer, din e-post och andra känsliga uppgifter visas inte för handlarna. Kontaktuppgifter delas först när det behövs för en affär som du själv har valt att gå vidare med.',
  },
]

// Replace these examples with verified customer reviews before launch.
const testimonials = [
  {
    quote:
      'Jag uppskattade att processen var tydlig från början och att jag själv kunde bestämma när erbjudandet kändes rätt.',
    name: 'Kundomdöme',
    detail: 'Bil såld via Autorell',
  },
  {
    quote:
      'Registreringen gick snabbt och jag fick hjälp när jag hade frågor. En betydligt enklare upplevelse än jag hade väntat mig.',
    name: 'Kundomdöme',
    detail: 'Bil såld via Autorell',
  },
  {
    quote:
      'Det kändes tryggt att bilen nådde flera professionella köpare utan att jag behövde hantera kontakten själv.',
    name: 'Kundomdöme',
    detail: 'Bil såld via Autorell',
  },
  {
    quote:
      'Jag fick en tydlig bild av marknadens intresse och kunde ta beslutet i min egen takt.',
    name: 'Kundomdöme',
    detail: 'Bud mottagna via Autorell',
  },
  {
    quote:
      'All information fanns samlad och jag slapp lägga tid på flera separata kontakter.',
    name: 'Kundomdöme',
    detail: 'Bil presenterad via Autorell',
  },
  {
    quote:
      'Det bästa var kombinationen av en digital process och möjligheten att få personlig hjälp.',
    name: 'Kundomdöme',
    detail: 'Bilägare hos Autorell',
  },
]

const tickerReviews = [
  'Tydlig process från start till mål',
  'Snabb och personlig återkoppling',
  'Enkelt att registrera bilen',
  'Tryggt att jämföra marknadens intresse',
  'Smidig kontakt hela vägen',
]

export default function FaqTestimonials() {
  const [openQuestion, setOpenQuestion] = useState(0)
  const [activeReview, setActiveReview] = useState(0)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveReview((current) => (current + 1) % testimonials.length)
    }, 6500)

    return () => window.clearInterval(interval)
  }, [])

  const showReview = (index: number) => {
    setActiveReview((index + testimonials.length) % testimonials.length)
  }

  return (
    <section className="relative overflow-hidden bg-[#f8faf9] pb-12 pt-16 sm:pb-16 sm:pt-20">
      <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-[#dcecf3]/70 blur-3xl" />
      <div className="absolute -right-24 bottom-24 h-80 w-80 rounded-full bg-[#efe7d8]/65 blur-3xl" />

      <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
        <div className="relative grid gap-4 lg:grid-cols-[1.08fr_.92fr] lg:gap-5">
          <div className="rounded-[24px] border border-[#e0e6e5] bg-white p-6 shadow-[0_24px_75px_rgba(32,33,36,.06)] sm:rounded-[30px] sm:p-10 lg:p-12">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[#e4f1f6] text-[#4a7c91]">
                <ShieldCheck className="h-[18px] w-[18px]" />
              </span>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#65767d]">
                Vanliga frågor
              </p>
            </div>
            <h2 className="mt-6 max-w-xl text-[36px] leading-[1.04] tracking-[-0.045em] text-[#202124] sm:text-[48px]">
              Tydliga svar före ditt beslut.
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-7 text-[#68787e] sm:text-base">
              Det viktigaste om fordonskriterier, europeisk budgivning,
              kontroll, betalning och export.
            </p>

            <div className="mt-8 space-y-2">
              {questions.map((item, index) => {
                const isOpen = openQuestion === index

                return (
                  <div
                    key={item.question}
                    className={`overflow-hidden rounded-[15px] border transition-colors duration-300 ${
                      isOpen
                        ? 'border-[#c4dce6] bg-[#f2f8fa]'
                        : 'border-[#e4e8e7] bg-white hover:border-[#ccdadd]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenQuestion(isOpen ? -1 : index)}
                      className="flex w-full items-center gap-4 px-4 py-4 text-left text-[14px] font-medium text-[#303638] sm:px-5 sm:text-[15px]"
                      aria-expanded={isOpen}
                    >
                      <span className="text-[10px] font-semibold tracking-[0.14em] text-[#91a0a6]">
                        0{index + 1}
                      </span>
                      <span className="flex-1">{item.question}</span>
                      <span
                        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition ${
                          isOpen
                            ? 'bg-[#242424] text-white'
                            : 'bg-[#edf2f2] text-[#58696f]'
                        }`}
                      >
                        <ChevronDown
                          className={`h-3.5 w-3.5 transition-transform duration-300 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </span>
                    </button>
                    <div
                      className={`grid transition-[grid-template-rows,opacity] duration-300 ${
                        isOpen
                          ? 'grid-rows-[1fr] opacity-100'
                          : 'grid-rows-[0fr] opacity-0'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="max-w-xl px-4 pb-5 pl-[52px] text-sm leading-7 text-[#607178] sm:px-5 sm:pl-[61px]">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="relative flex min-h-[520px] flex-col justify-between overflow-hidden rounded-[24px] border border-[#cfe1e8] bg-[#dceef5] px-6 py-9 text-[#202124] shadow-[0_24px_75px_rgba(60,102,119,.1)] sm:rounded-[30px] sm:px-10 sm:py-12 lg:px-12">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border-[55px] border-white/35" />
            <div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-white/45 blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#4e7484]">
                  Kundberättelser
                </p>
                <span className="grid h-11 w-11 place-items-center rounded-full bg-white/55 text-[#4f7f94]">
                  <Quote className="h-5 w-5" />
                </span>
              </div>

              <div
                className="mt-12 flex gap-1 text-[#cc9b3d]"
                aria-label="5 av 5 stjärnor"
              >
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="h-4 w-4 fill-current" />
                ))}
              </div>

              <blockquote className="mt-7 max-w-lg text-[26px] leading-[1.38] tracking-[-0.035em] sm:text-[32px]">
                “{testimonials[activeReview].quote}”
              </blockquote>
            </div>

            <div className="relative mt-12">
              <div className="mb-6 flex gap-2">
                {testimonials.map((testimonial, index) => (
                  <button
                    key={testimonial.quote}
                    type="button"
                    onClick={() => showReview(index)}
                    aria-label={`Visa kundberättelse ${index + 1}`}
                    className={`h-1.5 rounded-full transition-all ${
                      activeReview === index
                        ? 'w-8 bg-[#356b82]'
                        : 'w-1.5 bg-[#7599a8]/45'
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-end justify-between gap-6 border-t border-[#a9c9d5]/60 pt-6">
                <div>
                  <p className="font-semibold text-[#26363d]">
                    {testimonials[activeReview].name}
                  </p>
                  <p className="mt-1 text-sm text-[#5f7b87]">
                    {testimonials[activeReview].detail}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => showReview(activeReview - 1)}
                    aria-label="Föregående omdöme"
                    className="grid h-11 w-11 place-items-center rounded-full border border-[#9ebdca] bg-white/35 text-[#315f73] transition hover:bg-white"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => showReview(activeReview + 1)}
                    aria-label="Nästa omdöme"
                    className="grid h-11 w-11 place-items-center rounded-full bg-[#242424] text-white transition hover:bg-[#111111]"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30">
              <div
                key={activeReview}
                className="h-full origin-left bg-[#4d879f] motion-safe:animate-[review-progress_6.5s_linear]"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="relative mt-8 sm:mt-10">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[#f8faf9] to-transparent sm:w-28" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[#f8faf9] to-transparent sm:w-28" />
        <div className="testimonial-track flex w-max items-stretch gap-3 py-2">
          {[...tickerReviews, ...tickerReviews].map((review, index) => (
            <div
              key={`${review}-${index}`}
              className="flex min-w-[285px] items-center gap-4 rounded-full border border-[#dfe6e5] bg-white px-5 py-4 shadow-[0_10px_30px_rgba(32,33,36,.045)] sm:min-w-[350px] sm:px-6"
            >
              <div className="flex shrink-0 gap-0.5 text-[#d2a34b]">
                {Array.from({ length: 5 }).map((_, star) => (
                  <Star key={star} className="h-3 w-3 fill-current" />
                ))}
              </div>
              <p className="text-sm text-[#4e5c61]">{review}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
