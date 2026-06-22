import { createPublicMetadata } from '@/lib/public-seo'
import PublicLegalPage from '../components/PublicLegalPage'

export const metadata = createPublicMetadata({
  title: 'Integritetspolicy för Autorell marketplace',
  description: 'Hur Autorell behandlar konto-, kontakt-, annons-, meddelande-, betalnings- och säkerhetsuppgifter enligt GDPR.',
  path: '/integritet',
})

const sections = [
  {
    id: 'ansvarig',
    title: 'Personuppgiftsansvarig',
    paragraphs: [
      'Autorell AB i Sverige är personuppgiftsansvarig för marknadsplatsen. Frågor, invändningar och rättighetsbegäranden skickas till info@autorell.com.',
    ],
  },
  {
    id: 'uppgifter',
    title: 'Uppgifter vi behandlar',
    items: [
      'Kontotyp, för- och efternamn, födelsedatum, e-post, telefon, land, adress och inloggnings- och säkerhetsinformation.',
      'För privatkonton behandlas nationellt identitetsnummer för format-, dubblett- och riskkontroll. Råvärdet sparas inte i marknadsplatsprofilen; en skyddad kontrollreferens och de sista fyra tecknen kan sparas.',
      'För företag: företagsnamn, registreringsnummer, VAT-nummer, företrädare och verifieringsuppgifter.',
      'Annonsdata, bilder, fordonsidentitet, pris, plats, skick, historik, kända fel och publiceringspaket.',
      'Meddelanden, rapporter, supportärenden, modereringsbeslut och bevisning om misstänkt missbruk.',
      'Betalningsreferenser, paket, belopp, kvitto- och återbetalningsstatus. Fullständiga kortuppgifter lagras inte av Autorell.',
      'IP-adress, enhets-, webbläsar-, sessions- och händelseloggar när det behövs för drift och säkerhet.',
    ],
  },
  {
    id: 'andamal',
    title: 'Ändamål och rättslig grund',
    items: [
      'Avtal och åtgärder på din begäran: skapa konto, publicera annons, leverera annonspaket, möjliggöra meddelanden och support.',
      'Rättslig skyldighet: bokföring, skatt, myndighetsförfrågningar och skyldigheter för digitala plattformar och näringsidkare.',
      'Berättigat intresse: säker drift, bedrägeribekämpning, moderering, tvistbevisning, tjänsteutveckling och skydd av användare.',
      'Nationella identitetsnummer behandlas endast när det är tillåtet enligt tillämplig nationell rätt och med särskilda skyddsåtgärder. Ytterligare identitetskontroll kan utföras av en separat verifieringsleverantör.',
      'Samtycke används där lagen kräver det, exempelvis för icke nödvändiga cookies eller separat marknadsföring.',
    ],
  },
  {
    id: 'synlighet',
    title: 'Vad andra användare ser',
    paragraphs: [
      'Annonsen visar relevanta fordonsuppgifter, säljarens visningsnamn eller företagsnamn, land och om säljaren är privatperson eller näringsidkare.',
      'E-post, telefon, full adress, identitetsuppgifter och betalningsinformation visas inte öppet. Nödvändiga uppgifter kan delas mellan parter när ett avtal, leverans, kontroll eller rättslig skyldighet kräver det.',
    ],
  },
  {
    id: 'mottagare',
    title: 'Mottagare och leverantörer',
    items: [
      'Motparten i en affär när det är nödvändigt och tydligt för användaren.',
      'Leverantörer av hosting, databas, autentisering, lagring, e-post, betalning, analys, säkerhet och kundsupport.',
      'Rådgivare, transportörer, försäkrings- och identitetsleverantörer när användaren väljer ett flöde som kräver dem.',
      'Myndigheter och brottsbekämpande organ när lag, rättsligt krav eller skydd av personer och egendom kräver det.',
    ],
  },
  {
    id: 'lagring',
    title: 'Lagring och gallring',
    paragraphs: [
      'Kontodata sparas medan kontot är aktivt och därefter under den tid som behövs för rättsliga anspråk, säkerhet och skyldigheter. Annons- och meddelandedata kan sparas efter borttagning när det behövs för moderering, bedrägeribekämpning eller tvist.',
      'Skyddade identitetsreferenser och kontrollhistorik gallras när de inte längre behövs för kontosäkerhet, rättsliga krav eller bedrägeribekämpning.',
      'Betalnings- och bokföringsunderlag sparas enligt tillämpliga bokförings- och skatteregler. Uppgifter som inte längre behövs raderas eller anonymiseras.',
    ],
  },
  {
    id: 'overforing',
    title: 'Överföring utanför EU/EES',
    paragraphs: [
      'Om en leverantör behandlar uppgifter utanför EU/EES används ett giltigt överföringsstöd, exempelvis adekvansbeslut eller standardavtalsklausuler, samt kompletterande skydd när det behövs.',
    ],
  },
  {
    id: 'rattigheter',
    title: 'Dina rättigheter',
    items: [
      'Begära tillgång, rättelse, radering eller begränsning när GDPR:s villkor är uppfyllda.',
      'Invända mot behandling som grundas på berättigat intresse och begära dataportabilitet för tillämplig behandling.',
      'Återkalla samtycke utan att tidigare laglig behandling påverkas.',
      'Lämna klagomål till Integritetsskyddsmyndigheten (IMY) eller behörig dataskyddsmyndighet i ditt EU/EES-land.',
    ],
  },
  {
    id: 'sakerhet',
    title: 'Säkerhet och rapportering',
    paragraphs: [
      'Autorell använder behörighetskontroller, loggning, separerade roller och andra tekniska och organisatoriska åtgärder. Ingen internetbaserad tjänst kan dock garanteras helt fri från risk.',
      'Misstänkt kontointrång, identitetsmissbruk eller bedrägeri rapporteras omedelbart via hjälpcentret och till info@autorell.com.',
      'Automatiska kontroller kan flagga dubbletter, ogiltiga format eller riskmönster. En flagga leder inte ensam till ett slutligt rättsligt beslut; användaren kan begära manuell granskning.',
    ],
  },
]

export default function PrivacyPage() {
  return <PublicLegalPage eyebrow="Juridisk information" title="Integritetspolicy" intro="Hur personuppgifter används för konton, annonser, meddelanden, betalning och trygghet." sections={sections} />
}
