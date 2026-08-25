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

const freeListingTermByLocale: Record<PublicLocale, string> = {
  sv: 'Grundpubliceringen är gratis i fem dagar. Priser för 15 dagar och Premium 30 dagar visas före betalning.',
  en: 'The current free listing period is five days. Paid 15-day and Premium 30-day package prices are shown before payment.',
  de: 'Die kostenlose Anzeigenlaufzeit beträgt derzeit fünf Tage. Preise für 15 Tage und Premium 30 Tage werden vor der Zahlung angezeigt.',
  at: 'Die kostenlose Anzeigenlaufzeit beträgt derzeit fünf Tage. Preise für 15 Tage und Premium 30 Tage werden vor der Zahlung angezeigt.',
  be: 'De huidige gratis advertentieperiode bedraagt vijf dagen. De prijzen voor betaalde pakketten van 15 dagen en Premium 30 dagen worden vóór betaling getoond.',
  fr: 'La période de publication gratuite est actuellement de cinq jours. Les prix des forfaits payants de 15 jours et Premium de 30 jours sont affichés avant le paiement.',
  es: 'El periodo gratuito de publicación es actualmente de cinco días. Los precios de los paquetes de pago de 15 días y Premium de 30 días se muestran antes del pago.',
  it: 'Il periodo di pubblicazione gratuito è attualmente di cinque giorni. I prezzi dei pacchetti a pagamento da 15 giorni e Premium da 30 giorni vengono mostrati prima del pagamento.',
  pl: 'Bezpłatny okres publikacji wynosi obecnie pięć dni. Ceny płatnych pakietów 15-dniowych i Premium 30-dniowych są wyświetlane przed płatnością.',
  nl: 'De huidige gratis advertentieperiode bedraagt vijf dagen. De prijzen voor betaalde pakketten van 15 dagen en Premium 30 dagen worden vóór betaling getoond.',
  fi: 'Ilmainen ilmoitusaika on tällä hetkellä viisi päivää. Maksullisten 15 päivän ja Premium 30 päivän pakettien hinnat näytetään ennen maksua.',
  da: 'Den gratis annonceperiode er i øjeblikket fem dage. Priserne for de betalte 15-dages- og Premium 30-dagespakker vises før betaling.',
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
  const fallback = activeLocale === 'de' || activeLocale === 'at'
    ? legalFallbackCopyDe(title)
    : legalFallbackCopy(title)
  const localizedBase =
    activeLocale === 'sv'
      ? {
          eyebrow,
          title,
          intro,
          updated: 'Senast uppdaterad: 6 augusti 2026',
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
          updated: 'Last updated: 6 August 2026',
          questionTitle: 'Questions about your data?',
          questionText:
            'Contact us if you want to understand how a case is handled or use your data protection rights.',
          contact: 'Contact Autorell',
          sections: fallback.sections,
        })
  const localized = {
    ...localizedBase,
    sections: localizedBase.sections.map((section) =>
      ['purchase-terms', 'listing-services'].includes(section.id) && section.items?.length
        ? {
            ...section,
            items: [freeListingTermByLocale[activeLocale], ...section.items.slice(1)],
          }
        : section,
    ),
  }

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

function legalFallbackCopyDe(title: string): {
  title: string
  intro: string
  sections: LegalSection[]
} {
  const normalizedTitle = title.toLowerCase()

  if (normalizedTitle.includes('refund') || normalizedTitle.includes('återbetal')) {
    return {
      title: 'Erstattungsrichtlinie für Anzeigengebühren',
      intro:
        'So behandelt Autorell Erstattungen für bezahlte Anzeigengebühren, wenn eine Anzeige veröffentlicht, storniert oder von einem Zahlungs- oder Technikproblem betroffen ist.',
      sections: [
        {
          id: 'published-listings',
          title: 'Nach der Veröffentlichung einer Anzeige',
          paragraphs: [
            'Wenn eine Anzeige auf Autorell veröffentlicht wurde, beginnt die Leistung unmittelbar. Anzeigengebühren werden nach der Veröffentlichung daher normalerweise nicht erstattet.',
          ],
        },
        {
          id: 'refund-eligible',
          title: 'Wann eine Erstattung möglich ist',
          items: [
            'Die Anzeige konnte wegen eines technischen Fehlers bei Autorell nicht veröffentlicht werden.',
            'Die Zahlung wurde versehentlich mehrfach verarbeitet.',
            'Es wurde ein falscher Betrag berechnet.',
            'Autorell hat die Anzeige versehentlich falsch veröffentlicht oder bearbeitet.',
            'Verbraucherschutzrecht gibt Ihnen in Ihrem Land einen Anspruch auf Erstattung.',
          ],
        },
        {
          id: 'no-refund',
          title: 'Wann normalerweise keine Erstattung erfolgt',
          items: [
            'Sie entfernen die Anzeige nach der Veröffentlichung.',
            'Sie verkaufen das Fahrzeug oder brechen den Verkauf ab.',
            'Die Anzeigenlaufzeit endet ohne Verkauf.',
            'Sie ändern Ihre Meinung nach der Veröffentlichung.',
            'Die Anzeige wird entfernt, weil sie gegen Autorell-Bedingungen oder geltendes Recht verstößt.',
          ],
        },
      ],
    }
  }

  if (normalizedTitle.includes('cookie')) {
    return {
      title: 'Cookie-Richtlinie',
      intro:
        'Notwendige Technologien halten Autorell sicher und funktionsfähig. Statistik, Leistungsmessung und Werbung werden nur nach Ihren getrennten aktiven Entscheidungen aktiviert.',
      sections: [
        {
          id: 'cookies',
          title: 'Was sind Cookies?',
          paragraphs: [
            'Cookies sind kleine Dateien, die eine Website auf Ihrem Gerät speichert oder daraus ausliest. Ähnliche Technologien können lokalen Speicher oder andere Kennungen verwenden.',
          ],
        },
        {
          id: 'current-use',
          title: 'Was wir derzeit verwenden',
          paragraphs: [
            'Autorell verwendet notwendige Technologien für sichere Anmeldung, Sitzungen, Missbrauchsschutz und vom Nutzer angeforderte Funktionen.',
            'Vercel Analytics und Vercel Speed Insights werden erst geladen, nachdem Sie Statistik und Leistungsmessung aktiv akzeptiert haben. Google AdSense wird erst geladen, nachdem Sie Werbung separat akzeptiert haben.',
          ],
        },
        {
          id: 'necessary',
          title: 'Notwendige Cookies',
          items: [
            'Authentifizierungs- und Sitzungscookies für das Autorell-Konto.',
            'Sicherheitsfunktionen, die für den Betrieb des Dienstes erforderlich sind.',
            'Technischer Speicher für ausdrücklich angeforderte Funktionen.',
          ],
        },
        {
          id: 'analytics',
          title: 'Statistik und Leistung',
          paragraphs: [
            'Mit Ihrer separaten Einwilligung verwenden wir Vercel Analytics für aggregierte Nutzungsstatistiken und Vercel Speed Insights für Leistungsmessungen. Vercel kann technische Daten wie IP-Adresse, Geräte- und Browserinformationen sowie besuchte Seiten gemäß seinen Bedingungen verarbeiten.',
            'Die Einwilligung ist freiwillig und beeinflusst den Zugang zu den Grundfunktionen von Autorell nicht.',
          ],
        },
        {
          id: 'advertising',
          title: 'Werbung',
          paragraphs: [
            'Mit einer separaten Einwilligung verwenden wir Google AdSense, um Werbung anzuzeigen und zu messen. Google kann technische Daten, Anzeigeninteraktionen und Kennungen gemäß seinen Datenschutzhinweisen und Ihren Entscheidungen verarbeiten.',
            'Sie können Werbung unabhängig von Statistik und Leistungsmessung auswählen. Die Einwilligung ist freiwillig.',
          ],
        },
        {
          id: 'manage',
          title: 'Cookies verwalten',
          paragraphs: [
            'Sie können jede Auswahl jederzeit separat über die Cookie-Einstellungen in der Fußzeile ändern oder widerrufen. Beim Widerruf wird die Seite ohne das nicht mehr genehmigte Werkzeug neu geladen.',
            'Sie können Cookies außerdem im Browser löschen oder blockieren. Wenn notwendige Authentifizierungscookies blockiert werden, funktionieren Konto-, Anzeigen- und Nachrichtenfunktionen möglicherweise nicht.',
          ],
        },
        {
          id: 'inventory',
          title: 'Cookie-Inventar',
          items: [
            'autorell_cookie_consent · Autorell · speichert, ob Sie notwendige, Statistik-/Leistungs-, Werbe- oder alle Technologien ausgewählt haben · 180 Tage · notwendig, um Ihre Auswahl zu beachten.',
            'autorell-market und autorell-language · Autorell · speichern Markt und Sprache · höchstens 1 Jahr · notwendig.',
            'Authentifizierungs- und Sitzungsdaten · Autorell/Supabase · sichere Anmeldung · bis zur Abmeldung oder zum Ablauf der Sitzung · notwendig.',
            'Vercel Analytics und Speed Insights · Vercel · Nutzungs- und Leistungsmessung · nur mit separater Einwilligung zu Statistik und Leistung.',
            'Google AdSense · Google · Anzeigen, Messung und Betrugsschutz · nur mit separater Einwilligung zu Werbung; Kennungen können unterschiedliche Laufzeiten haben.',
          ],
        },
        {
          id: 'providers-transfers',
          title: 'Anbieter und internationale Übermittlungen',
          paragraphs: [
            'Vercel und Google sind externe Anbieter und können Daten außerhalb der EU/des EWR verarbeiten. In diesem Fall müssen der Anbieter und Autorell einen rechtmäßigen Übermittlungsmechanismus und geeignete Schutzmaßnahmen verwenden.',
            'Namen und Laufzeiten einzelner Drittanbieter-Cookies können sich ändern. Wir prüfen das Inventar und aktualisieren diese Richtlinie bei wesentlichen Änderungen von Technologie oder Zwecken.',
          ],
        },
      ],
    }
  }

  if (normalizedTitle.includes('privacy') || normalizedTitle.includes('integritet')) {
    return {
      title: 'Datenschutzerklärung',
      intro:
        'Wie personenbezogene Daten für Konten, Anzeigen, Nachrichten, Zahlungen und Sicherheit auf Autorell verwendet werden.',
      sections: [
        {
          id: 'controller',
          title: 'Verantwortlicher',
          paragraphs: [
            'Autorell AB in Schweden ist Verantwortlicher für den Marktplatz. Fragen, Widersprüche und Rechteanfragen können an info@autorell.com gesendet werden.',
          ],
        },
        {
          id: 'data',
          title: 'Daten, die wir verarbeiten',
          items: [
            'Kontotyp, Name, E-Mail, Telefon, Land, Adresse, Login- und Sicherheitsinformationen.',
            'Anzeigendaten, Bilder, Fahrzeugidentität, Preis, Standort, Zustand, Historie und bekannte Mängel.',
            'Bei Händleranfragen verarbeiten wir Fahrzeug-, Zustands- und Kontaktdaten sowie Fotos und den bevorzugten Kontaktweg des Verkäufers.',
            'Wenn ein Unternehmensmitglied einen Verkäufer als kontaktiert markiert, verarbeiten wir Unternehmen, Nutzer, Name, E-Mail, Kontaktweg und Zeitstempel zur gemeinsamen Nachverfolgung.',
            'Nachrichten, Meldungen, Supportfälle, Moderationsentscheidungen und Nachweise bei vermutetem Missbrauch.',
            'Zahlungsreferenzen, Pakete, Beträge, Belege und Erstattungsstatus. Vollständige Kartendaten werden nicht von Autorell gespeichert.',
          ],
        },
        {
          id: 'purposes',
          title: 'Zwecke und Rechtsgrundlagen',
          items: [
            'Vertrag und Nutzeranfrage: Kontoerstellung, Anzeigen, Anzeigenpakete, Nachrichten und Support.',
            'Rechtliche Pflicht: Buchhaltung, Steuern, Behördenanfragen und digitale Plattformpflichten.',
            'Berechtigtes Interesse: sicherer Betrieb, Betrugsprävention, Moderation, Streitnachweise und Weiterentwicklung des Dienstes.',
            'Nutzeranfrage und berechtigtes Interesse: Händleranfragen nach Länderauswahl zuordnen, Unternehmen benachrichtigen und unnötige Mehrfachkontakte innerhalb desselben Unternehmens vermeiden.',
            'Einwilligung wird verwendet, wenn dies gesetzlich erforderlich ist, zum Beispiel für nicht notwendige Cookies oder separates Marketing.',
          ],
        },
        {
          id: 'recipients-retention',
          title: 'Empfänger und Speicherdauer',
          items: [
            'Händleranfragen sind nur für berechtigte Geschäftskonten mit passender Länderauswahl sichtbar. Teammitglieder desselben Unternehmens sehen, wer den Verkäufer wann kontaktiert hat.',
            'Eine als kontaktiert markierte Anfrage bleibt 24 Stunden im Feed dieses Unternehmens und wird danach ausgeblendet. Das Kontaktprotokoll kann für Koordination, Sicherheit und Rechtsansprüche länger zugriffsbeschränkt gespeichert werden.',
            'Auftragsverarbeiter für Hosting, Datenbank, Authentifizierung, Speicherung, E-Mail und Zahlung erhalten nur die für ihre Leistung erforderlichen Daten. Einwilligungsbasierte Analyse und Werbung werden in der Cookie-Richtlinie beschrieben.',
          ],
        },
        {
          id: 'rights',
          title: 'Ihre Rechte',
          items: [
            'Auskunft, Berichtigung, Löschung oder Einschränkung verlangen, wenn die DSGVO-Voraussetzungen erfüllt sind.',
            'Widerspruch gegen Verarbeitung auf Grundlage berechtigter Interessen einlegen und Datenübertragbarkeit verlangen, soweit anwendbar.',
            'Einwilligung widerrufen, ohne die Rechtmäßigkeit früherer Verarbeitung zu berühren.',
          ],
        },
      ],
    }
  }

  return {
    title: 'Allgemeine Geschäftsbedingungen',
    intro:
      'Die Regeln für Konten, Anzeigen, Kontakt zwischen Nutzern, Zahlungen und Sicherheit auf Autorell.',
    sections: [
      {
        id: 'platform-role',
        title: 'Rolle der Plattform',
        paragraphs: [
          'Autorell stellt einen digitalen Marktplatz bereit, auf dem private Verkäufer und Unternehmen Fahrzeuganzeigen veröffentlichen, suchen, Suchen speichern und kommunizieren können.',
          'Bei gewöhnlichen Marktplatzanzeigen ist Autorell nicht automatisch Käufer, Verkäufer, Vermittler, Garant oder Partei der Vereinbarung zwischen Nutzern.',
        ],
      },
      {
        id: 'accounts',
        title: 'Private und geschäftliche Konten',
        items: [
          'Der Kontoinhaber muss mindestens 18 Jahre alt sein und korrekte aktuelle Kontakt- und Identitätsdaten angeben.',
          'Private Konten sind für persönlichen, nicht gewerblichen Handel bestimmt. Gewerbliche Verkäufer müssen ein Geschäftskonto verwenden.',
          'Private Verkäufer zeigen öffentlich normalerweise nur den Vornamen. Geschäftskonten zeigen den registrierten Firmennamen.',
          'Das Konto ist persönlich. Passwörter und Zugänge dürfen nicht geteilt werden.',
        ],
      },
      {
        id: 'listings',
        title: 'Anzeigen und Verantwortung des Verkäufers',
        items: [
          'Der Verkäufer muss berechtigt sein, das Fahrzeug anzubieten und zu verkaufen.',
          'Kategorie, Identität, Eigentum, Preis, Standort, Zustand, Laufleistung, Betriebsstunden, Mängel und Bilder müssen korrekt und nicht irreführend sein.',
          'Autorell kann Inhalte prüfen, einschränken, ausblenden oder entfernen und notwendige Nachweise sichern.',
        ],
      },
      {
        id: 'vehicle-purchases',
        title: 'Fahrzeugkauf und Verkäuferrolle',
        paragraphs: [
          'Kauft ein Verbraucher ein Fahrzeug von einem Unternehmen, gelten zwingende Verbraucherschutzregeln. Bei einem Kauf zwischen Privatpersonen gelten grundsätzlich das vereinbarte Recht und das schwedische Kaufrecht; ein allgemeines gesetzliches Widerrufsrecht besteht dafür nicht.',
          'Autorell ist Marktplatz und nicht automatisch Fahrzeugverkäufer, Käufer, Kreditgeber, Vermittler oder Garant. Die Anzeige zeigt den Kontotyp des Verkäufers.',
        ],
      },
      {
        id: 'listing-services',
        title: 'Anzeigenpakete und Widerrufsrecht',
        items: [
          'Die kostenlose Anzeigenlaufzeit beträgt derzeit fünf Tage. Preise für 15 Tage und Premium 30 Tage werden vor der Zahlung angezeigt.',
          'Verbraucher haben bei einem online gekauften Anzeigendienst grundsätzlich ein 14-tägiges Widerrufsrecht. Vor sofortiger Veröffentlichung müssen sie den Beginn während der Widerrufsfrist ausdrücklich verlangen und die gesetzlichen Folgen bestätigen.',
          'Seit dem 19. Juni 2026 stellt die Website für erfasste Verträge eine leicht zugängliche Widerrufsfunktion und eine unverzügliche Eingangsbestätigung bereit.',
        ],
      },
      {
        id: 'invoice-credit',
        title: 'Rechnung, Kredit und Zahlungsverzug',
        paragraphs: [
          'Geschäftsrechnung wird nur berechtigten Geschäftskonten angeboten. Das aktuelle Zahlungsziel beträgt 14 Tage ab Rechnungsdatum.',
          'Bei verspäteter Zahlung kann Autorell gesetzliche Verzugszinsen und vereinbarte, rechtlich zulässige Mahn- und Inkassokosten berechnen.',
          'Autorell vergibt selbst keine Fahrzeugkredite oder Verbraucherdarlehen, sofern ein separates Angebot dies nicht ausdrücklich vorsieht. Der benannte Kreditgeber ist für Kreditprüfung, Vorabinformationen und Vertragsbedingungen verantwortlich.',
        ],
      },
      {
        id: 'messages',
        title: 'Nachrichten und verbotenes Verhalten',
        items: [
          'Zum Kontakt mit einem Verkäufer ist eine Anmeldung erforderlich. Nachrichten dürfen nur für legitime Kommunikation zur Anzeige genutzt werden.',
          'Betrug, Belästigung, Spam, schädliche Links, Identitätsmissbrauch und Versuche, Passwörter, Kartendaten oder unzulässige Zahlungen anzufordern, sind verboten.',
        ],
      },
      {
        id: 'complaints',
        title: 'Beschwerden, Streit und anwendbares Recht',
        paragraphs: [
          'Beschwerden können über das Hilfezentrum oder an info@autorell.com gesendet werden. Verbraucher können die Widerrufsfunktion der Website nutzen, wenn ein gesetzliches Widerrufsrecht gilt.',
          'Schwedisches Recht gilt, soweit zwingende Schutzvorschriften im Land des Verbrauchers nicht vorgehen. Verbraucher behalten den Zugang zu zuständigen Gerichten und anwendbarer alternativer Streitbeilegung.',
        ],
      },
    ],
  }
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
        'Necessary technologies keep Autorell secure and working. Analytics, performance measurement and advertising are activated only after your separate active choices.',
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
            'Vercel Analytics and Vercel Speed Insights load only after you actively accept analytics and performance measurement. Google AdSense loads only after you separately accept advertising.',
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
          id: 'analytics',
          title: 'Analytics and performance',
          paragraphs: [
            'With your separate consent, we use Vercel Analytics for aggregated usage statistics and Vercel Speed Insights for performance measurement. Vercel may process technical information such as IP address, device and browser information and visited pages under its terms.',
            'Consent is voluntary and does not affect access to Autorell core functionality.',
          ],
        },
        {
          id: 'advertising',
          title: 'Advertising',
          paragraphs: [
            'With a separate consent, we use Google AdSense to display and measure ads. Google may process technical information, advertising interactions and identifiers under its privacy terms and your choices.',
            'You can choose advertising independently from analytics and performance measurement. Consent is voluntary.',
          ],
        },
        {
          id: 'manage',
          title: 'Manage cookies',
          paragraphs: [
            'You can change or withdraw each choice separately at any time through Cookie settings in the footer. When a previous consent is withdrawn, the page reloads without the tool that is no longer approved.',
            'You can also delete or block cookies in your browser. If necessary authentication cookies are blocked, account, listing and messaging features may stop working.',
          ],
        },
        {
          id: 'inventory',
          title: 'Cookie inventory',
          items: [
            'autorell_cookie_consent · Autorell · stores whether you selected necessary, analytics/performance, advertising or all technologies · 180 days · necessary to respect your choice.',
            'autorell-market and autorell-language · Autorell · store market and language · up to 1 year · necessary.',
            'Authentication and session data · Autorell/Supabase · secure sign-in · until logout or session expiry · necessary.',
            'Vercel Analytics and Speed Insights · Vercel · usage and performance measurement · separate analytics/performance consent only.',
            'Google AdSense · Google · advertising, measurement and fraud prevention · separate advertising consent only; identifiers may have different lifetimes.',
          ],
        },
        {
          id: 'providers-transfers',
          title: 'Providers and international transfers',
          paragraphs: [
            'Vercel and Google are external providers and may process data outside the EU/EEA. Where that occurs, the provider and Autorell must use a lawful transfer mechanism and applicable safeguards.',
            'Third-party cookie names and lifetimes may change. We review the inventory and update this policy when technology or purposes change materially.',
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
            'For private sellers, full names are kept for account, verification, safety and legal purposes. Public marketplace views normally show only the seller first name and account type.',
            'Listing data, images, vehicle identity, price, location, condition, history and known faults.',
            'Dealer-offer requests include vehicle, condition and contact details, photos and the seller’s preferred contact method.',
            'When a company member marks a seller as contacted, we process the company, user, name, email, contact method and timestamps for shared follow-up.',
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
            'User request and legitimate interest: match dealer requests by country, notify eligible companies and prevent unnecessary duplicate contact within the same company.',
            'Consent is used where required by law, for example for non-essential cookies or separate marketing.',
          ],
        },
        {
          id: 'recipients-retention',
          title: 'Recipients and retention',
          items: [
            'Dealer requests are visible only to eligible business accounts with matching country access. Members of the same company can see who contacted the seller and when.',
            'A request marked as contacted remains in that company’s feed for 24 hours and is then hidden. The contact audit may be retained with restricted access for coordination, security and legal claims.',
            'Processors for hosting, database, authentication, storage, email and payment receive only the data needed for their service. Consent-based analytics and advertising are described in the Cookie Policy.',
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
          'Private sellers normally show only their first name publicly. Business accounts show the registered company name.',
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
        id: 'vehicle-purchases',
        title: 'Vehicle purchases and the identity of the seller',
        paragraphs: [
          'When a consumer buys a vehicle from a business, mandatory consumer sales rules apply. The business seller is responsible for required identity, total price, fees, delivery, complaint rights and any distance-selling withdrawal rights.',
          'A purchase between private individuals is normally governed by the Swedish Sale of Goods Act and the parties’ agreement. There is no general statutory withdrawal right for a private-to-private vehicle purchase.',
          'Autorell is a marketplace and is not automatically the vehicle seller, buyer, lender, agent or guarantor. The listing shows the seller account type so users can identify their counterparty.',
        ],
      },
      {
        id: 'listing-services',
        title: 'Listing packages and consumer withdrawal rights',
        items: [
          'The current free listing period is five days. Paid 15-day and Premium 30-day package prices are shown before payment.',
          'A consumer who buys a listing service at a distance normally has a 14-day withdrawal right. Before immediate publication, the consumer must expressly request performance during that period and acknowledge the legal effect when the service has been fully performed.',
          'If the consumer withdraws before the service is fully performed, Autorell may charge a proportionate amount for the part performed after the consumer’s express request where permitted by law.',
          'From 19 June 2026, the website provides an accessible withdrawal function for agreements covered by a statutory withdrawal right and confirms receipt without undue delay.',
        ],
      },
      {
        id: 'invoice-credit',
        title: 'Invoices, credit and late payment',
        paragraphs: [
          'Business invoicing is available only when shown to an eligible business account. The current payment term is 14 days from the invoice date.',
          'For late payment, Autorell may charge default interest under the Swedish Interest Act and agreed reminder or collection fees permitted by law. New listing publication may be restricted while an undisputed invoice remains overdue.',
          'Autorell does not itself provide vehicle loans or consumer credit unless a separate offer expressly says so. Financing displayed in a listing comes from the business seller or named lender, which is responsible for pre-contract information, credit assessment, agreement terms and applicable consumer-credit rules.',
          'If a payment option constitutes consumer credit, including an invoice issued through a financing provider, mandatory consumer-credit protections and the named creditor’s terms apply. Business-to-business credit is not governed by consumer credit legislation.',
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
      {
        id: 'complaints',
        title: 'Complaints, disputes and governing law',
        paragraphs: [
          'Complaints can be submitted through the help centre or to info@autorell.com. Consumers may use the website withdrawal function where a statutory withdrawal right applies.',
          'Swedish law applies to the extent it is not displaced by mandatory protection in the consumer’s country. Consumers retain access to competent courts and applicable alternative dispute resolution, including the Swedish National Board for Consumer Disputes when its requirements are met.',
        ],
      },
    ],
  }
}
