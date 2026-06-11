import { createPublicMetadata } from '@/lib/public-seo'
import PublicLegalPage from '../components/PublicLegalPage'

export const metadata = createPublicMetadata({
  title: 'Cookiepolicy och cookieinställningar | Autorell',
  description:
    'Information om nödvändiga cookies, säkerhet, sessionshantering, framtida analysverktyg och hur du hanterar cookies på Autorell.',
  path: '/cookies',
})

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
      'Vi har för närvarande inte aktiverat marknadsföringscookies eller fristående analysverktyg på den publika webbplatsen.',
    ],
  },
  {
    id: 'nodvandiga',
    title: 'Nödvändiga kakor',
    items: [
      'Autentiserings- och sessionskakor för Dealer Portal.',
      'Säkerhetsfunktioner som krävs för att tjänsten ska fungera.',
      'Teknisk lagring som behövs för en uttryckligen begärd funktion.',
      'Nödvändiga kakor kräver normalt inte samtycke men ska beskrivas.',
    ],
  },
  {
    id: 'framtida',
    title: 'Analys och marknadsföring',
    paragraphs: [
      'Framtida statistik-, personaliserings- eller marknadsföringscookies aktiveras inte innan tydlig information och aktivt samtycke har lämnats där lagen kräver det.',
      'Användaren ska kunna neka lika enkelt och senare ändra eller återkalla sitt val.',
    ],
  },
  {
    id: 'hantera',
    title: 'Hantera kakor',
    paragraphs: [
      'Du kan radera eller blockera kakor i webbläsaren. Om nödvändiga autentiseringskakor blockeras kan Dealer Portal sluta fungera.',
    ],
  },
  {
    id: 'inventering',
    title: 'Cookieinventering',
    paragraphs: [
      'Innan icke-nödvändiga tekniker införs kompletteras denna sida med namn, leverantör, ändamål, uppgiftstyp och lagringstid för varje kaka.',
    ],
  },
]

export default function CookiesPage() {
  return (
    <PublicLegalPage
      eyebrow="Juridisk information"
      title="Cookiepolicy"
      intro="Vi använder så få kakor som möjligt och aktiverar inte icke-nödvändig spårning utan det samtycke som lagen kräver."
      sections={sections}
    />
  )
}
