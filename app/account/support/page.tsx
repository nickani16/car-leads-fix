import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  BadgeCheck,
  Bell,
  CreditCard,
  FileImage,
  FileText,
  HelpCircle,
  LifeBuoy,
  LockKeyhole,
  MessageCircle,
  ShieldAlert,
  Sparkles,
  TimerReset,
  type LucideIcon,
} from 'lucide-react'
import { AccountBreadcrumbs } from '@/app/account/AccountBreadcrumbs'
import { AccountSupportForm, type AccountSupportFormCopy } from '@/app/account/support/AccountSupportForm'
import { createClient } from '@/lib/supabase/server'
import { getRequestLocale } from '@/lib/request-locale'
import { localizePublicHref, translationLocale, type PublicLocale } from '@/lib/public-i18n'
import { generateAccountMetadata } from '@/lib/account-seo'

export const generateMetadata = generateAccountMetadata('support')

type TopicCopy = {
  title: string
  text: string
  href: string
  icon: LucideIcon
}

type SupportCopy = {
  eyebrow: string
  title: string
  intro: string
  responseLabel: string
  responseValue: string
  safetyLabel: string
  safetyValue: string
  quickTitle: string
  quickText: string
  topics: Omit<TopicCopy, 'icon'>[]
  faqEyebrow: string
  faqTitle: string
  faqText: string
  faq: Array<{ q: string; a: string }>
  guidanceTitle: string
  guidanceText: string
  guidanceItems: string[]
  statusTitle: string
  statusItems: Array<{ label: string; text: string }>
  form: AccountSupportFormCopy
}

const topicIcons = [FileText, FileImage, CreditCard, MessageCircle, Bell, LockKeyhole]

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
    .select('account_type,display_name,first_name,last_name,email,phone')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!profile) redirect(localizePublicHref(locale, '/register'))
  if (profile.account_type === 'business') redirect(localizePublicHref(locale, '/account/company/support'))

  const defaultName =
    String(profile.display_name || [profile.first_name, profile.last_name].filter(Boolean).join(' ') || '').trim()
  const defaultEmail = String(profile.email || user.email || '').trim()
  const defaultPhone = String(profile.phone || '').trim()
  const topics: TopicCopy[] = copy.topics.map((topic, index) => ({
    ...topic,
    href: localizePublicHref(locale, topic.href),
    icon: topicIcons[index] || HelpCircle,
  }))

  return (
    <main className="min-h-screen bg-[#f6f8fb] px-4 py-6 sm:px-8 lg:py-10">
      <div className="mx-auto max-w-[1180px]">
        <AccountBreadcrumbs
          locale={locale}
          items={[{ key: 'account', href: '/account' }, { key: 'support' }]}
        />

        <section className="mt-5 overflow-hidden rounded-[28px] border border-[#dfe7f2] bg-white shadow-[0_20px_60px_rgba(16,24,40,.06)]">
          <div className="grid gap-0 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="p-6 sm:p-8 lg:p-10">
              <div className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#cfe0ff] bg-[#f3f7ff] px-4 text-xs font-bold uppercase tracking-[0.16em] text-[#0866ff]">
                <LifeBuoy className="h-4 w-4" />
                {copy.eyebrow}
              </div>
              <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.055em] text-[#101828] sm:text-5xl">
                {copy.title}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#667085]">
                {copy.intro}
              </p>
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <SignalCard icon={TimerReset} label={copy.responseLabel} value={copy.responseValue} />
                <SignalCard icon={ShieldAlert} label={copy.safetyLabel} value={copy.safetyValue} />
              </div>
            </div>
            <div className="border-t border-[#e4eaf3] bg-[#f9fbff] p-6 sm:p-8 lg:border-l lg:border-t-0 lg:p-10">
              <p className="text-sm font-bold text-[#101828]">{copy.quickTitle}</p>
              <p className="mt-2 text-sm leading-6 text-[#667085]">{copy.quickText}</p>
              <div className="mt-5 grid gap-3">
                {topics.slice(0, 3).map((topic) => (
                  <Link
                    key={topic.title}
                    href={topic.href}
                    className="group flex items-center gap-4 rounded-[18px] border border-[#dfe7f2] bg-white p-4 transition hover:border-[#9fc0ff] hover:shadow-[0_14px_34px_rgba(16,24,40,.06)]"
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-[#eef5ff] text-[#0866ff]">
                      <topic.icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-[#101828]">{topic.title}</span>
                      <span className="mt-1 block text-xs leading-5 text-[#667085]">{topic.text}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {topics.map((topic) => (
            <Link
              key={topic.title}
              href={topic.href}
              className="group rounded-[22px] border border-[#dfe7f2] bg-white p-5 shadow-[0_14px_38px_rgba(16,24,40,.035)] transition hover:-translate-y-0.5 hover:border-[#9fc0ff] hover:shadow-[0_18px_44px_rgba(16,24,40,.07)]"
            >
              <span className="grid h-12 w-12 place-items-center rounded-[16px] bg-[#eef5ff] text-[#0866ff] transition group-hover:bg-[#0866ff] group-hover:text-white">
                <topic.icon className="h-5 w-5" />
              </span>
              <h2 className="mt-4 text-lg font-semibold tracking-[-0.025em] text-[#101828]">{topic.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#667085]">{topic.text}</p>
            </Link>
          ))}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <div className="rounded-[24px] border border-[#dfe7f2] bg-white p-6 shadow-[0_18px_50px_rgba(16,24,40,.05)] sm:p-7">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0866ff]">{copy.faqEyebrow}</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#101828]">{copy.faqTitle}</h2>
              <p className="mt-3 text-sm leading-6 text-[#667085]">{copy.faqText}</p>
              <div className="mt-5 grid gap-3">
                {copy.faq.map((item) => (
                  <details key={item.q} className="group rounded-[18px] border border-[#dfe7f2] bg-[#fbfcff] p-4 open:bg-white">
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-sm font-bold text-[#101828]">
                      <span>{item.q}</span>
                      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#eef5ff] text-[#0866ff] transition group-open:rotate-45">+</span>
                    </summary>
                    <p className="mt-3 text-sm leading-6 text-[#667085]">{item.a}</p>
                  </details>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-[#dfe7f2] bg-[#101828] p-6 text-white shadow-[0_18px_50px_rgba(16,24,40,.12)] sm:p-7">
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[16px] bg-white/10 text-white">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-xl font-semibold tracking-[-0.03em]">{copy.guidanceTitle}</h2>
                  <p className="mt-2 text-sm leading-6 text-white/72">{copy.guidanceText}</p>
                </div>
              </div>
              <ul className="mt-5 grid gap-3 text-sm text-white/82">
                {copy.guidanceItems.map((item) => (
                  <li key={item} className="flex gap-3 rounded-[16px] bg-white/[0.07] p-3">
                    <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#8fc7ff]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <AccountSupportForm
              locale={locale}
              copy={copy.form}
              defaultName={defaultName}
              defaultEmail={defaultEmail}
              defaultPhone={defaultPhone}
            />

            <div className="rounded-[24px] border border-[#dfe7f2] bg-white p-6 shadow-[0_18px_50px_rgba(16,24,40,.05)] sm:p-7">
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-[#101828]">{copy.statusTitle}</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {copy.statusItems.map((item) => (
                  <div key={item.label} className="rounded-[18px] border border-[#dfe7f2] bg-[#fbfcff] p-4">
                    <p className="text-sm font-bold text-[#101828]">{item.label}</p>
                    <p className="mt-2 text-xs leading-5 text-[#667085]">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

function SignalCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-[#dfe7f2] bg-[#fbfcff] p-4">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-[13px] bg-white text-[#0866ff] shadow-[0_8px_24px_rgba(16,24,40,.06)]">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#667085]">{label}</p>
          <p className="mt-1 text-sm font-semibold text-[#101828]">{value}</p>
        </div>
      </div>
    </div>
  )
}

function supportCopy(locale: PublicLocale): SupportCopy {
  const key = translationLocale(locale)
  return supportCopies[key] || supportCopies.en
}

const supportCopies: Record<PublicLocale, SupportCopy> = {
  sv: {
    eyebrow: 'Hjälp och support',
    title: 'Support för ditt privata Autorell-konto',
    intro: 'Här får du snabb hjälp med annonser, betalningar, meddelanden, sparade sökningar och kontosäkerhet. Välj rätt område eller skicka ett tydligt ärende direkt till Autorell.',
    responseLabel: 'Svarstid',
    responseValue: 'Vi återkommer så snart vi kan',
    safetyLabel: 'Trygghet',
    safetyValue: 'Misstänkta ärenden prioriteras',
    quickTitle: 'Snabbvägar',
    quickText: 'Gå direkt till den del av kontot där du kan lösa vanliga ärenden själv.',
    topics: [
      { title: 'Mina annonser', text: 'Hantera aktiva annonser, utkast, granskning och publicering.', href: '/account/listings' },
      { title: 'Bilder och innehåll', text: 'Byt bilder, justera annonstext och kontrollera fordonsdata.', href: '/account/listings' },
      { title: 'Betalningar', text: 'Fortsätt betalning, se paketstatus och hantera obetalda annonser.', href: '/account/payments' },
      { title: 'Meddelanden', text: 'Följ upp frågor från köpare och håll kontakten samlad.', href: '/account/messages' },
      { title: 'Sparade sökningar', text: 'Ändra bevakningar och filter som du vill återkomma till.', href: '/account/saved-searches' },
      { title: 'Säkerhet och konto', text: 'Verifiering, misstänkt aktivitet och profiluppgifter.', href: '/account/settings' },
    ],
    faqEyebrow: 'Vanliga frågor',
    faqTitle: 'Snabba svar innan du kontaktar oss',
    faqText: 'De vanligaste privata kontoärendena går ofta att lösa direkt från Mina sidor.',
    faq: [
      { q: 'Varför väntar min annons på betalning?', a: 'En betald publicering eller ett tillval måste bekräftas innan annonsen kan gå vidare. Öppna Mina annonser eller Betalningar och välj Fortsätt betalning.' },
      { q: 'Varför är annonsen under granskning?', a: 'Autorell kontrollerar att obligatoriska uppgifter, bilder och betalningsstatus är klara innan annonsen publiceras.' },
      { q: 'Kan jag ändra en publicerad annons?', a: 'Ja. Gå till Mina annonser, öppna annonsen och välj redigera. Spara ändringarna så uppdateras annonsen.' },
      { q: 'Jag får inga meddelanden från köpare, vad gör jag?', a: 'Kontrollera e-post, verifiering och meddelandefliken. Skicka gärna ett ärende med annonsreferens om något saknas.' },
      { q: 'Hur rapporterar jag misstänkt aktivitet?', a: 'Välj Säkerhet i formuläret och skriv vad som hänt. Skicka gärna länk, annons-ID eller användaruppgifter om du har det.' },
    ],
    guidanceTitle: 'Så får du snabbare hjälp',
    guidanceText: 'Ju mer sammanhang vi får från början, desto snabbare kan vi hitta rätt åtgärd.',
    guidanceItems: ['Ange annons-ID, betalningsreferens eller länk om ärendet gäller en specifik annons.', 'Beskriv vad du försökte göra och vilket felmeddelande du såg.', 'Bifoga inte känsliga kortuppgifter. Autorell ser aldrig hela kortnumret.'],
    statusTitle: 'Vad händer efter att du skickat?',
    statusItems: [
      { label: '1. Mottaget', text: 'Ärendet skickas till Autorell med marknad, ämne och referens.' },
      { label: '2. Sorterat', text: 'Vi kopplar ärendet till rätt område: annons, betalning, konto eller säkerhet.' },
      { label: '3. Svar', text: 'Du får svar på e-post med nästa steg eller uppföljande fråga.' },
    ],
    form: {
      eyebrow: 'Kontakta support',
      title: 'Skicka ett ärende',
      text: 'Fyll i formuläret så tydligt som möjligt. Ditt namn och din e-post är förifyllda när de finns på kontot.',
      name: 'Namn',
      email: 'E-post',
      phone: 'Telefon',
      topic: 'Ärendetyp',
      topicPlaceholder: 'Välj område',
      priority: 'Prioritet',
      priorityPlaceholder: 'Välj prioritet',
      reference: 'Annons eller betalningsreferens',
      referencePlaceholder: 'Exempel: annons-ID, ordernummer eller länk',
      subject: 'Rubrik',
      subjectPlaceholder: 'Sammanfatta problemet kort',
      message: 'Beskrivning',
      messagePlaceholder: 'Berätta vad du behöver hjälp med, vad du försökte göra och vad som hände.',
      privacyStart: 'Jag har läst',
      privacyLink: 'integritetspolicyn',
      privacyEnd: 'och godkänner att Autorell behandlar uppgifterna för att hantera mitt ärende.',
      submit: 'Skicka ärende',
      sending: 'Skickar ärende...',
      successTitle: 'Ärendet är skickat',
      successText: 'Vi har tagit emot din fråga och återkommer via e-post så snart vi kan.',
      sendAnother: 'Skicka ett nytt ärende',
      error: 'Ärendet kunde inte skickas just nu. Kontrollera fälten och försök igen.',
      footnote: 'Skicka aldrig fullständiga kortnummer eller lösenord. Betalningar hanteras säkert av Stripe.',
      topics: ['Annons', 'Betalning', 'Meddelanden', 'Verifiering', 'Säkerhet', 'Tekniskt problem', 'Annat'],
      priorities: ['Normal', 'Brådskande', 'Säkerhetsärende'],
    },
  },
  en: {
    eyebrow: 'Help and support',
    title: 'Support for your private Autorell account',
    intro: 'Get help with listings, payments, messages, saved searches and account safety. Choose the right area or send a clear support request directly to Autorell.',
    responseLabel: 'Response',
    responseValue: 'We reply as soon as we can',
    safetyLabel: 'Safety',
    safetyValue: 'Suspicious cases are prioritized',
    quickTitle: 'Quick links',
    quickText: 'Go straight to the account area where many common issues can be solved.',
    topics: [
      { title: 'My listings', text: 'Manage active listings, drafts, review and publishing.', href: '/account/listings' },
      { title: 'Images and content', text: 'Replace photos, adjust seller text and check vehicle data.', href: '/account/listings' },
      { title: 'Payments', text: 'Continue checkout, view package status and unpaid listings.', href: '/account/payments' },
      { title: 'Messages', text: 'Follow up buyer questions and keep contact in one place.', href: '/account/messages' },
      { title: 'Saved searches', text: 'Edit alerts and filters you want to return to later.', href: '/account/saved-searches' },
      { title: 'Security and account', text: 'Verification, suspicious activity and profile details.', href: '/account/settings' },
    ],
    faqEyebrow: 'FAQ',
    faqTitle: 'Quick answers before contacting us',
    faqText: 'Most private account issues can be handled directly from My pages.',
    faq: [
      { q: 'Why is my listing waiting for payment?', a: 'A paid package or add-on must be confirmed before the listing can continue. Open My listings or Payments and choose Continue payment.' },
      { q: 'Why is my listing under review?', a: 'Autorell checks that required details, images and payment status are complete before a listing becomes public.' },
      { q: 'Can I edit a published listing?', a: 'Yes. Go to My listings, open the listing and choose edit. Save the changes to update it.' },
      { q: 'I do not receive buyer messages. What should I do?', a: 'Check your email, verification and message area. Send a request with the listing reference if anything is missing.' },
      { q: 'How do I report suspicious activity?', a: 'Choose Safety in the form and describe what happened. Include a link, listing ID or user details if available.' },
    ],
    guidanceTitle: 'How to get faster help',
    guidanceText: 'The more context we receive from the start, the faster we can find the right next step.',
    guidanceItems: ['Add a listing ID, payment reference or link if the case concerns a specific listing.', 'Describe what you tried to do and which error message you saw.', 'Do not send sensitive card details. Autorell never sees your full card number.'],
    statusTitle: 'What happens after you send it?',
    statusItems: [
      { label: '1. Received', text: 'Your request is sent to Autorell with market, topic and reference.' },
      { label: '2. Routed', text: 'We connect the case to the right area: listing, payment, account or safety.' },
      { label: '3. Reply', text: 'You receive an email with next steps or a follow-up question.' },
    ],
    form: {
      eyebrow: 'Contact support',
      title: 'Send a support request',
      text: 'Fill in the form as clearly as possible. Your name and email are prefilled when available on your account.',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      topic: 'Case type',
      topicPlaceholder: 'Choose area',
      priority: 'Priority',
      priorityPlaceholder: 'Choose priority',
      reference: 'Listing or payment reference',
      referencePlaceholder: 'Example: listing ID, order number or link',
      subject: 'Subject',
      subjectPlaceholder: 'Summarize the issue briefly',
      message: 'Description',
      messagePlaceholder: 'Tell us what you need help with, what you tried and what happened.',
      privacyStart: 'I have read the',
      privacyLink: 'privacy policy',
      privacyEnd: 'and allow Autorell to process my details to handle this request.',
      submit: 'Send request',
      sending: 'Sending request...',
      successTitle: 'Request sent',
      successText: 'We have received your question and will reply by email as soon as we can.',
      sendAnother: 'Send another request',
      error: 'The request could not be sent right now. Check the fields and try again.',
      footnote: 'Never send full card numbers or passwords. Payments are handled securely by Stripe.',
      topics: ['Listing', 'Payment', 'Messages', 'Verification', 'Safety', 'Technical issue', 'Other'],
      priorities: ['Normal', 'Urgent', 'Safety case'],
    },
  },
  de: {
    eyebrow: 'Hilfe und Support',
    title: 'Support für Ihr privates Autorell-Konto',
    intro: 'Hilfe zu Anzeigen, Zahlungen, Nachrichten, gespeicherten Suchen und Kontosicherheit. Wählen Sie den passenden Bereich oder senden Sie direkt eine klare Anfrage an Autorell.',
    responseLabel: 'Antwortzeit',
    responseValue: 'Wir antworten so schnell wie möglich',
    safetyLabel: 'Sicherheit',
    safetyValue: 'Verdächtige Fälle werden priorisiert',
    quickTitle: 'Schnellzugriff',
    quickText: 'Gehen Sie direkt zu dem Kontobereich, in dem sich viele häufige Fragen lösen lassen.',
    topics: [
      { title: 'Meine Anzeigen', text: 'Aktive Anzeigen, Entwürfe, Prüfung und Veröffentlichung verwalten.', href: '/account/listings' },
      { title: 'Bilder und Inhalte', text: 'Fotos ersetzen, Verkäufertext anpassen und Fahrzeugdaten prüfen.', href: '/account/listings' },
      { title: 'Zahlungen', text: 'Checkout fortsetzen, Paketstatus und offene Anzeigen ansehen.', href: '/account/payments' },
      { title: 'Nachrichten', text: 'Käuferfragen beantworten und Kontakte gesammelt halten.', href: '/account/messages' },
      { title: 'Gespeicherte Suchen', text: 'Benachrichtigungen und Filter bearbeiten.', href: '/account/saved-searches' },
      { title: 'Sicherheit und Konto', text: 'Verifizierung, verdächtige Aktivität und Profildaten.', href: '/account/settings' },
    ],
    faqEyebrow: 'FAQ',
    faqTitle: 'Schnelle Antworten vor der Kontaktaufnahme',
    faqText: 'Viele private Kontoanliegen lassen sich direkt über Mein Konto lösen.',
    faq: [
      { q: 'Warum wartet meine Anzeige auf Zahlung?', a: 'Ein bezahltes Paket oder Add-on muss bestätigt werden, bevor die Anzeige fortgesetzt werden kann. Öffnen Sie Meine Anzeigen oder Zahlungen und wählen Sie Zahlung fortsetzen.' },
      { q: 'Warum wird meine Anzeige geprüft?', a: 'Autorell prüft Pflichtangaben, Bilder und Zahlungsstatus, bevor eine Anzeige öffentlich wird.' },
      { q: 'Kann ich eine veröffentlichte Anzeige ändern?', a: 'Ja. Öffnen Sie Meine Anzeigen, wählen Sie die Anzeige und bearbeiten Sie sie. Speichern Sie die Änderungen.' },
      { q: 'Ich erhalte keine Käufernachrichten. Was kann ich tun?', a: 'Prüfen Sie E-Mail, Verifizierung und Nachrichtenbereich. Senden Sie eine Anfrage mit Anzeigenreferenz, wenn etwas fehlt.' },
      { q: 'Wie melde ich verdächtige Aktivität?', a: 'Wählen Sie Sicherheit im Formular und beschreiben Sie, was passiert ist. Fügen Sie Link, Anzeigen-ID oder Nutzerdaten hinzu, wenn vorhanden.' },
    ],
    guidanceTitle: 'So erhalten Sie schneller Hilfe',
    guidanceText: 'Je mehr Kontext wir direkt erhalten, desto schneller finden wir den richtigen nächsten Schritt.',
    guidanceItems: ['Geben Sie Anzeigen-ID, Zahlungsreferenz oder Link an, wenn es um eine bestimmte Anzeige geht.', 'Beschreiben Sie, was Sie versucht haben und welche Fehlermeldung angezeigt wurde.', 'Senden Sie keine vollständigen Kartendaten. Autorell sieht niemals Ihre vollständige Kartennummer.'],
    statusTitle: 'Was passiert nach dem Absenden?',
    statusItems: [
      { label: '1. Erhalten', text: 'Ihre Anfrage wird mit Markt, Thema und Referenz an Autorell gesendet.' },
      { label: '2. Zugeordnet', text: 'Wir ordnen den Fall dem passenden Bereich zu: Anzeige, Zahlung, Konto oder Sicherheit.' },
      { label: '3. Antwort', text: 'Sie erhalten eine E-Mail mit den nächsten Schritten oder einer Rückfrage.' },
    ],
    form: {
      eyebrow: 'Support kontaktieren',
      title: 'Supportanfrage senden',
      text: 'Füllen Sie das Formular möglichst klar aus. Name und E-Mail sind vorausgefüllt, wenn sie im Konto vorhanden sind.',
      name: 'Name',
      email: 'E-Mail',
      phone: 'Telefon',
      topic: 'Falltyp',
      topicPlaceholder: 'Bereich wählen',
      priority: 'Priorität',
      priorityPlaceholder: 'Priorität wählen',
      reference: 'Anzeige oder Zahlungsreferenz',
      referencePlaceholder: 'Beispiel: Anzeigen-ID, Bestellnummer oder Link',
      subject: 'Betreff',
      subjectPlaceholder: 'Problem kurz zusammenfassen',
      message: 'Beschreibung',
      messagePlaceholder: 'Beschreiben Sie, wobei Sie Hilfe benötigen, was Sie versucht haben und was passiert ist.',
      privacyStart: 'Ich habe die',
      privacyLink: 'Datenschutzerklärung',
      privacyEnd: 'gelesen und erlaube Autorell, meine Angaben zur Bearbeitung dieser Anfrage zu verarbeiten.',
      submit: 'Anfrage senden',
      sending: 'Anfrage wird gesendet...',
      successTitle: 'Anfrage gesendet',
      successText: 'Wir haben Ihre Frage erhalten und antworten so schnell wie möglich per E-Mail.',
      sendAnother: 'Weitere Anfrage senden',
      error: 'Die Anfrage konnte gerade nicht gesendet werden. Prüfen Sie die Felder und versuchen Sie es erneut.',
      footnote: 'Senden Sie niemals vollständige Kartennummern oder Passwörter. Zahlungen werden sicher über Stripe verarbeitet.',
      topics: ['Anzeige', 'Zahlung', 'Nachrichten', 'Verifizierung', 'Sicherheit', 'Technisches Problem', 'Sonstiges'],
      priorities: ['Normal', 'Dringend', 'Sicherheitsfall'],
    },
  },
  fr: {
    eyebrow: 'Aide et support',
    title: 'Support pour votre compte privé Autorell',
    intro: 'Obtenez de l’aide pour vos annonces, paiements, messages, recherches enregistrées et la sécurité du compte. Choisissez le bon sujet ou envoyez une demande claire à Autorell.',
    responseLabel: 'Réponse',
    responseValue: 'Nous répondons dès que possible',
    safetyLabel: 'Sécurité',
    safetyValue: 'Les cas suspects sont prioritaires',
    quickTitle: 'Accès rapides',
    quickText: 'Accédez directement à la zone du compte où de nombreux problèmes peuvent être résolus.',
    topics: [
      { title: 'Mes annonces', text: 'Gérer les annonces actives, brouillons, validations et publications.', href: '/account/listings' },
      { title: 'Images et contenu', text: 'Remplacer les photos, ajuster le texte vendeur et vérifier les données du véhicule.', href: '/account/listings' },
      { title: 'Paiements', text: 'Continuer le paiement, voir le statut du forfait et les annonces impayées.', href: '/account/payments' },
      { title: 'Messages', text: 'Répondre aux acheteurs et garder les échanges au même endroit.', href: '/account/messages' },
      { title: 'Recherches enregistrées', text: 'Modifier les alertes et les filtres à retrouver plus tard.', href: '/account/saved-searches' },
      { title: 'Sécurité et compte', text: 'Vérification, activité suspecte et informations de profil.', href: '/account/settings' },
    ],
    faqEyebrow: 'FAQ',
    faqTitle: 'Réponses rapides avant de nous contacter',
    faqText: 'La plupart des questions liées au compte privé se règlent depuis Mes pages.',
    faq: [
      { q: 'Pourquoi mon annonce attend-elle un paiement ?', a: 'Un forfait payant ou une option doit être confirmé avant que l’annonce puisse continuer. Ouvrez Mes annonces ou Paiements et choisissez Continuer le paiement.' },
      { q: 'Pourquoi mon annonce est-elle en cours de validation ?', a: 'Autorell vérifie les informations obligatoires, les images et le statut du paiement avant la publication.' },
      { q: 'Puis-je modifier une annonce publiée ?', a: 'Oui. Ouvrez Mes annonces, choisissez l’annonce et modifiez-la. Enregistrez ensuite les changements.' },
      { q: 'Je ne reçois pas les messages des acheteurs. Que faire ?', a: 'Vérifiez votre e-mail, la vérification du compte et la messagerie. Envoyez une demande avec la référence de l’annonce si nécessaire.' },
      { q: 'Comment signaler une activité suspecte ?', a: 'Choisissez Sécurité dans le formulaire et décrivez ce qui s’est passé. Ajoutez un lien, un ID d’annonce ou des informations utilisateur si possible.' },
    ],
    guidanceTitle: 'Comment obtenir une aide plus rapide',
    guidanceText: 'Plus le contexte est clair dès le départ, plus vite nous trouvons la bonne action.',
    guidanceItems: ['Ajoutez un ID d’annonce, une référence de paiement ou un lien si le cas concerne une annonce précise.', 'Décrivez ce que vous avez essayé de faire et le message d’erreur affiché.', 'N’envoyez jamais de numéro de carte complet. Autorell ne voit jamais le numéro complet.'],
    statusTitle: 'Que se passe-t-il après l’envoi ?',
    statusItems: [
      { label: '1. Reçu', text: 'Votre demande est envoyée à Autorell avec le marché, le sujet et la référence.' },
      { label: '2. Orienté', text: 'Nous rattachons le cas au bon domaine : annonce, paiement, compte ou sécurité.' },
      { label: '3. Réponse', text: 'Vous recevez un e-mail avec les prochaines étapes ou une question.' },
    ],
    form: {
      eyebrow: 'Contacter le support',
      title: 'Envoyer une demande',
      text: 'Remplissez le formulaire aussi clairement que possible. Votre nom et votre e-mail sont préremplis s’ils existent sur le compte.',
      name: 'Nom',
      email: 'E-mail',
      phone: 'Téléphone',
      topic: 'Type de demande',
      topicPlaceholder: 'Choisir un domaine',
      priority: 'Priorité',
      priorityPlaceholder: 'Choisir une priorité',
      reference: 'Référence annonce ou paiement',
      referencePlaceholder: 'Exemple : ID annonce, numéro de commande ou lien',
      subject: 'Objet',
      subjectPlaceholder: 'Résumez brièvement le problème',
      message: 'Description',
      messagePlaceholder: 'Expliquez ce dont vous avez besoin, ce que vous avez essayé et ce qui s’est passé.',
      privacyStart: 'J’ai lu la',
      privacyLink: 'politique de confidentialité',
      privacyEnd: 'et j’autorise Autorell à traiter mes informations pour gérer cette demande.',
      submit: 'Envoyer la demande',
      sending: 'Envoi de la demande...',
      successTitle: 'Demande envoyée',
      successText: 'Nous avons reçu votre question et répondrons par e-mail dès que possible.',
      sendAnother: 'Envoyer une autre demande',
      error: 'La demande n’a pas pu être envoyée. Vérifiez les champs et réessayez.',
      footnote: 'N’envoyez jamais de numéros de carte complets ni de mots de passe. Les paiements sont sécurisés par Stripe.',
      topics: ['Annonce', 'Paiement', 'Messages', 'Vérification', 'Sécurité', 'Problème technique', 'Autre'],
      priorities: ['Normal', 'Urgent', 'Cas de sécurité'],
    },
  },
  es: {
    eyebrow: 'Ayuda y soporte',
    title: 'Soporte para tu cuenta privada de Autorell',
    intro: 'Obtén ayuda con anuncios, pagos, mensajes, búsquedas guardadas y seguridad de la cuenta. Elige el área correcta o envía una solicitud clara a Autorell.',
    responseLabel: 'Respuesta',
    responseValue: 'Respondemos lo antes posible',
    safetyLabel: 'Seguridad',
    safetyValue: 'Los casos sospechosos tienen prioridad',
    quickTitle: 'Accesos rápidos',
    quickText: 'Ve directamente al área de la cuenta donde se resuelven muchos casos comunes.',
    topics: [
      { title: 'Mis anuncios', text: 'Gestiona anuncios activos, borradores, revisión y publicación.', href: '/account/listings' },
      { title: 'Imágenes y contenido', text: 'Cambia fotos, ajusta el texto del vendedor y revisa datos del vehículo.', href: '/account/listings' },
      { title: 'Pagos', text: 'Continúa el pago, revisa el estado del paquete y anuncios pendientes.', href: '/account/payments' },
      { title: 'Mensajes', text: 'Responde preguntas de compradores y mantén el contacto ordenado.', href: '/account/messages' },
      { title: 'Búsquedas guardadas', text: 'Edita alertas y filtros para volver a ellos más tarde.', href: '/account/saved-searches' },
      { title: 'Seguridad y cuenta', text: 'Verificación, actividad sospechosa y datos del perfil.', href: '/account/settings' },
    ],
    faqEyebrow: 'FAQ',
    faqTitle: 'Respuestas rápidas antes de contactarnos',
    faqText: 'La mayoría de los asuntos de una cuenta privada se pueden gestionar desde Mis páginas.',
    faq: [
      { q: '¿Por qué mi anuncio espera pago?', a: 'Un paquete de pago o complemento debe confirmarse antes de que el anuncio continúe. Abre Mis anuncios o Pagos y elige Continuar pago.' },
      { q: '¿Por qué mi anuncio está en revisión?', a: 'Autorell revisa datos obligatorios, imágenes y estado de pago antes de publicar el anuncio.' },
      { q: '¿Puedo editar un anuncio publicado?', a: 'Sí. Ve a Mis anuncios, abre el anuncio y elige editar. Guarda los cambios para actualizarlo.' },
      { q: 'No recibo mensajes de compradores. ¿Qué hago?', a: 'Comprueba tu e-mail, la verificación y el área de mensajes. Envía una solicitud con la referencia del anuncio si falta algo.' },
      { q: '¿Cómo informo actividad sospechosa?', a: 'Elige Seguridad en el formulario y describe lo sucedido. Incluye enlace, ID del anuncio o datos del usuario si los tienes.' },
    ],
    guidanceTitle: 'Cómo recibir ayuda más rápido',
    guidanceText: 'Cuanto más contexto recibamos al principio, más rápido encontraremos el siguiente paso.',
    guidanceItems: ['Añade ID del anuncio, referencia de pago o enlace si el caso trata de un anuncio concreto.', 'Describe lo que intentaste hacer y qué mensaje de error viste.', 'No envíes datos completos de tarjeta. Autorell nunca ve el número completo.'],
    statusTitle: '¿Qué ocurre después de enviarlo?',
    statusItems: [
      { label: '1. Recibido', text: 'Tu solicitud se envía a Autorell con mercado, tema y referencia.' },
      { label: '2. Clasificado', text: 'Conectamos el caso con el área correcta: anuncio, pago, cuenta o seguridad.' },
      { label: '3. Respuesta', text: 'Recibes un e-mail con próximos pasos o una pregunta de seguimiento.' },
    ],
    form: {
      eyebrow: 'Contactar soporte',
      title: 'Enviar una solicitud',
      text: 'Completa el formulario con claridad. Tu nombre y e-mail aparecen rellenos si existen en la cuenta.',
      name: 'Nombre',
      email: 'E-mail',
      phone: 'Teléfono',
      topic: 'Tipo de caso',
      topicPlaceholder: 'Elegir área',
      priority: 'Prioridad',
      priorityPlaceholder: 'Elegir prioridad',
      reference: 'Referencia de anuncio o pago',
      referencePlaceholder: 'Ejemplo: ID de anuncio, número de pedido o enlace',
      subject: 'Asunto',
      subjectPlaceholder: 'Resume el problema brevemente',
      message: 'Descripción',
      messagePlaceholder: 'Cuéntanos qué necesitas, qué intentaste y qué ocurrió.',
      privacyStart: 'He leído la',
      privacyLink: 'política de privacidad',
      privacyEnd: 'y permito que Autorell trate mis datos para gestionar esta solicitud.',
      submit: 'Enviar solicitud',
      sending: 'Enviando solicitud...',
      successTitle: 'Solicitud enviada',
      successText: 'Hemos recibido tu pregunta y responderemos por e-mail lo antes posible.',
      sendAnother: 'Enviar otra solicitud',
      error: 'La solicitud no pudo enviarse ahora. Revisa los campos e inténtalo de nuevo.',
      footnote: 'Nunca envíes números completos de tarjeta ni contraseñas. Los pagos se gestionan de forma segura con Stripe.',
      topics: ['Anuncio', 'Pago', 'Mensajes', 'Verificación', 'Seguridad', 'Problema técnico', 'Otro'],
      priorities: ['Normal', 'Urgente', 'Caso de seguridad'],
    },
  },
  it: {
    eyebrow: 'Aiuto e supporto',
    title: 'Supporto per il tuo account privato Autorell',
    intro: 'Ricevi aiuto per annunci, pagamenti, messaggi, ricerche salvate e sicurezza dell’account. Scegli l’area corretta o invia una richiesta chiara ad Autorell.',
    responseLabel: 'Risposta',
    responseValue: 'Rispondiamo appena possibile',
    safetyLabel: 'Sicurezza',
    safetyValue: 'I casi sospetti hanno priorità',
    quickTitle: 'Accessi rapidi',
    quickText: 'Vai direttamente all’area dell’account dove puoi risolvere molti casi comuni.',
    topics: [
      { title: 'I miei annunci', text: 'Gestisci annunci attivi, bozze, revisione e pubblicazione.', href: '/account/listings' },
      { title: 'Immagini e contenuti', text: 'Sostituisci foto, modifica il testo venditore e controlla i dati veicolo.', href: '/account/listings' },
      { title: 'Pagamenti', text: 'Continua il checkout, controlla stato pacchetto e annunci non pagati.', href: '/account/payments' },
      { title: 'Messaggi', text: 'Rispondi agli acquirenti e mantieni i contatti in un unico posto.', href: '/account/messages' },
      { title: 'Ricerche salvate', text: 'Modifica avvisi e filtri da riaprire più tardi.', href: '/account/saved-searches' },
      { title: 'Sicurezza e account', text: 'Verifica, attività sospette e dati del profilo.', href: '/account/settings' },
    ],
    faqEyebrow: 'FAQ',
    faqTitle: 'Risposte rapide prima di contattarci',
    faqText: 'Molti problemi dell’account privato possono essere risolti da Le mie pagine.',
    faq: [
      { q: 'Perché il mio annuncio attende il pagamento?', a: 'Un pacchetto a pagamento o un extra deve essere confermato prima che l’annuncio continui. Apri I miei annunci o Pagamenti e scegli Continua pagamento.' },
      { q: 'Perché il mio annuncio è in revisione?', a: 'Autorell controlla dati obbligatori, immagini e stato del pagamento prima della pubblicazione.' },
      { q: 'Posso modificare un annuncio pubblicato?', a: 'Sì. Vai su I miei annunci, apri l’annuncio e scegli modifica. Salva le modifiche per aggiornarlo.' },
      { q: 'Non ricevo messaggi dagli acquirenti. Cosa devo fare?', a: 'Controlla e-mail, verifica e area messaggi. Invia una richiesta con il riferimento dell’annuncio se manca qualcosa.' },
      { q: 'Come segnalo attività sospette?', a: 'Scegli Sicurezza nel modulo e descrivi l’accaduto. Aggiungi link, ID annuncio o dati utente se disponibili.' },
    ],
    guidanceTitle: 'Come ricevere aiuto più velocemente',
    guidanceText: 'Più contesto riceviamo subito, più rapidamente troviamo il prossimo passo corretto.',
    guidanceItems: ['Aggiungi ID annuncio, riferimento pagamento o link se riguarda un annuncio specifico.', 'Descrivi cosa hai provato a fare e quale errore hai visto.', 'Non inviare dati completi della carta. Autorell non vede mai il numero completo.'],
    statusTitle: 'Cosa succede dopo l’invio?',
    statusItems: [
      { label: '1. Ricevuto', text: 'La richiesta viene inviata ad Autorell con mercato, tema e riferimento.' },
      { label: '2. Smistato', text: 'Colleghiamo il caso all’area giusta: annuncio, pagamento, account o sicurezza.' },
      { label: '3. Risposta', text: 'Ricevi un’e-mail con i prossimi passi o una domanda.' },
    ],
    form: {
      eyebrow: 'Contatta supporto',
      title: 'Invia una richiesta',
      text: 'Compila il modulo nel modo più chiaro possibile. Nome ed e-mail sono precompilati se presenti nell’account.',
      name: 'Nome',
      email: 'E-mail',
      phone: 'Telefono',
      topic: 'Tipo di caso',
      topicPlaceholder: 'Scegli area',
      priority: 'Priorità',
      priorityPlaceholder: 'Scegli priorità',
      reference: 'Riferimento annuncio o pagamento',
      referencePlaceholder: 'Esempio: ID annuncio, numero ordine o link',
      subject: 'Oggetto',
      subjectPlaceholder: 'Riassumi brevemente il problema',
      message: 'Descrizione',
      messagePlaceholder: 'Spiega di cosa hai bisogno, cosa hai provato e cosa è successo.',
      privacyStart: 'Ho letto la',
      privacyLink: 'privacy policy',
      privacyEnd: 'e autorizzo Autorell a trattare i miei dati per gestire questa richiesta.',
      submit: 'Invia richiesta',
      sending: 'Invio richiesta...',
      successTitle: 'Richiesta inviata',
      successText: 'Abbiamo ricevuto la tua domanda e risponderemo via e-mail appena possibile.',
      sendAnother: 'Invia un’altra richiesta',
      error: 'La richiesta non può essere inviata ora. Controlla i campi e riprova.',
      footnote: 'Non inviare mai numeri completi di carta o password. I pagamenti sono gestiti in sicurezza da Stripe.',
      topics: ['Annuncio', 'Pagamento', 'Messaggi', 'Verifica', 'Sicurezza', 'Problema tecnico', 'Altro'],
      priorities: ['Normale', 'Urgente', 'Caso di sicurezza'],
    },
  },
  pl: {
    eyebrow: 'Pomoc i wsparcie',
    title: 'Wsparcie dla prywatnego konta Autorell',
    intro: 'Uzyskaj pomoc dotyczącą ogłoszeń, płatności, wiadomości, zapisanych wyszukiwań i bezpieczeństwa konta. Wybierz właściwy obszar albo wyślij jasne zgłoszenie do Autorell.',
    responseLabel: 'Odpowiedź',
    responseValue: 'Odpowiemy tak szybko, jak to możliwe',
    safetyLabel: 'Bezpieczeństwo',
    safetyValue: 'Podejrzane sprawy mają priorytet',
    quickTitle: 'Szybkie linki',
    quickText: 'Przejdź bezpośrednio do obszaru konta, gdzie można rozwiązać typowe sprawy.',
    topics: [
      { title: 'Moje ogłoszenia', text: 'Zarządzaj aktywnymi ogłoszeniami, szkicami, weryfikacją i publikacją.', href: '/account/listings' },
      { title: 'Zdjęcia i treść', text: 'Zmień zdjęcia, popraw tekst sprzedawcy i sprawdź dane pojazdu.', href: '/account/listings' },
      { title: 'Płatności', text: 'Kontynuuj checkout, sprawdź status pakietu i nieopłacone ogłoszenia.', href: '/account/payments' },
      { title: 'Wiadomości', text: 'Odpowiadaj kupującym i trzymaj kontakt w jednym miejscu.', href: '/account/messages' },
      { title: 'Zapisane wyszukiwania', text: 'Edytuj alerty i filtry, do których chcesz wrócić.', href: '/account/saved-searches' },
      { title: 'Bezpieczeństwo i konto', text: 'Weryfikacja, podejrzana aktywność i dane profilu.', href: '/account/settings' },
    ],
    faqEyebrow: 'FAQ',
    faqTitle: 'Szybkie odpowiedzi przed kontaktem',
    faqText: 'Większość spraw prywatnego konta można obsłużyć z poziomu Moich stron.',
    faq: [
      { q: 'Dlaczego moje ogłoszenie czeka na płatność?', a: 'Płatny pakiet lub dodatek musi zostać potwierdzony, zanim ogłoszenie przejdzie dalej. Otwórz Moje ogłoszenia lub Płatności i wybierz Kontynuuj płatność.' },
      { q: 'Dlaczego moje ogłoszenie jest w weryfikacji?', a: 'Autorell sprawdza wymagane dane, zdjęcia i status płatności przed publikacją ogłoszenia.' },
      { q: 'Czy mogę edytować opublikowane ogłoszenie?', a: 'Tak. Przejdź do Moich ogłoszeń, otwórz ogłoszenie i wybierz edycję. Zapisz zmiany, aby je zaktualizować.' },
      { q: 'Nie otrzymuję wiadomości od kupujących. Co zrobić?', a: 'Sprawdź e-mail, weryfikację i wiadomości. Wyślij zgłoszenie z referencją ogłoszenia, jeśli czegoś brakuje.' },
      { q: 'Jak zgłosić podejrzaną aktywność?', a: 'Wybierz Bezpieczeństwo w formularzu i opisz sytuację. Dodaj link, ID ogłoszenia lub dane użytkownika, jeśli je masz.' },
    ],
    guidanceTitle: 'Jak szybciej uzyskać pomoc',
    guidanceText: 'Im więcej kontekstu otrzymamy na początku, tym szybciej znajdziemy właściwe działanie.',
    guidanceItems: ['Dodaj ID ogłoszenia, referencję płatności lub link, jeśli sprawa dotyczy konkretnego ogłoszenia.', 'Opisz, co próbowałeś zrobić i jaki komunikat błędu się pojawił.', 'Nie wysyłaj pełnych danych karty. Autorell nigdy nie widzi pełnego numeru karty.'],
    statusTitle: 'Co dzieje się po wysłaniu?',
    statusItems: [
      { label: '1. Otrzymane', text: 'Zgłoszenie trafia do Autorell z rynkiem, tematem i referencją.' },
      { label: '2. Przekazane', text: 'Łączymy sprawę z właściwym obszarem: ogłoszenie, płatność, konto lub bezpieczeństwo.' },
      { label: '3. Odpowiedź', text: 'Otrzymasz e-mail z kolejnymi krokami lub pytaniem.' },
    ],
    form: {
      eyebrow: 'Kontakt z pomocą',
      title: 'Wyślij zgłoszenie',
      text: 'Wypełnij formularz możliwie jasno. Imię i e-mail są uzupełnione, jeśli znajdują się na koncie.',
      name: 'Imię i nazwisko',
      email: 'E-mail',
      phone: 'Telefon',
      topic: 'Typ sprawy',
      topicPlaceholder: 'Wybierz obszar',
      priority: 'Priorytet',
      priorityPlaceholder: 'Wybierz priorytet',
      reference: 'Referencja ogłoszenia lub płatności',
      referencePlaceholder: 'Przykład: ID ogłoszenia, numer zamówienia lub link',
      subject: 'Temat',
      subjectPlaceholder: 'Krótko podsumuj problem',
      message: 'Opis',
      messagePlaceholder: 'Napisz, czego potrzebujesz, co próbowałeś zrobić i co się stało.',
      privacyStart: 'Przeczytałem/am',
      privacyLink: 'politykę prywatności',
      privacyEnd: 'i zgadzam się, aby Autorell przetwarzał moje dane w celu obsługi zgłoszenia.',
      submit: 'Wyślij zgłoszenie',
      sending: 'Wysyłanie zgłoszenia...',
      successTitle: 'Zgłoszenie wysłane',
      successText: 'Otrzymaliśmy Twoje pytanie i odpowiemy e-mailem tak szybko, jak to możliwe.',
      sendAnother: 'Wyślij kolejne zgłoszenie',
      error: 'Nie można teraz wysłać zgłoszenia. Sprawdź pola i spróbuj ponownie.',
      footnote: 'Nigdy nie wysyłaj pełnych numerów kart ani haseł. Płatności są bezpiecznie obsługiwane przez Stripe.',
      topics: ['Ogłoszenie', 'Płatność', 'Wiadomości', 'Weryfikacja', 'Bezpieczeństwo', 'Problem techniczny', 'Inne'],
      priorities: ['Normalny', 'Pilny', 'Sprawa bezpieczeństwa'],
    },
  },
  nl: {
    eyebrow: 'Hulp en support',
    title: 'Support voor je particuliere Autorell-account',
    intro: 'Krijg hulp met advertenties, betalingen, berichten, opgeslagen zoekopdrachten en accountveiligheid. Kies het juiste onderwerp of stuur een duidelijke aanvraag naar Autorell.',
    responseLabel: 'Reactie',
    responseValue: 'We reageren zo snel mogelijk',
    safetyLabel: 'Veiligheid',
    safetyValue: 'Verdachte zaken krijgen prioriteit',
    quickTitle: 'Snelle links',
    quickText: 'Ga direct naar het accountgedeelte waar veel zaken kunnen worden opgelost.',
    topics: [
      { title: 'Mijn advertenties', text: 'Beheer actieve advertenties, concepten, controle en publicatie.', href: '/account/listings' },
      { title: 'Afbeeldingen en inhoud', text: 'Vervang foto’s, pas verkoperstekst aan en controleer voertuigdata.', href: '/account/listings' },
      { title: 'Betalingen', text: 'Ga door met checkout, bekijk pakketstatus en onbetaalde advertenties.', href: '/account/payments' },
      { title: 'Berichten', text: 'Volg vragen van kopers op en houd contact centraal.', href: '/account/messages' },
      { title: 'Opgeslagen zoekopdrachten', text: 'Wijzig meldingen en filters die je later opnieuw wilt gebruiken.', href: '/account/saved-searches' },
      { title: 'Veiligheid en account', text: 'Verificatie, verdachte activiteit en profielgegevens.', href: '/account/settings' },
    ],
    faqEyebrow: 'FAQ',
    faqTitle: 'Snelle antwoorden voordat je contact opneemt',
    faqText: 'De meeste particuliere accountvragen kun je direct oplossen via Mijn pagina’s.',
    faq: [
      { q: 'Waarom wacht mijn advertentie op betaling?', a: 'Een betaald pakket of extra optie moet worden bevestigd voordat de advertentie verder kan. Open Mijn advertenties of Betalingen en kies Betaling voortzetten.' },
      { q: 'Waarom wordt mijn advertentie gecontroleerd?', a: 'Autorell controleert verplichte gegevens, afbeeldingen en betalingsstatus voordat de advertentie openbaar wordt.' },
      { q: 'Kan ik een gepubliceerde advertentie bewerken?', a: 'Ja. Ga naar Mijn advertenties, open de advertentie en kies bewerken. Sla de wijzigingen op.' },
      { q: 'Ik ontvang geen berichten van kopers. Wat nu?', a: 'Controleer e-mail, verificatie en berichten. Stuur een aanvraag met advertentiereferentie als iets ontbreekt.' },
      { q: 'Hoe meld ik verdachte activiteit?', a: 'Kies Veiligheid in het formulier en beschrijf wat er is gebeurd. Voeg link, advertentie-ID of gebruikersgegevens toe als je die hebt.' },
    ],
    guidanceTitle: 'Zo krijg je sneller hulp',
    guidanceText: 'Hoe meer context we meteen krijgen, hoe sneller we de juiste volgende stap vinden.',
    guidanceItems: ['Voeg advertentie-ID, betalingsreferentie of link toe als het om een specifieke advertentie gaat.', 'Beschrijf wat je probeerde te doen en welke foutmelding je zag.', 'Stuur nooit volledige kaartgegevens. Autorell ziet nooit het volledige kaartnummer.'],
    statusTitle: 'Wat gebeurt er na verzenden?',
    statusItems: [
      { label: '1. Ontvangen', text: 'Je aanvraag wordt naar Autorell gestuurd met markt, onderwerp en referentie.' },
      { label: '2. Gerouteerd', text: 'We koppelen de zaak aan het juiste gebied: advertentie, betaling, account of veiligheid.' },
      { label: '3. Antwoord', text: 'Je ontvangt een e-mail met vervolgstappen of een vraag.' },
    ],
    form: {
      eyebrow: 'Support contacteren',
      title: 'Supportaanvraag sturen',
      text: 'Vul het formulier zo duidelijk mogelijk in. Naam en e-mail zijn ingevuld wanneer ze in je account staan.',
      name: 'Naam',
      email: 'E-mail',
      phone: 'Telefoon',
      topic: 'Type zaak',
      topicPlaceholder: 'Kies gebied',
      priority: 'Prioriteit',
      priorityPlaceholder: 'Kies prioriteit',
      reference: 'Advertentie- of betalingsreferentie',
      referencePlaceholder: 'Voorbeeld: advertentie-ID, ordernummer of link',
      subject: 'Onderwerp',
      subjectPlaceholder: 'Vat het probleem kort samen',
      message: 'Beschrijving',
      messagePlaceholder: 'Vertel waarmee je hulp nodig hebt, wat je probeerde en wat er gebeurde.',
      privacyStart: 'Ik heb het',
      privacyLink: 'privacybeleid',
      privacyEnd: 'gelezen en geef Autorell toestemming om mijn gegevens te verwerken voor deze aanvraag.',
      submit: 'Aanvraag sturen',
      sending: 'Aanvraag versturen...',
      successTitle: 'Aanvraag verzonden',
      successText: 'We hebben je vraag ontvangen en reageren zo snel mogelijk per e-mail.',
      sendAnother: 'Nog een aanvraag sturen',
      error: 'De aanvraag kon nu niet worden verzonden. Controleer de velden en probeer opnieuw.',
      footnote: 'Stuur nooit volledige kaartnummers of wachtwoorden. Betalingen worden veilig verwerkt door Stripe.',
      topics: ['Advertentie', 'Betaling', 'Berichten', 'Verificatie', 'Veiligheid', 'Technisch probleem', 'Overig'],
      priorities: ['Normaal', 'Dringend', 'Veiligheidszaak'],
    },
  },
  fi: {
    eyebrow: 'Ohjeet ja tuki',
    title: 'Tuki yksityiselle Autorell-tilillesi',
    intro: 'Saat apua ilmoituksiin, maksuihin, viesteihin, tallennettuihin hakuihin ja tilin turvallisuuteen. Valitse oikea alue tai lähetä selkeä tukipyyntö Autorellille.',
    responseLabel: 'Vastaus',
    responseValue: 'Vastaamme mahdollisimman pian',
    safetyLabel: 'Turvallisuus',
    safetyValue: 'Epäilyttävät tapaukset priorisoidaan',
    quickTitle: 'Pikalinkit',
    quickText: 'Siirry suoraan siihen tilin osaan, jossa monet yleiset asiat voi ratkaista.',
    topics: [
      { title: 'Omat ilmoitukset', text: 'Hallitse aktiivisia ilmoituksia, luonnoksia, tarkistusta ja julkaisua.', href: '/account/listings' },
      { title: 'Kuvat ja sisältö', text: 'Vaihda kuvia, muokkaa myyjän tekstiä ja tarkista ajoneuvotiedot.', href: '/account/listings' },
      { title: 'Maksut', text: 'Jatka maksua, tarkista paketin tila ja maksamattomat ilmoitukset.', href: '/account/payments' },
      { title: 'Viestit', text: 'Vastaa ostajien kysymyksiin ja pidä yhteydenpito yhdessä paikassa.', href: '/account/messages' },
      { title: 'Tallennetut haut', text: 'Muokkaa ilmoituksia ja suodattimia, joihin haluat palata.', href: '/account/saved-searches' },
      { title: 'Turvallisuus ja tili', text: 'Vahvistus, epäilyttävä toiminta ja profiilitiedot.', href: '/account/settings' },
    ],
    faqEyebrow: 'UKK',
    faqTitle: 'Nopeat vastaukset ennen yhteydenottoa',
    faqText: 'Useimmat yksityistilin asiat voi hoitaa suoraan Omilta sivuilta.',
    faq: [
      { q: 'Miksi ilmoitukseni odottaa maksua?', a: 'Maksullinen paketti tai lisäpalvelu on vahvistettava ennen kuin ilmoitus voi jatkua. Avaa Omat ilmoitukset tai Maksut ja valitse Jatka maksua.' },
      { q: 'Miksi ilmoitukseni on tarkistuksessa?', a: 'Autorell tarkistaa pakolliset tiedot, kuvat ja maksun tilan ennen julkaisua.' },
      { q: 'Voinko muokata julkaistua ilmoitusta?', a: 'Kyllä. Siirry Omiin ilmoituksiin, avaa ilmoitus ja valitse muokkaa. Tallenna muutokset.' },
      { q: 'En saa ostajien viestejä. Mitä teen?', a: 'Tarkista sähköposti, vahvistus ja viestialue. Lähetä pyyntö ilmoitusviitteellä, jos jotain puuttuu.' },
      { q: 'Miten ilmoitan epäilyttävästä toiminnasta?', a: 'Valitse lomakkeessa Turvallisuus ja kuvaa tapahtunut. Lisää linkki, ilmoitus-ID tai käyttäjätiedot, jos ne ovat saatavilla.' },
    ],
    guidanceTitle: 'Näin saat apua nopeammin',
    guidanceText: 'Mitä enemmän taustatietoja saamme alussa, sitä nopeammin löydämme oikean seuraavan vaiheen.',
    guidanceItems: ['Lisää ilmoitus-ID, maksuviite tai linkki, jos asia koskee tiettyä ilmoitusta.', 'Kuvaa mitä yritit tehdä ja minkä virheilmoituksen näit.', 'Älä lähetä täydellisiä korttitietoja. Autorell ei koskaan näe koko korttinumeroa.'],
    statusTitle: 'Mitä tapahtuu lähetyksen jälkeen?',
    statusItems: [
      { label: '1. Vastaanotettu', text: 'Pyyntö lähetetään Autorellille markkinan, aiheen ja viitteen kanssa.' },
      { label: '2. Ohjattu', text: 'Yhdistämme asian oikeaan alueeseen: ilmoitus, maksu, tili tai turvallisuus.' },
      { label: '3. Vastaus', text: 'Saat sähköpostin seuraavista vaiheista tai lisäkysymyksen.' },
    ],
    form: {
      eyebrow: 'Ota yhteyttä tukeen',
      title: 'Lähetä tukipyyntö',
      text: 'Täytä lomake mahdollisimman selkeästi. Nimi ja sähköposti täytetään valmiiksi, jos ne löytyvät tililtä.',
      name: 'Nimi',
      email: 'Sähköposti',
      phone: 'Puhelin',
      topic: 'Asian tyyppi',
      topicPlaceholder: 'Valitse alue',
      priority: 'Prioriteetti',
      priorityPlaceholder: 'Valitse prioriteetti',
      reference: 'Ilmoituksen tai maksun viite',
      referencePlaceholder: 'Esim. ilmoitus-ID, tilausnumero tai linkki',
      subject: 'Aihe',
      subjectPlaceholder: 'Tiivistä ongelma lyhyesti',
      message: 'Kuvaus',
      messagePlaceholder: 'Kerro mihin tarvitset apua, mitä yritit tehdä ja mitä tapahtui.',
      privacyStart: 'Olen lukenut',
      privacyLink: 'tietosuojakäytännön',
      privacyEnd: 'ja annan Autorellille luvan käsitellä tietojani tämän pyynnön hoitamiseksi.',
      submit: 'Lähetä pyyntö',
      sending: 'Lähetetään pyyntöä...',
      successTitle: 'Pyyntö lähetetty',
      successText: 'Olemme vastaanottaneet kysymyksesi ja vastaamme sähköpostitse mahdollisimman pian.',
      sendAnother: 'Lähetä uusi pyyntö',
      error: 'Pyyntöä ei voitu lähettää juuri nyt. Tarkista kentät ja yritä uudelleen.',
      footnote: 'Älä koskaan lähetä täydellisiä korttinumeroita tai salasanoja. Maksut käsitellään turvallisesti Stripen kautta.',
      topics: ['Ilmoitus', 'Maksu', 'Viestit', 'Vahvistus', 'Turvallisuus', 'Tekninen ongelma', 'Muu'],
      priorities: ['Normaali', 'Kiireellinen', 'Turvallisuustapaus'],
    },
  },
  da: {
    eyebrow: 'Hjælp og support',
    title: 'Support til din private Autorell-konto',
    intro: 'Få hjælp til annoncer, betalinger, beskeder, gemte søgninger og kontosikkerhed. Vælg det rigtige område eller send en tydelig supportsag til Autorell.',
    responseLabel: 'Svar',
    responseValue: 'Vi svarer hurtigst muligt',
    safetyLabel: 'Sikkerhed',
    safetyValue: 'Mistænkelige sager prioriteres',
    quickTitle: 'Genveje',
    quickText: 'Gå direkte til den kontodel, hvor mange almindelige sager kan løses.',
    topics: [
      { title: 'Mine annoncer', text: 'Administrer aktive annoncer, kladder, gennemgang og publicering.', href: '/account/listings' },
      { title: 'Billeder og indhold', text: 'Udskift fotos, juster sælgertekst og kontroller køretøjsdata.', href: '/account/listings' },
      { title: 'Betalinger', text: 'Fortsæt checkout, se pakkestatus og ubetalte annoncer.', href: '/account/payments' },
      { title: 'Beskeder', text: 'Følg op på køberspørgsmål og hold kontakten samlet.', href: '/account/messages' },
      { title: 'Gemte søgninger', text: 'Rediger alarmer og filtre, som du vil vende tilbage til.', href: '/account/saved-searches' },
      { title: 'Sikkerhed og konto', text: 'Verificering, mistænkelig aktivitet og profiloplysninger.', href: '/account/settings' },
    ],
    faqEyebrow: 'FAQ',
    faqTitle: 'Hurtige svar før du kontakter os',
    faqText: 'De fleste private kontoemner kan håndteres direkte fra Mine sider.',
    faq: [
      { q: 'Hvorfor venter min annonce på betaling?', a: 'En betalt pakke eller tilvalg skal bekræftes, før annoncen kan fortsætte. Åbn Mine annoncer eller Betalinger og vælg Fortsæt betaling.' },
      { q: 'Hvorfor er min annonce under gennemgang?', a: 'Autorell kontrollerer obligatoriske oplysninger, billeder og betalingsstatus før publicering.' },
      { q: 'Kan jeg redigere en publiceret annonce?', a: 'Ja. Gå til Mine annoncer, åbn annoncen og vælg rediger. Gem ændringerne.' },
      { q: 'Jeg modtager ikke beskeder fra købere. Hvad gør jeg?', a: 'Kontroller e-mail, verificering og beskedområdet. Send en sag med annoncereference, hvis noget mangler.' },
      { q: 'Hvordan rapporterer jeg mistænkelig aktivitet?', a: 'Vælg Sikkerhed i formularen og beskriv, hvad der skete. Tilføj link, annonce-ID eller brugeroplysninger, hvis du har dem.' },
    ],
    guidanceTitle: 'Sådan får du hurtigere hjælp',
    guidanceText: 'Jo mere kontekst vi får fra starten, desto hurtigere kan vi finde næste skridt.',
    guidanceItems: ['Angiv annonce-ID, betalingsreference eller link, hvis sagen gælder en specifik annonce.', 'Beskriv hvad du forsøgte at gøre, og hvilken fejlbesked du så.', 'Send aldrig fulde kortoplysninger. Autorell ser aldrig hele kortnummeret.'],
    statusTitle: 'Hvad sker der efter afsendelse?',
    statusItems: [
      { label: '1. Modtaget', text: 'Din sag sendes til Autorell med marked, emne og reference.' },
      { label: '2. Fordelt', text: 'Vi kobler sagen til det rigtige område: annonce, betaling, konto eller sikkerhed.' },
      { label: '3. Svar', text: 'Du modtager en e-mail med næste skridt eller et opfølgende spørgsmål.' },
    ],
    form: {
      eyebrow: 'Kontakt support',
      title: 'Send en supportsag',
      text: 'Udfyld formularen så tydeligt som muligt. Navn og e-mail er udfyldt, når de findes på kontoen.',
      name: 'Navn',
      email: 'E-mail',
      phone: 'Telefon',
      topic: 'Sagstype',
      topicPlaceholder: 'Vælg område',
      priority: 'Prioritet',
      priorityPlaceholder: 'Vælg prioritet',
      reference: 'Annonce- eller betalingsreference',
      referencePlaceholder: 'Eksempel: annonce-ID, ordrenummer eller link',
      subject: 'Emne',
      subjectPlaceholder: 'Opsummer problemet kort',
      message: 'Beskrivelse',
      messagePlaceholder: 'Fortæl hvad du har brug for hjælp til, hvad du prøvede, og hvad der skete.',
      privacyStart: 'Jeg har læst',
      privacyLink: 'privatlivspolitikken',
      privacyEnd: 'og accepterer, at Autorell behandler mine oplysninger for at håndtere denne sag.',
      submit: 'Send sag',
      sending: 'Sender sag...',
      successTitle: 'Sag sendt',
      successText: 'Vi har modtaget dit spørgsmål og svarer pr. e-mail hurtigst muligt.',
      sendAnother: 'Send en ny sag',
      error: 'Sagen kunne ikke sendes lige nu. Kontroller felterne og prøv igen.',
      footnote: 'Send aldrig fulde kortnumre eller adgangskoder. Betalinger håndteres sikkert af Stripe.',
      topics: ['Annonce', 'Betaling', 'Beskeder', 'Verificering', 'Sikkerhed', 'Teknisk problem', 'Andet'],
      priorities: ['Normal', 'Haster', 'Sikkerhedssag'],
    },
  },
  at: {} as SupportCopy,
  be: {} as SupportCopy,
}

supportCopies.at = supportCopies.de
supportCopies.be = supportCopies.nl
