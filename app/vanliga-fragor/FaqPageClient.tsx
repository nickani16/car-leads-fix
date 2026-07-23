'use client'

import Link from 'next/link'
import { ArrowRight, ChevronDown, Search } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { localizePublicHref, translatePublic, type PublicLocale } from '@/lib/public-i18n'

type Localized = { sv: string; en: string; de: string }
type CategoryKey = 'all' | 'account' | 'listings' | 'buying' | 'export' | 'pricing' | 'messages' | 'safety' | 'business' | 'language'

const categories: Array<{ key: CategoryKey; label: Localized }> = [
  { key: 'all', label: { sv: 'Alla', en: 'All', de: 'Alle' } },
  { key: 'account', label: { sv: 'Konton', en: 'Accounts', de: 'Konten' } },
  { key: 'listings', label: { sv: 'Annonser', en: 'Listings', de: 'Anzeigen' } },
  { key: 'buying', label: { sv: 'Köp', en: 'Buying', de: 'Kaufen' } },
  { key: 'export', label: { sv: 'Export & import', en: 'Export & import', de: 'Export & Import' } },
  { key: 'pricing', label: { sv: 'Priser', en: 'Pricing', de: 'Preise' } },
  { key: 'messages', label: { sv: 'Meddelanden', en: 'Messages', de: 'Nachrichten' } },
  { key: 'safety', label: { sv: 'Trygghet', en: 'Safety', de: 'Sicherheit' } },
  { key: 'business', label: { sv: 'Företag', en: 'Business', de: 'Unternehmen' } },
  { key: 'language', label: { sv: 'Språk', en: 'Language', de: 'Sprache' } },
]

const questions: Array<{ category: Exclude<CategoryKey, 'all'>; question: Localized; answer: Localized }> = [
  {
    category: 'account',
    question: { sv: 'Hur loggar jag in utan lösenord?', en: 'How do I sign in without a password?', de: 'Wie melde ich mich ohne Passwort an?' },
    answer: { sv: 'Ange din e-postadress i inloggningsrutan. Autorell skickar en engångskod till mejlen. Kontrollera även skräpposten om koden inte kommer fram inom några minuter.', en: 'Enter your email address in the sign-in window. Autorell sends a one-time code by email. Also check spam if the code does not arrive within a few minutes.', de: 'Geben Sie Ihre E-Mail-Adresse im Anmeldefenster ein. Autorell sendet einen Einmalcode per E-Mail. Prüfen Sie auch den Spam-Ordner, falls der Code nicht innerhalb weniger Minuten ankommt.' },
  },
  {
    category: 'account',
    question: { sv: 'Vad är skillnaden mellan privatkonto och företagskonto?', en: 'What is the difference between a private and business account?', de: 'Was ist der Unterschied zwischen Privat- und Unternehmenskonto?' },
    answer: { sv: 'Privatkonto är för personer som köper eller säljer för egen räkning. Företagskonto används av handlare och bolag och kan visa företagsinformation, team och lager på ett mer professionellt sätt.', en: 'A private account is for people buying or selling for themselves. A business account is for dealers and companies and can present company details, teams and inventory more professionally.', de: 'Ein Privatkonto ist für Personen, die für sich selbst kaufen oder verkaufen. Ein Unternehmenskonto ist für Händler und Firmen und kann Unternehmensdaten, Teams und Bestand professioneller darstellen.' },
  },
  {
    category: 'account',
    question: { sv: 'Vilka kontaktuppgifter behöver vara korrekta?', en: 'Which contact details must be correct?', de: 'Welche Kontaktdaten müssen korrekt sein?' },
    answer: { sv: 'E-post, telefonnummer, namn, land och relevant företagsinformation behöver stämma. Uppgifterna används för konto, säkerhet, meddelanden, betalning och support.', en: 'Email, phone number, name, country and relevant company details must be accurate. The details are used for account access, safety, messages, payment and support.', de: 'E-Mail, Telefonnummer, Name, Land und relevante Unternehmensdaten müssen korrekt sein. Die Daten werden für Konto, Sicherheit, Nachrichten, Zahlung und Support genutzt.' },
  },
  {
    category: 'listings',
    question: { sv: 'Vilka fordon kan jag annonsera?', en: 'Which vehicles can I list?', de: 'Welche Fahrzeuge kann ich inserieren?' },
    answer: { sv: 'Du kan annonsera bilar, transportbilar, lastbilar, motorcyklar, husbilar, husvagnar, lantbruk, entreprenadmaskiner och andra fordon som stöds i marknadsplatsen.', en: 'You can list cars, vans, trucks, motorcycles, motorhomes, caravans, agricultural machinery, construction machinery and other supported marketplace vehicles.', de: 'Sie können Autos, Transporter, Lkw, Motorräder, Wohnmobile, Wohnwagen, Landmaschinen, Baumaschinen und andere unterstützte Fahrzeuge inserieren.' },
  },
  {
    category: 'listings',
    question: { sv: 'Kan jag redigera en annons efter publicering?', en: 'Can I edit a listing after publishing?', de: 'Kann ich eine Anzeige nach der Veröffentlichung bearbeiten?' },
    answer: { sv: 'Ja. Du kan uppdatera pris, text, bilder och vissa fordonsuppgifter från kontot. Större ändringar kan skickas till ny granskning om de påverkar objektets identitet eller säkerhet.', en: 'Yes. You can update price, text, images and some vehicle details from your account. Larger changes may be reviewed again if they affect identity or safety.', de: 'Ja. Preis, Text, Bilder und einige Fahrzeugdaten können im Konto aktualisiert werden. Größere Änderungen können erneut geprüft werden, wenn sie Identität oder Sicherheit betreffen.' },
  },
  {
    category: 'listings',
    question: { sv: 'Vad betyder annons-ID och referensnummer?', en: 'What do listing ID and reference number mean?', de: 'Was bedeuten Anzeigen-ID und Referenznummer?' },
    answer: { sv: 'Varje annons får ett unikt ID och referensnummer. Använd dem vid support, rapportering, betalningsfrågor eller om du behöver hänvisa till en specifik affär.', en: 'Every listing gets a unique ID and reference number. Use them for support, reports, payment questions or when you need to refer to a specific deal.', de: 'Jede Anzeige erhält eine eindeutige ID und Referenznummer. Nutzen Sie diese für Support, Meldungen, Zahlungsfragen oder wenn Sie auf einen bestimmten Handel verweisen müssen.' },
  },
  {
    category: 'buying',
    question: { sv: 'Hur kontaktar jag säljaren?', en: 'How do I contact the seller?', de: 'Wie kontaktiere ich den Verkäufer?' },
    answer: { sv: 'Öppna annonsen och välj telefon, meddelande eller kontaktformulär när det finns. För vissa åtgärder behöver du vara inloggad så kommunikationen kopplas till ditt konto.', en: 'Open the listing and choose phone, message or contact form when available. Some actions require sign-in so communication is connected to your account.', de: 'Öffnen Sie die Anzeige und wählen Sie Telefon, Nachricht oder Kontaktformular, wenn verfügbar. Einige Aktionen erfordern Anmeldung, damit die Kommunikation Ihrem Konto zugeordnet wird.' },
  },
  {
    category: 'buying',
    question: { sv: 'Vad ska jag kontrollera innan jag köper?', en: 'What should I check before buying?', de: 'Was sollte ich vor dem Kauf prüfen?' },
    answer: { sv: 'Kontrollera säljarens identitet, objektets dokument, VIN eller serienummer, servicehistorik, ägaruppgifter, bilder och att priset verkar rimligt.', en: 'Check the seller identity, documents, VIN or serial number, service history, ownership details, images and whether the price seems reasonable.', de: 'Prüfen Sie Verkäuferidentität, Dokumente, VIN oder Seriennummer, Servicehistorie, Eigentümerdaten, Bilder und ob der Preis plausibel ist.' },
  },
  {
    category: 'export',
    question: { sv: 'Kan jag köpa från ett annat EU-land?', en: 'Can I buy from another EU country?', de: 'Kann ich aus einem anderen EU-Land kaufen?' },
    answer: { sv: 'Ja. Kom överens tidigt om pris, betalning, hämtning, transport, dokument, försäkring och vem som ansvarar för export och registrering.', en: 'Yes. Agree early on price, payment, pickup, transport, documents, insurance and who handles export and registration.', de: 'Ja. Klären Sie früh Preis, Zahlung, Abholung, Transport, Dokumente, Versicherung und wer Export und Registrierung übernimmt.' },
  },
  {
    category: 'export',
    question: { sv: 'Vilka dokument behövs vid export eller import?', en: 'Which documents are needed for export or import?', de: 'Welche Dokumente werden für Export oder Import benötigt?' },
    answer: { sv: 'Spara köpeavtal, kvitto eller faktura, registreringsbevis, identitet på köpare och säljare, VIN eller serienummer, transportdokument och eventuell fullmakt.', en: 'Keep the purchase agreement, receipt or invoice, registration document, buyer and seller identity, VIN or serial number, transport documents and any power of attorney.', de: 'Bewahren Sie Kaufvertrag, Quittung oder Rechnung, Zulassungsdokument, Identität von Käufer und Verkäufer, VIN oder Seriennummer, Transportdokumente und ggf. Vollmacht auf.' },
  },
  {
    category: 'pricing',
    question: { sv: 'Vad kostar en annons?', en: 'What does a listing cost?', de: 'Was kostet eine Anzeige?' },
    answer: { sv: 'Grundannonsen är gratis under den period som visas i flödet. Längre publicering och extra synlighet väljs i Checkout och visar samma lokala pris som på prissidan.', en: 'The basic listing is free for the period shown in the flow. Longer publishing and extra visibility are selected in checkout and show the same local price as the pricing page.', de: 'Die Basisanzeige ist für den im Ablauf gezeigten Zeitraum kostenlos. Längere Laufzeit und zusätzliche Sichtbarkeit werden im Checkout gewählt und zeigen denselben lokalen Preis wie die Preisseite.' },
  },
  {
    category: 'pricing',
    question: { sv: 'Vad händer om betalningen dras flera gånger?', en: 'What if payment is charged more than once?', de: 'Was passiert, wenn die Zahlung mehrfach abgebucht wird?' },
    answer: { sv: 'Kontakta support med annons-ID, betalningsreferens och belopp. Om en dubbelbetalning bekräftas återbetalas den normalt till samma betalningsmetod.', en: 'Contact support with listing ID, payment reference and amount. If a duplicate payment is confirmed, it is normally refunded to the same payment method.', de: 'Kontaktieren Sie den Support mit Anzeigen-ID, Zahlungsreferenz und Betrag. Wird eine Doppelzahlung bestätigt, erfolgt die Erstattung normalerweise auf dieselbe Zahlungsmethode.' },
  },
  {
    category: 'messages',
    question: { sv: 'Varför ska jag hålla viktiga frågor i Autorell?', en: 'Why should I keep important questions in Autorell?', de: 'Warum sollte ich wichtige Fragen in Autorell halten?' },
    answer: { sv: 'Det ger bättre historik om något blir otydligt. Supporten kan lättare hjälpa till när annons, konto och kommunikation går att följa.', en: 'It creates a better history if something becomes unclear. Support can help more easily when listing, account and communication can be followed.', de: 'So entsteht ein besserer Verlauf, falls etwas unklar wird. Der Support kann leichter helfen, wenn Anzeige, Konto und Kommunikation nachvollziehbar sind.' },
  },
  {
    category: 'messages',
    question: { sv: 'Ska jag betala via ett meddelande?', en: 'Should I pay through a message?', de: 'Sollte ich über eine Nachricht bezahlen?' },
    answer: { sv: 'Nej. Skicka aldrig kortuppgifter, lösenord eller pengar på uppmaning i ett meddelande. Använd bara betalningsflöden som tydligt visas i ditt Autorell-konto.', en: 'No. Never send card details, passwords or money because of a message. Only use payment flows clearly shown in your Autorell account.', de: 'Nein. Senden Sie niemals Kartendaten, Passwörter oder Geld aufgrund einer Nachricht. Nutzen Sie nur Zahlungsabläufe, die klar in Ihrem Autorell-Konto angezeigt werden.' },
  },
  {
    category: 'safety',
    question: { sv: 'Hur rapporterar jag bedrägeri eller en falsk annons?', en: 'How do I report fraud or a fake listing?', de: 'Wie melde ich Betrug oder eine falsche Anzeige?' },
    answer: { sv: 'Öppna Rapportera problem och ange annons-ID, motpart, datum, betalningsreferens och belopp om det finns. Vid akut risk eller pågående brott ska du kontakta lokal polis först.', en: 'Open Report a problem and include listing ID, counterparty, date, payment reference and amount if available. If there is immediate risk or an ongoing crime, contact local police first.', de: 'Öffnen Sie Problem melden und geben Sie Anzeigen-ID, Gegenpartei, Datum, Zahlungsreferenz und Betrag an, falls vorhanden. Bei akuter Gefahr oder laufender Straftat wenden Sie sich zuerst an die lokale Polizei.' },
  },
  {
    category: 'safety',
    question: { sv: 'Är ett verifierat företag en garanti?', en: 'Is a verified company a guarantee?', de: 'Ist ein verifiziertes Unternehmen eine Garantie?' },
    answer: { sv: 'Nej. Verifiering minskar risk och gör företagsuppgifter tydligare, men ersätter inte din egen kontroll av objekt, dokument, betalning och avtal.', en: 'No. Verification reduces risk and makes company details clearer, but it does not replace your own checks of the item, documents, payment and agreement.', de: 'Nein. Verifizierung reduziert Risiko und macht Unternehmensdaten klarer, ersetzt aber nicht Ihre eigene Prüfung von Objekt, Dokumenten, Zahlung und Vertrag.' },
  },
  {
    category: 'business',
    question: { sv: 'Kan företag lägga upp flera annonser?', en: 'Can companies publish multiple listings?', de: 'Können Unternehmen mehrere Anzeigen veröffentlichen?' },
    answer: { sv: 'Ja. Företagskonton är byggda för återkommande annonsering, lagerhantering, företagssida och flera användare beroende på plan och upplägg.', en: 'Yes. Business accounts are built for recurring listings, inventory management, company pages and multiple users depending on plan and setup.', de: 'Ja. Unternehmenskonten sind für wiederkehrende Anzeigen, Bestandsverwaltung, Unternehmensseiten und mehrere Nutzer je nach Tarif und Einrichtung gebaut.' },
  },
  {
    category: 'business',
    question: { sv: 'Vilken information visas om ett företag?', en: 'Which company information is shown?', de: 'Welche Unternehmensdaten werden angezeigt?' },
    answer: { sv: 'Företagsnamn, logotyp, allmän kontaktinformation, adress, företagssida och relevanta annonser kan visas. Kontakt på en enskild annons kan fortfarande gå direkt till ansvarig säljare.', en: 'Company name, logo, general contact details, address, company page and relevant listings can be shown. Contact on an individual listing can still go directly to the responsible seller.', de: 'Firmenname, Logo, allgemeine Kontaktdaten, Adresse, Unternehmensseite und relevante Anzeigen können angezeigt werden. Kontakt auf einer einzelnen Anzeige kann weiterhin direkt zum zuständigen Verkäufer gehen.' },
  },
  {
    category: 'language',
    question: { sv: 'Hur byter jag språk och marknad?', en: 'How do I change language and market?', de: 'Wie ändere ich Sprache und Markt?' },
    answer: { sv: 'Öppna marknadsväljaren i headern eller footern och välj land. Autorell byter URL, språk och valuta utifrån vald marknad när det är möjligt.', en: 'Open the market selector in the header or footer and choose a country. Autorell changes URL, language and currency based on the selected market when possible.', de: 'Öffnen Sie die Marktauswahl im Header oder Footer und wählen Sie ein Land. Autorell ändert URL, Sprache und Währung nach Möglichkeit entsprechend dem gewählten Markt.' },
  },
]

export default function FaqPageClient({ locale: providedLocale }: { locale?: PublicLocale }) {
  const pathname = usePathname()
  const locale = providedLocale || localeFromPathname(pathname)
  const [category, setCategory] = useState<CategoryKey>('all')
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState<string | null>(questions[0]?.question.en || null)
  const text = (value: Localized) => {
    if (locale === 'sv') return value.sv
    if (locale === 'de') return value.de
    return translatePublic(locale, value.en)
  }
  const translate = (value: string) => (locale === 'sv' ? value : translatePublic(locale, value))

  const query = search.trim().toLocaleLowerCase(locale === 'sv' ? 'sv' : 'en')
  const filtered = questions.filter((item) => {
    const localizedQuestion = text(item.question)
    const localizedAnswer = text(item.answer)
    const localizedCategory = text(categories.find((candidate) => candidate.key === item.category)?.label || categories[0].label)
    const matchesCategory = category === 'all' || item.category === category
    const matchesSearch = !query || `${localizedCategory} ${localizedQuestion} ${localizedAnswer}`.toLocaleLowerCase(locale === 'sv' ? 'sv' : 'en').includes(query)
    return matchesCategory && matchesSearch
  })

  return (
    <>
      <div id="faq-search" className="mt-12 scroll-mt-28 rounded-[8px] border border-[#dfe6f2] bg-[#f8fbff] p-4 sm:p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0866ff]">{translate('Sök och filtrera')}</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-[-0.02em] text-[#101828]">{translate('Vanliga frågor')}</h2>
          </div>
          <span className="hidden text-sm font-medium text-[#667085] sm:block">
            {filtered.length} / {questions.length}
          </span>
        </div>
        <div className="mt-4 flex items-center gap-3 rounded-[8px] border border-[#cfd8e7] bg-white px-4">
          <Search className="h-5 w-5 text-[#667085]" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={translate('Sök bland frågor...')}
            className="h-13 w-full bg-transparent text-[#101828] outline-none placeholder:text-[#98a2b3]"
          />
        </div>
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:overflow-visible sm:pb-0">
        {categories.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setCategory(item.key)}
            className={`shrink-0 rounded-[8px] px-4 py-2.5 text-sm font-semibold transition ${
              category === item.key ? 'bg-[#0866ff] text-white' : 'border border-[#d8d7e1] bg-white text-[#344054] hover:border-[#0866ff] hover:text-[#0866ff]'
            }`}
          >
            {text(item.label)}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-3 lg:grid-cols-2">
        {filtered.map((item) => {
          const question = text(item.question)
          const isOpen = open === item.question.en
          const categoryLabel = text(categories.find((candidate) => candidate.key === item.category)?.label || categories[0].label)
          return (
            <div key={item.question.en} className="rounded-[8px] border border-[#dfe6f2] bg-white align-top">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : item.question.en)}
                className="flex w-full items-start justify-between gap-5 p-5 text-left"
                aria-expanded={isOpen}
              >
                <span>
                  <span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#0866ff]">{categoryLabel}</span>
                  <span className="mt-2 block text-base font-semibold leading-6 text-[#101828] sm:text-lg">{question}</span>
                </span>
                <span className={`mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-[8px] transition ${isOpen ? 'rotate-180 bg-[#0866ff] text-white' : 'bg-[#eef5ff] text-[#0866ff]'}`}>
                  <ChevronDown className="h-4 w-4" />
                </span>
              </button>
              <div className={`grid transition-[grid-template-rows] duration-300 ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden">
                  <p className="border-t border-[#edf1f6] px-5 pb-6 pt-4 text-sm leading-7 text-[#566174]">{text(item.answer)}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="mt-8 rounded-[8px] border border-[#dfe6f2] py-14 text-center">
          <p className="text-[#626d76]">{translate('Vi hittade ingen fråga som matchade din sökning.')}</p>
        </div>
      )}

      <div className="mt-10 flex min-h-[130px] flex-col items-start justify-between gap-6 rounded-[8px] border border-[#bfd0ea] bg-[#eef5ff] p-6 sm:flex-row sm:items-center sm:p-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.03em]">{translate('Hittade du inte svaret?')}</h2>
          <p className="mt-2 text-sm text-[#56636c]">{translate('Skicka din fråga så hjälper vi dig vidare.')}</p>
        </div>
        <Link href={localizePublicHref(locale, '/report')} className="inline-flex min-h-12 items-center gap-2 rounded-[8px] bg-[#0866ff] px-6 text-sm font-bold text-white transition hover:bg-[#0054d8]">
          {translate('Rapportera problem')} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </>
  )
}

function localeFromPathname(pathname: string): PublicLocale {
  const first = pathname.split('/').filter(Boolean)[0]
  if (first === 'se') return 'sv'
  if (first === 'de') return 'de'
  if (first === 'at') return 'at'
  if (first === 'be') return 'be'
  if (first === 'pl' || first === 'fr' || first === 'es' || first === 'it' || first === 'nl' || first === 'fi') {
    return first
  }
  if (first === 'dk') return 'da'
  return 'en'
}
