import Link from 'next/link'
import { ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react'
import { headers } from 'next/headers'
import PublicFooter from './PublicFooter'
import PublicHeader from './PublicHeader'
import {
  localizePublicHref,
  translatePublicObject,
  type PublicLocale,
} from '@/lib/public-i18n'
import { getRequestLocale } from '@/lib/request-locale'

type LegalSection = {
  id: string
  title: string
  paragraphs?: string[]
  items?: string[]
}

export default async function PublicLegalPage({
  eyebrow,
  title,
  intro,
  sections,
  locale,
}: {
  eyebrow: string
  title: string
  intro: string
  sections: LegalSection[]
  locale?: PublicLocale
}) {
  const activeLocale = locale || (await getRequestLocale())
  const requestHeaders = await headers()
  const marketCode = requestHeaders.get('x-autorell-market') || undefined
  const fallback = legalFallbackCopy(title)
  const localized =
    activeLocale === 'sv'
      ? {
          eyebrow,
          title,
          intro,
          updated: 'Senast uppdaterad: 25 juni 2026',
          questionTitle: 'Frågor om dina uppgifter?',
          questionText:
            'Kontakta oss om du vill förstå hur ett ärende hanteras eller använda dina dataskyddsrättigheter.',
          contact: 'Kontakta Autorell',
          sections,
        }
      : translatePublicObject(activeLocale, {
          eyebrow: 'Legal information',
          title: fallback.title,
          intro: fallback.intro,
          updated: 'Last updated: 25 June 2026',
          questionTitle: 'Questions about your data?',
          questionText:
            'Contact us if you want to understand how a case is handled or use your data protection rights.',
          contact: 'Contact Autorell',
          sections: fallback.sections,
        })

  return (
    <main className="bg-[#f7f8fb] text-[#101828]">
      <PublicHeader locale={activeLocale} marketCode={marketCode} />
      <section className="relative overflow-hidden border-b border-[#dfe6f2] bg-white py-16 sm:py-24">
        <div className="relative mx-auto max-w-[var(--autorell-page-max)] px-5 sm:px-8">
          <p className="inline-flex rounded-[8px] bg-[#e8f1ff] px-3 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#075fff]">
            {localized.eyebrow}
          </p>
          <h1 className="mt-6 max-w-4xl text-4xl font-extrabold leading-[1.02] tracking-[-0.05em] sm:text-6xl lg:text-[72px]">
            {localized.title}
          </h1>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-[#475467]">
            {localized.intro}
          </p>
          <p className="mt-6 text-sm font-semibold text-[#667085]">
            {localized.updated}
          </p>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="mx-auto grid max-w-[var(--autorell-page-max)] gap-8 px-5 sm:px-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <nav className="rounded-[16px] border border-[#dfe6f2] bg-white p-3 shadow-[0_12px_36px_rgba(16,24,40,.05)]">
              {localized.sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center justify-between rounded-[10px] px-4 py-3 text-sm font-semibold text-[#475467] transition hover:bg-[#e8f1ff] hover:text-[#075fff]"
                >
                  {section.title}
                  <ArrowRight size={14} />
                </a>
              ))}
            </nav>
          </aside>

          <div className="space-y-6">
            {localized.sections.map((section, index) => (
              <article
                key={section.id}
                id={section.id}
                className="scroll-mt-28 rounded-[18px] border border-[#dfe6f2] bg-white p-6 shadow-[0_12px_36px_rgba(16,24,40,.04)] sm:p-8"
              >
                <div className="mb-6 flex items-center gap-4">
                  <span className="grid h-10 w-10 place-items-center rounded-[12px] bg-[#e8f1ff] text-sm font-extrabold text-[#075fff]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h2 className="text-2xl font-extrabold tracking-[-0.035em]">
                    {section.title}
                  </h2>
                </div>
                <div className="space-y-4 text-sm leading-7 text-[#475467]">
                  {section.paragraphs?.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {section.items && (
                    <ul className="space-y-3">
                      {section.items.map((item) => (
                        <li key={item} className="flex gap-3">
                          <CheckCircle2
                            size={17}
                            className="mt-1.5 shrink-0 text-[#075fff]"
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </article>
            ))}

            <div className="rounded-[18px] bg-[#061b42] p-7 text-white shadow-[0_18px_44px_rgba(6,27,66,.14)] sm:p-9">
              <ShieldCheck className="text-[#9fc7ff]" size={28} />
              <h2 className="mt-5 text-2xl">{localized.questionTitle}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65">
                {localized.questionText}
              </p>
              <Link
                href={localizePublicHref(activeLocale, '/contact')}
                className="mt-6 inline-flex items-center gap-2 rounded-[12px] bg-[#075fff] px-5 py-3 text-sm font-bold text-white"
              >
                {localized.contact}
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
      <PublicFooter locale={activeLocale} />
    </main>
  )
}

function legalFallbackCopy(title: string): {
  title: string
  intro: string
  sections: LegalSection[]
} {
  if (
    title.toLowerCase().includes('återbetal') ||
    title.toLowerCase().includes('refund')
  ) {
    return {
      title: 'Refund Policy for Listing Fees',
      intro:
        'How Autorell handles refunds for paid listing fees when a listing is published, cancelled or affected by a payment or technical issue.',
      sections: [
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
            'Contact Autorell support and include the listing ID, payment reference and the reason for the refund request. We review each case individually and respond as soon as possible.',
          ],
        },
        {
          id: 'processing-time',
          title: 'Processing time',
          paragraphs: [
            'If a refund is approved, the money is refunded to the same payment method used for the purchase. Normal processing time is 5-10 banking days, depending on the payment provider and bank.',
          ],
        },
      ],
    }
  }

  if (title.toLowerCase().includes('cookie')) {
    return {
      title: 'Cookie Policy',
      intro:
        'We use as few cookies as possible and do not activate non-essential tracking without the consent required by law.',
      sections: [
        {
          id: 'cookies',
          title: 'What are cookies?',
          paragraphs: [
            'Cookies are small files that a website stores on or reads from your device. Similar technologies may use local storage or other identifiers.',
          ],
        },
        {
          id: 'current-use',
          title: 'What we use today',
          paragraphs: [
            'Autorell uses necessary technologies for secure login, session handling, abuse prevention and features requested by the user.',
            'We do not currently activate marketing cookies or standalone analytics tools on the public website.',
          ],
        },
        {
          id: 'necessary',
          title: 'Necessary cookies',
          items: [
            'Authentication and session cookies for the Autorell account.',
            'Security functions required for the service to work.',
            'Technical storage needed for an explicitly requested feature.',
          ],
        },
        {
          id: 'manage',
          title: 'Manage cookies',
          paragraphs: [
            'You can delete or block cookies in your browser. If necessary authentication cookies are blocked, account, listing and messaging features may stop working.',
          ],
        },
      ],
    }
  }

  if (title.toLowerCase().includes('integritet')) {
    return {
      title: 'Privacy Policy',
      intro:
        'How personal data is used for accounts, listings, messages, payments and safety on Autorell.',
      sections: [
        {
          id: 'controller',
          title: 'Data controller',
          paragraphs: [
            'Autorell AB in Sweden is the data controller for the marketplace. Questions, objections and rights requests can be sent to info@autorell.com.',
          ],
        },
        {
          id: 'data',
          title: 'Data we process',
          items: [
            'Account type, name, email, phone, country, address, login and security information.',
            'Listing data, images, vehicle identity, price, location, condition, history and known faults.',
            'Messages, reports, support cases, moderation decisions and evidence of suspected misuse.',
            'Payment references, packages, amounts, receipt and refund status. Full card details are not stored by Autorell.',
          ],
        },
        {
          id: 'purposes',
          title: 'Purposes and legal bases',
          items: [
            'Contract and user request: account creation, listings, listing packages, messages and support.',
            'Legal obligation: bookkeeping, tax, authority requests and digital platform obligations.',
            'Legitimate interest: secure operation, fraud prevention, moderation, dispute evidence and service development.',
            'Consent is used where required by law, for example for non-essential cookies or separate marketing.',
          ],
        },
        {
          id: 'rights',
          title: 'Your rights',
          items: [
            'Request access, correction, erasure or restriction where GDPR conditions are met.',
            'Object to processing based on legitimate interest and request data portability where applicable.',
            'Withdraw consent without affecting previous lawful processing.',
          ],
        },
      ],
    }
  }

  return {
    title: 'Terms and Conditions',
    intro:
      'The rules for accounts, listings, contact between users, payment and safety on Autorell.',
    sections: [
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
          'The account is personal. Passwords and access must not be shared.',
        ],
      },
      {
        id: 'listings',
        title: 'Listings and seller responsibility',
        items: [
          'The seller must have the right to advertise and sell the vehicle.',
          'Category, identity, ownership, price, location, condition, mileage, operating hours, faults and images must be accurate and not misleading.',
          'Autorell may review, limit, hide or remove content and preserve necessary evidence.',
        ],
      },
      {
        id: 'messages',
        title: 'Messages and prohibited behaviour',
        items: [
          'Login is required to contact a seller. Messages may only be used for legitimate communication about the listing.',
          'Fraud, harassment, spam, harmful links, identity misuse and attempts to request passwords, card details or improper payments are prohibited.',
        ],
      },
    ],
  }
}
