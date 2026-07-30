import Link from 'next/link'
import {
  BadgeCheck,
  Building2,
  CircleHelp,
  Clock3,
  CreditCard,
  LifeBuoy,
  Mail,
  MessageSquareText,
  Search,
  ShieldAlert,
  Sparkles,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
import ContactForm from './ContactForm'
import { localizePublicHref, translationLocale, type PublicLocale } from '@/lib/public-i18n'

type ContactCopy = {
  eyebrow: string
  title: string
  text: string
  emailLabel: string
  emailText: string
  responseLabel: string
  responseText: string
  urgentLabel: string
  urgentText: string
  routesTitle: string
  routesText: string
  routes: Array<{ title: string; text: string; icon: LucideIcon }>
  checklistTitle: string
  checklistText: string
  checklist: string[]
  faqTitle: string
  faq: Array<{ q: string; a: string }>
  accountCtaTitle: string
  accountCtaText: string
  accountCta: string
}

export function getPublicContactSeoCopy(locale: PublicLocale) {
  const copy = contactCopies[translationLocale(locale)] || contactCopies.en
  return {
    title: copy.seoTitle,
    description: copy.seoDescription,
  }
}

type InternalContactCopy = ContactCopy & {
  seoTitle: string
  seoDescription: string
}

export default function PublicContactPage({
  locale = 'sv',
}: {
  locale?: PublicLocale
}) {
  const source = contactCopies[translationLocale(locale)] || contactCopies.en
  const accountSupportHref = localizePublicHref(locale, '/account/support')

  return (
    <>
      <section className="border-b border-[#dce3ef] bg-[#f6f8fb]">
        <div className="mx-auto grid max-w-[var(--autorell-page-max)] gap-8 px-4 py-12 sm:px-8 sm:py-16 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end lg:py-20">
          <div>
            <div className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#cfe0ff] bg-white px-4 text-xs font-medium uppercase tracking-[0.16em] text-[#0866ff] shadow-[0_10px_28px_rgba(16,24,40,.04)]">
              <LifeBuoy className="h-4 w-4" />
              {source.eyebrow}
            </div>
            <h1 className="mt-5 max-w-4xl text-4xl font-medium leading-[1.03] tracking-[-0.055em] text-[#101828] sm:text-6xl">
              {source.title}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-[#667085] sm:text-lg sm:leading-8">
              {source.text}
            </p>
          </div>

          <aside className="rounded-[24px] border border-[#dce6f4] bg-white p-5 shadow-[0_18px_50px_rgba(16,24,40,.06)] sm:p-6">
            <ContactSignal icon={Clock3} label={source.responseLabel} text={source.responseText} />
            <div className="my-5 h-px bg-[#e4eaf3]" />
            <ContactSignal icon={ShieldAlert} label={source.urgentLabel} text={source.urgentText} />
            <a
              href="mailto:info@autorell.com"
              className="mt-6 flex min-h-14 items-center gap-3 rounded-[16px] bg-[#101828] px-4 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-[#1d2939]"
            >
              <Mail className="h-5 w-5" />
              <span>
                <span className="block text-[10px] uppercase tracking-[0.16em] text-white/60">
                  {source.emailLabel}
                </span>
                {source.emailText}
              </span>
            </a>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-[var(--autorell-page-max)] px-4 py-12 sm:px-8 sm:py-16">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <div className="rounded-[24px] border border-[#dfe7f2] bg-white p-6 shadow-[0_18px_50px_rgba(16,24,40,.05)] sm:p-7">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#0866ff]">
                {source.routesTitle}
              </p>
              <p className="mt-3 text-sm leading-6 text-[#667085]">{source.routesText}</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {source.routes.map(({ title, text, icon: Icon }) => (
                  <article key={title} className="rounded-[18px] border border-[#e1e7f0] bg-[#fbfcff] p-4">
                    <span className="grid h-11 w-11 place-items-center rounded-[14px] bg-[#eef5ff] text-[#0866ff]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h2 className="mt-4 text-base font-medium tracking-[-0.02em] text-[#101828]">{title}</h2>
                    <p className="mt-2 text-sm leading-6 text-[#667085]">{text}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-[#dbe7f6] bg-[#f4f8ff] p-6 sm:p-7">
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[16px] bg-white text-[#0866ff] shadow-[0_10px_26px_rgba(16,24,40,.05)]">
                  <MessageSquareText className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-xl font-medium tracking-[-0.03em] text-[#101828]">{source.checklistTitle}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#667085]">{source.checklistText}</p>
                </div>
              </div>
              <ul className="mt-5 grid gap-3 text-sm leading-6 text-[#475467]">
                {source.checklist.map((item) => (
                  <li key={item} className="flex gap-3 rounded-[16px] bg-white/80 p-3">
                    <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#0866ff]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[24px] border border-[#dfe7f2] bg-white p-6 shadow-[0_18px_50px_rgba(16,24,40,.05)] sm:p-7">
              <h2 className="text-xl font-medium tracking-[-0.03em] text-[#101828]">{source.faqTitle}</h2>
              <div className="mt-5 grid gap-3">
                {source.faq.map((item) => (
                  <details key={item.q} className="group rounded-[18px] border border-[#dfe7f2] bg-[#fbfcff] p-4 open:bg-white">
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-sm font-medium text-[#101828]">
                      <span>{item.q}</span>
                      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#eef5ff] text-[#0866ff] transition group-open:rotate-45">+</span>
                    </summary>
                    <p className="mt-3 text-sm leading-6 text-[#667085]">{item.a}</p>
                  </details>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-[#101828] bg-[#101828] p-6 text-white shadow-[0_18px_50px_rgba(16,24,40,.12)] sm:p-7">
              <Sparkles className="h-5 w-5 text-[#8fc7ff]" />
              <h2 className="mt-4 text-xl font-medium tracking-[-0.03em]">{source.accountCtaTitle}</h2>
              <p className="mt-2 text-sm leading-6 text-white/72">{source.accountCtaText}</p>
              <Link
                href={accountSupportHref}
                className="mt-5 inline-flex min-h-12 items-center rounded-full bg-white px-5 text-sm font-medium text-[#101828] transition hover:-translate-y-0.5 hover:bg-[#eef5ff]"
              >
                {source.accountCta}
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-[24px] border border-[#e1e5ec] bg-white shadow-[0_18px_48px_rgba(16,24,40,.08)]">
            <ContactForm locale={locale} />
          </div>
        </div>
      </section>
    </>
  )
}

function ContactSignal({ icon: Icon, label, text }: { icon: LucideIcon; label: string; text: string }) {
  return (
    <div className="flex items-start gap-4">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-[#edf5ff] text-[#0866ff]">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-sm font-medium text-[#101828]">{label}</p>
        <p className="mt-1 text-sm leading-6 text-[#667085]">{text}</p>
      </div>
    </div>
  )
}

const contactCopies: Record<PublicLocale, InternalContactCopy> = {
  sv: {
    seoTitle: 'Kontakta Autorell | Support för köpare, säljare och företag',
    seoDescription: 'Kontakta Autorell för hjälp med annonser, köp, betalningar, företagslösningar, säkerhet och teknisk support.',
    eyebrow: 'Kontakta Autorell',
    title: 'Rätt kontaktväg för köpare, säljare och företag.',
    text: 'Skicka ditt ärende till Autorell så hamnar det hos rätt team. Kontaktsidan är öppen för alla och hjälper oss att förstå om frågan gäller köp, annons, betalning, företag eller säkerhet.',
    emailLabel: 'E-post',
    emailText: 'info@autorell.com',
    responseLabel: 'Svarstid',
    responseText: 'Vi återkommer så snart vi kan och prioriterar aktiva annons- och säkerhetsärenden.',
    urgentLabel: 'Säkerhet',
    urgentText: 'Misstänkt bedrägeri, identitetsmissbruk eller olämplig kontakt ska beskrivas tydligt i formuläret.',
    routesTitle: 'Välj rätt ärende',
    routesText: 'Använd formuläret för allmänna frågor. Är du inloggad kan du även gå via Mina sidor för kontospecifik support.',
    routes: [
      { title: 'Konto och inloggning', text: 'Registrering, e-postverifiering, profil, lösenord eller radering av konto.', icon: UserRound },
      { title: 'Annonser och betalning', text: 'Publicering, annons-ID, paket, Stripe-betalning, kvitto eller ändringar.', icon: CreditCard },
      { title: 'Köp och sökning', text: 'Hitta fordon, sparade sökningar, meddelanden och kontakt med säljare.', icon: Search },
      { title: 'Företag', text: 'Företagskonto, lager, återkommande annonsering, team och större volymer.', icon: Building2 },
      { title: 'Rapportera problem', text: 'Misstänkta annonser, felaktig data, missbruk eller tekniskt fel.', icon: ShieldAlert },
      { title: 'Allmän fråga', text: 'Press, samarbeten, marknader eller annat som rör Autorell.', icon: CircleHelp },
    ],
    checklistTitle: 'Skicka gärna med detta',
    checklistText: 'Tydliga uppgifter gör att vi kan hjälpa dig snabbare.',
    checklist: ['Annons-ID, länk eller ordernummer om ärendet gäller en specifik annons.', 'Vilket land, konto, företag eller fordon frågan gäller.', 'Vad du försökte göra, vad som hände och vilket felmeddelande du såg.'],
    faqTitle: 'Vanliga kontaktfrågor',
    faq: [
      { q: 'Måste jag vara inloggad för att kontakta Autorell?', a: 'Nej. Den här sidan är publik. För kontospecifika ärenden är det däremot oftast snabbare att vara inloggad.' },
      { q: 'Var hittar jag hjälp för en aktiv annons?', a: 'Logga in och öppna Mina sidor om du kan. Ange alltid annons-ID eller länk i formuläret.' },
      { q: 'Kan jag skicka kortuppgifter i formuläret?', a: 'Nej. Skicka aldrig hela kortnummer eller lösenord. Betalningar hanteras säkert via Stripe.' },
    ],
    accountCtaTitle: 'Inloggad användare?',
    accountCtaText: 'För dina egna annonser, betalningar och kontouppgifter får du bättre hjälp via supportsidan på Mina sidor.',
    accountCta: 'Gå till kontosupport',
  },
  en: {
    seoTitle: 'Contact Autorell | Support for buyers, sellers and businesses',
    seoDescription: 'Contact Autorell for help with listings, buying, payments, business solutions, safety and technical support.',
    eyebrow: 'Contact Autorell',
    title: 'The right contact route for buyers, sellers and businesses.',
    text: 'Send your enquiry to Autorell and it will reach the right team. This public contact page helps us understand whether your question concerns buying, a listing, payment, business or safety.',
    emailLabel: 'Email',
    emailText: 'info@autorell.com',
    responseLabel: 'Response time',
    responseText: 'We reply as soon as we can and prioritize active listing and safety issues.',
    urgentLabel: 'Safety',
    urgentText: 'Suspected fraud, identity misuse or inappropriate contact should be described clearly in the form.',
    routesTitle: 'Choose the right case',
    routesText: 'Use the form for general questions. If you are signed in, you can also use My pages for account-specific support.',
    routes: [
      { title: 'Account and sign-in', text: 'Registration, email verification, profile, password or account deletion.', icon: UserRound },
      { title: 'Listings and payment', text: 'Publishing, listing ID, packages, Stripe payment, receipt or edits.', icon: CreditCard },
      { title: 'Buying and search', text: 'Finding vehicles, saved searches, messages and seller contact.', icon: Search },
      { title: 'Business', text: 'Business accounts, inventory, recurring listings, teams and larger volumes.', icon: Building2 },
      { title: 'Report a problem', text: 'Suspicious listings, incorrect data, abuse or technical issues.', icon: ShieldAlert },
      { title: 'General question', text: 'Press, partnerships, markets or anything else about Autorell.', icon: CircleHelp },
    ],
    checklistTitle: 'Helpful details to include',
    checklistText: 'Clear details help us respond faster.',
    checklist: ['Listing ID, link or order number if the case concerns a specific listing.', 'Which country, account, company or vehicle the question concerns.', 'What you tried to do, what happened and which error message you saw.'],
    faqTitle: 'Common contact questions',
    faq: [
      { q: 'Do I need to be signed in to contact Autorell?', a: 'No. This page is public. For account-specific issues, being signed in is usually faster.' },
      { q: 'Where do I get help for an active listing?', a: 'Sign in and open My pages if you can. Always include the listing ID or link in the form.' },
      { q: 'Can I send card details in the form?', a: 'No. Never send full card numbers or passwords. Payments are handled securely by Stripe.' },
    ],
    accountCtaTitle: 'Signed-in user?',
    accountCtaText: 'For your own listings, payments and account details, you get better help through support in My pages.',
    accountCta: 'Go to account support',
  },
  de: {
    seoTitle: 'Autorell kontaktieren | Support für Käufer, Verkäufer und Unternehmen',
    seoDescription: 'Kontaktieren Sie Autorell bei Fragen zu Anzeigen, Kauf, Zahlungen, Unternehmenslösungen, Sicherheit und technischem Support.',
    eyebrow: 'Autorell kontaktieren',
    title: 'Der richtige Kontaktweg für Käufer, Verkäufer und Unternehmen.',
    text: 'Senden Sie Ihre Anfrage an Autorell, damit sie beim richtigen Team landet. Diese öffentliche Kontaktseite hilft uns zu verstehen, ob es um Kauf, Anzeige, Zahlung, Unternehmen oder Sicherheit geht.',
    emailLabel: 'E-Mail',
    emailText: 'info@autorell.com',
    responseLabel: 'Antwortzeit',
    responseText: 'Wir antworten so schnell wie möglich und priorisieren aktive Anzeigen- und Sicherheitsfälle.',
    urgentLabel: 'Sicherheit',
    urgentText: 'Verdacht auf Betrug, Identitätsmissbrauch oder unangemessene Kontakte bitte klar im Formular beschreiben.',
    routesTitle: 'Passenden Fall wählen',
    routesText: 'Nutzen Sie das Formular für allgemeine Fragen. Angemeldete Nutzer können kontospezifischen Support über Mein Konto nutzen.',
    routes: [
      { title: 'Konto und Anmeldung', text: 'Registrierung, E-Mail-Verifizierung, Profil, Passwort oder Kontolöschung.', icon: UserRound },
      { title: 'Anzeigen und Zahlung', text: 'Veröffentlichung, Anzeigen-ID, Pakete, Stripe-Zahlung, Beleg oder Änderungen.', icon: CreditCard },
      { title: 'Kauf und Suche', text: 'Fahrzeuge finden, gespeicherte Suchen, Nachrichten und Verkäuferkontakt.', icon: Search },
      { title: 'Unternehmen', text: 'Unternehmenskonto, Bestand, wiederkehrende Anzeigen, Teams und größere Volumen.', icon: Building2 },
      { title: 'Problem melden', text: 'Verdächtige Anzeigen, falsche Daten, Missbrauch oder technische Fehler.', icon: ShieldAlert },
      { title: 'Allgemeine Frage', text: 'Presse, Partnerschaften, Märkte oder andere Fragen zu Autorell.', icon: CircleHelp },
    ],
    checklistTitle: 'Diese Angaben helfen uns',
    checklistText: 'Klare Angaben helfen uns, schneller zu antworten.',
    checklist: ['Anzeigen-ID, Link oder Bestellnummer, wenn es um eine bestimmte Anzeige geht.', 'Land, Konto, Unternehmen oder Fahrzeug, auf das sich die Frage bezieht.', 'Was Sie versucht haben, was passiert ist und welche Fehlermeldung angezeigt wurde.'],
    faqTitle: 'Häufige Kontaktfragen',
    faq: [
      { q: 'Muss ich angemeldet sein, um Autorell zu kontaktieren?', a: 'Nein. Diese Seite ist öffentlich. Bei kontospezifischen Fällen ist es meist schneller, angemeldet zu sein.' },
      { q: 'Wo erhalte ich Hilfe zu einer aktiven Anzeige?', a: 'Melden Sie sich an und öffnen Sie Mein Konto, wenn möglich. Geben Sie immer Anzeigen-ID oder Link an.' },
      { q: 'Kann ich Kartendaten im Formular senden?', a: 'Nein. Senden Sie niemals vollständige Kartennummern oder Passwörter. Zahlungen laufen sicher über Stripe.' },
    ],
    accountCtaTitle: 'Angemeldeter Nutzer?',
    accountCtaText: 'Für eigene Anzeigen, Zahlungen und Kontodaten erhalten Sie bessere Hilfe über den Support in Mein Konto.',
    accountCta: 'Zum Kontosupport',
  },
  fr: {
    seoTitle: 'Contacter Autorell | Support acheteurs, vendeurs et entreprises',
    seoDescription: 'Contactez Autorell pour les annonces, achats, paiements, solutions entreprises, sécurité et support technique.',
    eyebrow: 'Contacter Autorell',
    title: 'Le bon contact pour les acheteurs, vendeurs et entreprises.',
    text: 'Envoyez votre demande à Autorell afin qu’elle arrive à la bonne équipe. Cette page publique nous aide à comprendre si votre question concerne un achat, une annonce, un paiement, une entreprise ou la sécurité.',
    emailLabel: 'E-mail',
    emailText: 'info@autorell.com',
    responseLabel: 'Délai de réponse',
    responseText: 'Nous répondons dès que possible et priorisons les annonces actives et les cas de sécurité.',
    urgentLabel: 'Sécurité',
    urgentText: 'Fraude suspectée, usurpation d’identité ou contact inapproprié doivent être décrits clairement dans le formulaire.',
    routesTitle: 'Choisir le bon sujet',
    routesText: 'Utilisez le formulaire pour les questions générales. Si vous êtes connecté, utilisez aussi Mes pages pour le support lié au compte.',
    routes: [
      { title: 'Compte et connexion', text: 'Inscription, vérification e-mail, profil, mot de passe ou suppression de compte.', icon: UserRound },
      { title: 'Annonces et paiement', text: 'Publication, ID d’annonce, forfaits, paiement Stripe, reçu ou modifications.', icon: CreditCard },
      { title: 'Achat et recherche', text: 'Trouver des véhicules, recherches enregistrées, messages et contact vendeur.', icon: Search },
      { title: 'Entreprise', text: 'Comptes professionnels, stock, annonces récurrentes, équipes et volumes.', icon: Building2 },
      { title: 'Signaler un problème', text: 'Annonces suspectes, données incorrectes, abus ou problèmes techniques.', icon: ShieldAlert },
      { title: 'Question générale', text: 'Presse, partenariats, marchés ou autre sujet sur Autorell.', icon: CircleHelp },
    ],
    checklistTitle: 'Informations utiles à inclure',
    checklistText: 'Des informations claires nous aident à répondre plus vite.',
    checklist: ['ID d’annonce, lien ou numéro de commande si le cas concerne une annonce.', 'Pays, compte, entreprise ou véhicule concerné.', 'Ce que vous avez essayé, ce qui s’est passé et le message d’erreur affiché.'],
    faqTitle: 'Questions fréquentes de contact',
    faq: [
      { q: 'Dois-je être connecté pour contacter Autorell ?', a: 'Non. Cette page est publique. Pour les questions de compte, être connecté est souvent plus rapide.' },
      { q: 'Où obtenir de l’aide pour une annonce active ?', a: 'Connectez-vous et ouvrez Mes pages si possible. Ajoutez toujours l’ID ou le lien de l’annonce.' },
      { q: 'Puis-je envoyer des données de carte dans le formulaire ?', a: 'Non. N’envoyez jamais de numéro de carte complet ni de mot de passe. Les paiements sont sécurisés par Stripe.' },
    ],
    accountCtaTitle: 'Utilisateur connecté ?',
    accountCtaText: 'Pour vos annonces, paiements et données de compte, utilisez le support dans Mes pages.',
    accountCta: 'Aller au support du compte',
  },
  es: {
    seoTitle: 'Contactar con Autorell | Soporte para compradores, vendedores y empresas',
    seoDescription: 'Contacta con Autorell para anuncios, compras, pagos, soluciones para empresas, seguridad y soporte técnico.',
    eyebrow: 'Contactar con Autorell',
    title: 'El contacto adecuado para compradores, vendedores y empresas.',
    text: 'Envía tu consulta a Autorell para que llegue al equipo correcto. Esta página pública nos ayuda a entender si la pregunta trata de compra, anuncio, pago, empresa o seguridad.',
    emailLabel: 'E-mail',
    emailText: 'info@autorell.com',
    responseLabel: 'Tiempo de respuesta',
    responseText: 'Respondemos lo antes posible y priorizamos anuncios activos y casos de seguridad.',
    urgentLabel: 'Seguridad',
    urgentText: 'Sospecha de fraude, suplantación o contacto inapropiado debe describirse claramente en el formulario.',
    routesTitle: 'Elige el caso correcto',
    routesText: 'Usa el formulario para preguntas generales. Si has iniciado sesión, también puedes usar Mis páginas para soporte de cuenta.',
    routes: [
      { title: 'Cuenta e inicio de sesión', text: 'Registro, verificación de e-mail, perfil, contraseña o eliminación de cuenta.', icon: UserRound },
      { title: 'Anuncios y pago', text: 'Publicación, ID de anuncio, paquetes, pago con Stripe, recibo o cambios.', icon: CreditCard },
      { title: 'Compra y búsqueda', text: 'Encontrar vehículos, búsquedas guardadas, mensajes y contacto con vendedores.', icon: Search },
      { title: 'Empresa', text: 'Cuentas de empresa, inventario, anuncios recurrentes, equipos y volúmenes.', icon: Building2 },
      { title: 'Informar un problema', text: 'Anuncios sospechosos, datos incorrectos, abuso o fallos técnicos.', icon: ShieldAlert },
      { title: 'Pregunta general', text: 'Prensa, colaboraciones, mercados u otro tema sobre Autorell.', icon: CircleHelp },
    ],
    checklistTitle: 'Detalles útiles para incluir',
    checklistText: 'Los datos claros nos ayudan a responder más rápido.',
    checklist: ['ID del anuncio, enlace o número de pedido si trata de un anuncio concreto.', 'País, cuenta, empresa o vehículo relacionado con la pregunta.', 'Qué intentaste hacer, qué ocurrió y qué mensaje de error viste.'],
    faqTitle: 'Preguntas frecuentes de contacto',
    faq: [
      { q: '¿Tengo que iniciar sesión para contactar con Autorell?', a: 'No. Esta página es pública. Para asuntos de cuenta, iniciar sesión suele ser más rápido.' },
      { q: '¿Dónde recibo ayuda para un anuncio activo?', a: 'Inicia sesión y abre Mis páginas si puedes. Incluye siempre el ID o enlace del anuncio.' },
      { q: '¿Puedo enviar datos de tarjeta en el formulario?', a: 'No. Nunca envíes números completos de tarjeta ni contraseñas. Los pagos se gestionan con Stripe.' },
    ],
    accountCtaTitle: '¿Usuario conectado?',
    accountCtaText: 'Para tus anuncios, pagos y datos de cuenta, obtendrás mejor ayuda desde el soporte de Mis páginas.',
    accountCta: 'Ir al soporte de cuenta',
  },
  it: {
    seoTitle: 'Contatta Autorell | Supporto per acquirenti, venditori e aziende',
    seoDescription: 'Contatta Autorell per annunci, acquisti, pagamenti, soluzioni aziendali, sicurezza e supporto tecnico.',
    eyebrow: 'Contatta Autorell',
    title: 'Il contatto giusto per acquirenti, venditori e aziende.',
    text: 'Invia la tua richiesta ad Autorell e arriverà al team corretto. Questa pagina pubblica ci aiuta a capire se la domanda riguarda acquisto, annuncio, pagamento, azienda o sicurezza.',
    emailLabel: 'E-mail',
    emailText: 'info@autorell.com',
    responseLabel: 'Tempo di risposta',
    responseText: 'Rispondiamo appena possibile e diamo priorità agli annunci attivi e ai casi di sicurezza.',
    urgentLabel: 'Sicurezza',
    urgentText: 'Sospetta frode, abuso d’identità o contatti inappropriati vanno descritti chiaramente nel modulo.',
    routesTitle: 'Scegli il caso corretto',
    routesText: 'Usa il modulo per domande generali. Se hai effettuato l’accesso, puoi usare Le mie pagine per supporto sul conto.',
    routes: [
      { title: 'Account e accesso', text: 'Registrazione, verifica e-mail, profilo, password o eliminazione account.', icon: UserRound },
      { title: 'Annunci e pagamento', text: 'Pubblicazione, ID annuncio, pacchetti, pagamento Stripe, ricevuta o modifiche.', icon: CreditCard },
      { title: 'Acquisto e ricerca', text: 'Trovare veicoli, ricerche salvate, messaggi e contatto venditore.', icon: Search },
      { title: 'Azienda', text: 'Account aziendali, stock, annunci ricorrenti, team e volumi maggiori.', icon: Building2 },
      { title: 'Segnala un problema', text: 'Annunci sospetti, dati errati, abusi o problemi tecnici.', icon: ShieldAlert },
      { title: 'Domanda generale', text: 'Stampa, partnership, mercati o altro su Autorell.', icon: CircleHelp },
    ],
    checklistTitle: 'Dettagli utili da includere',
    checklistText: 'Informazioni chiare ci aiutano a rispondere più rapidamente.',
    checklist: ['ID annuncio, link o numero ordine se riguarda un annuncio specifico.', 'Paese, account, azienda o veicolo interessato.', 'Cosa hai provato a fare, cosa è successo e quale errore hai visto.'],
    faqTitle: 'Domande frequenti sui contatti',
    faq: [
      { q: 'Devo essere registrato per contattare Autorell?', a: 'No. Questa pagina è pubblica. Per problemi dell’account, l’accesso è di solito più rapido.' },
      { q: 'Dove ricevo aiuto per un annuncio attivo?', a: 'Accedi e apri Le mie pagine se puoi. Includi sempre ID o link dell’annuncio.' },
      { q: 'Posso inviare dati della carta nel modulo?', a: 'No. Non inviare mai numeri completi di carta o password. I pagamenti sono gestiti da Stripe.' },
    ],
    accountCtaTitle: 'Utente connesso?',
    accountCtaText: 'Per annunci, pagamenti e dati account, ricevi supporto migliore tramite Le mie pagine.',
    accountCta: 'Vai al supporto account',
  },
  pl: {
    seoTitle: 'Kontakt z Autorell | Wsparcie dla kupujących, sprzedających i firm',
    seoDescription: 'Skontaktuj się z Autorell w sprawie ogłoszeń, zakupów, płatności, rozwiązań firmowych, bezpieczeństwa i pomocy technicznej.',
    eyebrow: 'Kontakt z Autorell',
    title: 'Właściwa droga kontaktu dla kupujących, sprzedających i firm.',
    text: 'Wyślij zapytanie do Autorell, aby trafiło do właściwego zespołu. Ta publiczna strona pomaga nam ustalić, czy sprawa dotyczy zakupu, ogłoszenia, płatności, firmy czy bezpieczeństwa.',
    emailLabel: 'E-mail',
    emailText: 'info@autorell.com',
    responseLabel: 'Czas odpowiedzi',
    responseText: 'Odpowiadamy tak szybko, jak to możliwe, priorytetowo traktując aktywne ogłoszenia i bezpieczeństwo.',
    urgentLabel: 'Bezpieczeństwo',
    urgentText: 'Podejrzenie oszustwa, nadużycie tożsamości lub niewłaściwy kontakt opisz jasno w formularzu.',
    routesTitle: 'Wybierz odpowiednią sprawę',
    routesText: 'Użyj formularza do pytań ogólnych. Po zalogowaniu możesz też skorzystać z Moich stron dla spraw konta.',
    routes: [
      { title: 'Konto i logowanie', text: 'Rejestracja, weryfikacja e-mail, profil, hasło lub usunięcie konta.', icon: UserRound },
      { title: 'Ogłoszenia i płatność', text: 'Publikacja, ID ogłoszenia, pakiety, płatność Stripe, paragon lub zmiany.', icon: CreditCard },
      { title: 'Zakup i wyszukiwanie', text: 'Wyszukiwanie pojazdów, zapisane wyszukiwania, wiadomości i kontakt ze sprzedawcą.', icon: Search },
      { title: 'Firma', text: 'Konta firmowe, stany magazynowe, ogłoszenia cykliczne, zespoły i większe wolumeny.', icon: Building2 },
      { title: 'Zgłoś problem', text: 'Podejrzane ogłoszenia, błędne dane, nadużycia lub problemy techniczne.', icon: ShieldAlert },
      { title: 'Pytanie ogólne', text: 'Prasa, współprace, rynki lub inne tematy dotyczące Autorell.', icon: CircleHelp },
    ],
    checklistTitle: 'Przydatne dane do podania',
    checklistText: 'Jasne informacje pomagają nam szybciej odpowiedzieć.',
    checklist: ['ID ogłoszenia, link lub numer zamówienia, jeśli sprawa dotyczy konkretnego ogłoszenia.', 'Kraj, konto, firma lub pojazd, którego dotyczy pytanie.', 'Co próbowałeś zrobić, co się stało i jaki komunikat błędu widziałeś.'],
    faqTitle: 'Najczęstsze pytania kontaktowe',
    faq: [
      { q: 'Czy muszę być zalogowany, aby skontaktować się z Autorell?', a: 'Nie. Ta strona jest publiczna. W sprawach konta zalogowanie zwykle przyspiesza obsługę.' },
      { q: 'Gdzie uzyskać pomoc dla aktywnego ogłoszenia?', a: 'Zaloguj się i otwórz Moje strony, jeśli możesz. Zawsze dodaj ID lub link ogłoszenia.' },
      { q: 'Czy mogę wysłać dane karty w formularzu?', a: 'Nie. Nigdy nie wysyłaj pełnych numerów kart ani haseł. Płatności obsługuje bezpiecznie Stripe.' },
    ],
    accountCtaTitle: 'Zalogowany użytkownik?',
    accountCtaText: 'Dla własnych ogłoszeń, płatności i danych konta najlepiej skorzystać ze wsparcia w Moich stronach.',
    accountCta: 'Przejdź do wsparcia konta',
  },
  nl: {
    seoTitle: 'Contact met Autorell | Support voor kopers, verkopers en bedrijven',
    seoDescription: 'Neem contact op met Autorell voor advertenties, kopen, betalingen, bedrijfsoplossingen, veiligheid en technische support.',
    eyebrow: 'Contact met Autorell',
    title: 'De juiste contactroute voor kopers, verkopers en bedrijven.',
    text: 'Stuur je vraag naar Autorell zodat deze bij het juiste team terechtkomt. Deze openbare contactpagina helpt ons te bepalen of het gaat om kopen, een advertentie, betaling, bedrijf of veiligheid.',
    emailLabel: 'E-mail',
    emailText: 'info@autorell.com',
    responseLabel: 'Reactietijd',
    responseText: 'We reageren zo snel mogelijk en geven prioriteit aan actieve advertenties en veiligheidszaken.',
    urgentLabel: 'Veiligheid',
    urgentText: 'Vermoeden van fraude, identiteitsmisbruik of ongepast contact moet duidelijk in het formulier worden beschreven.',
    routesTitle: 'Kies de juiste zaak',
    routesText: 'Gebruik het formulier voor algemene vragen. Ben je ingelogd, gebruik dan Mijn pagina’s voor accountsupport.',
    routes: [
      { title: 'Account en inloggen', text: 'Registratie, e-mailverificatie, profiel, wachtwoord of account verwijderen.', icon: UserRound },
      { title: 'Advertenties en betaling', text: 'Publicatie, advertentie-ID, pakketten, Stripe-betaling, bon of wijzigingen.', icon: CreditCard },
      { title: 'Kopen en zoeken', text: 'Voertuigen vinden, opgeslagen zoekopdrachten, berichten en verkopercontact.', icon: Search },
      { title: 'Bedrijf', text: 'Bedrijfsaccounts, voorraad, terugkerende advertenties, teams en grotere volumes.', icon: Building2 },
      { title: 'Probleem melden', text: 'Verdachte advertenties, onjuiste data, misbruik of technische problemen.', icon: ShieldAlert },
      { title: 'Algemene vraag', text: 'Pers, samenwerkingen, markten of iets anders over Autorell.', icon: CircleHelp },
    ],
    checklistTitle: 'Handige gegevens om mee te sturen',
    checklistText: 'Duidelijke gegevens helpen ons sneller antwoorden.',
    checklist: ['Advertentie-ID, link of ordernummer als het om een specifieke advertentie gaat.', 'Land, account, bedrijf of voertuig waar de vraag over gaat.', 'Wat je probeerde te doen, wat er gebeurde en welke foutmelding je zag.'],
    faqTitle: 'Veelgestelde contactvragen',
    faq: [
      { q: 'Moet ik ingelogd zijn om Autorell te contacteren?', a: 'Nee. Deze pagina is openbaar. Voor accountspecifieke zaken is inloggen meestal sneller.' },
      { q: 'Waar krijg ik hulp voor een actieve advertentie?', a: 'Log in en open Mijn pagina’s als dat kan. Voeg altijd de advertentie-ID of link toe.' },
      { q: 'Kan ik kaartgegevens via het formulier sturen?', a: 'Nee. Stuur nooit volledige kaartnummers of wachtwoorden. Betalingen lopen veilig via Stripe.' },
    ],
    accountCtaTitle: 'Ingelogde gebruiker?',
    accountCtaText: 'Voor je eigen advertenties, betalingen en accountgegevens krijg je betere hulp via support in Mijn pagina’s.',
    accountCta: 'Naar accountsupport',
  },
  fi: {
    seoTitle: 'Ota yhteyttä Autorelliin | Tuki ostajille, myyjille ja yrityksille',
    seoDescription: 'Ota yhteyttä Autorelliin ilmoituksista, ostamisesta, maksuista, yritysratkaisuista, turvallisuudesta ja teknisestä tuesta.',
    eyebrow: 'Ota yhteyttä Autorelliin',
    title: 'Oikea yhteydenottotapa ostajille, myyjille ja yrityksille.',
    text: 'Lähetä kysymyksesi Autorellille, jotta se päätyy oikealle tiimille. Tämä julkinen yhteyssivu auttaa meitä ymmärtämään, koskeeko asia ostamista, ilmoitusta, maksua, yritystä vai turvallisuutta.',
    emailLabel: 'Sähköposti',
    emailText: 'info@autorell.com',
    responseLabel: 'Vastausaika',
    responseText: 'Vastaamme mahdollisimman pian ja priorisoimme aktiiviset ilmoitukset sekä turvallisuusasiat.',
    urgentLabel: 'Turvallisuus',
    urgentText: 'Epäilty petos, identiteetin väärinkäyttö tai asiaton yhteydenotto tulee kuvata selkeästi lomakkeessa.',
    routesTitle: 'Valitse oikea asia',
    routesText: 'Käytä lomaketta yleisiin kysymyksiin. Kirjautuneena voit käyttää Omat sivut -tukea tilikohtaisiin asioihin.',
    routes: [
      { title: 'Tili ja kirjautuminen', text: 'Rekisteröinti, sähköpostivahvistus, profiili, salasana tai tilin poisto.', icon: UserRound },
      { title: 'Ilmoitukset ja maksu', text: 'Julkaisu, ilmoitus-ID, paketit, Stripe-maksu, kuitti tai muutokset.', icon: CreditCard },
      { title: 'Osto ja haku', text: 'Ajoneuvojen haku, tallennetut haut, viestit ja yhteys myyjään.', icon: Search },
      { title: 'Yritys', text: 'Yritystilit, varasto, toistuvat ilmoitukset, tiimit ja suuremmat volyymit.', icon: Building2 },
      { title: 'Ilmoita ongelmasta', text: 'Epäilyttävät ilmoitukset, väärät tiedot, väärinkäyttö tai tekniset ongelmat.', icon: ShieldAlert },
      { title: 'Yleinen kysymys', text: 'Lehdistö, yhteistyöt, markkinat tai muu Autorelliin liittyvä asia.', icon: CircleHelp },
    ],
    checklistTitle: 'Hyödylliset tiedot mukaan',
    checklistText: 'Selkeät tiedot auttavat meitä vastaamaan nopeammin.',
    checklist: ['Ilmoitus-ID, linkki tai tilausnumero, jos asia koskee tiettyä ilmoitusta.', 'Maa, tili, yritys tai ajoneuvo, jota kysymys koskee.', 'Mitä yritit tehdä, mitä tapahtui ja minkä virheilmoituksen näit.'],
    faqTitle: 'Yleiset yhteydenottokysymykset',
    faq: [
      { q: 'Pitääkö minun olla kirjautunut ottaakseni yhteyttä Autorelliin?', a: 'Ei. Tämä sivu on julkinen. Tilikohtaisissa asioissa kirjautuminen on yleensä nopeampaa.' },
      { q: 'Mistä saan apua aktiiviseen ilmoitukseen?', a: 'Kirjaudu sisään ja avaa Omat sivut, jos voit. Lisää aina ilmoitus-ID tai linkki.' },
      { q: 'Voinko lähettää korttitietoja lomakkeella?', a: 'Ei. Älä koskaan lähetä koko korttinumeroa tai salasanoja. Maksut käsittelee turvallisesti Stripe.' },
    ],
    accountCtaTitle: 'Kirjautunut käyttäjä?',
    accountCtaText: 'Omille ilmoituksille, maksuille ja tilitiedoille saat paremman avun Omat sivut -tuesta.',
    accountCta: 'Siirry tilitukeen',
  },
  da: {
    seoTitle: 'Kontakt Autorell | Support til købere, sælgere og virksomheder',
    seoDescription: 'Kontakt Autorell for hjælp med annoncer, køb, betalinger, virksomhedsløsninger, sikkerhed og teknisk support.',
    eyebrow: 'Kontakt Autorell',
    title: 'Den rigtige kontaktvej for købere, sælgere og virksomheder.',
    text: 'Send din henvendelse til Autorell, så den når det rigtige team. Denne offentlige kontaktside hjælper os med at forstå, om spørgsmålet handler om køb, annonce, betaling, virksomhed eller sikkerhed.',
    emailLabel: 'E-mail',
    emailText: 'info@autorell.com',
    responseLabel: 'Svartid',
    responseText: 'Vi svarer hurtigst muligt og prioriterer aktive annonce- og sikkerhedssager.',
    urgentLabel: 'Sikkerhed',
    urgentText: 'Mistanke om svindel, identitetsmisbrug eller upassende kontakt skal beskrives tydeligt i formularen.',
    routesTitle: 'Vælg den rigtige sag',
    routesText: 'Brug formularen til generelle spørgsmål. Er du logget ind, kan du også bruge Mine sider til kontospecifik support.',
    routes: [
      { title: 'Konto og login', text: 'Registrering, e-mailbekræftelse, profil, adgangskode eller kontosletning.', icon: UserRound },
      { title: 'Annoncer og betaling', text: 'Publicering, annonce-ID, pakker, Stripe-betaling, kvittering eller ændringer.', icon: CreditCard },
      { title: 'Køb og søgning', text: 'Find køretøjer, gemte søgninger, beskeder og kontakt med sælger.', icon: Search },
      { title: 'Virksomhed', text: 'Virksomhedskonti, lager, gentagne annoncer, teams og større volumener.', icon: Building2 },
      { title: 'Rapportér problem', text: 'Mistænkelige annoncer, forkerte data, misbrug eller tekniske problemer.', icon: ShieldAlert },
      { title: 'Generelt spørgsmål', text: 'Presse, samarbejde, markeder eller andet om Autorell.', icon: CircleHelp },
    ],
    checklistTitle: 'Nyttige oplysninger at sende med',
    checklistText: 'Tydelige oplysninger hjælper os med at svare hurtigere.',
    checklist: ['Annonce-ID, link eller ordrenummer, hvis sagen gælder en bestemt annonce.', 'Land, konto, virksomhed eller køretøj spørgsmålet handler om.', 'Hvad du forsøgte at gøre, hvad der skete, og hvilken fejlbesked du så.'],
    faqTitle: 'Ofte stillede kontaktspørgsmål',
    faq: [
      { q: 'Skal jeg være logget ind for at kontakte Autorell?', a: 'Nej. Denne side er offentlig. For kontospecifikke sager er det normalt hurtigere at være logget ind.' },
      { q: 'Hvor får jeg hjælp til en aktiv annonce?', a: 'Log ind og åbn Mine sider, hvis du kan. Tilføj altid annonce-ID eller link.' },
      { q: 'Kan jeg sende kortoplysninger i formularen?', a: 'Nej. Send aldrig fulde kortnumre eller adgangskoder. Betalinger håndteres sikkert af Stripe.' },
    ],
    accountCtaTitle: 'Logget ind?',
    accountCtaText: 'For dine egne annoncer, betalinger og kontodata får du bedre hjælp via support i Mine sider.',
    accountCta: 'Gå til kontosupport',
  },
  at: {} as InternalContactCopy,
  be: {} as InternalContactCopy,
}

contactCopies.at = contactCopies.de
contactCopies.be = contactCopies.nl
