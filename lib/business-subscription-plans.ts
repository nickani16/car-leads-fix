import {
  billingProductCatalog,
  type BillingProduct,
  type BusinessPlan,
} from '@/lib/billing/product-catalog'
import { translationLocale, type PublicLocale } from '@/lib/public-i18n'

export type BillingPeriod = 'monthly' | 'annual'

export type BusinessPlanFeature = {
  label: string
  description: string
  included: boolean
}

export type BusinessSubscriptionPlan = {
  key: BusinessPlan
  name: string
  audience: string
  limit: string
  summary: string
  recommended?: boolean
  enterprise?: boolean
  features: BusinessPlanFeature[]
}

export const annualDiscount = 15

export const businessSubscriptionPlans: BusinessSubscriptionPlan[] = [
  {
    key: 'free',
    name: 'Free',
    audience: 'Start',
    limit: '5 active listings',
    summary: 'A simple listing allowance only. No company page, no team accounts and no reporting.',
    features: [
      { label: '5 active listings', description: 'Publish up to five active listings at the same time.', included: true },
      { label: 'Own listing management', description: 'Create, pause and update your own listings.', included: true },
      { label: 'Company page', description: 'Not included. Free does not show a separate public company page.', included: false },
      { label: 'Team accounts', description: 'Not included. Only the account owner can work in Free.', included: false },
      { label: 'Reports and export', description: 'Not included in Free.', included: false },
    ],
  },
  {
    key: 'starter',
    name: 'Starter',
    audience: 'Small dealers',
    limit: '25 active listings',
    summary: 'For smaller inventories that need a company page and a more professional sales flow.',
    features: [
      { label: '25 active listings', description: 'For smaller inventories with recurring publishing.', included: true },
      { label: 'Company page Basic', description: 'Company name, logo and contact route are presented more clearly.', included: true },
      { label: 'Standard enquiries', description: 'Leads and messages are handled through Autorell standard flow.', included: true },
      { label: 'Team accounts', description: 'Team accounts start with Growth.', included: false },
      { label: 'Reports and export', description: 'Reports and export start with Professional.', included: false },
    ],
  },
  {
    key: 'growth',
    name: 'Growth',
    audience: 'Growing team',
    limit: '100 active listings',
    summary: 'For companies where several people work in the same account and publish listings continuously.',
    recommended: true,
    features: [
      { label: '100 active listings', description: 'For a larger active inventory.', included: true },
      { label: 'Company page Plus', description: 'Extended company presentation with a shared inventory view.', included: true },
      { label: '10 team accounts', description: 'Invite up to 10 people who can use the same company account and upload listings.', included: true },
      { label: 'Staff roles', description: 'Staff can be connected to the company listing workflow.', included: true },
      { label: 'Priority support', description: 'Included from Professional.', included: false },
    ],
  },
  {
    key: 'professional',
    name: 'Professional',
    audience: 'High volume',
    limit: '500 active listings',
    summary: 'For larger organisations with many sellers, high volume and better follow-up.',
    features: [
      { label: '500 active listings', description: 'For large inventories and a high publishing pace.', included: true },
      { label: 'Company page Pro', description: 'The best standard presentation for the company and inventory.', included: true },
      { label: '50+ team accounts', description: 'Built for larger teams where many people publish and manage listings.', included: true },
      { label: 'Reports and export', description: 'Export inventory data and follow activity over time.', included: true },
      { label: 'Priority support', description: 'Faster help with publishing, payments and account cases.', included: true },
    ],
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    audience: 'Tailored',
    limit: 'Custom quota',
    summary: 'For importers, chains and operators with custom needs for volume, team and process.',
    enterprise: true,
    features: [
      { label: 'Custom listing quota', description: 'Quota and setup are based on the company actual needs.', included: true },
      { label: 'Advanced company page', description: 'Custom presentation for larger brands or several inventories.', included: true },
      { label: 'Expanded team', description: 'Team, roles and permissions are adapted to the organisation.', included: true },
      { label: 'Data export and advisory', description: 'Deeper follow-up, onboarding and practical help.', included: true },
      { label: 'Enterprise support', description: 'Direct contact for larger flows and business-critical cases.', included: true },
    ],
  },
]

export const businessSubscriptionCopy = {
  monthly: 'Monthly',
  annual: 'Annual - save 15%',
  annualBadge: '-15%',
  annualEquivalent: 'equals about',
  perMonth: '/month',
  perYear: '/year',
  exclVat: 'excl. VAT',
  included: 'Included',
  yourPlan: 'Your plan',
  recommended: 'Recommended',
  contactUs: 'Contact us',
  currentPlanButton: 'Current plan',
}

export function getBusinessPlanProduct(plan: BusinessPlan, billingPeriod: BillingPeriod): BillingProduct | null {
  const interval = billingPeriod === 'annual' ? 'year' : 'month'
  return billingProductCatalog.find((product) =>
    product.kind === 'subscription' &&
    product.businessPlan === plan &&
    product.billingInterval === interval
  ) || null
}

export function localeToIntl(locale: PublicLocale) {
  const translated = translationLocale(locale)
  if (translated === 'sv') return 'sv-SE'
  if (translated === 'de') return 'de-DE'
  if (translated === 'da') return 'da-DK'
  if (translated === 'fi') return 'fi-FI'
  if (translated === 'fr') return 'fr-FR'
  if (translated === 'it') return 'it-IT'
  if (translated === 'es') return 'es-ES'
  if (translated === 'nl') return 'nl-NL'
  if (translated === 'pl') return 'pl-PL'
  return 'en-GB'
}
