'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton({
  compact = false,
}: {
  compact?: boolean
}) {
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
      className={`inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-[#d8d7d1] bg-white text-sm font-medium text-[#34383a] transition hover:border-[#9ebdca] hover:bg-[#f4f9fb] disabled:cursor-not-allowed disabled:opacity-60 ${
        compact ? 'w-10 px-0 sm:w-auto sm:px-4' : 'px-4'
      }`}
      aria-label={isLoading ? 'Signing out' : 'Sign out'}
      title="Sign out"
    >
      <LogOut size={15} />
      <span className={compact ? 'hidden sm:inline' : ''}>
        {isLoading ? 'Signing out...' : 'Sign out'}
      </span>
    </button>
  )
}
