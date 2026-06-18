import Link from 'next/link'
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CarFront,
  Clock3,
  Headphones,
  Mail,
  MessageSquareText,
  ShieldCheck,
  Store,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
import ContactForm from '@/app/components/ContactForm'

type ContactLocale = 'sv' | 'de' | 'en'

const copy = {
  sv: {
    eyebrow: 'Autorell kontakt',
    title: 'Rätt person från första meddelandet.',
    intro:
      'Oavsett om du säljer en bil, hanterar en pågående affär eller representerar ett företag ser vi till att din fråga landar rätt direkt.',
    responseLabel: 'Personlig återkoppling',
    responseTitle: 'Normalt inom en arbetsdag.',
    responseText:
      'Du får svar från en person som kan ditt ärende – inte ett opersonligt supportsystem.',
    promises: [
      ['En tydlig kontaktväg', 'Vi sorterar din fråga och kopplar in rätt kompetens.'],
      ['Skyddade uppgifter', 'Dina kontaktuppgifter delas inte i handlarflödet.'],
      ['Fokus på nästa steg', 'Du får ett konkret svar på hur ärendet går vidare.'],
    ],
    routeEyebrow: 'Vad gäller ditt ärende?',
    routeTitle: 'Välj den väg som ligger närmast.',
    routes: [
      ['Privat säljare', 'Värdering, fordonsuppgifter eller att sälja bilen.', UserRound],
      ['Pågående affär', 'Bud, kontroll, avtal eller status i ett aktivt ärende.', CarFront],
      ['Företag & fordonsflotta', 'Remarketing, flera fordon eller ett pilotupplägg.', BriefcaseBusiness],
      ['Bilhandlare', 'Dealer Network, konto, budgivning eller teknisk hjälp.', Store],
    ],
    directEyebrow: 'Direktkontakt',
    directTitle: 'Vi finns nära när det behövs.',
    directText:
      'Beskriv ärendet i formuläret. Behöver du komplettera med dokument eller fordonsuppgifter hjälper vi dig vidare i svaret.',
    emailLabel: 'E-post',
    responseTimeLabel: 'Svarstid',
    responseTime: 'Normalt inom en arbetsdag',
    dealerTitle: 'Vill ni köpa fordon via Autorell?',
    dealerText:
      'Ansök om tillgång till Autorell Dealer Network för verifierade bilföretag.',
    dealerLink: 'Ansök som handlare',
    faqTitle: 'Kanske finns svaret redan.',
    faqText:
      'Se vanliga frågor om värdering, budgivning, fordonskontroll och försäljning.',
    faqLink: 'Se vanliga frågor',
    faqHref: '/vanliga-fragor',
  },
  de: {
    eyebrow: 'Autorell Kontakt',
    title: 'Vom ersten Kontakt direkt zur richtigen Person.',
    intro:
      'Ob Händlerzugang, Fahrzeug, Export oder laufender Vorgang – Ihre Anfrage wird direkt an das passende Autorell-Team weitergeleitet.',
    responseLabel: 'Persönliche Rückmeldung',
    responseTitle: 'In der Regel innerhalb eines Werktags.',
    responseText:
      'Sie erhalten eine klare Antwort von einer Person, die den nächsten Schritt übernehmen kann.',
    promises: [
      ['Ein klarer Kontaktweg', 'Wir ordnen Ihre Anfrage ein und verbinden Sie mit dem richtigen Team.'],
      ['Geschützte Angaben', 'Kontakt- und Unternehmensdaten werden kontrolliert behandelt.'],
      ['Konkreter nächster Schritt', 'Sie erfahren klar, wie Ihr Vorgang weitergeführt wird.'],
    ],
    routeEyebrow: 'Worum geht es?',
    routeTitle: 'Wählen Sie den passenden Bereich.',
    routes: [
      ['Fahrzeugangebot', 'Fragen zu Fahrzeugen, Unterlagen oder Verfügbarkeit.', CarFront],
      ['Laufender Vorgang', 'Gebot, Prüfung, Vertrag, Export oder Status.', MessageSquareText],
      ['Unternehmen', 'Fuhrpark, Remarketing oder eine mögliche Zusammenarbeit.', BriefcaseBusiness],
      ['Händlerzugang', 'Dealer Network, Konto, Gebote oder technische Hilfe.', Store],
    ],
    directEyebrow: 'Direkter Kontakt',
    directTitle: 'Klare Hilfe, wenn sie gebraucht wird.',
    directText:
      'Beschreiben Sie Ihr Anliegen im Formular. Falls Unterlagen oder Fahrzeugdaten nötig sind, erklären wir Ihnen den nächsten Schritt.',
    emailLabel: 'E-Mail',
    responseTimeLabel: 'Antwortzeit',
    responseTime: 'In der Regel innerhalb eines Werktags',
    dealerTitle: 'Zugang zum schwedischen Fahrzeugmarkt?',
    dealerText:
      'Beantragen Sie den Zugang zum Autorell Dealer Network für verifizierte Automobilunternehmen.',
    dealerLink: 'Händlerzugang beantragen',
    faqTitle: 'Vielleicht ist die Antwort schon da.',
    faqText:
      'Lesen Sie häufige Fragen zu Zugang, Fahrzeugen, Geboten und Transaktionen.',
    faqLink: 'Häufige Fragen ansehen',
    faqHref: '/faq',
  },
  en: {
    eyebrow: 'Autorell contact',
    title: 'The right person from the first message.',
    intro:
      'Whether your enquiry concerns dealer access, a vehicle, export or an active transaction, we route it directly to the right Autorell team.',
    responseLabel: 'A personal response',
    responseTitle: 'Normally within one business day.',
    responseText:
      'You receive a clear answer from someone who understands the case and can move it forward.',
    promises: [
      ['One clear contact route', 'We assess the enquiry and connect it with the right expertise.'],
      ['Protected information', 'Contact and company details are handled with care.'],
      ['A practical next step', 'You get a clear answer on how the matter moves forward.'],
    ],
    routeEyebrow: 'What can we help with?',
    routeTitle: 'Choose the closest route.',
    routes: [
      ['Vehicle enquiry', 'Questions about vehicles, documentation or availability.', CarFront],
      ['Active transaction', 'Bidding, inspection, contracts, export or status.', MessageSquareText],
      ['Business partnership', 'Fleet remarketing, sourcing or a potential collaboration.', BriefcaseBusiness],
      ['Dealer access', 'Dealer Network, accounts, bidding or technical support.', Store],
    ],
    directEyebrow: 'Direct contact',
    directTitle: 'Clear support when it matters.',
    directText:
      'Describe your enquiry in the form. If documents or vehicle details are needed, we will explain the next step in our reply.',
    emailLabel: 'Email',
    responseTimeLabel: 'Response time',
    responseTime: 'Normally within one business day',
    dealerTitle: 'Looking for selected Swedish vehicles?',
    dealerText:
      'Apply for the Autorell Dealer Network, available to verified automotive businesses.',
    dealerLink: 'Apply for dealer access',
    faqTitle: 'The answer may already be here.',
    faqText:
      'Read common questions about access, vehicles, bidding and transactions.',
    faqLink: 'View frequently asked questions',
    faqHref: '/faq',
  },
} as const

export default function PublicContactPage({
  locale = 'sv',
}: {
  locale?: ContactLocale
}) {
  const t = copy[locale]

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-white/10 bg-[#20272b] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(180,217,239,.2),transparent_30%),linear-gradient(115deg,rgba(255,255,255,.035),transparent_44%)]" />
        <div className="absolute -right-40 -top-56 h-[600px] w-[600px] rounded-full border-[82px] border-white/[.045]" />
        <div className="relative mx-auto grid max-w-[1320px] gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[1.12fr_.88fr] lg:items-end lg:px-12 lg:py-32">
          <div>
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#B4D9EF]">
              <span className="h-px w-8 bg-[#B4D9EF]/70" />
              {t.eyebrow}
            </p>
            <h1 className="mt-7 max-w-4xl text-[43px] leading-[.98] tracking-[-0.055em] sm:text-7xl sm:leading-[.96] lg:text-[84px]">
              {t.title}
            </h1>
            <p className="mt-8 max-w-2xl text-[17px] leading-8 text-white/64 sm:text-xl sm:leading-9">
              {t.intro}
            </p>
            <a
              href="#contact-form"
              className="mt-9 inline-flex min-h-14 items-center gap-3 rounded-full bg-[#B4D9EF] px-7 text-sm font-semibold text-[#20272b] shadow-[0_18px_45px_rgba(0,0,0,.2)] transition hover:-translate-y-0.5 hover:bg-white"
            >
              {locale === 'sv'
                ? 'Skriv till oss'
                : locale === 'de'
                  ? 'Anfrage senden'
                  : 'Send an enquiry'}
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-white/[.065] p-7 backdrop-blur-sm sm:p-9">
            <Headphones className="h-7 w-7 text-[#B4D9EF]" />
            <p className="mt-10 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#B4D9EF]">
              {t.responseLabel}
            </p>
            <h2 className="mt-3 text-3xl leading-tight tracking-[-0.045em]">
              {t.responseTitle}
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/60">
              {t.responseText}
            </p>
            <div className="mt-8 border-t border-white/10 pt-6">
              <a
                href="mailto:info@autorell.com"
                className="inline-flex items-center gap-3 text-sm font-semibold"
              >
                <span className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-[#B4D9EF]">
                  <Mail className="h-4 w-4" />
                </span>
                info@autorell.com
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f5f3ee] py-16 sm:py-24">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#5b7c8c]">
              {t.routeEyebrow}
            </p>
            <h2 className="mt-4 text-[38px] leading-[1.02] tracking-[-0.052em] sm:text-5xl">
              {t.routeTitle}
            </h2>
          </div>

          <div className="mt-10 grid overflow-hidden rounded-[28px] border border-[#d8dedf] bg-[#d8dedf] gap-px md:grid-cols-2 lg:grid-cols-4">
            {t.routes.map(([title, text, Icon], index) => (
              <a
                key={title}
                href="#contact-form"
                className="group min-h-[250px] bg-white p-7 transition hover:bg-[#edf7fb] sm:p-8"
              >
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-[#edf6fa] text-[#315f74] transition group-hover:bg-[#B4D9EF]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="font-mono text-xs text-[#9aa4a8]">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-10 text-xl tracking-[-0.03em]">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#68767c]">{text}</p>
                <ArrowRight className="mt-7 h-4 w-4 text-[#547b8e] transition group-hover:translate-x-1" />
              </a>
            ))}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[.72fr_1.28fr]">
            <aside className="flex flex-col gap-6">
              <div className="relative overflow-hidden rounded-[28px] bg-[#B4D9EF] p-7 sm:p-9">
                <div className="absolute -right-14 -top-16 h-44 w-44 rounded-full border-[28px] border-white/28" />
                <BadgeCheck className="relative h-6 w-6" />
                <p className="relative mt-9 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#486676]">
                  {t.directEyebrow}
                </p>
                <h2 className="relative mt-3 text-3xl leading-tight tracking-[-0.045em]">
                  {t.directTitle}
                </h2>
                <p className="relative mt-4 text-sm leading-7 text-[#455c67]">
                  {t.directText}
                </p>
                <div className="relative mt-8 space-y-4 border-t border-[#20272b]/12 pt-6">
                  <ContactDetail
                    icon={Mail}
                    label={t.emailLabel}
                    value="info@autorell.com"
                    href="mailto:info@autorell.com"
                  />
                  <ContactDetail
                    icon={Clock3}
                    label={t.responseTimeLabel}
                    value={t.responseTime}
                  />
                </div>
              </div>

              <div className="rounded-[28px] bg-[#20272b] p-7 text-white sm:p-9">
                <Store className="h-6 w-6 text-[#B4D9EF]" />
                <h2 className="mt-8 text-2xl tracking-[-0.035em]">
                  {t.dealerTitle}
                </h2>
                <p className="mt-3 text-sm leading-7 text-white/60">
                  {t.dealerText}
                </p>
                <Link
                  href="/dealer-apply"
                  className="mt-7 inline-flex items-center gap-2 text-sm font-semibold"
                >
                  {t.dealerLink} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <Link
                href={t.faqHref}
                className="group rounded-[28px] border border-[#d8dedf] bg-white p-7 transition hover:border-[#aacfe0] sm:p-9"
              >
                <ShieldCheck className="h-6 w-6 text-[#3d738c]" />
                <h2 className="mt-8 text-2xl tracking-[-0.035em]">
                  {t.faqTitle}
                </h2>
                <p className="mt-3 text-sm leading-7 text-[#68767c]">
                  {t.faqText}
                </p>
                <span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#315f74]">
                  {t.faqLink}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            </aside>

            <div
              id="contact-form"
              className="scroll-mt-28 overflow-hidden rounded-[30px] border border-[#d7e1e5] bg-white shadow-[0_30px_90px_rgba(32,39,43,.1)]"
            >
              <ContactForm locale={locale} />
            </div>
          </div>

          <div className="mt-6 grid gap-px overflow-hidden rounded-[24px] border border-[#d8dedf] bg-[#d8dedf] md:grid-cols-3">
            {t.promises.map(([title, text], index) => (
              <div key={title} className="bg-[#faf9f6] p-6 sm:p-7">
                <div className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-[#e6f2f7] text-xs font-semibold text-[#3d738c]">
                    {index + 1}
                  </span>
                  <h3 className="font-semibold">{title}</h3>
                </div>
                <p className="mt-3 pl-11 text-sm leading-6 text-[#6b777c]">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

function ContactDetail({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: LucideIcon
  label: string
  value: string
  href?: string
}) {
  const content = (
    <>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/42">
        <Icon className="h-4 w-4" />
      </span>
      <span>
        <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#536d79]">
          {label}
        </span>
        <span className="mt-1 block text-sm font-semibold">{value}</span>
      </span>
    </>
  )

  return href ? (
    <a href={href} className="flex items-center gap-3">
      {content}
    </a>
  ) : (
    <div className="flex items-center gap-3">{content}</div>
  )
}
