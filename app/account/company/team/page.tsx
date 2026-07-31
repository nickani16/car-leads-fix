import { Mail, Users } from 'lucide-react'
import { CompanyPortalShell, LockedFeature, getCompanyPortalContext, planAllows } from '@/lib/company-portal'
import { translationLocale, type PublicLocale } from '@/lib/public-i18n'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCompanyTeamOverview } from '@/lib/business-team'
import { generateAccountMetadata } from '@/lib/account-seo'
import TeamInviteForm from './TeamInviteForm'
import TeamBillingRecipientToggle from './TeamBillingRecipientToggle'
import TeamMemberActions from './TeamMemberActions'

export const generateMetadata = generateAccountMetadata('company-team')

const baseCopy = {
  title: 'Team',
  description: 'Invite people to the company account and control access for listings, analytics and billing.',
  lockedText: 'Team accounts are available from Growth. Free and Starter remain limited to the account owner.',
  inviteTitle: 'Invite a team member',
  inviteText: 'The invitation is tied to the company account, email address and role. Plan limits and available seats are checked before access is granted.',
  membersTitle: 'Team members',
  membersText: 'No additional team members are connected yet. The account owner still has access.',
  pendingTitle: 'Pending invitations',
  seats: 'Seats',
  used: 'used',
  emailPlaceholder: 'name@company.com',
  role: 'Role',
  sendInvite: 'Send invitation',
  sending: 'Sending...',
  sent: 'Invitation sent.',
  invitationError: 'Invitation could not be sent.',
  billingRecipient: 'Receives invoices',
  billingRecipientOn: 'On',
  billingRecipientOff: 'Off',
  billingRecipientError: 'Invoice recipient could not be saved.',
  removeMember: 'Remove access',
  removingMember: 'Removing...',
  removeMemberConfirm: 'Remove this person from the company account? They will lose access to the company portal, branches and shared listings.',
  removeMemberError: 'The team member could not be removed.',
  flowTitle: 'How invitations work',
  flowSteps: [
    'Send the invitation to the exact email address the person will use to sign in.',
    'The person opens the email, signs in or creates an account with the same email address, and accepts the invitation.',
    'Autorell connects the person to this company account and opens the company portal.',
  ],
  roleLabels: {
    admin: 'Admin',
    manager: 'Manager',
    finance: 'Finance',
    sales: 'Sales',
    staff: 'Staff',
    viewer: 'Viewer',
  },
}

type TeamPageCopy = typeof baseCopy

const localizedCopy: Partial<Record<ReturnType<typeof translationLocale>, Partial<TeamPageCopy>>> = {
  sv: {
    title: 'Team',
    description: 'Bjud in personer till företagskontot och styr åtkomst för annonser, analys och fakturering.',
    lockedText: 'Teamkonton ingår från Growth. Free och Starter är begränsade till kontoägaren.',
    inviteTitle: 'Bjud in teammedlem',
    inviteText: 'Inbjudan kopplas till företagskontot, e-postadressen och rollen. Planbegränsningar och lediga platser kontrolleras innan åtkomst ges.',
    membersTitle: 'Teammedlemmar',
    membersText: 'Inga extra teammedlemmar är anslutna ännu. Kontoägaren har fortsatt åtkomst.',
    pendingTitle: 'Väntande inbjudningar',
    seats: 'Platser',
    used: 'använda',
    role: 'Roll',
    sendInvite: 'Skicka inbjudan',
    sending: 'Skickar...',
    sent: 'Inbjudan skickad.',
    invitationError: 'Inbjudan kunde inte skickas.',
    billingRecipient: 'Tar emot fakturor',
    billingRecipientOn: 'På',
    billingRecipientOff: 'Av',
    billingRecipientError: 'Fakturamottagaren kunde inte sparas.',
    removeMember: 'Ta bort åtkomst',
    removingMember: 'Tar bort...',
    removeMemberConfirm: 'Ta bort personen från företagskontot? Personen förlorar åtkomst till företagsportalen, filialer och delade annonser.',
    removeMemberError: 'Teammedlemmen kunde inte tas bort.',
    flowTitle: 'Så fungerar inbjudan',
    flowSteps: [
      'Skicka inbjudan till exakt den e-postadress personen ska använda vid inloggning.',
      'Personen öppnar mejlet, loggar in eller skapar konto med samma e-postadress och accepterar inbjudan.',
      'Autorell kopplar personen till företagskontot och öppnar företagsportalen.',
    ],
    roleLabels: { admin: 'Admin', manager: 'Ansvarig', finance: 'Ekonomi', sales: 'Säljare', staff: 'Personal', viewer: 'Läsbehörig' },
  },
  da: {
    title: 'Team',
    description: 'Inviter personer til virksomhedskontoen og styr adgang til annoncer, analyse og fakturering.',
    lockedText: 'Teamkonti er tilgængelige fra Growth. Free og Starter er begrænset til kontoejeren.',
    inviteTitle: 'Inviter teammedlem',
    inviteText: 'Invitationen knyttes til virksomhedskonto, e-mailadresse og rolle. Planbegrænsninger og ledige pladser kontrolleres før adgang gives.',
    membersTitle: 'Teammedlemmer',
    membersText: 'Der er endnu ingen ekstra teammedlemmer. Kontoejeren har fortsat adgang.',
    pendingTitle: 'Afventende invitationer',
    seats: 'Pladser',
    used: 'brugt',
    role: 'Rolle',
    sendInvite: 'Send invitation',
    sending: 'Sender...',
    sent: 'Invitation sendt.',
    billingRecipient: 'Modtager fakturaer',
    billingRecipientOn: 'Til',
    billingRecipientOff: 'Fra',
    billingRecipientError: 'Fakturamodtageren kunne ikke gemmes.',
    removeMember: 'Fjern adgang',
    removingMember: 'Fjerner...',
    removeMemberConfirm: 'Fjern personen fra virksomhedskontoen? Personen mister adgang til virksomhedsportal, filialer og delte annoncer.',
    removeMemberError: 'Teammedlemmet kunne ikke fjernes.',
    flowTitle: 'Sådan fungerer invitationen',
    flowSteps: [
      'Send invitationen til præcis den e-mailadresse personen skal bruge til login.',
      'Personen åbner mailen, logger ind eller opretter konto med samme e-mail og accepterer invitationen.',
      'Autorell knytter personen til virksomhedskontoen og åbner virksomhedsportalen.',
    ],
    roleLabels: { admin: 'Admin', manager: 'Manager', finance: 'Økonomi', sales: 'Sælger', staff: 'Medarbejder', viewer: 'Visning' },
  },
  fi: {
    title: 'Tiimi',
    description: 'Kutsu henkilöitä yritystilille ja hallitse pääsyä ilmoituksiin, analytiikkaan ja laskutukseen.',
    lockedText: 'Tiimitilit sisältyvät Growth-paketista alkaen. Free ja Starter ovat vain tilin omistajalle.',
    inviteTitle: 'Kutsu tiimin jäsen',
    inviteText: 'Kutsu liitetään yritystiliin, sähköpostiosoitteeseen ja rooliin. Paketin rajat ja vapaat paikat tarkistetaan ennen käyttöoikeutta.',
    membersTitle: 'Tiimin jäsenet',
    membersText: 'Muita tiimin jäseniä ei ole vielä liitetty. Tilin omistajan käyttöoikeus pysyy aktiivisena.',
    pendingTitle: 'Odottavat kutsut',
    seats: 'Paikat',
    used: 'käytössä',
    role: 'Rooli',
    sendInvite: 'Lähetä kutsu',
    sending: 'Lähetetään...',
    sent: 'Kutsu lähetetty.',
    billingRecipient: 'Vastaanottaa laskut',
    billingRecipientOn: 'Päällä',
    billingRecipientOff: 'Pois',
    billingRecipientError: 'Laskun vastaanottajaa ei voitu tallentaa.',
    removeMember: 'Poista pääsy',
    removingMember: 'Poistetaan...',
    removeMemberConfirm: 'Poistetaanko henkilö yritystililtä? Hän menettää pääsyn yritysportaaliin, toimipisteisiin ja jaettuihin ilmoituksiin.',
    removeMemberError: 'Tiimin jäsentä ei voitu poistaa.',
    flowTitle: 'Näin kutsu toimii',
    flowSteps: [
      'Lähetä kutsu täsmälleen siihen sähköpostiin, jolla henkilö kirjautuu sisään.',
      'Henkilö avaa sähköpostin, kirjautuu sisään tai luo tilin samalla sähköpostilla ja hyväksyy kutsun.',
      'Autorell liittää henkilön yritystiliin ja avaa yritysportaalin.',
    ],
    roleLabels: { admin: 'Admin', manager: 'Vastuuhenkilö', finance: 'Talous', sales: 'Myyjä', staff: 'Henkilöstö', viewer: 'Katselija' },
  },
  de: {
    title: 'Team',
    description: 'Laden Sie Personen in das Unternehmenskonto ein und steuern Sie Zugriff auf Anzeigen, Analysen und Abrechnung.',
    lockedText: 'Teamkonten sind ab Growth verfügbar. Free und Starter bleiben auf den Kontoinhaber begrenzt.',
    inviteTitle: 'Teammitglied einladen',
    inviteText: 'Die Einladung wird mit Unternehmenskonto, E-Mail-Adresse und Rolle verbunden. Planlimits und freie Sitzplätze werden vor dem Zugriff geprüft.',
    membersTitle: 'Teammitglieder',
    membersText: 'Es sind noch keine weiteren Teammitglieder verbunden. Der Kontoinhaber bleibt aktiv.',
    pendingTitle: 'Ausstehende Einladungen',
    seats: 'Sitzplätze',
    used: 'verwendet',
    role: 'Rolle',
    sendInvite: 'Einladung senden',
    sending: 'Wird gesendet...',
    sent: 'Einladung gesendet.',
    billingRecipient: 'Erhält Rechnungen',
    billingRecipientOn: 'Ein',
    billingRecipientOff: 'Aus',
    billingRecipientError: 'Rechnungsempfänger konnte nicht gespeichert werden.',
    removeMember: 'Zugriff entfernen',
    removingMember: 'Wird entfernt...',
    removeMemberConfirm: 'Diese Person aus dem Unternehmenskonto entfernen? Sie verliert Zugriff auf Unternehmensportal, Standorte und geteilte Anzeigen.',
    removeMemberError: 'Das Teammitglied konnte nicht entfernt werden.',
    flowTitle: 'So funktioniert die Einladung',
    flowSteps: [
      'Senden Sie die Einladung an genau die E-Mail-Adresse, mit der sich die Person anmeldet.',
      'Die Person öffnet die E-Mail, meldet sich an oder erstellt ein Konto mit derselben E-Mail und akzeptiert die Einladung.',
      'Autorell verbindet die Person mit dem Unternehmenskonto und öffnet das Unternehmensportal.',
    ],
    roleLabels: { admin: 'Admin', manager: 'Manager', finance: 'Finanzen', sales: 'Vertrieb', staff: 'Mitarbeiter', viewer: 'Leser' },
  },
  fr: {
    title: 'Équipe',
    description: 'Invitez des personnes au compte entreprise et gérez l’accès aux annonces, aux analyses et à la facturation.',
    lockedText: 'Les comptes d’équipe sont disponibles à partir de Growth. Free et Starter restent limités au propriétaire du compte.',
    inviteTitle: 'Inviter un membre',
    inviteText: 'L’invitation est liée au compte entreprise, à l’adresse e-mail et au rôle. Le plan et les places disponibles sont vérifiés avant l’accès.',
    membersTitle: 'Membres de l’équipe',
    membersText: 'Aucun membre supplémentaire n’est encore connecté. Le propriétaire du compte conserve l’accès.',
    pendingTitle: 'Invitations en attente',
    seats: 'Places',
    used: 'utilisées',
    role: 'Rôle',
    sendInvite: 'Envoyer l’invitation',
    sending: 'Envoi...',
    sent: 'Invitation envoyée.',
    billingRecipient: 'Reçoit les factures',
    billingRecipientOn: 'Oui',
    billingRecipientOff: 'Non',
    billingRecipientError: 'Le destinataire des factures n’a pas pu être enregistré.',
    removeMember: 'Retirer l’accès',
    removingMember: 'Suppression...',
    removeMemberConfirm: 'Retirer cette personne du compte entreprise ? Elle perdra l’accès au portail, aux sites et aux annonces partagées.',
    removeMemberError: 'Le membre de l’équipe n’a pas pu être retiré.',
    flowTitle: 'Fonctionnement de l’invitation',
    flowSteps: [
      'Envoyez l’invitation à l’adresse e-mail exacte que la personne utilisera pour se connecter.',
      'La personne ouvre l’e-mail, se connecte ou crée un compte avec cette même adresse, puis accepte l’invitation.',
      'Autorell relie la personne au compte entreprise et ouvre le portail entreprise.',
    ],
    roleLabels: { admin: 'Admin', manager: 'Responsable', finance: 'Finance', sales: 'Ventes', staff: 'Personnel', viewer: 'Lecture' },
  },
  es: {
    title: 'Equipo',
    description: 'Invita personas a la cuenta de empresa y controla el acceso a anuncios, analítica y facturación.',
    lockedText: 'Las cuentas de equipo están disponibles desde Growth. Free y Starter se limitan al propietario de la cuenta.',
    inviteTitle: 'Invitar miembro del equipo',
    inviteText: 'La invitación se vincula a la cuenta de empresa, el correo y el rol. El plan y las plazas disponibles se comprueban antes de dar acceso.',
    membersTitle: 'Miembros del equipo',
    membersText: 'Aún no hay miembros adicionales conectados. El propietario mantiene el acceso.',
    pendingTitle: 'Invitaciones pendientes',
    seats: 'Plazas',
    used: 'usadas',
    role: 'Rol',
    sendInvite: 'Enviar invitación',
    sending: 'Enviando...',
    sent: 'Invitación enviada.',
    billingRecipient: 'Recibe facturas',
    billingRecipientOn: 'Sí',
    billingRecipientOff: 'No',
    billingRecipientError: 'No se pudo guardar el destinatario de facturas.',
    removeMember: 'Quitar acceso',
    removingMember: 'Quitando...',
    removeMemberConfirm: '¿Quitar a esta persona de la cuenta de empresa? Perderá acceso al portal, ubicaciones y anuncios compartidos.',
    removeMemberError: 'No se pudo quitar el miembro del equipo.',
    flowTitle: 'Cómo funciona la invitación',
    flowSteps: [
      'Envía la invitación exactamente al correo que la persona usará para iniciar sesión.',
      'La persona abre el correo, inicia sesión o crea una cuenta con ese mismo correo y acepta la invitación.',
      'Autorell conecta a la persona con la cuenta de empresa y abre el portal de empresa.',
    ],
    roleLabels: { admin: 'Admin', manager: 'Responsable', finance: 'Finanzas', sales: 'Ventas', staff: 'Personal', viewer: 'Lectura' },
  },
  it: {
    title: 'Team',
    description: 'Invita persone all’account aziendale e gestisci accesso ad annunci, analisi e fatturazione.',
    lockedText: 'Gli account team sono disponibili da Growth. Free e Starter restano limitati al proprietario dell’account.',
    inviteTitle: 'Invita membro del team',
    inviteText: 'L’invito viene collegato all’account aziendale, all’e-mail e al ruolo. Piano e posti disponibili vengono controllati prima dell’accesso.',
    membersTitle: 'Membri del team',
    membersText: 'Non ci sono ancora membri aggiuntivi. L’accesso del proprietario resta attivo.',
    pendingTitle: 'Inviti in sospeso',
    seats: 'Posti',
    used: 'usati',
    role: 'Ruolo',
    sendInvite: 'Invia invito',
    sending: 'Invio...',
    sent: 'Invito inviato.',
    billingRecipient: 'Riceve fatture',
    billingRecipientOn: 'Attivo',
    billingRecipientOff: 'Disattivo',
    billingRecipientError: 'Il destinatario delle fatture non è stato salvato.',
    removeMember: 'Rimuovi accesso',
    removingMember: 'Rimozione...',
    removeMemberConfirm: 'Rimuovere questa persona dall’account aziendale? Perderà accesso al portale, alle sedi e agli annunci condivisi.',
    removeMemberError: 'Impossibile rimuovere il membro del team.',
    flowTitle: 'Come funziona l’invito',
    flowSteps: [
      'Invia l’invito all’indirizzo e-mail esatto che la persona userà per accedere.',
      'La persona apre l’e-mail, accede o crea un account con la stessa e-mail e accetta l’invito.',
      'Autorell collega la persona all’account aziendale e apre il portale aziendale.',
    ],
    roleLabels: { admin: 'Admin', manager: 'Responsabile', finance: 'Finanza', sales: 'Vendite', staff: 'Staff', viewer: 'Lettore' },
  },
  nl: {
    title: 'Team',
    description: 'Nodig mensen uit voor het bedrijfsaccount en beheer toegang tot advertenties, analyse en facturatie.',
    lockedText: 'Teamaccounts zijn beschikbaar vanaf Growth. Free en Starter blijven beperkt tot de accounteigenaar.',
    inviteTitle: 'Teamlid uitnodigen',
    inviteText: 'De uitnodiging wordt gekoppeld aan het bedrijfsaccount, e-mailadres en rol. Planlimieten en beschikbare plaatsen worden gecontroleerd voordat toegang wordt gegeven.',
    membersTitle: 'Teamleden',
    membersText: 'Er zijn nog geen extra teamleden gekoppeld. De accounteigenaar houdt toegang.',
    pendingTitle: 'Openstaande uitnodigingen',
    seats: 'Plaatsen',
    used: 'gebruikt',
    role: 'Rol',
    sendInvite: 'Uitnodiging sturen',
    sending: 'Versturen...',
    sent: 'Uitnodiging verstuurd.',
    billingRecipient: 'Ontvangt facturen',
    billingRecipientOn: 'Aan',
    billingRecipientOff: 'Uit',
    billingRecipientError: 'Factuurontvanger kon niet worden opgeslagen.',
    removeMember: 'Toegang verwijderen',
    removingMember: 'Verwijderen...',
    removeMemberConfirm: 'Deze persoon uit het bedrijfsaccount verwijderen? De persoon verliest toegang tot het bedrijfsportaal, locaties en gedeelde advertenties.',
    removeMemberError: 'Het teamlid kon niet worden verwijderd.',
    flowTitle: 'Zo werkt de uitnodiging',
    flowSteps: [
      'Stuur de uitnodiging naar exact het e-mailadres waarmee de persoon inlogt.',
      'De persoon opent de e-mail, logt in of maakt een account met hetzelfde e-mailadres en accepteert de uitnodiging.',
      'Autorell koppelt de persoon aan het bedrijfsaccount en opent het bedrijfsportaal.',
    ],
    roleLabels: { admin: 'Admin', manager: 'Manager', finance: 'Financiën', sales: 'Verkoop', staff: 'Medewerker', viewer: 'Lezer' },
  },
  pl: {
    title: 'Zespół',
    description: 'Zaproś osoby do konta firmowego i zarządzaj dostępem do ogłoszeń, analityki i faktur.',
    lockedText: 'Konta zespołowe są dostępne od planu Growth. Free i Starter są ograniczone do właściciela konta.',
    inviteTitle: 'Zaproś członka zespołu',
    inviteText: 'Zaproszenie jest powiązane z kontem firmy, adresem e-mail i rolą. Limity planu i dostępne miejsca są sprawdzane przed przyznaniem dostępu.',
    membersTitle: 'Członkowie zespołu',
    membersText: 'Nie ma jeszcze dodatkowych członków zespołu. Właściciel konta nadal ma dostęp.',
    pendingTitle: 'Oczekujące zaproszenia',
    seats: 'Miejsca',
    used: 'użyte',
    role: 'Rola',
    sendInvite: 'Wyślij zaproszenie',
    sending: 'Wysyłanie...',
    sent: 'Zaproszenie wysłane.',
    billingRecipient: 'Otrzymuje faktury',
    billingRecipientOn: 'Wł.',
    billingRecipientOff: 'Wył.',
    billingRecipientError: 'Nie udało się zapisać odbiorcy faktur.',
    removeMember: 'Usuń dostęp',
    removingMember: 'Usuwanie...',
    removeMemberConfirm: 'Usunąć tę osobę z konta firmowego? Straci dostęp do portalu firmy, lokalizacji i wspólnych ogłoszeń.',
    removeMemberError: 'Nie udało się usunąć członka zespołu.',
    flowTitle: 'Jak działa zaproszenie',
    flowSteps: [
      'Wyślij zaproszenie na dokładnie ten adres e-mail, którego osoba użyje do logowania.',
      'Osoba otwiera e-mail, loguje się lub tworzy konto z tym samym adresem i akceptuje zaproszenie.',
      'Autorell łączy osobę z kontem firmowym i otwiera portal firmy.',
    ],
    roleLabels: { admin: 'Admin', manager: 'Menedżer', finance: 'Finanse', sales: 'Sprzedaż', staff: 'Pracownik', viewer: 'Podgląd' },
  },
}

function roleLabel(copy: TeamPageCopy, role: string) {
  return (copy.roleLabels as Record<string, string>)[role] || role
}

export default async function CompanyTeamPage({ localeOverride }: { localeOverride?: PublicLocale } = {}) {
  const context = await getCompanyPortalContext(localeOverride)
  const copy = {
    ...baseCopy,
    ...(localizedCopy[translationLocale(context.locale)] || {}),
  }
  const plan = String(context.subscription?.plan_key || 'free')
  if (!planAllows(plan, 'growth')) {
    return (
      <CompanyPortalShell context={context} active="team" title={copy.title} description={copy.description}>
        <LockedFeature locale={context.locale} requiredPlan="Growth" text={copy.lockedText} />
      </CompanyPortalShell>
    )
  }
  const team = context.profile.company_id
    ? await getCompanyTeamOverview(createAdminClient(), context.profile.company_id, plan)
    : null

  return (
    <CompanyPortalShell context={context} active="team" title={copy.title} description={copy.description}>
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <section className="rounded-[16px] border border-[#d9e2ef] bg-white p-6 shadow-[0_18px_50px_rgba(16,24,40,.045)]">
          <div className="grid h-11 w-11 place-items-center rounded-[13px] bg-[#eef5ff] text-[#0866ff]"><Mail className="h-5 w-5" /></div>
          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-[-.025em] text-[#101828]">{copy.inviteTitle}</h2>
              <p className="mt-2 text-sm leading-6 text-[#667085]">{copy.inviteText}</p>
            </div>
            {team ? (
              <div className="rounded-[12px] border border-[#d9e2ef] bg-[#f8fbff] px-4 py-3 text-sm font-semibold text-[#344054]">
                {copy.seats}: {team.usedSeats}/{team.seatLimit} {copy.used}
              </div>
            ) : null}
          </div>
          <TeamInviteForm copy={copy} locale={context.locale} />
        </section>
        <section className="rounded-[16px] border border-[#d9e2ef] bg-white p-6 shadow-[0_18px_50px_rgba(16,24,40,.045)]">
          <div className="grid h-11 w-11 place-items-center rounded-[13px] bg-[#eef5ff] text-[#0866ff]"><Users className="h-5 w-5" /></div>
          <h2 className="mt-4 text-xl font-semibold tracking-[-.025em] text-[#101828]">{copy.membersTitle}</h2>
          {team?.members.length ? (
            <div className="mt-4 grid gap-3">
              {team.members.map((member) => (
                <div key={member.userId} className="rounded-[12px] border border-[#e5ebf3] px-4 py-3">
                  <p className="text-sm font-bold text-[#101828]">{member.name}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[.12em] text-[#667085]">{roleLabel(copy, member.role)}</p>
                  {member.email ? <p className="mt-1 truncate text-sm text-[#667085]">{member.email}</p> : null}
                  {member.email ? (
                    <TeamBillingRecipientToggle
                      userId={member.userId}
                      enabled={member.billingNotificationsEnabled}
                      locale={context.locale}
                      copy={copy}
                    />
                  ) : null}
                  {member.userId !== context.userId ? (
                    <TeamMemberActions userId={member.userId} locale={context.locale} copy={copy} />
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm leading-6 text-[#667085]">{copy.membersText}</p>
          )}
        </section>
      </div>

      {team?.invitations.length ? (
        <section className="mt-4 rounded-[16px] border border-[#d9e2ef] bg-white p-6 shadow-[0_18px_50px_rgba(16,24,40,.045)]">
          <h2 className="text-xl font-semibold tracking-[-.025em] text-[#101828]">{copy.pendingTitle}</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {team.invitations.map((invitation) => (
              <div key={invitation.id} className="rounded-[12px] border border-[#e5ebf3] px-4 py-3">
                <p className="truncate text-sm font-bold text-[#101828]">{invitation.email}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[.12em] text-[#667085]">{roleLabel(copy, invitation.role)} · {invitation.emailStatus}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-4 rounded-[16px] border border-[#d9e2ef] bg-white p-6 shadow-[0_18px_50px_rgba(16,24,40,.045)]">
        <h2 className="text-xl font-semibold tracking-[-.025em] text-[#101828]">{copy.flowTitle}</h2>
        <ol className="mt-4 grid gap-3 md:grid-cols-3">
          {copy.flowSteps.map((step, index) => (
            <li key={step} className="rounded-[14px] border border-[#e5ebf3] bg-[#f8fbff] p-4 text-sm leading-6 text-[#475467]">
              <span className="mb-3 grid h-8 w-8 place-items-center rounded-full bg-[#0866ff] text-xs font-bold text-white">{index + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </section>
    </CompanyPortalShell>
  )
}
