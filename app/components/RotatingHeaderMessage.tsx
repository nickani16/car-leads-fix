'use client'

import { useEffect, useState } from 'react'
import type { PublicLocale } from '@/lib/public-i18n'

const rotatingWords = {
  sv: ['Värdera', 'Sälja', 'Exportera', 'Växa'],
  de: ['Bewerten', 'Verkaufen', 'Exportieren', 'Handeln'],
  en: ['Value', 'Sell', 'Export', 'Trade'],
} as const

const compactMessages: Partial<Record<PublicLocale, string>> = {
  fr: 'Véhicules suédois. Commerce européen.',
  es: 'Vehículos suecos. Comercio europeo.',
  it: 'Veicoli svedesi. Commercio europeo.',
  pl: 'Szwedzkie auta. Europejski handel.',
  nl: 'Zweedse auto’s. Europese handel.',
  pt: 'Veículos suecos. Comércio europeu.',
  fi: 'Ruotsalaiset autot. Euroopan kauppa.',
  da: 'Svenske biler. Europæisk handel.',
  cs: 'Švédská vozidla. Evropský obchod.',
  ro: 'Vehicule suedeze. Comerț european.',
  bg: 'Шведски автомобили. Европейска търговия.',
  hr: 'Švedska vozila. Europska trgovina.',
  el: 'Σουηδικά οχήματα. Ευρωπαϊκό εμπόριο.',
  hu: 'Svéd járművek. Európai kereskedelem.',
  sk: 'Švédske vozidlá. Európsky obchod.',
  sl: 'Švedska vozila. Evropska trgovina.',
  et: 'Rootsi sõidukid. Euroopa kaubandus.',
  lv: 'Zviedrijas auto. Eiropas tirdzniecība.',
  lt: 'Švediški automobiliai. Europos prekyba.',
}

export default function RotatingHeaderMessage({
  locale,
}: {
  locale: PublicLocale
}) {
  const [index, setIndex] = useState(0)
  const words =
    locale === 'sv' || locale === 'de' || locale === 'en'
      ? rotatingWords[locale]
      : null

  useEffect(() => {
    if (!words) return
    const timer = window.setInterval(
      () => setIndex((value) => (value + 1) % words.length),
      2600,
    )
    return () => window.clearInterval(timer)
  }, [words])

  if (!words) {
    return (
      <span className="block truncate">
        {compactMessages[locale] || 'Swedish vehicles. European trade.'}
      </span>
    )
  }

  const prefix =
    locale === 'sv' ? 'Autorell för' : locale === 'de' ? 'Autorell:' : 'Autorell:'

  return (
    <span className="flex min-w-0 items-center gap-1.5 whitespace-nowrap">
      <span className="shrink-0">{prefix}</span>
      <span className="relative inline-grid min-w-[72px] overflow-hidden text-left font-semibold sm:min-w-[88px]">
        <span key={`${locale}-${index}`} className="header-word-enter col-start-1 row-start-1">
          {words[index]}
        </span>
      </span>
    </span>
  )
}
