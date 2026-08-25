import { generateAccountMetadata } from '@/lib/account-seo'
import { translationLocale, type PublicLocale } from '@/lib/public-i18n'
import { getRequestLocale } from '@/lib/request-locale'

export const generateMetadata = generateAccountMetadata('business-status')

const copy = {
  en: {
    eyebrow: 'Autorell for companies',
    title: 'Your application is being reviewed',
    text: 'We review company applications within 24 hours and will return with a decision as soon as the check is complete.',
    nextTitle: 'What happens next',
    stepOne: 'Autorell checks the company details, contact person and risk signals.',
    stepTwo: 'You receive a decision by email and in your company account.',
    stepThree: 'After approval you choose a plan and can start publishing listings.',
  },
  sv: {
    eyebrow: 'Autorell för företag',
    title: 'Din ansökan granskas',
    text: 'Vi granskar företagsansökningar inom 24 timmar och återkommer med besked så snart kontrollen är klar.',
    nextTitle: 'Vad händer nu',
    stepOne: 'Autorell kontrollerar företagsuppgifter, kontaktperson och risksignaler.',
    stepTwo: 'Du får besked via mejl och i företagets konto.',
    stepThree: 'Efter godkännande väljer du plan och kan börja publicera annonser.',
  },
  de: {
    eyebrow: 'Autorell für Unternehmen',
    title: 'Ihr Antrag wird geprüft',
    text: 'Wir prüfen Unternehmensanträge innerhalb von 24 Stunden und melden uns, sobald die Prüfung abgeschlossen ist.',
    nextTitle: 'Was als Nächstes passiert',
    stepOne: 'Autorell prüft Unternehmensdaten, Kontaktperson und Risikosignale.',
    stepTwo: 'Sie erhalten die Entscheidung per E-Mail und im Unternehmenskonto.',
    stepThree: 'Nach der Freigabe wählen Sie einen Tarif und können Anzeigen veröffentlichen.',
  },
  fr: {
    eyebrow: 'Autorell pour les entreprises',
    title: 'Votre demande est en cours d’examen',
    text: 'Nous examinons les demandes d’entreprise sous 24 heures et revenons vers vous dès que la vérification est terminée.',
    nextTitle: 'Prochaines étapes',
    stepOne: 'Autorell vérifie les informations de l’entreprise, le contact et les signaux de risque.',
    stepTwo: 'Vous recevez la décision par e-mail et dans votre compte entreprise.',
    stepThree: 'Après validation, vous choisissez une offre et pouvez publier des annonces.',
  },
  es: {
    eyebrow: 'Autorell para empresas',
    title: 'Estamos revisando tu solicitud',
    text: 'Revisamos las solicitudes de empresa en un plazo de 24 horas y te comunicaremos la decisión cuando finalice la comprobación.',
    nextTitle: 'Qué ocurre ahora',
    stepOne: 'Autorell comprueba los datos de la empresa, la persona de contacto y las señales de riesgo.',
    stepTwo: 'Recibirás la decisión por correo y en tu cuenta de empresa.',
    stepThree: 'Tras la aprobación, eliges un plan y puedes publicar anuncios.',
  },
  it: {
    eyebrow: 'Autorell per aziende',
    title: 'La tua richiesta è in revisione',
    text: 'Esaminiamo le richieste aziendali entro 24 ore e ti invieremo l’esito appena la verifica sarà completata.',
    nextTitle: 'Cosa succede ora',
    stepOne: 'Autorell controlla i dati aziendali, il referente e i segnali di rischio.',
    stepTwo: 'Riceverai l’esito via e-mail e nel tuo account aziendale.',
    stepThree: 'Dopo l’approvazione scegli un piano e puoi pubblicare annunci.',
  },
  nl: {
    eyebrow: 'Autorell voor bedrijven',
    title: 'Je aanvraag wordt beoordeeld',
    text: 'We beoordelen bedrijfsaanvragen binnen 24 uur en sturen een besluit zodra de controle klaar is.',
    nextTitle: 'Wat gebeurt er nu',
    stepOne: 'Autorell controleert bedrijfsgegevens, contactpersoon en risicosignalen.',
    stepTwo: 'Je ontvangt het besluit per e-mail en in je bedrijfsaccount.',
    stepThree: 'Na goedkeuring kies je een plan en kun je advertenties publiceren.',
  },
  fi: {
    eyebrow: 'Autorell yrityksille',
    title: 'Hakemuksesi on tarkistuksessa',
    text: 'Tarkistamme yrityshakemukset 24 tunnin kuluessa ja ilmoitamme päätöksen heti, kun tarkistus on valmis.',
    nextTitle: 'Mitä tapahtuu seuraavaksi',
    stepOne: 'Autorell tarkistaa yritystiedot, yhteyshenkilön ja riskisignaalit.',
    stepTwo: 'Saat päätöksen sähköpostitse ja yritystilillesi.',
    stepThree: 'Hyväksynnän jälkeen valitset paketin ja voit julkaista ilmoituksia.',
  },
  da: {
    eyebrow: 'Autorell for virksomheder',
    title: 'Din ansøgning bliver gennemgået',
    text: 'Vi gennemgår virksomhedsansøgninger inden for 24 timer og vender tilbage med svar, når kontrollen er færdig.',
    nextTitle: 'Hvad sker der nu',
    stepOne: 'Autorell kontrollerer virksomhedsoplysninger, kontaktperson og risikosignaler.',
    stepTwo: 'Du får besked via e-mail og i virksomhedskontoen.',
    stepThree: 'Efter godkendelse vælger du plan og kan begynde at publicere annoncer.',
  },
  pl: {
    eyebrow: 'Autorell dla firm',
    title: 'Twój wniosek jest sprawdzany',
    text: 'Sprawdzamy wnioski firmowe w ciągu 24 godzin i wrócimy z decyzją, gdy kontrola będzie zakończona.',
    nextTitle: 'Co dalej',
    stepOne: 'Autorell sprawdza dane firmy, osobę kontaktową i sygnały ryzyka.',
    stepTwo: 'Decyzję otrzymasz e-mailem oraz na koncie firmowym.',
    stepThree: 'Po zatwierdzeniu wybierasz plan i możesz publikować ogłoszenia.',
  },
} satisfies Record<string, Record<string, string>>

function getCopy(locale: PublicLocale) {
  const language = translationLocale(locale)
  return copy[language as keyof typeof copy] || copy.en
}

export default async function BusinessStatusPage() {
  const locale = await getRequestLocale()
  const t = getCopy(locale)
  const steps = [t.stepOne, t.stepTwo, t.stepThree]

  return (
    <main className="min-h-screen bg-[#f6f8fb] px-5 py-16 sm:px-8 sm:py-20">
      <section className="mx-auto max-w-2xl overflow-hidden rounded-[24px] border border-[#dbe4f0] bg-white shadow-[0_22px_70px_rgba(16,24,40,.08)]">
        <div className="border-b border-[#e5ebf3] bg-[#f8fbff] p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#0866ff]">{t.eyebrow}</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-.04em] text-[#101828] sm:text-4xl">{t.title}</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-[#667085]">{t.text}</p>
        </div>
        <div className="p-6 sm:p-8">
          <h2 className="text-lg font-semibold tracking-[-.02em] text-[#101828]">{t.nextTitle}</h2>
          <ol className="mt-5 grid gap-3">
            {steps.map((step, index) => (
              <li key={step} className="flex gap-3 rounded-[16px] border border-[#e2e8f0] bg-white p-4">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#eef5ff] text-sm font-semibold text-[#0866ff]">
                  {index + 1}
                </span>
                <span className="pt-1 text-sm leading-6 text-[#475467]">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </main>
  )
}
