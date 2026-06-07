import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DealerLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: dealer, error } = await supabase
    .from('dealers')
    .select('status')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error || !dealer) {
    redirect('/login?status=dealer-not-found')
  }

  if (dealer.status !== 'approved') {
    redirect('/login?status=pending')
  }

  return children
}