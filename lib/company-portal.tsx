import 'server-only'

import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  BarChart3,
  Building2,
  CreditCard,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  LayoutDashboard,
  Lock,
  MapPin,
  Plus,
  RefreshCw,
  Settings,
  Upload,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { getRequestLocale } from '@/lib/request-locale'
import { localizePublicHref, translatePublicObject, translationLocale, type PublicLocale } from '@/lib/public-i18n'
import { getAccountListingSummary, type AccountListingSummary } from '@/lib/account-listings-management'
import { resolveBusinessAccountScope } from '@/lib/billing/business-account-scope'
import { AccountBreadcrumbs, type AccountCrumbKey } from '@/app/account/AccountBreadcrumbs'
import AccountLogoutButton from '@/app/konto/AccountLogoutButton'
import { getAccountCopy } from '@/lib/account-i18n'
import { isBusinessFeatureEnabled } from '@/lib/business-feature-flags'

export type CompanyPortalContext = {
  locale: PublicLocale
  userId: string
  profile: {
    company_name: string | null
    email: string | null
    company_id: string | null
    country_code: string | null
    business_verification_status: string | null
    business_onboarding_status: string | null
  }
  subscription: {
    plan_key: string | null
    status: string | null
    payment_status: string | null
    active_listing_limit: number | null
    next_billing_at: string | null
    current_period_end: string | null
    cancel_at_period_end: boolean | null
    cancellation_effective_at: string | null
  } | null
  listingSummary: AccountListingSummary
  listingOwnerUserIds: string[]
  inventoryImportEnabled: boolean
}

export type CompanyPortalPageKey =
  | 'overview'
  | 'listings'
  | 'create'
  | 'import'
  | 'inventory'
  | 'analytics'
  | 'locations'
  | 'team'
  | 'subscription'
  | 'profile'
  | 'settings'
  | 'support'

const baseCopy = {
  portal: 'Company portal',
  overview: 'Overview',
  listings: 'Listings',
  create: 'Create listing',
  import: 'Import listings',
  inventory: 'Inventory connection',
  analytics: 'Analytics',
  locations: 'Locations',
  team: 'Team',
  subscription: 'Subscription and billing',
  profile: 'Company profile',
  settings: 'Settings',
  support: 'Support',
  locked: 'Locked',
  requires: 'Requires',
  upgrade: 'Upgrade plan',
}

const localeCopy: Partial<Record<ReturnType<typeof translationLocale>, Partial<typeof baseCopy>>> = {
  sv: {
    portal: 'Företagsportal',
    overview: 'Översikt',
    listings: 'Annonser',
    create: 'Skapa annons',
    import: 'Importera annonser',
    inventory: 'Lageranslutning',
    analytics: 'Analys',
    locations: 'Filialer',
    team: 'Team',
    subscription: 'Prenumeration och betalning',
    profile: 'Företagsprofil',
    settings: 'Inställningar',
    support: 'Hjälp',
    locked: 'Låst',
    requires: 'Kräver',
    upgrade: 'Uppgradera plan',
  },
  de: {
    portal: 'Unternehmensportal',
    overview: 'Übersicht',
    listings: 'Anzeigen',
    create: 'Anzeige erstellen',
    import: 'Anzeigen importieren',
    inventory: 'Bestandsanbindung',
    analytics: 'Analysen',
    locations: 'Standorte',
    team: 'Team',
    subscription: 'Abo und Abrechnung',
    profile: 'Unternehmensprofil',
    settings: 'Einstellungen',
    support: 'Support',
    locked: 'Gesperrt',
    requires: 'Erfordert',
    upgrade: 'Plan upgraden',
  },
  fr: {
    portal: 'Portail entreprise',
    overview: 'Vue d’ensemble',
    listings: 'Annonces',
    create: 'Créer une annonce',
    import: 'Importer des annonces',
    inventory: 'Connexion du stock',
    analytics: 'Analyses',
    locations: 'Sites',
    team: 'Équipe',
    subscription: 'Abonnement et facturation',
    profile: 'Profil entreprise',
    settings: 'Paramètres',
    support: 'Support',
    locked: 'Verrouillé',
    requires: 'Nécessite',
    upgrade: 'Changer de plan',
  },
  es: {
    portal: 'Portal de empresa',
    overview: 'Resumen',
    listings: 'Anuncios',
    create: 'Crear anuncio',
    import: 'Importar anuncios',
    inventory: 'Conexión de inventario',
    analytics: 'Analítica',
    locations: 'Ubicaciones',
    team: 'Equipo',
    subscription: 'Suscripción y facturación',
    profile: 'Perfil de empresa',
    settings: 'Configuración',
    support: 'Soporte',
    locked: 'Bloqueado',
    requires: 'Requiere',
    upgrade: 'Mejorar plan',
  },
  it: {
    portal: 'Portale aziendale',
    overview: 'Panoramica',
    listings: 'Annunci',
    create: 'Crea annuncio',
    import: 'Importa annunci',
    inventory: 'Collegamento inventario',
    analytics: 'Analisi',
    locations: 'Sedi',
    team: 'Team',
    subscription: 'Abbonamento e fatturazione',
    profile: 'Profilo aziendale',
    settings: 'Impostazioni',
    support: 'Supporto',
    locked: 'Bloccato',
    requires: 'Richiede',
    upgrade: 'Aggiorna piano',
  },
  nl: {
    portal: 'Bedrijfsportaal',
    overview: 'Overzicht',
    listings: 'Advertenties',
    create: 'Advertentie maken',
    import: 'Advertenties importeren',
    inventory: 'Voorraadkoppeling',
    analytics: 'Analyse',
    locations: 'Locaties',
    team: 'Team',
    subscription: 'Abonnement en facturatie',
    profile: 'Bedrijfsprofiel',
    settings: 'Instellingen',
    support: 'Support',
    locked: 'Vergrendeld',
    requires: 'Vereist',
    upgrade: 'Plan upgraden',
  },
  fi: {
    portal: 'Yritysportaali',
    overview: 'Yleiskatsaus',
    listings: 'Ilmoitukset',
    create: 'Luo ilmoitus',
    import: 'Tuo ilmoituksia',
    inventory: 'Varastoyhteys',
    analytics: 'Analytiikka',
    locations: 'Toimipisteet',
    team: 'Tiimi',
    subscription: 'Tilaus ja laskutus',
    profile: 'Yritysprofiili',
    settings: 'Asetukset',
    support: 'Tuki',
    locked: 'Lukittu',
    requires: 'Vaatii',
    upgrade: 'Päivitä paketti',
  },
  da: {
    portal: 'Virksomhedsportal',
    overview: 'Oversigt',
    listings: 'Annoncer',
    create: 'Opret annonce',
    import: 'Importér annoncer',
    inventory: 'Lagerforbindelse',
    analytics: 'Analyse',
    locations: 'Lokationer',
    team: 'Team',
    subscription: 'Abonnement og fakturering',
    profile: 'Virksomhedsprofil',
    settings: 'Indstillinger',
    support: 'Support',
    locked: 'Låst',
    requires: 'Kræver',
    upgrade: 'Opgrader plan',
  },
  pl: {
    portal: 'Portal firmowy',
    overview: 'Przegląd',
    listings: 'Ogłoszenia',
    create: 'Utwórz ogłoszenie',
    import: 'Importuj ogłoszenia',
    inventory: 'Połączenie zapasów',
    analytics: 'Analityka',
    locations: 'Lokalizacje',
    team: 'Zespół',
    subscription: 'Subskrypcja i płatności',
    profile: 'Profil firmy',
    settings: 'Ustawienia',
    support: 'Wsparcie',
    locked: 'Zablokowane',
    requires: 'Wymaga',
    upgrade: 'Ulepsz plan',
  },
}

function getCompanyPortalCopy(locale: PublicLocale) {
  return {
    ...translatePublicObject(locale, baseCopy),
    ...(localeCopy[translationLocale(locale)] || {}),
  } as typeof baseCopy
}

const navigation: Array<{ key: CompanyPortalPageKey; href: string; icon: LucideIcon; requiredPlan?: string }> = [
  { key: 'overview', href: '/account/company', icon: LayoutDashboard },
  { key: 'listings', href: '/account/company/listings', icon: FileText },
  { key: 'create', href: '/account/company/listings/create', icon: Plus },
  { key: 'import', href: '/account/company/import', icon: Upload },
  { key: 'inventory', href: '/account/company/inventory', icon: RefreshCw },
  { key: 'analytics', href: '/account/company/analytics', icon: BarChart3 },
  { key: 'locations', href: '/account/company/locations', icon: MapPin },
  { key: 'team', href: '/account/company/team', icon: Users, requiredPlan: 'Growth' },
  { key: 'subscription', href: '/account/company/subscription', icon: CreditCard },
  { key: 'profile', href: '/account/company/profile', icon: Building2 },
  { key: 'settings', href: '/account/company/settings', icon: Settings },
  { key: 'support', href: '/account/company/support', icon: HelpCircle },
]

const companyBreadcrumbKey: Record<CompanyPortalPageKey, AccountCrumbKey> = {
  overview: 'companyAccount',
  listings: 'companyListings',
  create: 'companyListingCreate',
  import: 'companyImport',
  inventory: 'companyInventory',
  analytics: 'companyAnalytics',
  locations: 'companyLocations',
  team: 'companyTeam',
  subscription: 'companySubscription',
  profile: 'companyProfile',
  settings: 'settings',
  support: 'support',
}

export async function getCompanyPortalContext(localeOverride?: PublicLocale): Promise<CompanyPortalContext> {
  const locale = localeOverride || await getRequestLocale()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(localizePublicHref(locale, '/login'))

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('marketplace_profiles')
    .select('account_type,company_id,company_name,email,country_code,business_verification_status,business_onboarding_status')
    .eq('user_id', user.id)
    .maybeSingle()

  if (profile?.account_type !== 'business') redirect(localizePublicHref(locale, '/account'))

  const scope = await resolveBusinessAccountScope(user.id, admin)
  const [{ data: subscription }, listingSummary, { data: pilot }] = await Promise.all([
    admin
      .from('business_subscriptions')
      .select('plan_key,status,payment_status,active_listing_limit,next_billing_at,current_period_end,cancel_at_period_end,cancellation_effective_at')
      .eq('user_id', scope.subscriptionUserId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    getAccountListingSummary(admin, scope.listingOwnerUserIds).catch(() => ({
      counts: { all: 0, active: 0, payment: 0, review: 0, draft: 0, paused: 0, expired: 0, sold: 0, deleted: 0 },
      totalViews: 0,
      totalFavorites: 0,
      missingImages: 0,
      firstMissingImageId: null,
      flagged: 0,
      expiringSoon: 0,
      failedPayments: 0,
      categories: [],
      countries: [],
    })),
    profile.company_id
      ? admin
          .from('business_pilot_programs')
          .select('id')
          .eq('organization_id', profile.company_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  const inventoryImportEnabled = Boolean(profile.company_id) && await isBusinessFeatureEnabled(
    'dealer_inventory_import',
    {
      organizationId: profile.company_id,
      pilotProgramId: pilot?.id || null,
      marketCode: profile.country_code,
    },
  )

  return {
    locale,
    userId: user.id,
    profile,
    subscription: subscription || null,
    listingSummary,
    listingOwnerUserIds: scope.listingOwnerUserIds,
    inventoryImportEnabled,
  }
}

export function CompanyPortalShell({
  context,
  active,
  title,
  description,
  children,
}: {
  context: CompanyPortalContext
  active: CompanyPortalPageKey
  title: string
  description: string
  children: React.ReactNode
}) {
  const copy = getCompanyPortalCopy(context.locale)
  const accountCopy = getAccountCopy(context.locale)
  const plan = String(context.subscription?.plan_key || 'free').toLowerCase()
  const currentCrumb = companyBreadcrumbKey[active]
  const breadcrumbItems =
    active === 'overview'
      ? [{ key: 'companyAccount' as const }]
      : [
          { key: 'companyAccount' as const, href: '/account/company' },
          { key: currentCrumb },
        ]

  return (
    <main className="min-h-screen bg-[#f6f8fb]">
      <div className="mx-auto grid max-w-[var(--autorell-page-max)] gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:py-9">
        <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-hidden">
          <div className="rounded-[18px] border border-[#d9e2ef] bg-white p-4 shadow-[0_18px_50px_rgba(16,24,40,.055)] lg:flex lg:max-h-[calc(100vh-7rem)] lg:flex-col">
            <p className="px-2 text-xs font-bold uppercase tracking-[.18em] text-[#0866ff]">{copy.portal}</p>
            <h2 className="mt-2 px-2 text-lg font-semibold tracking-[-.025em] text-[#101828]">
              {context.profile.company_name || 'Autorell'}
            </h2>
            <nav className="mt-4 grid gap-1 lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:pr-1">
              {navigation.filter((item) => item.key !== 'inventory' || context.inventoryImportEnabled).map((item) => {
                const Icon = item.icon
                const locked = Boolean(item.requiredPlan && !planAllows(plan, item.requiredPlan))
                const label = String(copy[item.key as keyof typeof copy] || item.key)
                return (
                  <Link
                    key={item.key}
                    href={localizePublicHref(context.locale, item.href)}
                    className={`flex min-h-11 items-center justify-between gap-3 rounded-[12px] px-3 text-sm font-semibold transition ${
                      active === item.key
                        ? 'bg-[#0866ff] text-white'
                        : 'text-[#475467] hover:bg-[#eef5ff] hover:text-[#0866ff]'
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{label}</span>
                    </span>
                    {locked ? <Lock className="h-3.5 w-3.5 shrink-0 opacity-70" /> : null}
                  </Link>
                )
              })}
            </nav>
            <div className="mt-3 border-t border-[#e4eaf3] pt-3">
              <AccountLogoutButton
                homeHref={localizePublicHref(context.locale, '/')}
                label={accountCopy.signOut}
                className="w-full justify-start"
              />
            </div>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="rounded-[18px] border border-[#d9e2ef] bg-white p-5 shadow-[0_18px_50px_rgba(16,24,40,.045)] sm:p-6">
            <AccountBreadcrumbs locale={context.locale} items={breadcrumbItems} className="mb-5" />
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#0866ff]">{copy.portal}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-.045em] text-[#101828] sm:text-4xl">{title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#667085]">{description}</p>
          </header>
          <div className="mt-6">{children}</div>
        </section>
      </div>
    </main>
  )
}

export function LockedFeature({
  locale,
  requiredPlan,
  text,
}: {
  locale: PublicLocale
  requiredPlan: string
  text: string
}) {
  const copy = getCompanyPortalCopy(locale)
  return (
    <div className="rounded-[16px] border border-[#d9e2ef] bg-white p-6 text-center shadow-[0_18px_50px_rgba(16,24,40,.045)]">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-[14px] bg-[#eef5ff] text-[#0866ff]">
        <Lock className="h-5 w-5" />
      </div>
      <h2 className="mt-4 text-xl font-semibold tracking-[-.025em] text-[#101828]">{copy.locked}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#667085]">{text}</p>
      <Link href={localizePublicHref(locale, '/account/company/subscription')} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-[10px] bg-[#0866ff] px-4 text-sm font-bold text-white">
        {copy.upgrade} · {copy.requires} {requiredPlan}
      </Link>
    </div>
  )
}

export function EmptyPanel({
  icon: Icon = FileSpreadsheet,
  title,
  text,
  action,
}: {
  icon?: LucideIcon
  title: string
  text: string
  action?: React.ReactNode
}) {
  return (
    <div className="rounded-[16px] border border-[#d9e2ef] bg-white p-6 shadow-[0_18px_50px_rgba(16,24,40,.045)]">
      <div className="grid h-11 w-11 place-items-center rounded-[13px] bg-[#eef5ff] text-[#0866ff]">
        <Icon className="h-5 w-5" />
      </div>
      <h2 className="mt-4 text-xl font-semibold tracking-[-.025em] text-[#101828]">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#667085]">{text}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}

export function planAllows(plan: string, requiredPlan: string) {
  const rank: Record<string, number> = { free: 0, starter: 1, growth: 2, professional: 3, enterprise: 4 }
  return (rank[plan.toLowerCase()] ?? 0) >= (rank[requiredPlan.toLowerCase()] ?? 0)
}

export function formatCompanyDate(value: string | null | undefined, locale: PublicLocale) {
  if (!value) return '-'
  return new Intl.DateTimeFormat(locale === 'sv' ? 'sv-SE' : locale === 'da' ? 'da-DK' : locale === 'fi' ? 'fi-FI' : locale, { dateStyle: 'medium' }).format(new Date(value))
}
