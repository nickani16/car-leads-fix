import { Building2, CircleHelp, Mail, ShieldAlert } from 'lucide-react'
import ContactForm from './ContactForm'
import { translatePublicObject, type PublicLocale } from '@/lib/public-i18n'

const baseCopy = {
  eyebrow: 'Contact Autorell',
  title: 'Help with accounts, listings and marketplace safety.',
  text: 'Send your question to the team responsible for the European vehicle marketplace.',
  cards: [
    ['Accounts and listings', 'Registration, profile, publishing, pricing or listing management.'],
    ['Business solutions', 'Company accounts, recurring inventory and larger marketplace needs.'],
    ['Safety and reports', 'Suspicious listings, identity misuse, fraud attempts or inappropriate communication.'],
  ],
}

export default function PublicContactPage({ locale = 'sv' }: { locale?: PublicLocale }) {
  const source =
    locale === 'sv'
      ? {
          eyebrow: 'Kontakta Autorell',
          title: 'Hjälp med konton, annonser och marketplace-säkerhet.',
          text: 'Skicka din fråga till teamet som ansvarar för den europeiska fordonsmarknadsplatsen.',
          cards: [
            ['Konton och annonser', 'Registrering, profil, publicering, priser eller annonshantering.'],
            ['Företagslösningar', 'Företagskonton, återkommande lager och större marketplace-behov.'],
            ['Säkerhet och rapporter', 'Misstänkta annonser, identitetsmissbruk, bedrägeriförsök eller olämplig kommunikation.'],
          ],
        }
      : locale === 'de'
        ? {
            eyebrow: 'Autorell kontaktieren',
            title: 'Hilfe zu Konten, Anzeigen und Marktplatzsicherheit.',
            text: 'Senden Sie Ihre Frage an das Team für den europäischen Fahrzeugmarktplatz.',
            cards: [
              ['Konten und Anzeigen', 'Registrierung, Profil, Veröffentlichung, Preise oder Anzeigenverwaltung.'],
              ['Unternehmenslösungen', 'Unternehmenskonten, regelmäßiger Bestand und größere Marktplatzanforderungen.'],
              ['Sicherheit und Meldungen', 'Verdächtige Anzeigen, Identitätsmissbrauch, Betrugsversuche oder unangemessene Kommunikation.'],
            ],
          }
        : translatePublicObject(locale, baseCopy)
  const icons = [CircleHelp, Building2, ShieldAlert]

  return (
    <>
      <section className="border-b border-[#dce3ef] bg-[linear-gradient(135deg,#f8faff,#e8f1ff)]">
        <div className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 sm:py-24">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#0866ff]">{source.eyebrow}</p>
          <h1 className="mt-5 max-w-4xl text-5xl leading-[1] tracking-[-.055em] sm:text-7xl">{source.title}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[#667085]">{source.text}</p>
        </div>
      </section>
      <section className="mx-auto grid max-w-[1240px] gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[.8fr_1.2fr]">
        <aside className="grid gap-4 self-start">
          {source.cards.map(([title, text], index) => {
            const Icon = icons[index]
            return <article key={title} className="rounded-[20px] border border-[#e1e5ec] bg-white p-6"><Icon className="h-5 w-5 text-[#0866ff]" /><h2 className="mt-5 text-xl">{title}</h2><p className="mt-2 text-sm leading-6 text-[#667085]">{text}</p></article>
          })}
          <a href="mailto:info@autorell.com" className="inline-flex items-center gap-2 rounded-[18px] bg-[#101828] p-6 font-bold text-white"><Mail className="h-5 w-5" />info@autorell.com</a>
        </aside>
        <div className="rounded-[24px] border border-[#e1e5ec] bg-white p-6 shadow-sm sm:p-8">
          <ContactForm locale={locale} />
        </div>
      </section>
    </>
  )
}
