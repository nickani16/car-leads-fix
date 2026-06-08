import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type LoginRequest = {
  email?: string
  password?: string
  next?: string
}

export async function POST(request: Request) {
  const body = (await request.json()) as LoginRequest
  const email = body.email?.trim().toLowerCase() || ''
  const password = body.password || ''

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email and password are required.' },
      { status: 400 }
    )
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !data.user) {
    return NextResponse.json(
      { error: 'Invalid email or password.' },
      { status: 401 }
    )
  }

  const requestedPath =
    body.next === '/admin' || body.next === '/dealer' ? body.next : ''

  if (requestedPath === '/admin') {
    const { data: adminAccount } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', data.user.id)
      .eq('is_active', true)
      .maybeSingle()

    if (!adminAccount) {
      await supabase.auth.signOut()
      return NextResponse.json(
        { error: 'This account does not have Admin Portal access.' },
        { status: 403 }
      )
    }

    return NextResponse.json({ success: true, destination: '/admin' })
  }

  if (requestedPath === '/dealer') {
    return NextResponse.json({ success: true, destination: '/dealer' })
  }

  const { data: adminAccount } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', data.user.id)
    .eq('is_active', true)
    .maybeSingle()

  return NextResponse.json({
    success: true,
    destination: adminAccount ? '/admin' : '/dealer',
  })
}

