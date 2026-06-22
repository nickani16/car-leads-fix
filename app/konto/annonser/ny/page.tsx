import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import NewListingForm from './NewListingForm'

export default async function NewListingPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/konto/annonser/ny')
  const { data: profile } = await createAdminClient().from('marketplace_profiles').select('account_type').eq('user_id', user.id).single()
  if (!profile) redirect('/registrera')
  const { category = 'cars' } = await searchParams
  return <main className="mx-auto max-w-[1100px] px-5 py-10 sm:px-8"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#0866ff]">Ny annons</p><h1 className="mt-3 text-4xl tracking-[-.04em]">Beskriv fordonet tydligt</h1><p className="mb-8 mt-3 max-w-2xl text-[#667085]">Riktiga kontaktuppgifter hämtas från din profil. Annonsen granskas innan den blir sökbar.</p><NewListingForm accountType={profile.account_type} defaultCategory={category} /></main>
}
