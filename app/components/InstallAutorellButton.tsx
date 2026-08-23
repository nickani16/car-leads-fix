'use client'

import Link from 'next/link'
import { Smartphone } from 'lucide-react'
import { localizePublicHref, type PublicLocale } from '@/lib/public-i18n'

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
      className="inline-flex min-h-11 items-center gap-2 rounded-[8px] border border-[#cfe1fb] bg-[#eaf3ff] px-4 text-[13px] font-semibold text-[#0755d9] transition hover:border-[#a9c9f5] hover:bg-[#dcecff] hover:text-[#0648bd] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0866ff]"
    >
      <Smartphone className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden="true" />
      {copy.button}
    </Link>
  )
}
