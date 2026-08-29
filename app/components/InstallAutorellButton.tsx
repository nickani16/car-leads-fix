'use client'

import Link from 'next/link'
import { Smartphone } from 'lucide-react'
import { localizePublicHref, type PublicLocale } from '@/lib/public-locale'

type InstallCopy = {
  button: string
}

const copyByLocale: Record<PublicLocale, InstallCopy> = {
  sv: { button: 'Ladda ner appen' },
  en: { button: 'Download the app' },
  de: { button: 'App herunterladen' },
  at: { button: 'App herunterladen' },
  be: { button: 'App downloaden' },
  fr: { button: 'Télécharger l’application' },
  es: { button: 'Descargar la aplicación' },
  it: { button: 'Scarica l’app' },
  pl: { button: 'Pobierz aplikację' },
  nl: { button: 'App downloaden' },
  fi: { button: 'Lataa sovellus' },
  da: { button: 'Download appen' },
}

export default function InstallAutorellButton({ locale }: { locale: PublicLocale }) {
  const copy = copyByLocale[locale] || copyByLocale.en

  return (
    <Link
      href={localizePublicHref(locale, '/app')}
      className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[#d6e5fb] bg-[#f4f8ff] px-3 text-[12px] font-semibold text-[#075fff] transition hover:-translate-y-0.5 hover:border-[#075fff] hover:bg-[#075fff] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075fff]"
    >
      <Smartphone className="h-[15px] w-[15px]" strokeWidth={1.8} aria-hidden="true" />
      {copy.button}
    </Link>
  )
}
