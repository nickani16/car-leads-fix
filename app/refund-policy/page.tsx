import { createPublicMetadata } from '@/lib/public-seo'
import PublicLegalPage from '../components/PublicLegalPage'

export const metadata = createPublicMetadata({
  title: 'Refund Policy for Listing Fees | Autorell',
  description:
    'Refund policy for paid listing fees on Autorell, including published listings, technical errors, duplicate payments and processing times.',
  path: '/refund-policy',
})

const sections = [
  {
    id: 'published-listings',
    title: 'After a listing has been published',
    paragraphs: [
      'When a listing has been published on Autorell, the service starts immediately. Therefore, listing fees are normally not refunded after publication.',
    ],
  },
  {
    id: 'refund-eligible',
    title: 'When a refund may apply',
    items: [
      'Your listing could not be published because of a technical error at Autorell.',
      'Your payment was processed more than once by mistake.',
      'You were charged the wrong amount.',
      'Autorell mistakenly published or handled your listing incorrectly.',
      'EU consumer protection law gives you a right to a refund in your country.',
    ],
  },
  {
    id: 'no-refund',
    title: 'When refunds normally do not apply',
    items: [
      'You choose to remove the listing after publication.',
      'You sell the vehicle or cancel the sale.',
      'The listing period expires without a sale.',
      'You change your mind after the listing has been published.',
      'Your listing is removed because it violates Autorell terms or applicable law.',
    ],
  },
  {
    id: 'before-publication',
    title: 'Before publication',
    paragraphs: [
      'If payment has been completed but the listing has not yet been published, you can contact Autorell support to request cancellation. If the service has not started, the payment may be refunded.',
    ],
  },
  {
    id: 'request-refund',
    title: 'How to request a refund',
    paragraphs: [
      'Contact Autorell support and include the listing ID, payment reference and the reason for the refund request.',
      'We review each case individually and respond as soon as possible.',
    ],
  },
  {
    id: 'processing-time',
    title: 'Processing time',
    paragraphs: [
      'If a refund is approved, the money is refunded to the same payment method used for the purchase.',
      'Normal processing time is 5-10 banking days, depending on the payment provider and bank.',
    ],
  },
]

export default function RefundPolicyPage() {
  return (
    <PublicLegalPage
      eyebrow="Legal information"
      title="Refund Policy for Listing Fees"
      intro="Refund policy for paid listings on Autorell."
      sections={sections}
    />
  )
}
