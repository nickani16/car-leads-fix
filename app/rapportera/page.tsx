import Link from 'next/link'
import { headers } from 'next/headers'
import { ShieldAlert } from 'lucide-react'
import PublicHeader from '@/app/components/PublicHeader'
import PublicFooter from '@/app/components/PublicFooter'
import ReportForm from './ReportForm'
import {
  isPublicLanguage,
  localizePublicHref,
  type PublicLocale,
} from '@/lib/public-i18n'
import { currencyForLocale } from '@/lib/market-locale'

type ReportPageCopy = {
  title: string
  intro: string
  riskTitle: string
  riskText: string
  helpTitle: string
  helpText: string
  helpLink: string
}

const reportPageCopy: Record<PublicLocale, ReportPageCopy> = {
  sv: {
    title: 'Rapportera bedrägeri eller ett säkerhetsproblem.',
    intro:
      'Logga in och rapportera en annons, konversation, betalningsförfrågan eller misstänkt identitetsmissbruk. Skicka aldrig pengar utanför det flöde som visas i ditt Autorell-konto.',
    riskTitle: 'Omedelbar risk eller pågående brott?',
    riskText:
      'Kontakta lokalt nödnummer, polis eller ansvarig myndighet först. En rapport till Autorell ersätter inte polisanmälan, bankärende, försäkringsärende eller myndighetsanmälan.',
    helpTitle: 'Vad Autorell kan hjälpa till med',
    helpText:
      'Vi kan bevara annons-, konto-, meddelande- och betalningsreferenser, granska misstänkt aktivitet, begränsa konton och lämna relevant plattformsinformation vid en laglig utredning.',
    helpLink: 'Öppna hjälpcenter',
  },
  en: {
    title: 'Report fraud or a safety issue.',
    intro:
      'Sign in and report a listing, conversation, payment request or suspected identity misuse. Never send money outside the flow shown in your Autorell account.',
    riskTitle: 'Immediate risk or an ongoing crime?',
    riskText:
      'Call your local emergency number, local police or relevant authorities first. An Autorell report does not replace a police report, bank dispute, insurance claim or authority notification.',
    helpTitle: 'What Autorell can help with',
    helpText:
      'We can preserve listing, account, message and payment-reference data, review suspicious activity, restrict accounts and provide relevant platform information for a lawful investigation.',
    helpLink: 'Open help center',
  },
  de: {
    title: 'Betrug oder ein Sicherheitsproblem melden.',
    intro:
      'Melden Sie eine Anzeige, Unterhaltung, Zahlungsaufforderung oder einen vermuteten Identitätsmissbrauch. Senden Sie niemals Geld außerhalb des Ablaufs in Ihrem Autorell-Konto.',
    riskTitle: 'Akute Gefahr oder laufende Straftat?',
    riskText:
      'Kontaktieren Sie zuerst den lokalen Notruf, die Polizei oder zuständige Behörden. Eine Meldung an Autorell ersetzt keine Anzeige, Bankreklamation, Versicherungsmeldung oder Behördenmeldung.',
    helpTitle: 'Wobei Autorell helfen kann',
    helpText:
      'Wir können Anzeigen-, Konto-, Nachrichten- und Zahlungsdaten sichern, verdächtige Aktivitäten prüfen, Konten einschränken und relevante Plattforminformationen für rechtmäßige Ermittlungen bereitstellen.',
    helpLink: 'Hilfe-Center öffnen',
  },
  at: {
    title: 'Betrug oder ein Sicherheitsproblem melden.',
    intro:
      'Melden Sie eine Anzeige, Unterhaltung, Zahlungsaufforderung oder einen vermuteten Identitätsmissbrauch. Senden Sie niemals Geld außerhalb des Ablaufs in Ihrem Autorell-Konto.',
    riskTitle: 'Akute Gefahr oder laufende Straftat?',
    riskText:
      'Kontaktieren Sie zuerst den lokalen Notruf, die Polizei oder zuständige Behörden. Eine Meldung an Autorell ersetzt keine Anzeige, Bankreklamation, Versicherungsmeldung oder Behördenmeldung.',
    helpTitle: 'Wobei Autorell helfen kann',
    helpText:
      'Wir können Anzeigen-, Konto-, Nachrichten- und Zahlungsdaten sichern, verdächtige Aktivitäten prüfen, Konten einschränken und relevante Plattforminformationen für rechtmäßige Ermittlungen bereitstellen.',
    helpLink: 'Hilfe-Center öffnen',
  },
  be: {
    title: 'Fraude of een veiligheidsprobleem melden.',
    intro:
      'Meld een advertentie, gesprek, betaalverzoek of vermoedelijk identiteitsmisbruik. Stuur nooit geld buiten de flow die in uw Autorell-account wordt getoond.',
    riskTitle: 'Direct risico of een lopend misdrijf?',
    riskText:
      'Bel eerst het lokale noodnummer, de politie of de bevoegde autoriteiten. Een Autorell-melding vervangt geen politieaangifte, bankgeschil, verzekeringsclaim of melding bij de overheid.',
    helpTitle: 'Waar Autorell mee kan helpen',
    helpText:
      'We kunnen advertentie-, account-, bericht- en betalingsgegevens bewaren, verdachte activiteit beoordelen, accounts beperken en relevante platforminformatie verstrekken voor een wettig onderzoek.',
    helpLink: 'Helpcentrum openen',
  },
  fr: {
    title: 'Signaler une fraude ou un problème de sécurité.',
    intro:
      'Signalez une annonce, une conversation, une demande de paiement ou une suspicion d’usurpation d’identité. N’envoyez jamais d’argent en dehors du processus affiché dans votre compte Autorell.',
    riskTitle: 'Risque immédiat ou infraction en cours ?',
    riskText:
      'Contactez d’abord le numéro d’urgence local, la police ou les autorités compétentes. Un signalement Autorell ne remplace pas une plainte, un litige bancaire, une déclaration d’assurance ou une notification aux autorités.',
    helpTitle: 'Ce qu’Autorell peut faire',
    helpText:
      'Nous pouvons conserver les données d’annonce, de compte, de messages et de paiement, examiner les activités suspectes, restreindre des comptes et fournir les informations pertinentes de la plateforme dans le cadre d’une enquête légale.',
    helpLink: 'Ouvrir le centre d’aide',
  },
  es: {
    title: 'Informar de fraude o de un problema de seguridad.',
    intro:
      'Inicia sesión e informa de un anuncio, conversación, solicitud de pago o posible uso indebido de identidad. Nunca envíes dinero fuera del flujo mostrado en tu cuenta de Autorell.',
    riskTitle: '¿Riesgo inmediato o delito en curso?',
    riskText:
      'Contacta primero con el número de emergencias local, la policía o las autoridades competentes. Un informe a Autorell no sustituye una denuncia policial, reclamación bancaria, parte de seguro o notificación oficial.',
    helpTitle: 'Cómo puede ayudar Autorell',
    helpText:
      'Podemos conservar datos de anuncios, cuentas, mensajes y referencias de pago, revisar actividad sospechosa, restringir cuentas y aportar información relevante de la plataforma para una investigación legal.',
    helpLink: 'Abrir centro de ayuda',
  },
  it: {
    title: 'Segnala una frode o un problema di sicurezza.',
    intro:
      'Accedi e segnala un annuncio, una conversazione, una richiesta di pagamento o un sospetto uso improprio dell’identità. Non inviare mai denaro fuori dal flusso mostrato nel tuo account Autorell.',
    riskTitle: 'Rischio immediato o reato in corso?',
    riskText:
      'Contatta prima il numero di emergenza locale, la polizia o le autorità competenti. Una segnalazione ad Autorell non sostituisce una denuncia, una contestazione bancaria, una richiesta assicurativa o una comunicazione alle autorità.',
    helpTitle: 'Come può aiutare Autorell',
    helpText:
      'Possiamo conservare dati di annuncio, account, messaggi e riferimenti di pagamento, verificare attività sospette, limitare account e fornire informazioni rilevanti della piattaforma per un’indagine legale.',
    helpLink: 'Apri centro assistenza',
  },
  pl: {
    title: 'Zgłoś oszustwo lub problem z bezpieczeństwem.',
    intro:
      'Zaloguj się i zgłoś ogłoszenie, rozmowę, żądanie płatności albo podejrzenie nadużycia tożsamości. Nigdy nie wysyłaj pieniędzy poza procesem widocznym na koncie Autorell.',
    riskTitle: 'Natychmiastowe ryzyko lub trwające przestępstwo?',
    riskText:
      'Najpierw skontaktuj się z lokalnym numerem alarmowym, policją lub właściwymi organami. Zgłoszenie do Autorell nie zastępuje zawiadomienia policji, reklamacji bankowej, zgłoszenia ubezpieczeniowego ani powiadomienia organów.',
    helpTitle: 'W czym może pomóc Autorell',
    helpText:
      'Możemy zabezpieczyć dane ogłoszenia, konta, wiadomości i referencji płatności, sprawdzić podejrzaną aktywność, ograniczyć konta i przekazać odpowiednie informacje platformy w legalnym postępowaniu.',
    helpLink: 'Otwórz centrum pomocy',
  },
  nl: {
    title: 'Fraude of een veiligheidsprobleem melden.',
    intro:
      'Meld een advertentie, gesprek, betaalverzoek of vermoedelijk identiteitsmisbruik. Stuur nooit geld buiten de flow die in uw Autorell-account wordt getoond.',
    riskTitle: 'Direct risico of een lopend misdrijf?',
    riskText:
      'Bel eerst het lokale noodnummer, de politie of de bevoegde autoriteiten. Een Autorell-melding vervangt geen politieaangifte, bankgeschil, verzekeringsclaim of melding bij de overheid.',
    helpTitle: 'Waar Autorell mee kan helpen',
    helpText:
      'We kunnen advertentie-, account-, bericht- en betalingsgegevens bewaren, verdachte activiteit beoordelen, accounts beperken en relevante platforminformatie verstrekken voor een wettig onderzoek.',
    helpLink: 'Helpcentrum openen',
  },
  fi: {
    title: 'Ilmoita petoksesta tai turvallisuusongelmasta.',
    intro:
      'Kirjaudu sisään ja ilmoita ilmoituksesta, keskustelusta, maksupyynnöstä tai epäillystä identiteetin väärinkäytöstä. Älä koskaan lähetä rahaa Autorell-tilillä näkyvän prosessin ulkopuolella.',
    riskTitle: 'Välitön riski tai käynnissä oleva rikos?',
    riskText:
      'Ota ensin yhteyttä paikalliseen hätänumeroon, poliisiin tai toimivaltaisiin viranomaisiin. Autorell-ilmoitus ei korvaa rikosilmoitusta, pankkireklamaatiota, vakuutusasiaa tai viranomaisilmoitusta.',
    helpTitle: 'Missä Autorell voi auttaa',
    helpText:
      'Voimme säilyttää ilmoitus-, tili-, viesti- ja maksutietoja, tarkistaa epäilyttävää toimintaa, rajoittaa tilejä ja toimittaa asiaankuuluvia alustatietoja laillista tutkintaa varten.',
    helpLink: 'Avaa ohjekeskus',
  },
  da: {
    title: 'Anmeld svindel eller et sikkerhedsproblem.',
    intro:
      'Log ind og anmeld en annonce, samtale, betalingsanmodning eller mistanke om misbrug af identitet. Send aldrig penge uden for det flow, der vises på din Autorell-konto.',
    riskTitle: 'Akut risiko eller igangværende kriminalitet?',
    riskText:
      'Kontakt først det lokale alarmnummer, politiet eller relevante myndigheder. En anmeldelse til Autorell erstatter ikke en politianmeldelse, banksag, forsikringssag eller myndighedsanmeldelse.',
    helpTitle: 'Hvad Autorell kan hjælpe med',
    helpText:
      'Vi kan gemme annonce-, konto-, besked- og betalingsreferencer, gennemgå mistænkelig aktivitet, begrænse konti og give relevante platformoplysninger til en lovlig undersøgelse.',
    helpLink: 'Åbn hjælpecenter',
  },
}

export default async function ReportPage() {
  const requestHeaders = await headers()
  const requestedLocale = requestHeaders.get('x-autorell-language') || 'en'
  const marketCode = requestHeaders.get('x-autorell-market') || undefined
  const locale: PublicLocale =
    requestedLocale === 'sv' ||
    requestedLocale === 'de' ||
    isPublicLanguage(requestedLocale)
      ? requestedLocale
      : 'en'
  const copy = reportPageCopy[locale] || reportPageCopy.en
  const currency = currencyForLocale(locale)

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7f8fb] text-[#101828]">
      <PublicHeader locale={locale} marketCode={marketCode} />
      <section className="mx-auto grid w-full max-w-[1100px] min-w-0 gap-8 px-4 py-10 sm:px-8 sm:py-14 lg:grid-cols-[.85fr_1.15fr] lg:py-20">
        <div className="min-w-0">
          <span className="grid h-12 w-12 place-items-center rounded-[15px] bg-red-50 text-red-600">
            <ShieldAlert />
          </span>
          <h1 className="mt-6 max-w-full break-words text-[40px] font-bold leading-[1.05] tracking-normal sm:text-5xl lg:text-[56px]">
            {copy.title}
          </h1>
          <p className="mt-5 max-w-full text-lg leading-8 text-[#667085] sm:text-xl">
            {copy.intro}
          </p>
          <div className="mt-6 rounded-[18px] border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
            <strong>{copy.riskTitle}</strong>
            <br />
            {copy.riskText}
          </div>
          <div className="mt-4 rounded-[18px] border border-[#dfe6f2] bg-white p-5 text-sm leading-6 text-[#475467]">
            <strong className="text-[#101828]">
              {copy.helpTitle}
            </strong>
            <br />
            {copy.helpText}
          </div>
          <Link
            href={localizePublicHref(locale, '/help-center')}
            className="mt-6 inline-block font-bold text-[#0866ff]"
          >
            {copy.helpLink} -&gt;
          </Link>
        </div>
        <ReportForm locale={locale} currency={currency} />
      </section>
      <PublicFooter locale={locale} />
    </main>
  )
}
