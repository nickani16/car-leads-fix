import {
  Building2,
  CircleHelp,
  Clock3,
  FileText,
  Mail,
  MessageSquareText,
  ShieldAlert,
} from 'lucide-react'
import ContactForm from './ContactForm'
import { translatePublicObject, type PublicLocale } from '@/lib/public-i18n'

const contactPageCopy = {
  sv: {
    eyebrow: 'Kontakta Autorell',
    title: 'Rätt hjälp för köp, annonser och företag.',
    text: 'Skicka ditt ärende till Autorell så hamnar det hos rätt team. Ju tydligare information du lämnar, desto snabbare kan vi hjälpa dig vidare.',
    responseLabel: 'Svarstid',
    responseText: 'Vi prioriterar säkerhetsärenden och pågående annonsproblem först.',
    emailLabel: 'E-post',
    cards: [
      {
        title: 'Konto och inloggning',
        text: 'Hjälp med registrering, företagskonto, inloggning, profil eller radering av konto.',
        icon: CircleHelp,
      },
      {
        title: 'Annonser och betalning',
        text: 'Frågor om publicering, pris, annons-ID, ändringar, pausade annonser eller fakturaunderlag.',
        icon: FileText,
      },
      {
        title: 'Företagslösningar',
        text: 'För företag som vill annonsera återkommande, hantera lager eller prata om större volymer.',
        icon: Building2,
      },
      {
        title: 'Trygghet och rapporter',
        text: 'Misstänkta annonser, identitetsmissbruk, bedrägeriförsök eller olämplig kommunikation.',
        icon: ShieldAlert,
      },
    ],
    checklistTitle: 'Skicka gärna med detta',
    checklist: [
      'Annons-ID eller länk om ärendet gäller en annons.',
      'Vilket land, konto eller företag ärendet gäller.',
      'Kort beskrivning av vad som hänt och vad du behöver hjälp med.',
    ],
  },
  en: {
    eyebrow: 'Contact Autorell',
    title: 'The right help for buying, listings and business.',
    text: 'Send your enquiry to Autorell and it will reach the right team. The clearer your information is, the faster we can help with the next step.',
    responseLabel: 'Response time',
    responseText: 'We prioritise safety cases and active listing issues first.',
    emailLabel: 'Email',
    cards: [
      {
        title: 'Account and sign-in',
        text: 'Help with registration, business accounts, sign-in, profile details or account deletion.',
        icon: CircleHelp,
      },
      {
        title: 'Listings and payment',
        text: 'Questions about publishing, price, listing ID, edits, paused listings or invoice details.',
        icon: FileText,
      },
      {
        title: 'Business solutions',
        text: 'For companies that want recurring listings, inventory tools or support for larger volumes.',
        icon: Building2,
      },
      {
        title: 'Safety and reports',
        text: 'Suspicious listings, identity misuse, fraud attempts or inappropriate communication.',
        icon: ShieldAlert,
      },
    ],
    checklistTitle: 'Helpful details to include',
    checklist: [
      'Listing ID or link if the case concerns a listing.',
      'Which country, account or company the case concerns.',
      'A short description of what happened and what you need help with.',
    ],
  },
  de: {
    eyebrow: 'Autorell kontaktieren',
    title: 'Die richtige Hilfe für Kauf, Anzeigen und Unternehmen.',
    text: 'Senden Sie Ihre Anfrage an Autorell, damit sie beim richtigen Team ankommt. Je klarer die Informationen sind, desto schneller können wir helfen.',
    responseLabel: 'Antwortzeit',
    responseText: 'Sicherheitsfälle und aktive Anzeigenprobleme haben Priorität.',
    emailLabel: 'E-Mail',
    cards: [
      {
        title: 'Konto und Anmeldung',
        text: 'Hilfe bei Registrierung, Unternehmenskonto, Anmeldung, Profilangaben oder Kontolöschung.',
        icon: CircleHelp,
      },
      {
        title: 'Anzeigen und Zahlung',
        text: 'Fragen zu Veröffentlichung, Preis, Anzeigen-ID, Änderungen, pausierten Anzeigen oder Rechnungsdaten.',
        icon: FileText,
      },
      {
        title: 'Unternehmenslösungen',
        text: 'Für Unternehmen mit wiederkehrenden Anzeigen, Bestandsverwaltung oder größeren Volumen.',
        icon: Building2,
      },
      {
        title: 'Sicherheit und Meldungen',
        text: 'Verdächtige Anzeigen, Identitätsmissbrauch, Betrugsversuche oder unangemessene Kommunikation.',
        icon: ShieldAlert,
      },
    ],
    checklistTitle: 'Diese Angaben helfen uns',
    checklist: [
      'Anzeigen-ID oder Link, wenn es um eine Anzeige geht.',
      'Land, Konto oder Unternehmen, auf das sich der Fall bezieht.',
      'Kurze Beschreibung, was passiert ist und wobei Sie Hilfe brauchen.',
    ],
  },
} as const

export default function PublicContactPage({
  locale = 'sv',
}: {
  locale?: PublicLocale
}) {
  const source =
    locale === 'sv' || locale === 'de' || locale === 'en'
      ? contactPageCopy[locale]
      : translatePublicObject(locale, contactPageCopy.en)

  return (
    <>
      <section className="border-b border-[#dce3ef] bg-[linear-gradient(135deg,#f8fbff,#eef5ff)]">
        <div className="mx-auto grid max-w-[var(--autorell-page-max)] gap-10 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[.18em] text-[#0866ff]">
              {source.eyebrow}
            </p>
            <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[1] tracking-[-.055em] sm:text-7xl">
              {source.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[#667085]">
              {source.text}
            </p>
          </div>

          <aside className="rounded-[22px] border border-[#dce6f4] bg-white p-6 shadow-[0_24px_70px_rgba(16,24,40,.10)]">
            <div className="flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[13px] bg-[#edf5ff] text-[#0866ff]">
                <Clock3 className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-extrabold text-[#101828]">
                  {source.responseLabel}
                </p>
                <p className="mt-1 text-sm leading-6 text-[#667085]">
                  {source.responseText}
                </p>
              </div>
            </div>
            <a
              href="mailto:info@autorell.com"
              className="mt-6 flex min-h-12 items-center gap-3 rounded-[14px] bg-[#101828] px-4 text-sm font-extrabold text-white transition hover:bg-[#1d2939]"
            >
              <Mail className="h-5 w-5" />
              <span>
                <span className="block text-[10px] uppercase tracking-[0.16em] text-white/60">
                  {source.emailLabel}
                </span>
                info@autorell.com
              </span>
            </a>
          </aside>
        </div>
      </section>

      <section className="mx-auto grid max-w-[var(--autorell-page-max)] gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[.84fr_1.16fr]">
        <aside className="self-start">
          <div className="grid gap-4">
            {source.cards.map(({ title, text, icon: Icon }) => (
              <article
                key={title}
                className="rounded-[18px] border border-[#e1e7f0] bg-white p-6 shadow-[0_14px_36px_rgba(16,24,40,.04)]"
              >
                <Icon className="h-5 w-5 text-[#0866ff]" />
                <h2 className="mt-5 text-xl font-black tracking-[-.03em]">
                  {title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#667085]">{text}</p>
              </article>
            ))}
          </div>

          <div className="mt-5 rounded-[18px] border border-[#dbe7f6] bg-[#f4f8ff] p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-[12px] bg-white text-[#0866ff] shadow-sm">
                <MessageSquareText className="h-5 w-5" />
              </span>
              <h2 className="text-lg font-black tracking-[-.03em]">
                {source.checklistTitle}
              </h2>
            </div>
            <ul className="mt-5 space-y-3 text-sm font-semibold leading-6 text-[#475467]">
              {source.checklist.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0866ff]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="overflow-hidden rounded-[24px] border border-[#e1e5ec] bg-white shadow-[0_18px_48px_rgba(16,24,40,.08)]">
          <ContactForm locale={locale} />
        </div>
      </section>
    </>
  )
}
