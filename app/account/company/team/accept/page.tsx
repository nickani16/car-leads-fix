import PublicHeader from '@/app/components/PublicHeader'
import AcceptTeamInvitation from './AcceptTeamInvitation'
import { getRequestLocale } from '@/lib/request-locale'
import { translationLocale, type PublicLocale } from '@/lib/public-i18n'
import { generateAccountMetadata } from '@/lib/account-seo'

export const generateMetadata = generateAccountMetadata('company-team-accept')

const baseCopy = {
  eyebrow: 'Company invitation',
  title: 'Accept team invitation',
  description: 'We check the invitation automatically. Use the same email address that received the invitation.',
  accept: 'Accept invitation',
  accepting: 'Checking invitation...',
  success: 'Invitation accepted. Opening the company portal.',
  signInFirst: 'Sign in with the invited email address. We will bring you back to this invitation.',
  failed: 'The invitation could not be accepted.',
}

const localizedCopy: Partial<Record<ReturnType<typeof translationLocale>, Partial<typeof baseCopy>>> = {
  sv: {
    eyebrow: 'Företagsinbjudan',
    title: 'Acceptera teaminbjudan',
    description: 'Vi kontrollerar inbjudan automatiskt. Använd samma e-postadress som fick inbjudan.',
    accept: 'Acceptera inbjudan',
    accepting: 'Kontrollerar inbjudan...',
    success: 'Inbjudan accepterad. Företagsportalen öppnas.',
    signInFirst: 'Logga in med den inbjudna e-postadressen. Du skickas tillbaka hit efter inloggning.',
    failed: 'Inbjudan kunde inte accepteras.',
  },
  da: {
    eyebrow: 'Virksomhedsinvitation',
    title: 'Accepter teaminvitation',
    description: 'Vi kontrollerer invitationen automatisk. Brug den samme e-mailadresse som modtog invitationen.',
    accept: 'Accepter invitation',
    accepting: 'Kontrollerer invitation...',
    success: 'Invitation accepteret. Virksomhedsportalen åbnes.',
    signInFirst: 'Log ind med den inviterede e-mailadresse. Du sendes tilbage hertil efter login.',
    failed: 'Invitationen kunne ikke accepteres.',
  },
  fi: {
    eyebrow: 'Yrityskutsu',
    title: 'Hyväksy tiimikutsu',
    description: 'Tarkistamme kutsun automaattisesti. Käytä samaa sähköpostiosoitetta, johon kutsu lähetettiin.',
    accept: 'Hyväksy kutsu',
    accepting: 'Tarkistetaan kutsua...',
    success: 'Kutsu hyväksytty. Yritysportaali avataan.',
    signInFirst: 'Kirjaudu kutsutulla sähköpostiosoitteella. Palaat sen jälkeen tähän kutsuun.',
    failed: 'Kutsua ei voitu hyväksyä.',
  },
  de: {
    eyebrow: 'Unternehmenseinladung',
    title: 'Teameinladung annehmen',
    description: 'Wir prüfen die Einladung automatisch. Verwenden Sie dieselbe E-Mail-Adresse, an die die Einladung gesendet wurde.',
    accept: 'Einladung annehmen',
    accepting: 'Einladung wird geprüft...',
    success: 'Einladung angenommen. Das Unternehmensportal wird geöffnet.',
    signInFirst: 'Melden Sie sich mit der eingeladenen E-Mail-Adresse an. Danach kommen Sie zu dieser Einladung zurück.',
    failed: 'Die Einladung konnte nicht angenommen werden.',
  },
  fr: {
    eyebrow: 'Invitation entreprise',
    title: 'Accepter l’invitation équipe',
    description: 'Nous vérifions l’invitation automatiquement. Utilisez la même adresse e-mail que celle qui a reçu l’invitation.',
    accept: 'Accepter l’invitation',
    accepting: 'Vérification de l’invitation...',
    success: 'Invitation acceptée. Ouverture du portail entreprise.',
    signInFirst: 'Connectez-vous avec l’adresse e-mail invitée. Vous reviendrez ensuite à cette invitation.',
    failed: 'L’invitation n’a pas pu être acceptée.',
  },
  es: {
    eyebrow: 'Invitación de empresa',
    title: 'Aceptar invitación de equipo',
    description: 'Comprobamos la invitación automáticamente. Usa el mismo correo que recibió la invitación.',
    accept: 'Aceptar invitación',
    accepting: 'Comprobando invitación...',
    success: 'Invitación aceptada. Abriendo el portal de empresa.',
    signInFirst: 'Inicia sesión con el correo invitado. Te devolveremos a esta invitación.',
    failed: 'No se pudo aceptar la invitación.',
  },
  it: {
    eyebrow: 'Invito aziendale',
    title: 'Accetta invito al team',
    description: 'Controlliamo l’invito automaticamente. Usa la stessa e-mail che ha ricevuto l’invito.',
    accept: 'Accetta invito',
    accepting: 'Controllo invito...',
    success: 'Invito accettato. Apertura del portale aziendale.',
    signInFirst: 'Accedi con l’e-mail invitata. Tornerai poi a questo invito.',
    failed: 'Impossibile accettare l’invito.',
  },
  nl: {
    eyebrow: 'Bedrijfsuitnodiging',
    title: 'Teamuitnodiging accepteren',
    description: 'We controleren de uitnodiging automatisch. Gebruik hetzelfde e-mailadres dat de uitnodiging ontving.',
    accept: 'Uitnodiging accepteren',
    accepting: 'Uitnodiging controleren...',
    success: 'Uitnodiging geaccepteerd. Het bedrijfsportaal wordt geopend.',
    signInFirst: 'Log in met het uitgenodigde e-mailadres. Daarna kom je terug bij deze uitnodiging.',
    failed: 'De uitnodiging kon niet worden geaccepteerd.',
  },
  pl: {
    eyebrow: 'Zaproszenie firmowe',
    title: 'Akceptuj zaproszenie do zespołu',
    description: 'Automatycznie sprawdzamy zaproszenie. Użyj tego samego adresu e-mail, na który wysłano zaproszenie.',
    accept: 'Akceptuj zaproszenie',
    accepting: 'Sprawdzanie zaproszenia...',
    success: 'Zaproszenie zaakceptowane. Otwieramy portal firmy.',
    signInFirst: 'Zaloguj się zaproszonym adresem e-mail. Wrócisz potem do tego zaproszenia.',
    failed: 'Nie udało się zaakceptować zaproszenia.',
  },
}

export default async function AcceptCompanyTeamInvitationPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const locale = await getRequestLocale()
  const params = await searchParams
  const token = String(Array.isArray(params?.token) ? params?.token[0] : params?.token || '')
  const copy = {
    ...baseCopy,
    ...(localizedCopy[translationLocale(locale as PublicLocale)] || {}),
  }

  return (
    <>
      <PublicHeader locale={locale} />
      <main className="min-h-[calc(100vh-64px)] bg-[#f6f8fb] px-5 py-12">
        <section className="mx-auto max-w-2xl rounded-[18px] border border-[#d9e2ef] bg-white p-6 shadow-[0_18px_50px_rgba(16,24,40,.055)] sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#0866ff]">{copy.eyebrow}</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-.045em] text-[#101828]">{copy.title}</h1>
          <p className="mt-3 text-sm leading-6 text-[#667085]">{copy.description}</p>
          <div className="mt-6">
            <AcceptTeamInvitation locale={locale} token={token} copy={copy} />
          </div>
        </section>
      </main>
    </>
  )
}
