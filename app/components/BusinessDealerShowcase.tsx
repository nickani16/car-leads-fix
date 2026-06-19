'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import {
  BarChart3,
  CarFront,
  ChevronLeft,
  ChevronRight,
  Gavel,
  ShieldCheck,
} from 'lucide-react'

const slides = [
  {
    eyebrow: '01 · Fordonspresentation',
    title: 'Varje bil blir ett tydligt beslutsunderlag.',
    text: 'Bilder, specifikation, skick och kända avvikelser struktureras för professionella köpare.',
    src: '/dealer-handtag.webp',
    alt: 'Fordonsdetalj i Autorells köparpresentation',
    icon: CarFront,
    metric: 'Anonym presentation',
    signal: 'Säljaruppgifter skyddas',
  },
  {
    eyebrow: '02 · Europeisk efterfrågan',
    title: 'Verifierade handlare bedömer samma underlag.',
    text: 'Autorell testar marknaden i det europeiska köparnätverket och samlar in konkreta prissignaler.',
    src: '/dealer-macbook.webp',
    alt: 'Autorell dealer dashboard på laptop',
    icon: Gavel,
    metric: 'EU market test',
    signal: 'Professionella köpare',
  },
  {
    eyebrow: '03 · Portfölj och resultat',
    title: 'Ni får ett samlat flöde även för stora volymer.',
    text: 'Lagerbilar, leasingreturer och flottor följs från underlag till Autorells erbjudande och genomförd export.',
    src: '/dealer-samsung.webp',
    alt: 'Autorell dealer portal med fordons- och budöversikt',
    icon: BarChart3,
    metric: 'Många fordon',
    signal: 'Ett samordnat flöde',
  },
] as const

const ROTATION_MS = 5200

export default function BusinessDealerShowcase() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reducedMotion.matches) return

    const timer = window.setInterval(
      () => setActive((current) => (current + 1) % slides.length),
      ROTATION_MS
    )
    return () => window.clearInterval(timer)
  }, [paused])

  const slide = slides[active]
  const Icon = slide.icon

  function move(direction: -1 | 1) {
    setActive(
      (current) => (current + direction + slides.length) % slides.length
    )
  }

  return (
    <div
      className="relative min-w-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="absolute -inset-5 rounded-[38px] bg-white/45 blur-2xl" />
      <div className="relative overflow-hidden rounded-[28px] border border-white/90 bg-[#202529] shadow-[0_38px_100px_rgba(35,52,61,.28)]">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 text-white sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex gap-1.5">
              <i className="h-2 w-2 rounded-full bg-[#e88b7c]" />
              <i className="h-2 w-2 rounded-full bg-[#e3c878]" />
              <i className="h-2 w-2 rounded-full bg-[#80bd94]" />
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/45">
              Autorell transaction workspace
            </span>
          </div>
          <span className="flex items-center gap-2 rounded-full bg-[#edf7f1]/10 px-3 py-1.5 text-[10px] text-[#a9dfbb]">
            <span className="home-live-dot h-2 w-2 rounded-full bg-[#76bb91]" />
            Live
          </span>
        </div>

        <div className="relative aspect-[16/10] overflow-hidden bg-[#dfe9ed]">
          {slides.map((item, index) => (
            <Image
              key={item.src}
              src={item.src}
              alt={item.alt}
              fill
              priority={index === 0}
              sizes="(max-width: 1024px) 100vw, 48vw"
              className={`object-cover object-center transition duration-700 ${
                index === active
                  ? 'scale-100 opacity-100'
                  : 'pointer-events-none scale-[1.035] opacity-0'
              }`}
            />
          ))}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(24,30,34,.02)_28%,rgba(24,30,34,.88)_100%)]" />
          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/30 bg-white/85 px-3 py-2 text-[10px] font-medium text-[#354750] shadow-lg backdrop-blur sm:left-6 sm:top-6">
            <ShieldCheck className="h-3.5 w-3.5 text-[#4d849b]" />
            Skyddad B2B-presentation
          </div>

          <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-7">
            <div
              key={active}
              className="animate-[home-signal-card_.65s_ease-out_both]"
            >
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B4D9EF]">
                <Icon className="h-4 w-4" />
                {slide.eyebrow}
              </div>
              <h2 className="mt-3 max-w-xl text-[25px] leading-[1.05] tracking-[-0.045em] sm:text-[34px]">
                {slide.title}
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/68">
                {slide.text}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-5 text-white sm:px-6">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-[13px] border border-white/10 bg-white/[.055] px-4 py-3">
              <span className="block text-[9px] uppercase tracking-[0.16em] text-white/35">
                Kapacitet
              </span>
              <strong className="mt-1 block text-sm font-medium">
                {slide.metric}
              </strong>
            </div>
            <div className="hidden rounded-[13px] border border-white/10 bg-white/[.055] px-4 py-3 sm:block">
              <span className="block text-[9px] uppercase tracking-[0.16em] text-white/35">
                Resultat
              </span>
              <strong className="mt-1 block text-sm font-medium">
                {slide.signal}
              </strong>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => move(-1)}
              aria-label="Föregående vy"
              className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[.06] transition hover:bg-white/15"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => move(1)}
              aria-label="Nästa vy"
              className="grid h-10 w-10 place-items-center rounded-full bg-[#B4D9EF] text-[#202124] transition hover:bg-[#c9e6f6]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex h-1 bg-white/5">
          {slides.map((item, index) => (
            <button
              key={item.eyebrow}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Visa vy ${index + 1}`}
              className="relative flex-1 overflow-hidden"
            >
              <span
                className={`absolute inset-y-0 left-0 bg-[#B4D9EF] ${
                  index === active && !paused
                    ? 'w-full transition-[width] duration-[5200ms] ease-linear'
                    : index === active
                      ? 'w-full'
                      : 'w-0'
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
