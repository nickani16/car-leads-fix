import { createPublicMetadata } from '@/lib/public-seo'
import { getRequestLocale } from '@/lib/request-locale'
import { translatePublic } from '@/lib/public-i18n'
import PublicLegalPage from '../components/PublicLegalPage'

export async function generateMetadata() {
  const locale = await getRequestLocale()
  return createPublicMetadata({
    title: `${translatePublic(locale, 'Cookie Policy')} | Autorell`,
    description: translatePublic(
      locale,
      'Information about necessary cookies, consent-based analytics, performance measurement, advertising and how you manage your choices on Autorell.',
    ),
    path: '/cookies',
    locale,
  })
}

const sections = [
  {
    id: 'kakor',
    title: 'Vad är kakor?',
    paragraphs: [
      'Kakor är små filer som en webbplats lagrar eller läser på din enhet. Liknande tekniker kan använda lokal lagring eller andra identifierare.',
    ],
  },
  {
    id: 'idag',
    title: 'Vad vi använder idag',
    paragraphs: [
      'Autorell använder nödvändiga tekniker för säker inloggning, sessionshantering, skydd mot missbruk och funktioner som användaren uttryckligen begär.',
      'Vercel Analytics och Vercel Speed Insights laddas först efter att du aktivt har godkänt statistik och prestandamätning. Google AdSense laddas först efter att du separat har godkänt annonsering. Om du endast accepterar nödvändiga kakor laddas inget av dessa verktyg.',
    ],
  },
  {
    id: 'nodvandiga',
    title: 'Nödvändiga kakor',
    items: [
      'Autentiserings- och sessionskakor för Autorell-kontot.',
      'Säkerhetsfunktioner som krävs för att tjänsten ska fungera.',
      'Teknisk lagring som behövs för en uttryckligen begärd funktion.',
      'Nödvändiga kakor kräver normalt inte samtycke men ska beskrivas.',
    ],
  },
  {
    id: 'valfria',
    title: 'Statistik och prestanda',
    paragraphs: [
      'Med ditt separata samtycke använder vi Vercel Analytics för aggregerad användningsstatistik och Vercel Speed Insights för att mäta webbplatsens prestanda. Vercel kan behandla teknisk information som IP-adress, enhets- och webbläsarinformation samt besökta sidor enligt sina villkor.',
      'Samtycket är frivilligt och påverkar inte din möjlighet att använda Autorells grundfunktioner.',
    ],
  },
  {
    id: 'annonsering',
    title: 'Annonsering',
    paragraphs: [
      'Med ett separat samtycke använder vi Google AdSense för att visa och mäta annonser. Google kan behandla teknisk information, annonsinteraktioner och identifierare enligt sina integritetsvillkor och dina val.',
      'Du kan välja annonsering oberoende av statistik och prestandamätning. Samtycket är frivilligt.',
    ],
  },
  {
    id: 'hantera',
    title: 'Hantera kakor',
    paragraphs: [
      'Du kan när som helst öppna Cookieinställningar i sidfoten och ändra eller återkalla varje val separat. När ett tidigare godkännande återkallas laddas sidan om utan det verktyg som inte längre är godkänt. Du kan också radera eller blockera kakor i webbläsaren.',
      'Om nödvändiga autentiseringskakor blockeras kan konto-, annons- och meddelandefunktioner sluta fungera.',
    ],
  },
  {
    id: 'inventering',
    title: 'Cookieinventering',
    items: [
      'autorell_cookie_consent · Autorell · sparar om du valt nödvändiga, statistik/prestanda, annonsering eller samtliga tekniker · 180 dagar · nödvändig för att respektera ditt val.',
      'autorell-market och autorell-language · Autorell · sparar vald marknad och språk · högst 1 år · nödvändiga för begärd lokalisering.',
      'Autentiserings- och sessionsuppgifter · Autorell/Supabase · håller dig säkert inloggad och förnyar sessionen · till utloggning eller sessionens utgång · nödvändiga.',
      'Vercel Analytics · Vercel · aggregerad användningsstatistik · aktiveras endast med separat samtycke till statistik och prestanda; teknisk lagring och behandlingsperiod följer Vercels aktuella tjänsteinställningar.',
      'Vercel Speed Insights · Vercel · prestanda- och laddningsmätning · aktiveras endast med separat samtycke till statistik och prestanda; teknisk lagring och behandlingsperiod följer Vercels aktuella tjänsteinställningar.',
      'Google AdSense · Google · annonsvisning, annonsmätning, bedrägeriskydd och, där ditt val och Googles inställningar tillåter det, personalisering · aktiveras endast med separat samtycke till annonsering; Google kan använda flera identifierare med olika giltighetstid.',
    ],
  },
  {
    id: 'leverantorer',
    title: 'Leverantörer och överföringar',
    paragraphs: [
      'Vercel och Google är externa leverantörer och kan behandla uppgifter utanför EU/EES. När det sker ska leverantören och Autorell använda en laglig överföringsmekanism, exempelvis EU-kommissionens standardavtalsklausuler, och tillämpliga skyddsåtgärder.',
      'Aktuella namn på enskilda tredjepartskakor kan ändras av leverantören. Vi granskar inventeringen löpande och uppdaterar sidan när teknik eller ändamål ändras väsentligt.',
    ],
  },
]

export default function CookiesPage() {
  return (
    <PublicLegalPage
      eyebrow="Juridisk information"
      title="Cookiepolicy"
      intro="Nödvändiga tekniker håller Autorell säkert och fungerande. Statistik, prestandamätning och annonsering aktiveras endast efter ditt aktiva samtycke."
      sections={sections}
    />
  )
}
