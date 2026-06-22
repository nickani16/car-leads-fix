'use client'

import Link from 'next/link'
import { ArrowRight, ChevronDown, Search } from 'lucide-react'
import { useMemo, useState } from 'react'

const categories = ['Alla', 'Konton', 'Annonser', 'Priser', 'Meddelanden', 'Trygghet', 'Företag']

const questions = [
  ['Konton', 'Vad är skillnaden mellan privatkonto och företagskonto?', 'Privatkontot är för personer som säljer eller köper för egen räkning. Företagskontot kräver företagsnamn och registreringsnummer och markerar annonser som publicerade av en näringsidkare.'],
  ['Konton', 'Vilka kontaktuppgifter krävs?', 'Namn, fungerande e-postadress, telefonnummer och land krävs. Företag anger även företagsnamn och registreringsnummer. Uppgifterna används för säkerhet, meddelanden, avtal och support.'],
  ['Annonser', 'Vilka typer av fordon kan jag annonsera?', 'Bilar, transportbilar, motorcyklar, husbilar, husvagnar, lastbilar, lantbruk, entreprenad, elcyklar och elsparkcyklar.'],
  ['Annonser', 'Vilka uppgifter måste finnas i annonsen?', 'Kategori, märke eller tillverkare, modell, pris, plats, beskrivning, skick, kända fel och tydliga bilder. Årsmodell, körsträcka eller drifttimmar, service och utrustning ska anges när de är relevanta.'],
  ['Annonser', 'Publiceras annonsen direkt?', 'Annonsen går igenom automatiska och vid behov manuella kontroller. Autorell kan stoppa, begära komplettering eller ta bort annonser som bryter mot regler eller verkar vilseledande.'],
  ['Priser', 'Vad kostar en annons?', 'Sju dagar är gratis. Priset för 15 dagar och Premium varierar per kategori. Privatkonton betalar den lägre nivån i det visade intervallet och företagskonton den högre nivån. Slutpriset visas före betalning.'],
  ['Priser', 'Har Autorell abonnemang?', 'Nej. Annonspaket köps per objekt. Större företagsvolymer kan få en separat offert.'],
  ['Meddelanden', 'Hur kontaktar jag säljaren?', 'Tryck på Skriv till säljaren i annonsen. Du måste vara inloggad. Konversationen sparas i ditt konto så att missbruk kan utredas och parterna kan följa kommunikationen.'],
  ['Meddelanden', 'Ska jag betala via ett meddelande?', 'Nej. Skicka aldrig kortuppgifter, lösenord eller pengar på uppmaning i ett meddelande. Använd endast betalningsflöden som tydligt visas i ditt Autorell-konto.'],
  ['Trygghet', 'Hur rapporterar jag bedrägeri?', 'Öppna Rapportera problem och välj kategori. Bifoga annons-ID och beskriv händelsen. Vid akut risk eller pågående brott kontaktar du lokal polis eller 112.'],
  ['Trygghet', 'Är Autorell part i affären?', 'Det beror på det uttryckliga flödet. På vanliga marknadsplatsannonser förmedlar Autorell kontakt och är inte automatiskt köpare, säljare eller garant. Om Autorell är avtalspart framgår det tydligt i det separata avtalet.'],
  ['Företag', 'Vilken information visas om ett företag?', 'Annonsen markeras som företagsannons. Företagsnamn och nödvändig näringsidkarinformation visas så att köparen förstår vem som säljer och vilka konsumentregler som kan vara tillämpliga.'],
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

      <div className="mt-12 columns-1 gap-x-16 lg:columns-2">
        {filtered.map(([itemCategory, question, answer]) => {
          const isOpen = open === question
          return (
            <div
              key={question}
              className="inline-block w-full break-inside-avoid border-t border-[#dcdad4] align-top"
            >
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

      <div className="relative mt-16 flex min-h-[140px] flex-col items-start justify-between gap-6 overflow-hidden rounded-[24px] bg-[#B4D9EF] p-8 sm:flex-row sm:items-center sm:p-10">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full border-[42px] border-white/30"
        />
        <div className="relative z-10">
          <h2 className="text-2xl tracking-[-0.03em]">Hittade du inte svaret?</h2>
          <p className="mt-2 text-sm text-[#56636c]">Skicka din fråga så hjälper vi dig vidare.</p>
        </div>
        <Link href="/rapportera" className="relative z-10 inline-flex min-h-12 items-center gap-2 rounded-[15px] bg-[#0866ff] px-6 text-sm font-bold text-white">
          Rapportera problem <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </>
  )
}
