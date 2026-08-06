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
    title: 'Fordonsköp och vem som är säljare',
    paragraphs: [
      'Företagsannonser markeras som publicerade av en näringsidkare. När en konsument köper ett fordon av ett företag gäller konsumentköplagen och andra tvingande konsumentregler. Företagssäljaren ansvarar bland annat för korrekt identitet, totalpris, avgifter, leveransinformation, reklamationsrätt och eventuell ångerrätt vid distansavtal.',
      'När en privatperson köper av en annan privatperson gäller normalt köplagen och det parterna har avtalat. Det finns ingen allmän lagstadgad ångerrätt för ett sådant privatköp. Autorell visar därför kontotypen så att köparen kan förstå vem motparten är.',
      'Vid ett förmedlingsköp där ett företag sköter försäljningen till en konsument kan tvingande konsumentregler gälla även om fordonet är registrerat på en privatperson. Den som faktiskt förmedlar eller säljer ansvarar för att bedöma och uppfylla sina skyldigheter.',
    ],
  },
  {
    id: 'purchase-terms',
    title: 'Annonspaket, digital tjänst och ångerrätt',
    items: [
      'Sju dagars grundpublicering är gratis. Varje fordonskategori har ett fast pris för 15 dagar och Premium 30 dagar. Priset visas innan betalning.',
      'Samma publicerade kategoripris gäller för privatkonton och företagskonton, om inget separat skriftligt volymavtal gäller.',
      'Betalning hanteras av extern betalningsleverantör. Betalningsuppgifter ska aldrig skickas i meddelanden.',
      'En konsument som köper ett annonspaket på distans har normalt 14 dagars ångerrätt. Före omedelbar publicering ska konsumenten uttryckligen begära att tjänsten börjar under ångerfristen och bekräfta vad det innebär för ångerrätten när tjänsten har fullgjorts.',
      'Om konsumenten ångrar innan tjänsten är helt utförd kan Autorell, när lagen medger det, ha rätt till proportionell ersättning för den del som utförts efter konsumentens uttryckliga begäran.',
      'Från 19 juni 2026 kan konsumenter använda den tydliga ångerfunktionen på webbplatsen när ett avtal omfattas av lagstadgad ångerrätt. Autorell bekräftar mottagandet utan onödigt dröjsmål.',
    ],
  },
  {
    id: 'invoice-credit',
    title: 'Faktura, kredit och sen betalning',
    paragraphs: [
      'Företagsfaktura erbjuds endast när alternativet visas för ett behörigt företagskonto. Nuvarande betalningsvillkor är 14 dagar från fakturadatum. Företaget ansvarar för att faktura- och kontaktuppgifter är korrekta och för betalning på förfallodagen.',
      'Vid sen betalning får Autorell ta ut dröjsmålsränta enligt räntelagen och avtalade, lagligen tillåtna påminnelse- och inkassoavgifter. En påminnelseavgift tas bara ut när det finns stöd i avtalet och lagen. Åtkomst till ny publicering kan begränsas medan en ostridig faktura är förfallen.',
      'Autorell erbjuder inte själv fordonslån eller konsumentkredit om det inte uttryckligen anges i ett separat erbjudande. Finansieringsuppgifter i en annons kommer från företagssäljaren eller angiven kreditgivare. Kreditgivaren ansvarar för förköpsinformation, kreditprövning, avtal, effektiv ränta och övriga krav enligt konsumentkreditlagen.',
      'Om ett framtida betalningsalternativ innebär kredit till en konsument, exempelvis faktura via ett faktureringsbolag, gäller konsumentkreditlagens tvingande skydd och den angivna kreditgivarens villkor. Lån och faktura mellan företag omfattas inte av konsumentkreditlagen.',
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
      'En konsument kan använda webbplatsens ångerfunktion för ett avtal som omfattas av ångerrätt. Reklamationer och bestridanden ska göras så snart som möjligt och påverkar inte tvingande lagstadgade rättigheter.',
      'Om en konsument och Autorell inte kommer överens kan konsumenten anmäla tvisten till Allmänna reklamationsnämnden (ARN) när nämndens villkor är uppfyllda. Autorell deltar i tillämplig alternativ tvistlösning och lämnar den information som lagen kräver.',
      'Svensk lag tillämpas i den utsträckning den inte undanträngs av tvingande regler i användarens land. Konsumenter behåller rätten att använda behörig domstol och tvistlösning enligt tvingande lag.',
      'Tjänsten tillhandahålls av Autorell AB i Sverige. Fullständiga bolags- och adressuppgifter ska alltid framgå av avtal, betalningsunderlag och obligatorisk företagsinformation innan kommersiell transaktion slutförs.',
    ],
  },
]

export default function TermsPage() {
  return <PublicLegalPage eyebrow="Juridisk information" title="Användar- och marknadsplatsvillkor" intro="Reglerna för konton, annonser, kontakt mellan användare, betalning och trygghet på Autorell." sections={sections} />
}
