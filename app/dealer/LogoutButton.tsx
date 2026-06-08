'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function handleLogout() {
    setIsLoading(true)

    const supabase = createClient()
    await supabase.auth.signOut()

    router.replace('/login')
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className="h-10 rounded-full border border-[#d8d7d1] bg-white px-4 text-sm font-normal text-[#242424] transition hover:border-[#242424] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isLoading ? 'Signing out...' : 'Sign out'}
    </button>
  )
}
