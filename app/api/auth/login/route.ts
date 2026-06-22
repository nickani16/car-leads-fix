import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

function safeDestination(value?: string) {
  return value && value.startsWith('/') && !value.startsWith('//')
    ? value
    : '/konto'
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string
    password?: string
    next?: string
  }
  const email = body.email?.trim().toLowerCase()
  const password = body.password || ''
  if (!email || !password) {
    return NextResponse.json(
      { error: 'Enter your email address and password.' },
      { status: 400 },
    )
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error || !data.user) {
    return NextResponse.json(
      { error: 'Incorrect email address or password.' },
      { status: 401 },
    )
  }

  const destination = safeDestination(body.next)
  if (destination.startsWith('/admin')) {
    const { data: admin } = await createAdminClient()
      .from('admin_users')
      .select('is_active')
      .eq('user_id', data.user.id)
      .eq('is_active', true)
      .maybeSingle()
    if (!admin) {
      await supabase.auth.signOut()
      return NextResponse.json(
        { error: 'This account does not have marketplace administration access.' },
        { status: 403 },
      )
    }
    return NextResponse.json({ success: true, destination: '/admin' })
  }

  const { data: profile } = await createAdminClient()
    .from('marketplace_profiles')
    .select('user_id')
    .eq('user_id', data.user.id)
    .maybeSingle()
  if (!profile) {
    await supabase.auth.signOut()
    return NextResponse.json(
      { error: 'No marketplace profile was found for this account.' },
      { status: 403 },
    )
  }

  return NextResponse.json({
    success: true,
    destination: destination.startsWith('/konto') ? destination : '/konto',
  })
}
