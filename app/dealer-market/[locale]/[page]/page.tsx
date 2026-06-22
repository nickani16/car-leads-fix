import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import PublicContactPage from '@/app/components/PublicContactPage'
import PublicFooter from '@/app/components/PublicFooter'
import PublicHeader from '@/app/components/PublicHeader'
import {
  isPublicLanguage,
  translatePublicObject,
  type PublicLocale,
} from '@/lib/public-i18n'

type PageKey =
  | 'vehicles'
  | 'process'
  | 'benefits'
  | 'about'
  | 'faq'
  | 'contact'
  | 'privacy'
  | 'terms'
  | 'cookies'

const pages: Record<PageKey, {
  title: string
  heading: string
  intro: string
  sections: Array<{ title: string; text: string }>
}> = {
  vehicles: {
    title: "Europe's vehicle marketplace",
    heading: 'Vehicles from private and business sellers across Europe.',
    intro: 'Browse cars, vans, motorcycles, leisure vehicles, machinery and electric mobility in one connected marketplace.',
    sections: [
      { title: 'Many vehicle categories', text: 'Search cars, commercial vehicles, motorcycles, motorhomes, caravans, trucks, agricultural machinery, construction machinery and electric mobility.' },
      { title: 'Local markets', text: 'Filter listings by country, location, price, currency, make, model, year, mileage and energy source.' },
      { title: 'Direct seller contact', text: 'Registered users can save listings and contact private or business sellers through the platform.' },
    ],
  },
  process: {
    title: 'How Autorell works',
    heading: 'A clear marketplace from search to seller contact.',
    intro: 'Autorell provides the platform, listing tools and communication layer. Buyers and sellers remain responsible for their transaction.',
    sections: [
      { title: 'Search and compare', text: 'Use category and marketplace filters to find relevant vehicles across the EU.' },
      { title: 'Review the listing', text: 'Check the seller description, structured vehicle details, location, currency, price and images.' },
      { title: 'Contact the seller', text: 'Create an account to send messages, ask questions and arrange the next steps directly with the seller.' },
      { title: 'Complete the transaction', text: 'Agree payment, inspection, collection, transport and ownership transfer directly with the counterparty and appropriate service providers.' },
    ],
  },
  benefits: {
    title: 'Marketplace benefits',
    heading: 'One European market for private users and businesses.',
    intro: 'Reach beyond a local classifieds site without turning Autorell into a vehicle dealer or transaction counterparty.',
    sections: [
      { title: 'European reach', text: 'Publish once and make the listing discoverable to buyers across supported EU markets.' },
      { title: 'Structured data', text: 'Consistent categories and fields make vehicles easier to search and compare.' },
      { title: 'Private and business accounts', text: 'Use the marketplace as an individual seller or manage recurring inventory through a business account.' },
    ],
  },
  about: {
    title: 'About Autorell',
    heading: 'A European marketplace built around better vehicle discovery.',
    intro: 'Autorell is an EU-focused technology platform for finding, listing and comparing vehicles across borders.',
    sections: [
      { title: 'Marketplace, not vehicle dealer', text: 'Autorell does not buy vehicles, submit bids, export stock or resell vehicles on its own account.' },
      { title: 'Built for Europe', text: 'Local language experiences, relevant currencies and country filters make cross-border discovery more useful.' },
      { title: 'Scalable categories', text: 'The platform supports everyday mobility, commercial vehicles, leisure vehicles and heavy equipment.' },
    ],
  },
  faq: {
    title: 'Frequently asked questions',
    heading: 'Answers about listings, accounts and marketplace safety.',
    intro: 'The essentials for buyers, private sellers and business users.',
    sections: [
      { title: 'Does Autorell buy my vehicle?', text: 'No. Autorell is a marketplace. You publish an advertisement and communicate with interested buyers.' },
      { title: 'Who sets the price?', text: 'The seller sets the advertised price and chooses the listing currency.' },
      { title: 'Can businesses publish inventory?', text: 'Yes. Business accounts can publish and manage vehicle listings through the account area.' },
      { title: 'How do I contact a seller?', text: 'Sign in, open a relevant listing and start a conversation through Autorell messages.' },
      { title: 'Who handles payment and transport?', text: 'The buyer and seller agree payment, inspection, collection and transport. Autorell is not the vehicle buyer or seller.' },
    ],
  },
  contact: { title: 'Contact Autorell', heading: 'How can we help?', intro: 'Contact us about accounts, listings, safety or business marketplace solutions.', sections: [] },
  privacy: {
    title: 'Privacy policy',
    heading: 'Privacy policy',
    intro: 'How Autorell processes account, listing, communication and platform data.',
    sections: [
      { title: 'Data controller', text: 'Autorell AB is responsible for personal data processed through the marketplace.' },
      { title: 'Data we process', text: 'This may include account, identity, company, listing, communication, payment and security information.' },
      { title: 'Your rights', text: 'You may have rights to access, correction, deletion, restriction, portability and objection under applicable law.' },
    ],
  },
  terms: {
    title: 'Marketplace terms',
    heading: 'Terms of use',
    intro: 'Rules for accounts, listings, communication and use of the Autorell marketplace.',
    sections: [
      { title: 'Marketplace role', text: 'Autorell provides a digital marketplace and is not the buyer, seller, owner or exporter of listed vehicles.' },
      { title: 'Listing responsibility', text: 'Sellers are responsible for accurate descriptions, lawful ownership, prices, images and disclosed defects.' },
      { title: 'Transactions', text: 'Buyers and sellers are responsible for due diligence, contracts, payment, taxes, registration, transport and ownership transfer.' },
    ],
  },
  cookies: {
    title: 'Cookie policy',
    heading: 'Cookie policy',
    intro: 'Information about essential cookies and optional technologies used by Autorell.',
    sections: [
      { title: 'Essential cookies', text: 'Required cookies support security, authentication, sessions and requested marketplace functionality.' },
      { title: 'Your choices', text: 'Optional technologies are used according to your consent settings and applicable law.' },
    ],
  },
}

export async function generateMetadata({
  params,
}: PageProps<'/dealer-market/[locale]/[page]'>): Promise<Metadata> {
  const { locale, page } = await params
  if ((locale !== 'de' && !isPublicLanguage(locale)) || !(page in pages)) return {}
  const publicLocale = locale as PublicLocale
  const content = translatePublicObject(publicLocale, pages[page as PageKey])
  return { title: content.title, description: content.intro }
}

export default async function MarketplaceInformationPage({
  params,
}: PageProps<'/dealer-market/[locale]/[page]'>) {
  const { locale, page } = await params
  if ((locale !== 'de' && !isPublicLanguage(locale)) || !(page in pages)) {
    notFound()
  }
  const publicLocale = locale as PublicLocale
  const content = translatePublicObject(publicLocale, pages[page as PageKey])

  if (page === 'contact') {
    return (
      <main className="bg-[#f7f8fb] text-[#101828]">
        <PublicHeader locale={publicLocale} />
        <PublicContactPage locale={publicLocale} />
        <PublicFooter locale={publicLocale} />
      </main>
    )
  }

  return (
    <main className="bg-[#f7f8fb] text-[#101828]">
      <PublicHeader locale={publicLocale} />
      <section className="border-b border-[#dce3ef] bg-[linear-gradient(135deg,#f7faff,#eaf2ff)]">
        <div className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 sm:py-24">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#0866ff]">Autorell marketplace</p>
          <h1 className="mt-5 max-w-4xl text-5xl leading-[1] tracking-[-.055em] sm:text-7xl">{content.heading}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[#667085]">{content.intro}</p>
          {!['privacy', 'terms', 'cookies'].includes(page) && (
            <Link href="/marketplace/cars" className="mt-8 inline-flex min-h-13 items-center gap-2 rounded-[14px] bg-[#0866ff] px-6 font-bold text-white">
              {translatePublicObject(publicLocale, { label: 'Explore the marketplace' }).label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </section>
      <section className="mx-auto grid max-w-[1240px] gap-5 px-5 py-14 sm:px-8 md:grid-cols-2">
        {content.sections.map((section) => (
          <article key={section.title} className="rounded-[22px] border border-[#e1e5ec] bg-white p-7">
            <CheckCircle2 className="h-5 w-5 text-[#0866ff]" />
            <h2 className="mt-5 text-2xl tracking-[-.035em]">{section.title}</h2>
            <p className="mt-3 leading-7 text-[#667085]">{section.text}</p>
          </article>
        ))}
      </section>
      <PublicFooter locale={publicLocale} />
    </main>
  )
}
