import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, CreditCard, FileImage, FileText, MessageCircle, ShieldAlert } from 'lucide-react'
import ContactForm from '@/app/components/ContactForm'
import { createClient } from '@/lib/supabase/server'
import { getRequestLocale } from '@/lib/request-locale'
import { localizePublicHref, translatePublicObject, type PublicLocale } from '@/lib/public-i18n'
import { generateAccountMetadata } from '@/lib/account-seo'

export const generateMetadata = generateAccountMetadata('support')

export default async function PrivateSupportPage() {
  const locale = await getRequestLocale()
  const copy = supportCopy(locale)
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(localizePublicHref(locale, '/login'))

  const { data: profile } = await supabase
    .from('marketplace_profiles')
    .select('account_type')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!profile) redirect(localizePublicHref(locale, '/register'))
  if (profile.account_type === 'business') redirect(localizePublicHref(locale, '/account/company/support'))

  const topics = [
    { icon: FileText, title: copy.createListing, text: copy.createListingText, href: localizePublicHref(locale, '/account/listings/new') },
    { icon: FileImage, title: copy.images, text: copy.imagesText, href: localizePublicHref(locale, '/account/listings') },
    { icon: CreditCard, title: copy.payments, text: copy.paymentsText, href: localizePublicHref(locale, '/account/payments') },
    { icon: MessageCircle, title: copy.messages, text: copy.messagesText, href: localizePublicHref(locale, '/account/messages') },
    { icon: ShieldAlert, title: copy.safety, text: copy.safetyText, href: localizePublicHref(locale, '/safety-tips') },
  ]

  return (
    <main className="min-h-screen bg-[#f7f9fc] px-5 py-8 sm:px-8 lg:py-12">
      <div className="mx-auto max-w-[1180px]">
        <Link
          href={localizePublicHref(locale, '/account')}
          className="inline-flex items-center gap-2 text-sm font-bold text-[#475467] transition hover:text-[#0866ff]"
        >
          <ArrowLeft className="h-4 w-4" />
          {copy.back}
        </Link>

        <section className="mt-6 rounded-[24px] border border-[#dfe7f2] bg-white p-6 shadow-[0_18px_50px_rgba(16,24,40,.05)] sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0866ff]">
            {copy.eyebrow}
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.045em] text-[#101828]">
            {copy.title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#667085]">
            {copy.intro}
          </p>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {topics.map((topic) => (
            <Link
              key={topic.title}
              href={topic.href}
              className="rounded-[20px] border border-[#dfe7f2] bg-white p-5 shadow-[0_14px_38px_rgba(16,24,40,.04)] transition hover:border-[#aac5ef]"
            >
              <span className="grid h-11 w-11 place-items-center rounded-[14px] bg-[#eef5ff] text-[#0866ff]">
                <topic.icon className="h-5 w-5" />
              </span>
              <h2 className="mt-4 text-base font-semibold tracking-[-0.02em] text-[#101828]">{topic.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#667085]">{topic.text}</p>
            </Link>
          ))}
        </section>

        <section className="mt-6 overflow-hidden rounded-[24px] border border-[#dfe7f2] bg-white shadow-[0_18px_50px_rgba(16,24,40,.05)]">
          <div className="grid lg:grid-cols-[0.82fr_1.18fr]">
            <aside className="border-b border-[#e4eaf3] bg-[#fbfcff] p-6 sm:p-8 lg:border-b-0 lg:border-r">
              <h2 className="text-2xl font-semibold tracking-[-0.035em] text-[#101828]">{copy.faqTitle}</h2>
              <div className="mt-5 grid gap-3">
                {copy.faq.map((item) => (
                  <details key={item.q} className="rounded-[16px] border border-[#dfe7f2] bg-white p-4">
                    <summary className="cursor-pointer text-sm font-bold text-[#101828]">{item.q}</summary>
                    <p className="mt-3 text-sm leading-6 text-[#667085]">{item.a}</p>
                  </details>
                ))}
              </div>
            </aside>
            <ContactForm locale={locale} />
          </div>
        </section>
      </div>
    </main>
  )
}

function supportCopy(locale: PublicLocale) {
  const en = {
    back: 'My pages',
    eyebrow: 'Help and support',
    title: 'Private account support',
    intro: 'Get help with listings, images, payments, saved searches, messages and account safety.',
    createListing: 'Create listing',
    createListingText: 'Help with drafts, required fields and publishing.',
    images: 'Images',
    imagesText: 'Upload, order, replace or troubleshoot listing photos.',
    payments: 'Payments',
    paymentsText: 'Continue checkout, understand status and find orders.',
    messages: 'Messages',
    messagesText: 'Questions, replies and safe contact with buyers or sellers.',
    safety: 'Safety',
    safetyText: 'Report fraud, suspicious contact or account concerns.',
    faqTitle: 'Common questions',
    faq: [
      { q: 'Why is my listing waiting for payment?', a: 'Paid packages and add-ons must be verified by Stripe before the listing can continue. Open My listings and choose Continue payment.' },
      { q: 'Can I continue an unfinished listing?', a: 'Yes. Drafts are shown under My listings, and you can continue from the latest saved version.' },
      { q: 'Why is my listing under review?', a: 'Autorell reviews listings before they become public when payment, images and required information are complete.' },
      { q: 'How do saved searches work?', a: 'Saved searches keep your selected vehicle filters so you can return to the same results later.' },
    ],
  }
  if (locale === 'sv') {
    return {
      ...en,
      back: 'Mina sidor',
      eyebrow: 'Hjälp och support',
      title: 'Support för privatkonto',
      intro: 'Få hjälp med annonser, bilder, betalningar, sparade sökningar, meddelanden och kontosäkerhet.',
      createListing: 'Skapa annons',
      createListingText: 'Hjälp med utkast, obligatoriska fält och publicering.',
      images: 'Bilder',
      imagesText: 'Ladda upp, sortera, ersätt eller felsök annonsbilder.',
      payments: 'Betalningar',
      paymentsText: 'Fortsätt checkout, förstå status och hitta ordrar.',
      messages: 'Meddelanden',
      messagesText: 'Frågor, svar och trygg kontakt med köpare eller säljare.',
      safety: 'Säkerhet',
      safetyText: 'Rapportera bedrägeri, misstänkt kontakt eller kontoproblem.',
      faqTitle: 'Vanliga frågor',
      faq: [
        { q: 'Varför väntar min annons på betalning?', a: 'Betalda paket och tillägg måste verifieras av Stripe innan annonsen kan gå vidare. Öppna Mina annonser och välj Fortsätt betalning.' },
        { q: 'Kan jag fortsätta en oavslutad annons?', a: 'Ja. Utkast visas under Mina annonser, och du kan fortsätta från den senaste sparade versionen.' },
        { q: 'Varför är min annons under granskning?', a: 'Autorell granskar annonser innan de blir publika när betalning, bilder och obligatoriska uppgifter är klara.' },
        { q: 'Hur fungerar sparade sökningar?', a: 'Sparade sökningar behåller dina valda fordonsfilter så att du kan återvända till samma resultat senare.' },
      ],
    }
  }
  if (locale === 'de') {
    return {
      ...en,
      back: 'Mein Konto',
      eyebrow: 'Hilfe und Support',
      title: 'Support für Privatkonto',
      intro: 'Hilfe zu Anzeigen, Bildern, Zahlungen, gespeicherten Suchen, Nachrichten und Kontosicherheit.',
      createListing: 'Anzeige erstellen',
      createListingText: 'Hilfe mit Entwürfen, Pflichtfeldern und Veröffentlichung.',
      images: 'Bilder',
      imagesText: 'Fotos hochladen, sortieren, ersetzen oder Fehler beheben.',
      payments: 'Zahlungen',
      paymentsText: 'Checkout fortsetzen, Status verstehen und Bestellungen finden.',
      messages: 'Nachrichten',
      messagesText: 'Fragen, Antworten und sicherer Kontakt mit Käufern oder Verkäufern.',
      safety: 'Sicherheit',
      safetyText: 'Betrug, verdächtige Kontakte oder Kontoprobleme melden.',
      faqTitle: 'Häufige Fragen',
      faq: [
        { q: 'Warum wartet meine Anzeige auf Zahlung?', a: 'Bezahlte Pakete und Add-ons müssen von Stripe bestätigt werden, bevor die Anzeige fortgesetzt werden kann.' },
        { q: 'Kann ich eine unfertige Anzeige fortsetzen?', a: 'Ja. Entwürfe werden unter Meine Anzeigen angezeigt.' },
        { q: 'Warum wird meine Anzeige geprüft?', a: 'Autorell prüft Anzeigen, bevor sie öffentlich werden, wenn Zahlung, Bilder und Pflichtangaben vollständig sind.' },
        { q: 'Wie funktionieren gespeicherte Suchen?', a: 'Gespeicherte Suchen behalten Ihre Fahrzeugfilter, damit Sie später dieselben Ergebnisse öffnen können.' },
      ],
    }
  }
  return translatePublicObject(locale, en)
}
