import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

type LoginRequest = {
  email?: string
  password?: string
  next?: string
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginRequest
    const login = body.email?.trim().toLowerCase() || ''
    const password = body.password || ''

    if (!login || !password) {
      return NextResponse.json(
        { error: 'Email or username and password are required.' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()
    let email = login
    if (!login.includes('@')) {
      const { data: staffAccount } = await adminClient
        .from('staff_users')
        .select('email')
        .ilike('username', login)
        .eq('is_active', true)
        .maybeSingle()
      if (!staffAccount) {
        return NextResponse.json(
          { error: 'Invalid email, username or password.' },
          { status: 401 }
        )
      }
      email = staffAccount.email.toLowerCase()
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

    const requestedPath = ['/admin', '/dealer', '/sales', '/konto'].includes(body.next || '')
      ? body.next || ''
      : ''
    if (requestedPath === '/konto') {
      const { data: marketplaceProfile } = await adminClient
        .from('marketplace_profiles')
        .select('user_id')
        .eq('user_id', data.user.id)
        .maybeSingle()
      if (!marketplaceProfile) {
        await supabase.auth.signOut()
        return NextResponse.json(
          { error: 'No marketplace profile was found for this account.' },
          { status: 403 },
        )
      }
      return NextResponse.json({ success: true, destination: '/konto' })
    }
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
      const { data: dealerAccount } = await adminClient
        .from('dealers')
        .select('status')
        .eq('user_id', data.user.id)
        .maybeSingle()

      if (!dealerAccount) {
        await supabase.auth.signOut()
        return NextResponse.json(
          { error: 'No dealer profile was found for this account.' },
          { status: 403 }
        )
      }

      if (dealerAccount.status !== 'approved') {
        await supabase.auth.signOut()
        return NextResponse.json(
          { error: 'Your dealer application is still under review.' },
          { status: 403 }
        )
      }

      return NextResponse.json({ success: true, destination: '/dealer' })
    }

    if (requestedPath === '/sales') {
      const { data: staffAccount } = await adminClient
        .from('staff_users')
        .select('user_id,must_change_password')
        .eq('user_id', data.user.id)
        .eq('role', 'sales')
        .eq('is_active', true)
        .maybeSingle()

      if (!staffAccount) {
        await supabase.auth.signOut()
        return NextResponse.json(
          { error: 'This account does not have Sales Portal access.' },
          { status: 403 }
        )
      }

      return NextResponse.json({
        success: true,
        destination: staffAccount.must_change_password
          ? '/reset-password?required=1'
          : '/sales',
      })
    }

    const { data: adminAccount } = await adminClient
      .from('admin_users')
      .select('user_id')
      .eq('user_id', data.user.id)
      .eq('is_active', true)
      .maybeSingle()

    if (adminAccount) {
      return NextResponse.json({ success: true, destination: '/admin' })
    }

    const { data: staffAccount } = await adminClient
      .from('staff_users')
      .select('user_id,must_change_password')
      .eq('user_id', data.user.id)
      .eq('role', 'sales')
      .eq('is_active', true)
      .maybeSingle()

    if (staffAccount) {
      return NextResponse.json({
        success: true,
        destination: staffAccount.must_change_password
          ? '/reset-password?required=1'
          : '/sales',
      })
    }

    const { data: marketplaceProfile } = await adminClient
      .from('marketplace_profiles')
      .select('user_id')
      .eq('user_id', data.user.id)
      .maybeSingle()

    if (marketplaceProfile) {
      return NextResponse.json({ success: true, destination: '/konto' })
    }

    const { data: dealerAccount } = await adminClient
      .from('dealers')
      .select('status')
      .eq('user_id', data.user.id)
      .maybeSingle()

    if (!dealerAccount) {
      await supabase.auth.signOut()
      return NextResponse.json(
        { error: 'This account does not have portal access.' },
        { status: 403 }
      )
    }

    if (dealerAccount.status !== 'approved') {
      await supabase.auth.signOut()
      return NextResponse.json(
        { error: 'Your dealer application is still under review.' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      destination: '/dealer',
    })
  } catch (error) {
    console.error('Server login error:', error)
    return NextResponse.json(
      {
        error:
          'Login is not configured correctly on the production server. Please contact Autorell support.',
      },
      { status: 503 }
    )
  }
}
