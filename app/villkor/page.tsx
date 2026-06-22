import { createPublicMetadata } from '@/lib/public-seo'
import PublicLegalPage from '../components/PublicLegalPage'

export const metadata = createPublicMetadata({
  title: 'Användar- och marknadsplatsvillkor | Autorell',
  description: 'Villkor för konton, annonser, meddelanden, betalning, företagsförsäljning, rapportering och ansvar på Autorell.',
  path: '/villkor',
})

const sections = [
  {
    id: 'plattformens-roll',
    title: 'Plattformens roll',
    paragraphs: [
      'Autorell tillhandahåller en digital marknadsplats där privatpersoner och företag kan publicera fordonsannonser, söka, spara sökningar och kommunicera. På en vanlig marknadsplatsannons är Autorell inte automatiskt köpare, säljare, agent, garant eller part i avtalet mellan användarna.',
      'Autorell köper inte in annonserade fordon, lämnar inte bud och agerar inte som återförsäljare eller exportör. Köpare och säljare ansvarar själva för kontroll, avtal, betalning, transport, registrering och ägarbyte.',
    ],
  },
  {
    id: 'konton',
    title: 'Privat- och företagskonton',
    items: [
      'Kontoinnehavaren ska vara minst 18 år och lämna korrekta, aktuella kontakt- och identitetsuppgifter.',
      'Privatkonto används för egen, icke-yrkesmässig handel. Den som säljer som ett led i näringsverksamhet ska använda företagskonto.',
      'Företagskonton ska ange företagsnamn, registreringsnummer och andra uppgifter som behövs för att identifiera näringsidkaren.',
      'Autorell kan genomföra format-, dubblett-, VAT-, dokument- och riskkontroller samt begära e-legitimation eller ytterligare underlag. En kontrollmarkering är inte en garanti för framtida beteende, betalningsförmåga eller fordonet.',
      'Kontot är personligt. Lösenord och åtkomst får inte delas eller användas för att kringgå avstängning eller kontroll.',
    ],
  },
  {
    id: 'annonser',
    title: 'Annonser och säljarens ansvar',
    items: [
      'Säljaren måste ha rätt att annonsera och sälja fordonet.',
      'Kategori, identitet, ägande, pris, plats, skick, körsträcka eller drifttimmar, kända fel, skador, finansiering, utrustning och bilder ska vara korrekta och inte vilseledande.',
      'Det är förbjudet att annonsera stulna, osäkra, olagliga, återkallade eller felaktigt identifierade objekt eller använda material som gör intrång i annans rätt.',
      'Autorell får automatiskt eller manuellt granska, begränsa, begära komplettering, dölja eller ta bort innehåll och bevara nödvändig bevisning.',
    ],
  },
  {
    id: 'naringidkare',
    title: 'När säljaren är ett företag',
    paragraphs: [
      'Företagsannonser markeras som publicerade av en näringsidkare. Företaget ansvarar för obligatorisk information om identitet, totalpris, skatter, avgifter, leverans, garantier, reklamation, ångerrätt när sådan gäller och övriga tvingande konsumentregler.',
      'En privat säljare omfattas normalt inte av samma konsumenträttsliga skyldigheter som en näringsidkare. Plattformen visar därför kontotypen så att köparen kan förstå vem motparten är.',
    ],
  },
  {
    id: 'priser',
    title: 'Annonspaket och betalning',
    items: [
      'Sju dagars grundpublicering är gratis. Varje fordonskategori har ett fast pris för 15 dagar och Premium 30 dagar. Priset visas innan betalning.',
      'Samma publicerade kategoripris gäller för privatkonton och företagskonton, om inget separat skriftligt volymavtal gäller.',
      'Betalning hanteras av extern betalningsleverantör. Betalningsuppgifter ska aldrig skickas i meddelanden.',
      'Köpta digitala annonstjänster börjar enligt det valda paketet. Information om eventuell lagstadgad ångerrätt och samtycke till omedelbar leverans ska visas i checkout när det krävs.',
    ],
  },
  {
    id: 'meddelanden',
    title: 'Meddelanden och förbjudet beteende',
    items: [
      'Inloggning krävs för att kontakta en säljare. Meddelanden får endast användas för legitim kommunikation om annonsen.',
      'Bedrägeri, trakasserier, spam, diskriminering, skadliga länkar, identitetsmissbruk och försök att få lösenord, kortuppgifter eller otillbörliga betalningar är förbjudna.',
      'Autorell kan behandla och granska rapporterad kommunikation för säkerhet, support, tvist, bevisning och missbruksbekämpning.',
    ],
  },
  {
    id: 'rapportering',
    title: 'Rapportering och åtgärder',
    paragraphs: [
      'Användare kan rapportera misstänkt olagligt eller vilseledande innehåll, bedrägeri och missbruk via rapporteringsfunktionen. Rapporten bör identifiera annonsen eller konversationen och förklara problemet tillräckligt tydligt.',
      'Autorell bedömer rapporter och kan ta bort innehåll, begränsa funktioner, stänga av konton, säkra loggar och kontakta berörda användare eller myndigheter. Beslut fattas utifrån tillgängliga uppgifter och kan omprövas efter komplettering.',
      'Autorell kan hjälpa en drabbad användare att identifiera relevant konto-, annons-, betalnings- och meddelandedata och bevara uppgifter för en utredning. Användaren ansvarar fortfarande för att göra polisanmälan, kontakta bank eller betalningsleverantör och begränsa fortsatt skada.',
    ],
  },
  {
    id: 'ansvar',
    title: 'Ansvar och tillgänglighet',
    items: [
      'Autorell garanterar inte att en annons leder till kontakt, försäljning, visst pris eller att en användares uppgifter är fullständiga.',
      'Användarna ansvarar för egen kontroll av motpart, ägande, identitet, skick, dokument, skatt, registrering, transport, försäkring och tillämpliga regler innan avtal eller betalning.',
      'Ingenting i villkoren begränsar ansvar eller rättigheter som inte lagligen kan begränsas, inklusive tvingande konsument- och dataskyddsrätt.',
    ],
  },
  {
    id: 'tvist',
    title: 'Klagomål, lag och kontakt',
    paragraphs: [
      'Klagomål skickas till info@autorell.com eller via hjälpcentret. Ange konto, annons eller konversation och önskad lösning.',
      'Svensk lag tillämpas i den utsträckning den inte undanträngs av tvingande regler i användarens land. Konsumenter behåller rätten att använda behörig domstol och tvistlösning enligt tvingande lag.',
      'Tjänsten tillhandahålls av Autorell AB i Sverige. Fullständiga bolags- och adressuppgifter ska alltid framgå av avtal, betalningsunderlag och obligatorisk företagsinformation innan kommersiell transaktion slutförs.',
    ],
  },
]

export default function TermsPage() {
  return <PublicLegalPage eyebrow="Juridisk information" title="Användar- och marknadsplatsvillkor" intro="Reglerna för konton, annonser, kontakt mellan användare, betalning och trygghet på Autorell." sections={sections} />
}
