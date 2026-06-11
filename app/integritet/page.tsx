import { createPublicMetadata } from '@/lib/public-seo'
import PublicLegalPage from '../components/PublicLegalPage'

export const metadata = createPublicMetadata({
  title: 'Integritetspolicy och personuppgifter | Autorell',
  description:
    'Läs hur Autorell behandlar personuppgifter, vilka uppgifter som delas, rättsliga grunder, lagring och dina rättigheter enligt GDPR.',
  path: '/integritet',
})

const sections = [
  {
    id: 'ansvarig',
    title: 'Personuppgiftsansvarig',
    paragraphs: [
      'Autorell AB i Sverige är personuppgiftsansvarig. Frågor och begäranden skickas till info@autorell.com.',
      'Organisationsnummer och fullständig registrerad adress ska publiceras här innan kommersiell lansering.',
    ],
  },
  {
    id: 'uppgifter',
    title: 'Uppgifter vi behandlar',
    items: [
      'Namn, telefonnummer, e-postadress och annan kontaktinformation.',
      'Registreringsnummer, VIN, märke, modell, körsträcka, skick, utrustning och fotografier.',
      'Information om ägande, service, skador, finansiering och önskad försäljningstid.',
      'Kommunikation, erbjudanden, avtal, betalnings- och logistikreferenser.',
      'IP-adress, webbläsare och säkerhetsloggar när det krävs för drift, bevisning eller bedrägeriskydd.',
    ],
  },
  {
    id: 'andamal',
    title: 'Varför uppgifterna används',
    items: [
      'Skapa och bedöma fordonsprofilen.',
      'Presentera relevant fordonsinformation för godkända professionella köpare.',
      'Administrera bud, kontakta dig om resultat och hantera en möjlig försäljning.',
      'Genomföra identitets-, ägar-, säkerhets- och bedrägerikontroller.',
      'Hantera avtal, betalning, transport, export, bokföring och rättsliga krav.',
    ],
  },
  {
    id: 'dealers',
    title: 'Vad dealers får se',
    paragraphs: [
      'Autorell säljer inte och hyr inte ut ditt telefonnummer, din e-postadress eller andra kontaktuppgifter som marknadsföringsdata.',
      'Under budgivningen ser godkända dealers fordonsprofilen men inte säljarens telefonnummer eller e-postadress. Dealers visas anonymt för varandra.',
      'Registreringsnummer, VIN, bilder och andra relevanta fordonsuppgifter kan visas när de behövs för professionell värdering.',
      'Efter att du accepterat ett erbjudande kan nödvändiga partsuppgifter delas med vinnande köpare och leverantörer för avtal, betalning, hämtning och ägarövergång.',
    ],
  },
  {
    id: 'mottagare',
    title: 'Mottagare och leverantörer',
    items: [
      'Godkända bilhandlare och den vinnande köparen när affären kräver det.',
      'Leverantörer av hosting, databas, e-post, signering, identitetskontroll, betalning och säkerhet.',
      'Transportörer, dokumentleverantörer, rådgivare och myndigheter.',
      'Leverantörer får bara behandla uppgifter för avtalade ändamål och med lämpligt skydd.',
    ],
  },
  {
    id: 'grund',
    title: 'Rättslig grund',
    items: [
      'Avtal och åtgärder på din begäran för värdering, förmedling och försäljning.',
      'Rättsliga skyldigheter för bokföring, skatt och myndighetskrav.',
      'Berättigat intresse för säker drift, bedrägeriskydd och dokumentation.',
      'Samtycke där lagen kräver det, exempelvis framtida icke-nödvändiga cookies eller separat marknadsföring.',
    ],
  },
  {
    id: 'lagring',
    title: 'Lagring och gallring',
    paragraphs: [
      'Uppgifter sparas bara så länge de behövs för ärendet, dokumentation och rättsliga anspråk. Genomförda affärer sparas längre när bokförings-, skatte- eller avtalsregler kräver det.',
      'Exakta gallringsperioder per uppgiftskategori ska fastställas före kommersiell lansering.',
    ],
  },
  {
    id: 'overforing',
    title: 'Överföring utanför EU/EES',
    paragraphs: [
      'Om en leverantör behandlar uppgifter utanför EU/EES används en laglig överföringsmekanism och nödvändiga skyddsåtgärder.',
    ],
  },
  {
    id: 'rattigheter',
    title: 'Dina rättigheter',
    items: [
      'Begära tillgång till och rättelse av dina personuppgifter.',
      'Begära radering eller begränsning när GDPR:s villkor är uppfyllda.',
      'Invända mot behandling som grundas på berättigat intresse.',
      'Begära dataportabilitet för tillämplig behandling.',
      'Återkalla samtycke och lämna klagomål till Integritetsskyddsmyndigheten (IMY).',
    ],
  },
]

export default function PrivacyPage() {
  return (
    <PublicLegalPage
      eyebrow="Juridisk information"
      title="Integritetspolicy"
      intro="Vilka uppgifter vi använder, varför de behövs och vad som delas med bilhandlare."
      sections={sections}
    />
  )
}
