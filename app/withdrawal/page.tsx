import PublicFooter from '@/app/components/PublicFooter'
import PublicHeader from '@/app/components/PublicHeader'
import { createPublicMetadata } from '@/lib/public-seo'
import { getRequestLocale } from '@/lib/request-locale'
import type { PublicLocale } from '@/lib/public-i18n'
import WithdrawalForm from './WithdrawalForm'

export async function generateMetadata() {
  const locale = await getRequestLocale()
  const copy = getPageCopy(locale)
  return createPublicMetadata({
    title: `${copy.title} | Autorell`,
    description: copy.description,
    path: '/withdrawal',
    locale,
  })
}

export default async function WithdrawalPage() {
  const locale = await getRequestLocale()
  const copy = getPageCopy(locale)
  return (
    <main className="min-h-screen bg-[#f4f7fb] text-[#101828]">
      <PublicHeader locale={locale} />
      <section className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-18">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-[#0866ff]">
          {copy.eyebrow}
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-normal sm:text-5xl">
          {copy.title}
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-[#5f6b7a]">
          {copy.intro}
        </p>
        <div className="mt-8">
          <WithdrawalForm locale={locale} />
        </div>
      </section>
      <PublicFooter locale={locale} />
    </main>
  )
}

type WithdrawalPageCopy = {
  eyebrow: string
  title: string
  description: string
  intro: string
}

const pageCopies: Record<'en' | 'sv' | 'de' | 'fr' | 'es' | 'it' | 'pl' | 'nl' | 'fi' | 'da', WithdrawalPageCopy> = {
  en: {
    eyebrow: 'Consumer rights',
    title: 'Exercise your right of withdrawal',
    description: 'Submit a clear withdrawal request for an eligible Autorell digital service and receive an immediate reference.',
    intro: 'Use this form to clearly notify Autorell that you want to withdraw from an eligible digital service agreement. The form does not create a right of withdrawal where none applies, but it records the time and content of your request immediately.',
  },
  sv: {
    eyebrow: 'Konsumenträttigheter',
    title: 'Utöva din ångerrätt',
    description: 'Skicka en tydlig ångerbegäran för en berättigad digital tjänst hos Autorell och få en referens direkt.',
    intro: 'Använd formuläret för att tydligt meddela Autorell att du vill frånträda ett berättigat avtal om en digital tjänst. Formuläret skapar ingen ångerrätt där sådan saknas, men registrerar omedelbart tidpunkten och innehållet i din begäran.',
  },
  de: {
    eyebrow: 'Verbraucherrechte',
    title: 'Widerrufsrecht ausüben',
    description: 'Senden Sie einen eindeutigen Widerruf für einen berechtigten digitalen Autorell-Dienst und erhalten Sie sofort eine Referenz.',
    intro: 'Mit diesem Formular teilen Sie Autorell eindeutig mit, dass Sie einen berechtigten Vertrag über einen digitalen Dienst widerrufen möchten. Das Formular begründet kein Widerrufsrecht, wenn keines besteht, dokumentiert aber sofort Zeitpunkt und Inhalt Ihrer Erklärung.',
  },
  fr: {
    eyebrow: 'Droits des consommateurs',
    title: 'Exercer votre droit de rétractation',
    description: 'Envoyez une demande de rétractation claire pour un service numérique Autorell éligible et recevez immédiatement une référence.',
    intro: 'Utilisez ce formulaire pour informer clairement Autorell que vous souhaitez vous rétracter d’un contrat de service numérique éligible. Le formulaire ne crée pas de droit de rétractation lorsqu’il n’existe pas, mais enregistre immédiatement la date, l’heure et le contenu de votre demande.',
  },
  es: {
    eyebrow: 'Derechos de los consumidores',
    title: 'Ejerce tu derecho de desistimiento',
    description: 'Envía una solicitud clara de desistimiento para un servicio digital de Autorell que cumpla los requisitos y recibe una referencia inmediata.',
    intro: 'Utiliza este formulario para comunicar claramente a Autorell que deseas desistir de un contrato de servicio digital que cumpla los requisitos. El formulario no crea un derecho de desistimiento cuando no exista, pero registra de inmediato la fecha, la hora y el contenido de tu solicitud.',
  },
  it: {
    eyebrow: 'Diritti dei consumatori',
    title: 'Esercita il diritto di recesso',
    description: 'Invia una richiesta di recesso chiara per un servizio digitale Autorell idoneo e ricevi subito un riferimento.',
    intro: 'Usa questo modulo per comunicare chiaramente ad Autorell che desideri recedere da un contratto di servizio digitale idoneo. Il modulo non crea un diritto di recesso quando non è previsto, ma registra immediatamente la data, l’ora e il contenuto della richiesta.',
  },
  pl: {
    eyebrow: 'Prawa konsumenta',
    title: 'Skorzystaj z prawa do odstąpienia od umowy',
    description: 'Złóż jednoznaczne oświadczenie o odstąpieniu od kwalifikującej się usługi cyfrowej Autorell i od razu otrzymaj numer referencyjny.',
    intro: 'Skorzystaj z tego formularza, aby jednoznacznie poinformować Autorell o odstąpieniu od kwalifikującej się umowy o usługę cyfrową. Formularz nie tworzy prawa do odstąpienia, jeśli ono nie przysługuje, ale natychmiast rejestruje czas i treść oświadczenia.',
  },
  nl: {
    eyebrow: 'Consumentenrechten',
    title: 'Maak gebruik van uw herroepingsrecht',
    description: 'Dien een duidelijke herroepingsverklaring in voor een in aanmerking komende digitale Autorell-dienst en ontvang direct een referentie.',
    intro: 'Gebruik dit formulier om Autorell duidelijk te laten weten dat u een overeenkomst voor een in aanmerking komende digitale dienst wilt herroepen. Het formulier schept geen herroepingsrecht waar dat niet bestaat, maar registreert direct het tijdstip en de inhoud van uw verklaring.',
  },
  fi: {
    eyebrow: 'Kuluttajan oikeudet',
    title: 'Käytä peruuttamisoikeuttasi',
    description: 'Lähetä selkeä peruutuspyyntö ehdot täyttävästä Autorellin digitaalisesta palvelusta ja saat viitenumeron heti.',
    intro: 'Ilmoita tällä lomakkeella Autorellille selkeästi, että haluat peruuttaa ehdot täyttävän digitaalisen palvelusopimuksen. Lomake ei luo peruuttamisoikeutta silloin, kun sitä ei ole, mutta se tallentaa pyyntösi ajankohdan ja sisällön välittömästi.',
  },
  da: {
    eyebrow: 'Forbrugerrettigheder',
    title: 'Brug din fortrydelsesret',
    description: 'Indsend en tydelig fortrydelsesmeddelelse for en berettiget digital Autorell-tjeneste, og få straks en reference.',
    intro: 'Brug formularen til tydeligt at meddele Autorell, at du vil fortryde en berettiget aftale om en digital tjeneste. Formularen skaber ikke en fortrydelsesret, hvor den ikke gælder, men registrerer straks tidspunktet og indholdet af din meddelelse.',
  },
}

function getPageCopy(locale: PublicLocale) {
  if (locale === 'at') return pageCopies.de
  if (locale === 'be') return pageCopies.nl
  return pageCopies[locale] || pageCopies.en
}
