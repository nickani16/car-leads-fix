'use client'

import Link from 'next/link'
import { ArrowRight, ChevronDown, Search } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useMemo, useState } from 'react'
import { localizePublicHref, translatePublic, type PublicLocale } from '@/lib/public-i18n'

const categories = ['Alla', 'Konton', 'Annonser', 'Köp', 'Export & import', 'Priser', 'Meddelanden', 'Trygghet', 'Företag', 'Språk']

const questions = [
  ['Konton', 'Vad är skillnaden mellan privatkonto och företagskonto?', 'Privatkontot är för personer som säljer eller köper för egen räkning. Företagskontot kräver företagsnamn och registreringsnummer och markerar annonser som publicerade av en näringsidkare.'],
  ['Konton', 'Vilka kontaktuppgifter krävs?', 'Namn, fungerande e-postadress, telefonnummer och land krävs. Företag anger även företagsnamn och registreringsnummer. Uppgifterna används för säkerhet, meddelanden, avtal och support.'],
  ['Konton', 'Hur loggar jag in utan lösenord?', 'Ange din e-postadress i inloggningsrutan. Autorell skickar en engångskod till mejlen. Kontrollera även skräpposten om koden inte kommer fram inom några minuter.'],
  ['Konton', 'Kan jag byta från privatkonto till företagskonto?', 'Ja. Du kan komplettera kontot med företagsnamn, organisationsnummer eller VAT-nummer och kontaktperson. Autorell kan begära extra uppgifter om företaget ska annonsera flera objekt.'],
  ['Konton', 'Hur raderar jag mitt konto?', 'Logga in, gå till kontosidan och välj begär radering av konto. Om du har aktiva annonser, öppna meddelanden eller pågående betalningsärenden kan vi först behöva avsluta eller kontrollera dem. När begäran är mottagen stänger vi åtkomsten och hanterar personuppgifter enligt integritetspolicyn. Uppgifter som krävs för bokföring, säkerhet, tvister eller lagkrav kan behöva sparas en begränsad tid.'],
  ['Konton', 'Vad händer med mina annonser när kontot raderas?', 'Aktiva annonser pausas eller tas bort från marknadsplatsen när kontot stängs. Meddelanden, annons-ID, betalningsreferenser och säkerhetsloggar kan sparas om de behövs för support, lagkrav, bedrägeriförebyggande arbete eller en pågående tvist.'],
  ['Konton', 'Kan jag få ut uppgifter om mitt konto?', 'Ja. Kontakta support och ange vilken information du vill få ut. Vi kan behöva kontrollera din identitet innan vi lämnar ut kontodata, eftersom kontot kan innehålla meddelanden, betalningsreferenser och annonsuppgifter.'],
  ['Annonser', 'Vilka typer av fordon kan jag annonsera?', 'Bilar, transportbilar, motorcyklar, husbilar, husvagnar, lastbilar, lantbruk, entreprenad, elcyklar och elsparkcyklar.'],
  ['Annonser', 'Vilka uppgifter måste finnas i annonsen?', 'Kategori, märke eller tillverkare, modell, pris, plats, beskrivning, skick, kända fel och tydliga bilder. Årsmodell, körsträcka eller drifttimmar, service och utrustning ska anges när de är relevanta.'],
  ['Annonser', 'Varför frågar Autorell efter VIN, chassinummer eller serienummer?', 'Identifieringsnummer gör objektet spårbart och minskar risken för falska annonser, fel objekt och stulna fordon eller maskiner. Olika kategorier har olika krav, till exempel VIN för fordon och serienummer för maskiner.'],
  ['Annonser', 'Kan jag redigera en annons efter publicering?', 'Ja, du kan uppdatera pris, text, bilder och vissa fordonsuppgifter från kontot. Större ändringar kan skickas till ny granskning om de påverkar objektets identitet, prisbild eller säkerhetsrisk.'],
  ['Annonser', 'Vad betyder annonsnummer och referensnummer?', 'Varje annons får ett unikt annonsnummer och referensnummer. Använd dem vid support, betalningsfrågor, rapportering och om du behöver hänvisa till en specifik annons i en tvist.'],
  ['Annonser', 'Publiceras annonsen direkt?', 'Annonsen går igenom automatiska och vid behov manuella kontroller. Autorell kan stoppa, begära komplettering eller ta bort annonser som bryter mot regler eller verkar vilseledande.'],
  ['Köp', 'Hur hittar jag fordon i mitt land?', 'Välj din marknad i språk- och marknadsväljaren. Då visas rätt land, språk och valuta. I sökresultatet kan du filtrera på plats, kategori, märke, modell och pris.'],
  ['Köp', 'Kan jag spara annonser?', 'Ja. Tryck på hjärtikonen på en annons. Du behöver vara inloggad för att sparade annonser ska kopplas till ditt konto och finnas kvar mellan enheter.'],
  ['Köp', 'Kan jag spara sökningar?', 'Sparade sökningar hjälper dig att komma tillbaka till samma filter senare. När funktionen är aktiv krävs inloggning så att sökningen kan kopplas till ditt konto.'],
  ['Köp', 'Hur vet jag om ett pris är omräknat?', 'Originalpris och originalvaluta sparas alltid oförändrat. Om du valt en annan valuta visas omräknade priser med ungefär-symbolen, till exempel ≈, eftersom valutakurser kan ändras.'],
  ['Köp', 'Kan jag köpa ett fordon från ett annat EU-land?', 'Ja. Det är en av fördelarna med Autorell: du kan hitta fordon i andra EU-länder och kontakta säljaren direkt. Affären blir enklast när köpare och säljare tidigt kommer överens om pris, betalning, hämtning, transport, dokument, försäkring och vem som gör varje steg.'],
  ['Export & import', 'Hur exporterar jag ett fordon?', 'Börja med att komma överens med säljaren om affären och vem som ansvarar för transporten. Kontrollera sedan fordonets dokument, VIN, registreringsbevis, servicehistorik, ägaruppgifter, försäkring och om fordonet ska köras hem eller transporteras på trailer. Därefter ordnar köparen eller säljaren export-/avregistrering enligt säljarlandets regler och registrering i mottagarlandet.'],
  ['Export & import', 'Vem betalar transporten?', 'Det bestämmer köpare och säljare tillsammans innan affären slutförs. Vanligt är att köparen betalar transporten från säljarens plats, men säljaren kan hjälpa till att boka transport om ni kommer överens om det. Skriv alltid in i avtalet vem som betalar, när risken går över och var fordonet ska lämnas.'],
  ['Export & import', 'Kan jag använda ett transportföretag?', 'Ja, och det är ofta det enklaste sättet vid köp över landsgräns. Välj ett transportföretag som kan hämta fordonet på säljarens adress, kontrollera lastning, ge transportdokument och leverera till din adress eller besiktningsplats. Be om skriftlig offert, försäkringsvillkor, leveranstid och vad som gäller vid skada.'],
  ['Export & import', 'Kan jag köra hem fordonet själv?', 'I vissa länder går det, men du behöver rätt försäkring, tillåtna skyltar eller tillfällig registrering och giltiga dokument för hela resan. Reglerna skiljer sig mellan länder. Kontrollera alltid med myndigheten i säljarlandet och mottagarlandet innan du kör iväg.'],
  ['Export & import', 'Vilka dokument behöver jag vid export eller import?', 'Spara köpeavtal, kvitto eller faktura, registreringsbevis, identitet på köpare och säljare, VIN eller serienummer, tidigare ägaruppgifter, tekniska uppgifter, servicehistorik, transportdokument och eventuell fullmakt. För företag kan VAT-nummer, exportintyg eller andra handelsdokument behövas.'],
  ['Export & import', 'Hur registrerar jag fordonet i mitt land?', 'När fordonet har kommit fram ansöker du normalt om registrering eller ursprungskontroll i mottagarlandet, bokar eventuell kontrollbesiktning/registreringsbesiktning och ordnar försäkring innan fordonet används i trafik. Exakta steg beror på land, fordonstyp och om fordonet kommer från EU eller utanför EU.'],
  ['Export & import', 'Behöver jag betala moms, tull eller avgifter?', 'Det beror på land, fordonets ålder, körsträcka, om säljaren är privatperson eller företag och om fordonet kommer från EU eller utanför EU. Inom EU är begagnade fordon ofta enklare än nya fordon, men nya fordon och företagsaffärer kan ha särskilda VAT-regler. Kontrollera alltid med skattemyndighet eller tullmyndighet i ditt land innan betalning.'],
  ['Export & import', 'Vad gäller för registreringsskyltar?', 'Skyltar och tillfälliga exportskyltar hanteras enligt reglerna i säljarlandet och mottagarlandet. I vissa fall ska säljaren behålla eller lämna tillbaka skyltarna, i andra fall kan köparen behöva tillfälliga skyltar. Kontrollera detta innan fordonet hämtas så att transporten blir laglig.'],
  ['Export & import', 'Hjälper Autorell till med exporten?', 'Autorell är marknadsplatsen som gör det enklare att hitta fordon och kontakta säljare i Europa. Själva exporten, transporten, registreringen, försäkringen och myndighetskontakten hanteras av köpare, säljare och eventuellt transportföretag. Vi kan däremot hjälpa dig förstå vilka steg du bör kontrollera innan affären.'],
  ['Priser', 'Vad kostar en annons?', 'Sju dagar är gratis. Varje fordonskategori har ett fast pris för 15 dagar och Premium 30 dagar. Samma kategoripris gäller för privatpersoner och företag och visas alltid före betalning.'],
  ['Priser', 'Har Autorell abonnemang?', 'Nej. Annonspaket köps per objekt. Större företagsvolymer kan få en separat offert.'],
  ['Priser', 'Kan jag få återbetalning av annonsavgiften?', 'Normalt återbetalas inte en publicerad annons eftersom tjänsten startar direkt. Återbetalning kan vara aktuell vid tekniskt fel, dubbelbetalning, feldebitering eller om lagstiftning i ditt land ger rätt till återbetalning.'],
  ['Priser', 'Vad händer om betalningen dras flera gånger?', 'Kontakta support med annons-ID, betalningsreferens och belopp. Om en dubbelbetalning bekräftas återbetalas den normalt till samma betalningsmetod.'],
  ['Meddelanden', 'Hur kontaktar jag säljaren?', 'Tryck på Skriv till säljaren i annonsen. Du måste vara inloggad. Konversationen sparas i ditt konto så att missbruk kan utredas och parterna kan följa kommunikationen.'],
  ['Meddelanden', 'Varför ska jag hålla konversationen i Autorell?', 'Meddelanden i Autorell ger bättre spårbarhet om något går fel. Det hjälper supporten att utreda misstänkt bedrägeri, falska annonser eller otydliga villkor mellan köpare och säljare.'],
  ['Meddelanden', 'Får jag notiser om nya meddelanden?', 'Ja, när du är inloggad visas meddelanden och olästa konversationer i kontot. Viktiga uppdateringar kan även skickas via e-post.'],
  ['Meddelanden', 'Ska jag betala via ett meddelande?', 'Nej. Skicka aldrig kortuppgifter, lösenord eller pengar på uppmaning i ett meddelande. Använd endast betalningsflöden som tydligt visas i ditt Autorell-konto.'],
  ['Trygghet', 'Hur rapporterar jag bedrägeri?', 'Öppna Rapportera problem och ange annons-ID, motpart, datum, betalningsreferens och belopp när det finns. Autorell kan säkra konto-, annons- och meddelandedata, begränsa konton och hjälpa till med underlag. Vid akut risk eller pågående brott kontaktar du lokal polis eller 112.'],
  ['Trygghet', 'Vad ska jag kontrollera innan jag köper?', 'Kontrollera säljarens identitet, objektets dokument, VIN eller serienummer, servicehistorik, ägaruppgifter, bilder och att priset verkar rimligt. Betala aldrig om något känns stressat, otydligt eller för bra för att vara sant.'],
  ['Trygghet', 'Vad gör Autorell med misstänkta annonser?', 'Autorell kan pausa, flagga, avvisa eller ta bort annonser. Vi kan också begära kompletterande dokument, begränsa konton och spara historik för intern granskning och supportärenden.'],
  ['Trygghet', 'Är ett kontrollerat konto en garanti?', 'Nej. Format-, dubblett-, VAT- och riskkontroller minskar missbruk men är inte en garanti för en person, ett företag, ett fordon eller en betalning. Autorell kan kräva ytterligare dokument eller e-legitimation.'],
  ['Trygghet', 'Är Autorell part i affären?', 'Det beror på det uttryckliga flödet. På vanliga marknadsplatsannonser förmedlar Autorell kontakt och är inte automatiskt köpare, säljare eller garant. Om Autorell är avtalspart framgår det tydligt i det separata avtalet.'],
  ['Företag', 'Kan företag lägga upp flera annonser?', 'Ja. Företagskonton är byggda för återkommande annonsering, lagerhantering och flera objekt. Vid högre volymer kan Autorell erbjuda separat upplägg och manuell hjälp.'],
  ['Företag', 'Varför behöver företag ange VAT- eller organisationsnummer?', 'Det hjälper oss att identifiera säljaren, visa korrekt företagsinformation och minska risken för falska eller vilseledande företagskonton.'],
  ['Företag', 'Vilken information visas om ett företag?', 'Annonsen markeras som företagsannons. Företagsnamn och nödvändig näringsidkarinformation visas så att köparen förstår vem som säljer och vilka konsumentregler som kan vara tillämpliga.'],
  ['Språk', 'Hur byter jag språk och marknad?', 'Öppna marknadsväljaren i headern eller footern och välj land. Autorell byter URL, språk och valuta utifrån vald marknad och försöker behålla samma sida när det är möjligt.'],
  ['Språk', 'Vilken valuta visas?', 'Valutan följer vald marknad, till exempel SEK för Sverige, PLN för Polen, DKK för Danmark och EUR för euro-länder. Du kan även använda internationella referensvalutor som USD, GBP, NOK och CHF.'],
] as const

export default function FaqPageClient({ locale: providedLocale }: { locale?: PublicLocale }) {
  const pathname = usePathname()
  const locale = providedLocale || localeFromPathname(pathname)
  const [category, setCategory] = useState('Alla')
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState<string | null>(questions[0][1])
  const t = (value: string) => (locale === 'sv' ? value : translatePublic(locale, value))

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
      <div className="mt-12 flex max-w-3xl items-center gap-3 rounded-[16px] border border-[#d9e0eb] bg-white px-5 shadow-[0_12px_36px_rgba(16,24,40,.06)]">
        <Search className="h-5 w-5 text-[#777c80]" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t('Sök bland frågor...')}
          className="h-14 w-full bg-transparent text-[#202124] outline-none placeholder:text-[#999d9f]"
        />
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCategory(item)}
            className={`rounded-[12px] px-5 py-2.5 text-sm transition ${
              category === item ? 'bg-[#242424] text-white' : 'border border-[#d8d7d1] bg-white hover:border-[#242424]'
            }`}
          >
            {t(item)}
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
                  <span className="block text-[11px] uppercase tracking-[0.16em] text-[#8a8d8b]">{t(itemCategory)}</span>
                  <span className="mt-2 block text-lg text-[#26292b]">{t(question)}</span>
                </span>
                <span className={`mt-2 grid h-9 w-9 shrink-0 place-items-center rounded-[11px] transition ${isOpen ? 'rotate-180 bg-[#0866ff] text-white' : 'bg-[#e8f0ff] text-[#0866ff]'}`}>
                  <ChevronDown className="h-4 w-4" />
                </span>
              </button>
              <div className={`grid transition-[grid-template-rows] duration-300 ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden">
                  <p className="max-w-xl pb-7 pr-12 text-sm leading-7 text-[#626d76]">{t(answer)}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="mt-12 border-t border-[#dcdad4] py-14 text-center">
          <p className="text-[#626d76]">{t('Vi hittade ingen fråga som matchade din sökning.')}</p>
        </div>
      )}

      <div className="relative mt-16 flex min-h-[140px] flex-col items-start justify-between gap-6 overflow-hidden rounded-[20px] bg-[#e8f0ff] p-8 sm:flex-row sm:items-center sm:p-10">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full border-[42px] border-white/30"
        />
        <div className="relative z-10">
          <h2 className="text-2xl tracking-[-0.03em]">{t('Hittade du inte svaret?')}</h2>
          <p className="mt-2 text-sm text-[#56636c]">{t('Skicka din fråga så hjälper vi dig vidare.')}</p>
        </div>
        <Link href={localizePublicHref(locale, '/report')} className="relative z-10 inline-flex min-h-12 items-center gap-2 rounded-[15px] bg-[#0866ff] px-6 text-sm font-bold text-white">
          {t('Rapportera problem')} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </>
  )
}

function localeFromPathname(pathname: string): PublicLocale {
  const first = pathname.split('/').filter(Boolean)[0]
  if (first === 'se') return 'sv'
  if (first === 'de') return 'de'
  if (first === 'pl' || first === 'fr' || first === 'es' || first === 'it' || first === 'nl' || first === 'pt' || first === 'fi') {
    return first
  }
  if (first === 'dk') return 'da'
  if (first === 'cz') return 'cs'
  if (first === 'gr') return 'el'
  return 'en'
}
