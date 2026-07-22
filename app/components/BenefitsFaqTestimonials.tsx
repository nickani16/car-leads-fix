'use client'

import { useEffect, useState } from 'react'

type Testimonial = { quote: string; name: string; meta: string; rating: number }
type Faq = { question: string; answer: string }

const faqExtras: Record<string, Record<'car' | 'van' | 'construction', readonly Faq[]>> = {
  sv: {
    car: [{ question: 'Hur snabbt kan jag publicera en bilannons?', answer: 'Med bilder, fordonsdata och pris på plats kan du publicera på några minuter.' }, { question: 'Kan jag ändra annonsen senare?', answer: 'Ja, du kan uppdatera uppgifter, bilder och kontaktinformation från ditt konto.' }],
    van: [{ question: 'Hur säljer jag en transportbil?', answer: 'Lägg in modell, lastutrymme, bilder och pris i ett tydligt flöde och publicera när allt är klart.' }, { question: 'Kan företag annonsera flera transportbilar?', answer: 'Ja, företag kan publicera manuellt och samla lager och team i samma arbetsflöde.' }],
    construction: [{ question: 'Vilka entreprenadmaskiner kan jag annonsera?', answer: 'Du kan annonsera grävmaskiner, hjullastare, liftar och andra maskiner med relevanta tekniska uppgifter.' }, { question: 'Kan jag sälja maskiner till flera marknader?', answer: 'Ja, tydliga maskindata, bilder och rätt marknad gör det enklare att nå relevanta köpare.' }],
  },
  en: {
    car: [{ question: 'How quickly can I publish a car listing?', answer: 'With your vehicle details, photos and price ready, you can publish in minutes.' }, { question: 'Can I edit my listing later?', answer: 'Yes. Update details, photos and contact information from your account.' }],
    van: [{ question: 'How do I sell a van?', answer: 'Add the model, cargo details, photos and price in one clear flow before publishing.' }, { question: 'Can businesses list several vans?', answer: 'Yes. Businesses can publish manually and manage stock and teams in one workflow.' }],
    construction: [{ question: 'Which construction machines can I list?', answer: 'List excavators, wheel loaders, lifts and other machines with relevant technical details.' }, { question: 'Can I reach buyers in several markets?', answer: 'Yes. Clear machine data, photos and the right market help you reach relevant buyers.' }],
  },
  de: {
    car: [{ question: 'Wie schnell kann ich ein Fahrzeug inserieren?', answer: 'Mit Daten, Fotos und Preis ist die Anzeige in wenigen Minuten bereit.' }, { question: 'Kann ich die Anzeige später ändern?', answer: 'Ja, Daten, Fotos und Kontaktdaten lassen sich im Konto aktualisieren.' }],
    van: [{ question: 'Wie verkaufe ich einen Transporter?', answer: 'Ergänzen Sie Modell, Laderaum, Fotos und Preis in einem klaren Ablauf.' }, { question: 'Können Unternehmen mehrere Transporter inserieren?', answer: 'Ja, Unternehmen können Anzeigen manuell erstellen und Bestand und Teams verwalten.' }],
    construction: [{ question: 'Welche Baumaschinen kann ich inserieren?', answer: 'Inserieren Sie Bagger, Radlader, Hubarbeitsbühnen und weitere Maschinen.' }, { question: 'Erreiche ich Käufer in mehreren Märkten?', answer: 'Ja, klare Maschinendaten und Fotos helfen bei der Suche nach passenden Käufern.' }],
  },
  fr: {
    car: [{ question: 'En combien de temps publier une annonce auto ?', answer: 'Avec les informations, les photos et le prix prêts, la publication prend quelques minutes.' }, { question: 'Puis-je modifier mon annonce ?', answer: 'Oui, vous pouvez modifier les données, les photos et vos coordonnées depuis votre compte.' }],
    van: [{ question: 'Comment vendre un utilitaire ?', answer: 'Ajoutez le modèle, le volume utile, les photos et le prix dans un parcours simple.' }, { question: 'Une entreprise peut-elle publier plusieurs utilitaires ?', answer: 'Oui, elle peut publier manuellement et gérer son stock dans un même espace.' }],
    construction: [{ question: 'Quelles machines de chantier puis-je publier ?', answer: 'Publiez des pelles, chargeuses, nacelles et autres machines avec leurs données utiles.' }, { question: 'Puis-je toucher des acheteurs dans plusieurs marchés ?', answer: 'Oui, des données et photos claires facilitent la recherche de la bonne machine.' }],
  },
  es: {
    car: [{ question: '¿Cuánto tardo en publicar un coche?', answer: 'Con los datos, las fotos y el precio preparados, puedes publicarlo en minutos.' }, { question: '¿Puedo editar el anuncio después?', answer: 'Sí, puedes actualizar los datos, las fotos y el contacto desde tu cuenta.' }],
    van: [{ question: '¿Cómo vendo una furgoneta?', answer: 'Añade modelo, espacio de carga, fotos y precio en un proceso sencillo.' }, { question: '¿Puede una empresa publicar varias furgonetas?', answer: 'Sí, puede publicar manualmente y gestionar su stock y equipo en un solo flujo.' }],
    construction: [{ question: '¿Qué maquinaria de construcción puedo anunciar?', answer: 'Puedes anunciar excavadoras, cargadoras, plataformas y otras máquinas.' }, { question: '¿Puedo llegar a compradores de varios mercados?', answer: 'Sí, los datos claros y las fotos ayudan a encontrar compradores adecuados.' }],
  },
  it: {
    car: [{ question: 'Quanto tempo serve per pubblicare un’auto?', answer: 'Con dati, foto e prezzo pronti puoi pubblicare l’annuncio in pochi minuti.' }, { question: 'Posso modificare l’annuncio in seguito?', answer: 'Sì, puoi aggiornare dati, foto e contatti dal tuo account.' }],
    van: [{ question: 'Come vendo un furgone?', answer: 'Inserisci modello, spazio di carico, foto e prezzo in un flusso semplice.' }, { question: 'Un’azienda può pubblicare più furgoni?', answer: 'Sì, può pubblicare manualmente e gestire veicoli e team nello stesso spazio.' }],
    construction: [{ question: 'Quali macchine da cantiere posso pubblicare?', answer: 'Puoi pubblicare escavatori, pale, piattaforme e altre macchine.' }, { question: 'Posso raggiungere acquirenti in più mercati?', answer: 'Sì, dati chiari e foto aiutano gli acquirenti a trovare la macchina giusta.' }],
  },
  nl: {
    car: [{ question: 'Hoe snel kan ik een auto-advertentie plaatsen?', answer: 'Met gegevens, foto’s en prijs klaar plaats je de advertentie in enkele minuten.' }, { question: 'Kan ik de advertentie later wijzigen?', answer: 'Ja, je kunt gegevens, foto’s en contactinformatie vanuit je account aanpassen.' }],
    van: [{ question: 'Hoe verkoop ik een bestelwagen?', answer: 'Voeg model, laadruimte, foto’s en prijs toe in één duidelijk proces.' }, { question: 'Kunnen bedrijven meerdere bestelwagens plaatsen?', answer: 'Ja, bedrijven kunnen handmatig publiceren en voorraad en teams beheren.' }],
    construction: [{ question: 'Welke bouwmachines kan ik plaatsen?', answer: 'Plaats graafmachines, wielladers, hoogwerkers en andere machines.' }, { question: 'Kan ik kopers in meerdere markten bereiken?', answer: 'Ja, duidelijke machinegegevens en foto’s helpen passende kopers te vinden.' }],
  },
  pl: {
    car: [{ question: 'Jak szybko mogę opublikować ogłoszenie auta?', answer: 'Mając dane, zdjęcia i cenę, opublikujesz ogłoszenie w kilka minut.' }, { question: 'Czy mogę później edytować ogłoszenie?', answer: 'Tak, dane, zdjęcia i kontakt zmienisz na swoim koncie.' }],
    van: [{ question: 'Jak sprzedać samochód dostawczy?', answer: 'Dodaj model, przestrzeń ładunkową, zdjęcia i cenę w jednym prostym procesie.' }, { question: 'Czy firma może dodać wiele samochodów?', answer: 'Tak, firma może publikować ręcznie i zarządzać zapasem oraz zespołem.' }],
    construction: [{ question: 'Jakie maszyny budowlane mogę dodać?', answer: 'Możesz dodać koparki, ładowarki, podnośniki i inne maszyny.' }, { question: 'Czy mogę dotrzeć do kupujących na wielu rynkach?', answer: 'Tak, dokładne dane i zdjęcia ułatwiają znalezienie właściwych kupujących.' }],
  },
  da: {
    car: [{ question: 'Hvor hurtigt kan jeg oprette en bilannonce?', answer: 'Med data, billeder og pris klar kan du offentliggøre annoncen på få minutter.' }, { question: 'Kan jeg redigere annoncen senere?', answer: 'Ja, du kan opdatere data, billeder og kontakt fra din konto.' }],
    van: [{ question: 'Hvordan sælger jeg en varebil?', answer: 'Tilføj model, lastrum, billeder og pris i et enkelt forløb.' }, { question: 'Kan virksomheder annoncere flere varebiler?', answer: 'Ja, virksomheder kan oprette annoncer manuelt og styre lager og team.' }],
    construction: [{ question: 'Hvilke entreprenørmaskiner kan jeg annoncere?', answer: 'Du kan annoncere gravemaskiner, læssere, lifte og andre maskiner.' }, { question: 'Kan jeg nå købere på flere markeder?', answer: 'Ja, klare maskindata og billeder gør det lettere at finde relevante købere.' }],
  },
  fi: {
    car: [{ question: 'Kuinka nopeasti voin julkaista autoilmoituksen?', answer: 'Kun tiedot, kuvat ja hinta ovat valmiina, ilmoitus julkaistaan minuuteissa.' }, { question: 'Voinko muokata ilmoitusta myöhemmin?', answer: 'Kyllä, voit päivittää tiedot, kuvat ja yhteystiedot tililtäsi.' }],
    van: [{ question: 'Miten myyn pakettiauton?', answer: 'Lisää malli, tavaratila, kuvat ja hinta selkeässä työvaiheessa.' }, { question: 'Voiko yritys ilmoittaa useita pakettiautoja?', answer: 'Kyllä, yritys voi julkaista ilmoituksia ja hallita varastoa sekä tiimiä.' }],
    construction: [{ question: 'Mitä rakennuskoneita voin ilmoittaa?', answer: 'Voit ilmoittaa kaivinkoneita, pyöräkuormaajia, nostimia ja muita koneita.' }, { question: 'Voinko tavoittaa ostajia useilla markkinoilla?', answer: 'Kyllä, selkeät konetiedot ja kuvat auttavat löytämään oikeat ostajat.' }],
  },
}

export default function BenefitsFaqTestimonials({
  locale,
  faqTitle,
  faqs,
  vehicleKind = 'car',
}: {
  locale: string
  faqTitle: string
  faqs: readonly { question: string; answer: string }[]
  vehicleKind?: 'car' | 'van' | 'construction'
}) {
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const isSwedish = locale === 'sv'
  const faqLocale = locale === 'at' ? 'de' : locale === 'be' ? 'fr' : locale
  const extras = faqExtras[faqLocale] ?? faqExtras.en
  const displayFaqs = [...faqs, ...(extras[vehicleKind] ?? extras.car)].slice(0, 5)
  const testimonials: readonly Testimonial[] = vehicleKind === 'van' || vehicleKind === 'construction'
    ? (isSwedish
      ? [
          { quote: 'Jag fick upp transportbilen snabbt och kunde själv styra pris, bilder och kontakt.', name: 'Anna', meta: 'Företagare · Sverige', rating: 5 },
          { quote: 'Det tydliga flödet gjorde det enkelt att beskriva bilen för rätt köpare.', name: 'Johan', meta: 'Privat säljare · Sverige', rating: 5 },
          { quote: 'Vi nådde köpare på flera marknader utan att skapa separata annonser.', name: 'Maria', meta: 'Åkeri · Finland', rating: 5 },
          { quote: 'Teamkontot gav oss bättre kontroll över vårt lager av transportbilar.', name: 'Erik Lund', meta: 'Försäljningschef · Nordbil AB', rating: 5 },
          { quote: 'Vi började manuellt och kunde senare importera ett större lager via CSV.', name: 'Sofia Nilsson', meta: 'Handlare · Sverige', rating: 5 },
          { quote: 'Lokalt språk och rätt valuta gjorde försäljning över gränserna smidigare.', name: 'Lukas Weber', meta: 'Händler · Deutschland', rating: 4 },
        ]
      : [
          { quote: 'I listed our van quickly and kept control of price, photos and contact.', name: 'Anna', meta: 'Business owner · Sweden', rating: 5 },
          { quote: 'The structured flow made it easy to present the vehicle to serious buyers.', name: 'James', meta: 'Private seller · United Kingdom', rating: 5 },
          { quote: 'We reached buyers in several markets without duplicate listings.', name: 'Maria', meta: 'Transport company · Finland', rating: 5 },
          { quote: 'The team account gave us better control of our commercial vehicle stock.', name: 'Erik Lund', meta: 'Sales manager · Nordbil AB', rating: 5 },
          { quote: 'We started manually and moved to CSV imports as our stock grew.', name: 'Sofia Nilsson', meta: 'Dealer · Sweden', rating: 5 },
          { quote: 'Local language and currency made cross-border publishing much easier.', name: 'Lukas Weber', meta: 'Dealer · Germany', rating: 4 },
        ])
    : isSwedish
    ? [
        { quote: 'Det gick snabbt att få upp bilen och jag kunde själv styra pris, bilder och kontakt.', name: 'Anna', meta: 'Privat säljare · Sverige', rating: 5 },
        { quote: 'Jag slapp onödiga steg och fick en tydlig annons som kändes professionell från start.', name: 'Johan', meta: 'Privat säljare · Sverige', rating: 5 },
        { quote: 'Det var enkelt att nå köpare på flera marknader utan att behöva skapa flera annonser.', name: 'Maria', meta: 'Privat säljare · Finland', rating: 4 },
        { quote: 'Teamkontot gav oss bättre kontroll över lager, publicering och inkommande kontakter.', name: 'Erik Lund', meta: 'Försäljningschef · Nordbil AB', rating: 5 },
        { quote: 'Vi kunde börja manuellt och sedan importera lager via CSV när volymen växte.', name: 'Sofia Nilsson', meta: 'Handlare · Sverige', rating: 5 },
        { quote: 'Rätt valuta och lokalt språk gjorde det mycket enklare att publicera i flera länder.', name: 'Lukas Weber', meta: 'Dealer · Deutschland', rating: 4 },
      ]
    : [
        { quote: 'It was quick to publish the car, and I stayed in control of price, images and contact.', name: 'Anna', meta: 'Private seller · Sweden', rating: 5 },
        { quote: 'The clear flow removed unnecessary steps and made the listing feel professional from day one.', name: 'James', meta: 'Private seller · United Kingdom', rating: 5 },
        { quote: 'I could reach buyers in more than one market without creating separate listings.', name: 'Maria', meta: 'Private seller · Finland', rating: 4 },
        { quote: 'The team account gave us better control of inventory, publishing and incoming contacts.', name: 'Erik Lund', meta: 'Sales manager · Nordbil AB', rating: 5 },
        { quote: 'We started manually and moved to CSV imports when our inventory grew.', name: 'Sofia Nilsson', meta: 'Dealer · Sweden', rating: 5 },
        { quote: 'The right currency and local language made publishing across countries much easier.', name: 'Lukas Weber', meta: 'Dealer · Germany', rating: 4 },
      ]

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveTestimonial((current) => (current + 1) % testimonials.length)
    }, 6500)
    return () => window.clearInterval(timer)
  }, [testimonials.length])

  return (
    <section className="border-b border-[#dfe7f2] bg-white py-14 sm:py-20">
      <div className="mx-auto grid max-w-[var(--autorell-page-max)] items-start gap-10 px-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-16">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#0866ff]">{faqTitle}</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[-.04em] text-[#101828] sm:text-4xl">{isSwedish ? 'Vanliga frågor om att sälja på Autorell' : 'Common questions about selling on Autorell'}</h2>
          <div className="mt-7 divide-y divide-[#dfe7f2] border-y border-[#dfe7f2]">
            {displayFaqs.map((faq) => (
              <details key={faq.question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium text-[#101828] [&::-webkit-details-marker]:hidden">
                  <span>{faq.question}</span>
                  <span className="text-xl text-[#0866ff] transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 max-w-xl pr-8 text-sm leading-6 text-[#667085]">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="self-start h-fit min-h-[360px] min-w-0 flex flex-col justify-start bg-[#f5f7fb] p-7 sm:p-10 lg:self-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#0866ff]">{isSwedish ? 'Säljare berättar' : 'Seller stories'}</p>
            <div className="mt-8 flex gap-1 text-[#0866ff]" aria-label={`${testimonials[activeTestimonial].rating} / 5`}>{Array.from({ length: 5 }, (_, index) => <span key={index}>{index < testimonials[activeTestimonial].rating ? '★' : '☆'}</span>)}</div>
            <blockquote className="mt-7 text-2xl font-medium leading-tight tracking-[-.025em] text-[#101828] sm:text-3xl">&ldquo;{testimonials[activeTestimonial].quote}&rdquo;</blockquote>
          </div>
          <div className="mt-8 border-t border-[#dfe7f2] pt-5 text-sm text-[#667085]">
            <p className="font-semibold text-[#101828]">{testimonials[activeTestimonial].name}</p>
            <p className="mt-1">{testimonials[activeTestimonial].meta}</p>
            <div className="mt-6 flex items-center justify-between">
              <span>{String(activeTestimonial + 1).padStart(2, '0')} / {String(testimonials.length).padStart(2, '0')}</span>
              <div className="flex gap-2">
                <button type="button" aria-label={isSwedish ? 'Föregående omdöme' : 'Previous testimonial'} onClick={() => setActiveTestimonial((activeTestimonial - 1 + testimonials.length) % testimonials.length)} className="grid h-9 w-9 place-items-center rounded-full border border-[#cbd8ea] bg-white text-[#0866ff]">&larr;</button>
                <button type="button" aria-label={isSwedish ? 'Nästa omdöme' : 'Next testimonial'} onClick={() => setActiveTestimonial((activeTestimonial + 1) % testimonials.length)} className="grid h-9 w-9 place-items-center rounded-full bg-[#0866ff] text-white">&rarr;</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
