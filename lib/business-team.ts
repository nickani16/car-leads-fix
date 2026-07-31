import 'server-only'

import crypto from 'node:crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { escapeEmailHtml, localizedAccountUrl, resolveEmailLocale, type EmailLocale } from '@/lib/email/localization'

export const BUSINESS_TEAM_SEAT_LIMITS = {
  free: 1,
  starter: 1,
  growth: 10,
  professional: 50,
  enterprise: 200,
} as const

export const COMPANY_TEAM_ROLES = ['admin', 'manager', 'finance', 'sales', 'staff', 'viewer'] as const
export type CompanyTeamRole = (typeof COMPANY_TEAM_ROLES)[number]

export type CompanyTeamMember = {
  userId: string
  role: string
  createdAt: string | null
  name: string
  email: string
  billingNotificationsEnabled: boolean
}

export type CompanyTeamInvitation = {
  id: string
  email: string
  role: string
  status: string
  emailStatus: string
  expiresAt: string
  createdAt: string
}

export type CompanyTeamOverview = {
  seatLimit: number
  usedSeats: number
  remainingSeats: number
  members: CompanyTeamMember[]
  invitations: CompanyTeamInvitation[]
}

export function normalizeTeamRole(value: unknown): CompanyTeamRole | null {
  const role = String(value || '').trim().toLowerCase()
  return (COMPANY_TEAM_ROLES as readonly string[]).includes(role) ? role as CompanyTeamRole : null
}

export function teamSeatLimitForPlan(planKey: string | null | undefined) {
  const key = String(planKey || 'free').toLowerCase() as keyof typeof BUSINESS_TEAM_SEAT_LIMITS
  return BUSINESS_TEAM_SEAT_LIMITS[key] || BUSINESS_TEAM_SEAT_LIMITS.free
}

export function createTeamInvitationToken() {
  const token = crypto.randomBytes(32).toString('base64url')
  return { token, tokenHash: hashTeamInvitationToken(token) }
}

export function hashTeamInvitationToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export async function getCompanyTeamOverview(
  admin: SupabaseClient,
  companyId: string,
  planKey: string | null | undefined,
): Promise<CompanyTeamOverview> {
  const [{ data: members }, { data: invitations }] = await Promise.all([
    admin
      .from('marketplace_company_members')
      .select('user_id,role,created_at,billing_notifications_enabled')
      .eq('company_id', companyId)
      .order('created_at', { ascending: true }),
    admin
      .from('marketplace_company_invitations')
      .select('id,email,role,status,email_status,expires_at,created_at')
      .eq('company_id', companyId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false }),
  ])

  const userIds = Array.from(new Set((members || []).map((member) => String(member.user_id)).filter(Boolean)))
  const { data: profiles } = userIds.length
    ? await admin
        .from('marketplace_profiles')
        .select('user_id,display_name,first_name,last_name,email')
        .in('user_id', userIds)
    : { data: [] as Array<Record<string, unknown>> }
  const profileByUser = new Map((profiles || []).map((profile) => [String(profile.user_id), profile]))

  const normalizedMembers = (members || []).map((member) => {
    const userId = String(member.user_id)
    const profile = profileByUser.get(userId)
    const name = String(
      profile?.display_name ||
      [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') ||
      'Team member',
    )
    return {
      userId,
      role: String(member.role || 'staff'),
      createdAt: member.created_at || null,
      name,
      email: String(profile?.email || ''),
      billingNotificationsEnabled: Boolean(member.billing_notifications_enabled),
    }
  })

  const normalizedInvitations = (invitations || []).map((invitation) => ({
    id: String(invitation.id),
    email: String(invitation.email),
    role: String(invitation.role || 'staff'),
    status: String(invitation.status || 'pending'),
    emailStatus: String(invitation.email_status || 'pending'),
    expiresAt: String(invitation.expires_at),
    createdAt: String(invitation.created_at),
  }))

  const seatLimit = teamSeatLimitForPlan(planKey)
  const usedSeats = normalizedMembers.length + normalizedInvitations.length
  return {
    seatLimit,
    usedSeats,
    remainingSeats: Math.max(0, seatLimit - usedSeats),
    members: normalizedMembers,
    invitations: normalizedInvitations,
  }
}

export async function sendCompanyTeamInvitationEmail(
  admin: SupabaseClient,
  input: {
    invitationId: string
    to: string
    companyName: string
    inviterName: string
    role: CompanyTeamRole
    token: string
    locale?: string | null
    countryCode?: string | null
  },
) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    await markInvitationEmail(admin, input.invitationId, 'skipped', null, 'RESEND_API_KEY_MISSING')
    return { delivered: false, reason: 'missing_provider_key' as const }
  }

  const locale = resolveEmailLocale({ locale: input.locale, countryCode: input.countryCode })
  const message = buildTeamInvitationMessage(input, locale)
  const { data, error } = await new Resend(apiKey).emails.send(
    {
      from: process.env.AUTORELL_EMAIL_FROM || 'Autorell <noreply@autorell.com>',
      to: input.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    },
    { headers: { 'Idempotency-Key': `company-team-invite-${input.invitationId}` } },
  )

  if (error) {
    await markInvitationEmail(admin, input.invitationId, 'failed', null, error.message)
    return { delivered: false, reason: error.message }
  }

  await markInvitationEmail(admin, input.invitationId, 'sent', data?.id || null, null)
  return { delivered: true, providerMessageId: data?.id || null }
}

async function markInvitationEmail(
  admin: SupabaseClient,
  invitationId: string,
  status: 'sent' | 'failed' | 'skipped',
  providerMessageId: string | null,
  errorMessage: string | null,
) {
  await admin
    .from('marketplace_company_invitations')
    .update({
      email_status: status,
      provider_message_id: providerMessageId,
      email_error: errorMessage,
      updated_at: new Date().toISOString(),
    })
    .eq('id', invitationId)
}

function buildTeamInvitationMessage(
  input: {
    to: string
    companyName: string
    inviterName: string
    role: CompanyTeamRole
    token: string
  },
  locale: EmailLocale,
) {
  const copy = teamInviteCopy(locale)
  const acceptUrl = localizedAccountUrl(`/company/team/accept?token=${encodeURIComponent(input.token)}`, locale)
  const subject = copy.subject(input.companyName)
  const body = copy.body(input.companyName, input.inviterName, roleLabel(input.role, locale))
  return {
    subject,
    text: `${copy.title}\n\n${body}\n\n${copy.cta}: ${acceptUrl}\n\nAutorell`,
    html: `<!doctype html><html><body style="margin:0;background:#f6f8fb;font-family:Arial,sans-serif;color:#101828">
      <div style="max-width:620px;margin:0 auto;padding:32px 18px">
        <div style="background:#fff;border:1px solid #d9e2ef;border-radius:16px;padding:28px">
          <p style="margin:0 0 12px;color:#0866ff;font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase">Autorell</p>
          <h1 style="margin:0 0 14px;font-size:26px;line-height:1.2">${escapeEmailHtml(copy.title)}</h1>
          <p style="margin:0 0 22px;color:#475467;line-height:1.6">${escapeEmailHtml(body)}</p>
          <a href="${acceptUrl}" style="display:inline-block;background:#0866ff;color:#fff;text-decoration:none;border-radius:10px;padding:13px 18px;font-weight:700">${escapeEmailHtml(copy.cta)}</a>
          <p style="margin:22px 0 0;color:#667085;font-size:13px;line-height:1.5">${escapeEmailHtml(copy.footer)}</p>
        </div>
      </div>
    </body></html>`,
  }
}

function teamInviteCopy(locale: EmailLocale) {
  const copies = {
    en: {
      title: 'You are invited to a company account',
      cta: 'Accept invitation',
      footer: 'Sign in or create an account using the same email address that received this invitation.',
      subject: (company: string) => `${company} invited you to Autorell`,
      body: (company: string, inviter: string, role: string) => `${inviter} invited you to ${company} on Autorell with the ${role} role.`,
    },
    sv: {
      title: 'Du är inbjuden till ett företagskonto',
      cta: 'Acceptera inbjudan',
      footer: 'Logga in eller skapa konto med samma e-postadress som inbjudan skickades till.',
      subject: (company: string) => `${company} har bjudit in dig till Autorell`,
      body: (company: string, inviter: string, role: string) => `${inviter} har bjudit in dig till ${company} på Autorell med rollen ${role}.`,
    },
    da: {
      title: 'Du er inviteret til en virksomhedskonto',
      cta: 'Acceptér invitation',
      footer: 'Log ind eller opret konto med den samme e-mailadresse, som invitationen blev sendt til.',
      subject: (company: string) => `${company} har inviteret dig til Autorell`,
      body: (company: string, inviter: string, role: string) => `${inviter} har inviteret dig til ${company} på Autorell med rollen ${role}.`,
    },
    fi: {
      title: 'Sinut on kutsuttu yritystilille',
      cta: 'Hyväksy kutsu',
      footer: 'Kirjaudu sisään tai luo tili samalla sähköpostiosoitteella, johon kutsu lähetettiin.',
      subject: (company: string) => `${company} kutsui sinut Autorelliin`,
      body: (company: string, inviter: string, role: string) => `${inviter} kutsui sinut yrityksen ${company} Autorell-tilille roolilla ${role}.`,
    },
    de: {
      title: 'Sie wurden zu einem Unternehmenskonto eingeladen',
      cta: 'Einladung annehmen',
      footer: 'Melden Sie sich an oder erstellen Sie ein Konto mit derselben E-Mail-Adresse, an die diese Einladung gesendet wurde.',
      subject: (company: string) => `${company} hat Sie zu Autorell eingeladen`,
      body: (company: string, inviter: string, role: string) => `${inviter} hat Sie zu ${company} auf Autorell mit der Rolle ${role} eingeladen.`,
    },
    fr: {
      title: 'Vous êtes invité à un compte entreprise',
      cta: 'Accepter l’invitation',
      footer: 'Connectez-vous ou créez un compte avec la même adresse e-mail que celle qui a reçu cette invitation.',
      subject: (company: string) => `${company} vous a invité sur Autorell`,
      body: (company: string, inviter: string, role: string) => `${inviter} vous a invité à rejoindre ${company} sur Autorell avec le rôle ${role}.`,
    },
    it: {
      title: 'Sei stato invitato a un account aziendale',
      cta: 'Accetta invito',
      footer: 'Accedi o crea un account usando lo stesso indirizzo e-mail che ha ricevuto questo invito.',
      subject: (company: string) => `${company} ti ha invitato su Autorell`,
      body: (company: string, inviter: string, role: string) => `${inviter} ti ha invitato a ${company} su Autorell con il ruolo ${role}.`,
    },
    es: {
      title: 'Has sido invitado a una cuenta de empresa',
      cta: 'Aceptar invitación',
      footer: 'Inicia sesión o crea una cuenta con el mismo correo electrónico que recibió esta invitación.',
      subject: (company: string) => `${company} te invitó a Autorell`,
      body: (company: string, inviter: string, role: string) => `${inviter} te invitó a ${company} en Autorell con el rol ${role}.`,
    },
    nl: {
      title: 'Je bent uitgenodigd voor een bedrijfsaccount',
      cta: 'Uitnodiging accepteren',
      footer: 'Log in of maak een account aan met hetzelfde e-mailadres waarop deze uitnodiging is ontvangen.',
      subject: (company: string) => `${company} heeft je uitgenodigd voor Autorell`,
      body: (company: string, inviter: string, role: string) => `${inviter} heeft je uitgenodigd voor ${company} op Autorell met de rol ${role}.`,
    },
    pl: {
      title: 'Zaproszono Cię do konta firmowego',
      cta: 'Akceptuj zaproszenie',
      footer: 'Zaloguj się lub utwórz konto przy użyciu tego samego adresu e-mail, na który wysłano zaproszenie.',
      subject: (company: string) => `${company} zaprasza Cię do Autorell`,
      body: (company: string, inviter: string, role: string) => `${inviter} zaprasza Cię do ${company} w Autorell z rolą ${role}.`,
    },
  }
  return copies[locale] || copies.en
}

function roleLabel(role: CompanyTeamRole, locale: EmailLocale) {
  const labels: Partial<Record<EmailLocale, Record<CompanyTeamRole, string>>> = {
    sv: { admin: 'admin', manager: 'ansvarig', finance: 'ekonomi', sales: 'säljare', staff: 'personal', viewer: 'läsbehörig' },
    da: { admin: 'admin', manager: 'manager', finance: 'økonomi', sales: 'sælger', staff: 'medarbejder', viewer: 'visning' },
    fi: { admin: 'admin', manager: 'vastuuhenkilö', finance: 'talous', sales: 'myyjä', staff: 'henkilöstö', viewer: 'katselija' },
    de: { admin: 'Admin', manager: 'Manager', finance: 'Finanzen', sales: 'Vertrieb', staff: 'Mitarbeiter', viewer: 'Leser' },
    fr: { admin: 'admin', manager: 'responsable', finance: 'finance', sales: 'ventes', staff: 'personnel', viewer: 'lecture' },
    it: { admin: 'admin', manager: 'responsabile', finance: 'finanza', sales: 'vendite', staff: 'staff', viewer: 'lettore' },
    es: { admin: 'admin', manager: 'responsable', finance: 'finanzas', sales: 'ventas', staff: 'personal', viewer: 'lectura' },
    nl: { admin: 'admin', manager: 'manager', finance: 'financiën', sales: 'verkoop', staff: 'medewerker', viewer: 'lezer' },
    pl: { admin: 'admin', manager: 'menedżer', finance: 'finanse', sales: 'sprzedaż', staff: 'pracownik', viewer: 'podgląd' },
  }
  return labels[locale]?.[role] || role
}
