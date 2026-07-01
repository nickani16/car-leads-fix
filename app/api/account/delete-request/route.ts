import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Sign in to delete your account.' }, { status: 401 })
  }

  const admin = createAdminClient()
  const now = new Date().toISOString()

  const { data: profile } = await admin
    .from('marketplace_profiles')
    .select('account_type,display_name,company_name,phone')
    .eq('user_id', user.id)
    .maybeSingle()

  const accountName =
    profile?.account_type === 'business'
      ? profile?.company_name
      : profile?.display_name

  const { error: reportError } = await admin.from('marketplace_reports').insert({
    reporter_user_id: user.id,
    category: 'other',
    details: [
      '[account_deletion_request]',
      `Requested at: ${now}`,
      `Account type: ${profile?.account_type || 'unknown'}`,
      `Account name: ${accountName || 'unknown'}`,
      'User requested account deletion from the account area.',
      'Published listings should be hidden while Autorell reviews legal, payment and safety retention requirements.',
    ].join('\n'),
    contact_email: user.email,
    contact_phone: profile?.phone || null,
  })

  if (reportError) {
    return NextResponse.json({ error: reportError.message }, { status: 400 })
  }

  await Promise.all([
    admin
      .from('marketplace_listings')
      .update({ status: 'pending_review', updated_at: now })
      .eq('seller_user_id', user.id)
      .eq('status', 'published'),
    admin
      .from('marketplace_profiles')
      .update({ risk_status: 'restricted', updated_at: now })
      .eq('user_id', user.id),
  ])

  await supabase.auth.signOut()
  revalidateTag('marketplace-listings', 'max')

  return NextResponse.json({ success: true })
}
