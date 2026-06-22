'use client'

import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AccountLogoutButton() {
  async function signOut() {
    await createClient().auth.signOut()
    window.location.assign('/')
  }

  return (
    <button
      type="button"
      onClick={signOut}
      className="inline-flex min-h-10 items-center gap-2 rounded-[12px] px-4 text-sm font-semibold text-[#475467] hover:bg-[#fff1f1] hover:text-[#b42318]"
    >
      <LogOut className="h-4 w-4" />
      Logga ut
    </button>
  )
}
