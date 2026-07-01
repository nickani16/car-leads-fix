import { createPublicMetadata } from '@/lib/public-seo'
import PublicLegalPage from '../components/PublicLegalPage'

export const metadata = createPublicMetadata({
  title: 'Återbetalning av annonsavgifter | Autorell',
  description:
    'Återbetalningspolicy för annonsavgifter på Autorell, inklusive publicerade annonser, tekniska fel, feldebitering och handläggningstid.',
  path: '/aterbetalningspolicy',
})

const sections = [
  {
    id: 'publicerad-annons',
    title: 'Efter att en annons har publicerats',
    paragraphs: [
      'När en annons har publicerats på Autorell påbörjas tjänsten omedelbart. Därför gäller normalt ingen återbetalning av annonsavgiften efter att annonsen har blivit publicerad.',
    ],
  },
  {
    id: 'ratt-till-aterbetalning',
    title: 'Du kan ha rätt till återbetalning om',
    items: [
      'Din annons inte kunde publiceras på grund av ett tekniskt fel hos Autorell.',
      'Din betalning genomfördes flera gånger av misstag.',
      'Du debiterades fel belopp.',
      'Autorell av misstag publicerade eller hanterade din annons felaktigt.',
      'EU:s konsumentskyddslagstiftning ger dig rätt till återbetalning i ditt land.',
    ],
  },
  {
    id: 'ingen-aterbetalning',
    title: 'Återbetalning gäller normalt inte om',
    items: [
      'Du själv väljer att ta bort annonsen efter publicering.',
      'Du säljer fordonet eller avbryter försäljningen.',
      'Annonsperioden löper ut utan försäljning.',
      'Du ändrar dig efter att annonsen har publicerats.',
      'Din annons tas bort eftersom den bryter mot Autorells användarvillkor eller tillämplig lag.',
    ],
  },
  {
    id: 'innan-publicering',
    title: 'Innan publicering',
    paragraphs: [
      'Om betalningen har genomförts men annonsen ännu inte har publicerats kan du kontakta Autorells support för att begära avbokning. Om tjänsten ännu inte har påbörjats kan betalningen återbetalas.',
    ],
  },
  {
    id: 'begar-aterbetalning',
    title: 'Hur begär jag en återbetalning?',
    paragraphs: [
      'Kontakta Autorells support och ange annons-ID, betalningsreferens och anledning till återbetalningsbegäran.',
      'Vi granskar varje ärende individuellt och återkommer så snart som möjligt.',
    ],
  },
  {
    id: 'handlaggningstid',
    title: 'Handläggningstid',
    paragraphs: [
      'Om en återbetalning godkänns återbetalas pengarna till samma betalningsmetod som användes vid köpet.',
      'Normal handläggningstid är 5-10 bankdagar, beroende på betalningsleverantör och bank.',
    ],
  },
]

export default function RefundPolicyPage() {
  return (
    <PublicLegalPage
      eyebrow="Juridisk information"
      title="Återbetalning av annonsavgifter"
      intro="Återbetalningspolicy för annonser på Autorell."
      sections={sections}
    />
  )
}
