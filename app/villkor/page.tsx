import { createPublicMetadata } from '@/lib/public-seo'
import PublicLegalPage from '../components/PublicLegalPage'

export const metadata = createPublicMetadata({
  title: 'Användarvillkor för Autorell',
  description:
    'Villkor för fordonsprofil, budgivning, säljarens beslut, kontroll, avtal, betalning, hämtning och förmedling genom Autorell.',
  path: '/villkor',
})

const sections = [
  {
    id: 'tjansten',
    title: 'Om tjänsten',
    paragraphs: [
      'Autorell låter fordonsägare lämna information om ett fordon och ta emot erbjudanden från godkända professionella köpare.',
      'Att skapa en fordonsprofil är kostnadsfritt för säljaren och innebär inte att bilen är såld eller att säljaren måste acceptera ett erbjudande.',
    ],
  },
  {
    id: 'ansvar',
    title: 'Säljarens ansvar',
    items: [
      'Du måste ha rätt att lämna fordonsuppgifterna och förfoga över fordonet.',
      'Körsträcka, ägare, skador, service, finansiering, utrustning och skick ska beskrivas korrekt.',
      'Kända fel, skulder, äganderättsförbehåll och andra försäljningshinder ska uppges.',
      'Bilder och material får inte göra intrång i någon annans rättigheter.',
    ],
  },
  {
    id: 'presentation',
    title: 'Presentation för köpare',
    paragraphs: [
      'Relevant fordonsinformation kan visas för Autorells godkända handlarnätverk i Sverige och Europa, inklusive registreringsnummer, VIN, bilder, tekniska data, körsträcka och skick när det behövs för värdering.',
      'Telefonnummer och e-postadress säljs inte och visas inte för dealers under budgivningen.',
    ],
  },
  {
    id: 'bud',
    title: 'Bud och säljarens beslut',
    items: [
      'Dealerbud är erbjudanden till säljaren.',
      'Säljaren bestämmer själv om ett erbjudande ska accepteras.',
      'Ett högsta bud innebär inte automatiskt att ett köpeavtal har ingåtts med säljaren.',
      'Efter accept kan identitets-, ägar-, fordons- och dokumentkontroller krävas.',
      'Den slutliga affären styrs av separata transaktions- och förmedlingsavtal.',
    ],
  },
  {
    id: 'kontroll',
    title: 'Kontroll och avvikelser',
    paragraphs: [
      'Erbjudandet kan behöva bekräftas efter kontroll av identitet, ägande, finansiering, dokument, körsträcka och skick. Väsentliga avvikelser kan påverka eller ogiltigförklara erbjudandet.',
    ],
  },
  {
    id: 'affar',
    title: 'Avtal, betalning och hämtning',
    paragraphs: [
      'Belopp, parter, fordon, skick, riskövergång, betalning, hämtning, export och eventuella avgifter ska framgå av de slutliga transaktionsdokumenten.',
      'Betalning ska genomföras genom bank eller licensierad betalningsleverantör enligt det aktuella avtalet.',
    ],
  },
  {
    id: 'begransning',
    title: 'Ansvar och tillgänglighet',
    items: [
      'Autorell garanterar inte att ett fordon får bud eller att ett visst pris uppnås.',
      'Tjänsten kan påverkas av underhåll, tekniska fel eller händelser utanför rimlig kontroll.',
      'Inget begränsar tvingande konsumenträttigheter.',
      'Oskäliga villkor eller villkor som strider mot tvingande lag ska inte tillämpas.',
    ],
  },
  {
    id: 'klagomal',
    title: 'Klagomål och tvist',
    paragraphs: [
      'Frågor och klagomål skickas till info@autorell.com.',
      'Tillämplig lag, behörig domstol och eventuell alternativ tvistlösning ska fastställas efter juridisk granskning före kommersiell lansering.',
    ],
  },
  {
    id: 'foretag',
    title: 'Företagsuppgifter',
    paragraphs: [
      'Tjänsten tillhandahålls av Autorell AB i Sverige. Organisationsnummer och fullständig registrerad adress ska publiceras före kommersiell lansering. Kontakt: info@autorell.com.',
    ],
  },
]

export default function TermsPage() {
  return (
    <PublicLegalPage
      eyebrow="Juridisk information"
      title="Användarvillkor"
      intro="Villkoren för att skapa en fordonsprofil, ta emot erbjudanden och gå vidare med en försäljning."
      sections={sections}
    />
  )
}
