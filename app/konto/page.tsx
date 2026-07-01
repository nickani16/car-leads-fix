import Link from 'next/link'
import { redirect } from 'next/navigation'
import { BarChart3, FileText, MessageCircle, Plus, UserRound } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import ProfileForm from './ProfileForm'

export default async function AccountPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/konto')

  const { data: profile } = await supabase
    .from('marketplace_profiles')
    .select('account_type,first_name,last_name,birth_date,email,phone,country_code,company_name,registration_number,vat_number,address_line_1,address_line_2,city,region,postal_code,identity_status,business_verification_status,risk_status,national_id_last4,display_name')
    .eq('user_id', user.id)
    .single()
  if (!profile) redirect('/registrera?onboarding=1')
  const admin = createAdminClient()
  const [{ count: listings }, { count: published }, { count: conversations }] =
    await Promise.all([
      admin
        .from('marketplace_listings')
        .select('id', { count: 'exact', head: true })
        .eq('seller_user_id', user.id),
      admin
        .from('marketplace_listings')
        .select('id', { count: 'exact', head: true })
        .eq('seller_user_id', user.id)
        .eq('status', 'published'),
      admin
        .from('marketplace_conversations')
        .select('id', { count: 'exact', head: true })
        .or(`buyer_user_id.eq.${user.id},seller_user_id.eq.${user.id}`),
    ])

  return (
    <main className="mx-auto max-w-[1120px] px-5 py-10 sm:px-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#0866ff]">
            Autorell-konto
          </p>
          <h1 className="mt-3 text-4xl tracking-[-.04em]">
            Hej {profile?.first_name || profile?.display_name}
          </h1>
          <p className="mt-3 text-[#667085]">
            Här hanterar du annonser, meddelanden och din profil.
          </p>
        </div>
        <Link
          href="/salj-fordon"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] bg-[#0866ff] px-5 text-sm font-bold text-white"
        >
          <Plus className="h-4 w-4" />
          Skapa annons
        </Link>
      </div>

      <section className="mt-8 grid gap-3 sm:grid-cols-3">
        <Metric icon={FileText} label="Alla annonser" value={listings || 0} />
        <Metric icon={BarChart3} label="Publicerade" value={published || 0} />
        <Metric icon={MessageCircle} label="Konversationer" value={conversations || 0} />
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link href="/konto/annonser" className="rounded-[20px] border border-[#e1e5ec] bg-white p-6 transition hover:border-[#b8c5d8]">
          <FileText className="h-5 w-5 text-[#0866ff]" />
          <h2 className="mt-4 text-xl font-semibold">Hantera annonser</h2>
          <p className="mt-2 text-sm leading-6 text-[#667085]">
            Se status, publicera nya fordon och följ ditt lager.
          </p>
        </Link>
        <Link href="/konto/meddelanden" className="rounded-[20px] border border-[#e1e5ec] bg-white p-6 transition hover:border-[#b8c5d8]">
          <MessageCircle className="h-5 w-5 text-[#0866ff]" />
          <h2 className="mt-4 text-xl font-semibold">Öppna inkorgen</h2>
          <p className="mt-2 text-sm leading-6 text-[#667085]">
            Skriv direkt med köpare och säljare per annons.
          </p>
        </Link>
      </section>

      <section className="mt-10 border-t border-[#dfe3e8] pt-10">
        <div className="mb-7">
          <div className="flex items-center gap-3">
            <UserRound className="h-5 w-5 text-[#0866ff]" />
            <h2 className="text-2xl tracking-[-.035em]">Din profil</h2>
          </div>
          <p className="mt-2 text-sm text-[#667085]">
            Kontaktuppgifterna används för annonser, meddelanden och säkrare affärer.
          </p>
        </div>
        <ProfileForm profile={profile} />
      </section>
    </main>
  )
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FileText
  label: string
  value: number
}) {
  return (
    <article className="rounded-[18px] border border-[#e1e5ec] bg-white p-5">
      <Icon className="h-5 w-5 text-[#0866ff]" />
      <strong className="mt-4 block text-3xl">{value}</strong>
      <span className="mt-1 block text-sm text-[#667085]">{label}</span>
    </article>
  )
}
