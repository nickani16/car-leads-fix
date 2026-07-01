import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { isAllowedAdminEmail } from '@/lib/admin-allowlist'
import { getRequestLocale } from '@/lib/request-locale'
import { localizePublicHref, translatePublic, type PublicLocale } from '@/lib/public-i18n'
import { normalizeMarketplaceCategory } from '@/lib/marketplace'
import EditListingForm from './EditListingForm'

type EditListingPageProps = {
  params: Promise<{ id: string }>
}

export default async function EditListingPage({ params }: EditListingPageProps) {
  const locale = await getRequestLocale()
  const copy = getEditListingCopy(locale)
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(localizePublicHref(locale, '/'))

  const admin = createAdminClient()
  const { data: listing } = await admin
    .from('marketplace_listings')
    .select('id,title,category,price,currency,city,description,equipment,status,seller_user_id,seller_type,phone_visibility')
    .eq('id', id)
    .maybeSingle()

  if (!listing) notFound()

  const isOwner = listing.seller_user_id === user.id
  const isAdmin = await isActiveAdmin(admin, user.id, user.email)
  if (!isOwner && !isAdmin) notFound()

  return (
    <main className="mx-auto max-w-[980px] px-5 py-8 sm:px-8 lg:py-12">
      <Link
        href={localizePublicHref(locale, '/account/listings')}
        className="inline-flex items-center gap-2 text-sm font-bold text-[#0866ff]"
      >
        <ArrowLeft className="h-4 w-4" />
        {copy.back}
      </Link>
      <section className="mt-6 overflow-hidden rounded-[26px] border border-[#dfe6f1] bg-white shadow-[0_22px_65px_rgba(16,24,40,.065)]">
        <div className="border-b border-[#edf1f6] bg-[#f7faff] p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#0866ff]">
            {copy.eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-[-.045em] sm:text-5xl">
            {listing.title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#667085]">
            {copy.intro}
          </p>
        </div>
        <EditListingForm
          listing={{
            id: listing.id,
            category: normalizeMarketplaceCategory(listing.category),
            title: listing.title,
            price: Number(listing.price),
            currency: listing.currency,
            city: listing.city,
            description: listing.description || '',
            equipmentKeys: parseEquipmentText(listing.equipment),
            sellerType: listing.seller_type,
            phoneVisibility: listing.phone_visibility || 'public',
          }}
          backHref={localizePublicHref(locale, '/account/listings')}
        />
      </section>
    </main>
  )
}

function parseEquipmentText(value: string | null) {
  if (!value) return []
  return []
}

async function isActiveAdmin(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  email?: string | null,
) {
  if (!isAllowedAdminEmail(email)) return false

  const { data } = await admin
    .from('admin_users')
    .select('user_id')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle()

  return Boolean(data)
}

function getEditListingCopy(locale: PublicLocale) {
  const en = {
    back: 'Back to listings',
    eyebrow: 'Edit listing',
    intro: 'Changes are saved directly. Price changes are logged and shown on the listing when the price has clearly been reduced.',
  }
  if (locale === 'sv') {
    return {
      back: 'Tillbaka till annonser',
      eyebrow: 'Redigera annons',
      intro: 'Ändringar sparas direkt. Prisändringar loggas och visas på annonsen när priset har sänkts tydligt.',
    }
  }
  if (locale === 'de') {
    return {
      back: 'Zurück zu Anzeigen',
      eyebrow: 'Anzeige bearbeiten',
      intro: 'Änderungen werden direkt gespeichert. Preisänderungen werden protokolliert und in der Anzeige gezeigt, wenn der Preis deutlich gesenkt wurde.',
    }
  }
  return Object.fromEntries(
    Object.entries(en).map(([key, value]) => [key, translatePublic(locale, value)]),
  ) as typeof en
}
