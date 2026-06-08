'use client'

import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Quote,
  Star,
} from 'lucide-react'
import { useEffect, useState } from 'react'

const questions = [
  {
    question: 'Hur värderas min bil?',
    answer:
      'Vi använder informationen du lämnar för att presentera bilen för relevanta handlare. Intresset från marknaden hjälper oss att hitta ett aktuellt och konkurrenskraftigt pris.',
  },
  {
    question: 'Är värderingen kostnadsfri?',
    answer:
      'Ja. Det kostar ingenting att registrera bilen eller ta emot ett erbjudande.',
  },
  {
    question: 'Måste jag acceptera ett erbjudande?',
    answer:
      'Nej. Du bestämmer alltid själv om och när du vill sälja bilen.',
  },
  {
    question: 'Hur lång tid tar processen?',
    answer:
      'Det tar vanligtvis några minuter att registrera bilen. Därefter matchas den med relevanta köpare och budgivningen kan pågå i upp till 24 timmar.',
  },
  {
    question: 'Hur fungerar betalning och överlämning?',
    answer:
      'När du accepterat ett erbjudande hjälper vi dig vidare med nästa steg och ser till att processen blir tydlig och trygg.',
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
    <section className="overflow-hidden bg-[#f8f3e9] py-24 sm:py-32">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
        <div className="grid overflow-hidden border border-[#e4e0d9] bg-white lg:grid-cols-[1.08fr_.92fr]">
          <div className="px-6 py-12 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#242424]">
              Vanliga frågor
            </p>
            <h2 className="mt-5 text-4xl tracking-[-0.04em] text-[#202124] sm:text-5xl">
              Bra att veta innan du börjar.
            </h2>

            <div className="mt-10 border-t border-[#dce3e8]">
              {questions.map((item, index) => {
                const isOpen = openQuestion === index

                return (
                  <div key={item.question} className="border-b border-[#dce3e8]">
                    <button
                      type="button"
                      onClick={() => setOpenQuestion(isOpen ? -1 : index)}
                      className="flex w-full items-center justify-between gap-6 py-5 text-left text-[15px] font-normal text-[#303030]"
                      aria-expanded={isOpen}
                    >
                      {item.question}
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-[#242424] transition-transform duration-300 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    <div
                      className={`grid transition-[grid-template-rows] duration-300 ${
                        isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="max-w-xl pb-6 text-sm leading-7 text-[#647587]">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="relative flex min-h-[500px] flex-col justify-between overflow-hidden bg-[#242424] px-7 py-12 text-white sm:px-11 sm:py-14 lg:px-14 lg:py-16">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border-[55px] border-white/[0.04]" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B4D9EF]">
                  Kundberättelser
                </p>
                <Quote className="h-8 w-8 text-white/12" />
              </div>

              <div className="mt-14 flex gap-1 text-[#B4D9EF]" aria-label="5 av 5 stjärnor">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="h-4 w-4 fill-current" />
                ))}
              </div>

              <blockquote className="mt-7 max-w-lg text-2xl leading-[1.45] tracking-[-0.025em] sm:text-[28px]">
                “{testimonials[activeReview].quote}”
              </blockquote>
            </div>

            <div className="relative mt-14 flex items-end justify-between gap-6">
              <div>
                <p className="font-semibold">{testimonials[activeReview].name}</p>
                <p className="mt-1 text-sm text-white/50">
                  {testimonials[activeReview].detail}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => showReview(activeReview - 1)}
                  aria-label="Föregående omdöme"
                  className="grid h-11 w-11 place-items-center rounded-full border border-white/20 text-white transition hover:border-[#B4D9EF] hover:text-[#B4D9EF]"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => showReview(activeReview + 1)}
                  aria-label="Nästa omdöme"
                  className="grid h-11 w-11 place-items-center rounded-full bg-[#B4D9EF] text-[#242424] transition hover:bg-white"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 h-1 bg-white/10 right-0">
              <div
                key={activeReview}
                className="h-full origin-left bg-[#B4D9EF] motion-safe:animate-[review-progress_6.5s_linear]"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 border-y border-[#e1ddd6] bg-white py-5">
        <div className="testimonial-track flex w-max items-center">
          {[...tickerReviews, ...tickerReviews].map((review, index) => (
            <div
              key={`${review}-${index}`}
              className="flex min-w-[310px] items-center gap-4 border-r border-[#dfe5e9] px-8 sm:min-w-[390px] sm:px-12"
            >
              <div className="flex gap-0.5 text-[#72B5DB]">
                {Array.from({ length: 5 }).map((_, star) => (
                  <Star key={star} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <p className="text-sm text-[#555555]">{review}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
