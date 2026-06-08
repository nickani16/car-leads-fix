'use client'

import Link from 'next/link'
import { ArrowRight, ChevronDown, Search } from 'lucide-react'
import { useMemo, useState } from 'react'

const categories = ['Alla', 'Värdering', 'Försäljning', 'Trygghet', 'Bilhandlare']

const questions = [
  ['Värdering', 'Hur värderas min bil?', 'Bilens uppgifter och skick presenteras för relevanta professionella köpare. Marknadens intresse ger ett aktuellt underlag för erbjudandet.'],
  ['Värdering', 'Kostar det något att värdera bilen?', 'Nej. Det är kostnadsfritt att registrera bilen och ta emot ett erbjudande.'],
  ['Värdering', 'Vilka uppgifter behöver jag lämna?', 'Du behöver bland annat registreringsnummer, miltal, information om skick och utrustning samt tydliga bilder av bilen.'],
  ['Försäljning', 'Måste jag acceptera det högsta budet?', 'Nej. Du bestämmer alltid själv om du vill acceptera ett erbjudande och gå vidare med försäljningen.'],
  ['Försäljning', 'Hur länge pågår budgivningen?', 'Budgivningen är normalt öppen i upp till 24 timmar från att fordonsprofilen publiceras.'],
  ['Försäljning', 'Vad händer när jag accepterar ett erbjudande?', 'Vi hjälper dig vidare med kontakt, dokumentation, betalning och planering av överlämningen.'],
  ['Försäljning', 'Kan jag sälja en bil med finansiering?', 'Det kan vara möjligt. Ange information om eventuell kvarvarande finansiering så hjälper vi dig att bedöma nästa steg.'],
  ['Trygghet', 'Kan handlarna se mina kontaktuppgifter?', 'Nej. Din telefon och e-post visas inte öppet för handlarna i dealer-portalen.'],
  ['Trygghet', 'Hur kontrolleras bilhandlarna?', 'Handlare ansöker om tillgång och deras företagsuppgifter granskas innan de får använda nätverket.'],
  ['Trygghet', 'Är ett erbjudande bindande?', 'Du är inte bunden innan du uttryckligen har accepterat erbjudandet och kommit överens om affären.'],
  ['Bilhandlare', 'Hur ansöker mitt företag om tillgång?', 'Använd dealer-ansökan och fyll i företagets kontakt- och registreringsuppgifter. Vi återkommer efter granskning.'],
  ['Bilhandlare', 'Vilka fordon visas i portalen?', 'Portalen visar aktuella fordonsprofiler från Autorells marknader med den information som behövs för att bedöma och lägga bud.'],
] as const

export default function FaqPageClient() {
  const [category, setCategory] = useState('Alla')
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState<string | null>(questions[0][1])

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('sv')
    return questions.filter(([itemCategory, question, answer]) => {
      const matchesCategory = category === 'Alla' || itemCategory === category
      const matchesSearch = !query || `${question} ${answer}`.toLocaleLowerCase('sv').includes(query)
      return matchesCategory && matchesSearch
    })
  }, [category, search])

  return (
    <>
      <div className="mt-10 flex max-w-3xl items-center gap-3 rounded-full border border-[#d9d8d2] bg-white px-5 shadow-[0_10px_35px_rgba(32,33,36,.05)]">
        <Search className="h-5 w-5 text-[#777c80]" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Sök bland frågor..."
          className="h-14 w-full bg-transparent text-[#202124] outline-none placeholder:text-[#999d9f]"
        />
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCategory(item)}
            className={`rounded-full px-5 py-2.5 text-sm transition ${
              category === item ? 'bg-[#242424] text-white' : 'border border-[#d8d7d1] bg-white hover:border-[#242424]'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mt-12 grid gap-x-16 lg:grid-cols-2">
        {filtered.map(([itemCategory, question, answer]) => {
          const isOpen = open === question
          return (
            <div key={question} className="border-t border-[#dcdad4]">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : question)}
                className="flex w-full items-start justify-between gap-5 py-6 text-left"
                aria-expanded={isOpen}
              >
                <span>
                  <span className="block text-[11px] uppercase tracking-[0.16em] text-[#8a8d8b]">{itemCategory}</span>
                  <span className="mt-2 block text-lg text-[#26292b]">{question}</span>
                </span>
                <span className={`mt-2 grid h-9 w-9 shrink-0 place-items-center rounded-full transition ${isOpen ? 'rotate-180 bg-[#242424] text-white' : 'bg-[#B4D9EF]'}`}>
                  <ChevronDown className="h-4 w-4" />
                </span>
              </button>
              <div className={`grid transition-[grid-template-rows] duration-300 ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden">
                  <p className="max-w-xl pb-7 pr-12 text-sm leading-7 text-[#626d76]">{answer}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="mt-12 border-t border-[#dcdad4] py-14 text-center">
          <p className="text-[#626d76]">Vi hittade ingen fråga som matchade din sökning.</p>
        </div>
      )}

      <div className="mt-16 flex flex-col items-start justify-between gap-6 rounded-[24px] bg-[#B4D9EF] p-8 sm:flex-row sm:items-center sm:p-10">
        <div>
          <h2 className="text-2xl tracking-[-0.03em]">Hittade du inte svaret?</h2>
          <p className="mt-2 text-sm text-[#56636c]">Skicka din fråga så hjälper vi dig vidare.</p>
        </div>
        <Link href="/kontakt" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#242424] px-6 text-sm text-white">
          Kontakta oss <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </>
  )
}
