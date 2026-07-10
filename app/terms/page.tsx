import { createPublicMetadata } from '@/lib/public-seo'
import { getRequestLocale } from '@/lib/request-locale'
import { translatePublic } from '@/lib/public-i18n'
import PublicLegalPage from '../components/PublicLegalPage'

export async function generateMetadata() {
  const locale = await getRequestLocale()
  return createPublicMetadata({
    title: `${translatePublic(locale, 'Terms and Conditions')} | Autorell`,
    description: translatePublic(
      locale,
      'Rules for accounts, listings, messages, payments and safe use of Autorell.',
    ),
    path: '/terms',
    locale,
  })
}

const sections = [
  {
    id: 'platform-role',
    title: 'The role of the platform',
    paragraphs: [
      'Autorell provides a digital marketplace where private sellers and businesses can publish vehicle listings, search, save searches and communicate.',
      'For ordinary marketplace listings, Autorell is not automatically the buyer, seller, agent, guarantor or party to the agreement between users.',
    ],
  },
  {
    id: 'accounts',
    title: 'Private and business accounts',
    items: [
      'The account holder must be at least 18 years old and provide correct and current contact and identity information.',
      'Private accounts are used for personal, non-professional trading. Business sellers must use a business account.',
      'Business accounts must provide company name, registration number and other information needed to identify the trader.',
      'The account is personal. Passwords and access must not be shared or used to bypass restrictions.',
    ],
  },
  {
    id: 'listings',
    title: 'Listings and seller responsibility',
    items: [
      'The seller must have the right to advertise and sell the vehicle.',
      'Category, identity, ownership, price, location, condition, mileage or operating hours, known faults, damage, financing, equipment and images must be accurate and not misleading.',
      'It is prohibited to advertise stolen, unsafe, illegal, recalled or incorrectly identified objects.',
      'Autorell may review, limit, request more information, hide or remove content and preserve necessary evidence.',
    ],
  },
  {
    id: 'purchase-terms',
    title: 'Purchase terms',
    paragraphs: [
      'Marketplace purchases, listing packages and related digital services are presented before payment. A paid listing service normally starts when the listing is published.',
      'Users are responsible for checking the counterparty, vehicle identity, ownership, documents, payment method, transport, registration and applicable local rules before entering an agreement.',
    ],
  },
  {
    id: 'messages',
    title: 'Messages and prohibited behaviour',
    items: [
      'Login is required to contact a seller. Messages may only be used for legitimate communication about the listing.',
      'Fraud, harassment, spam, harmful links, identity misuse and attempts to request passwords, card details or improper payments are prohibited.',
      'Autorell may process and review reported communication for safety, support, dispute handling, evidence preservation and abuse prevention.',
    ],
  },
  {
    id: 'reports',
    title: 'Reporting and actions',
    paragraphs: [
      'Users can report suspected illegal or misleading content, fraud and misuse through the reporting function.',
      'Autorell may remove content, restrict functions, suspend accounts, preserve logs and contact affected users or authorities when appropriate or legally required.',
    ],
  },
]

export default function TermsPage() {
  return (
    <PublicLegalPage
      eyebrow="Legal information"
      title="Terms and Conditions"
      intro="The rules for accounts, listings, contact between users, payment and safety on Autorell."
      sections={sections}
    />
  )
}
