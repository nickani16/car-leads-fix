'use client'

import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AccountLogoutButton({
  homeHref = '/',
  label = 'Log out',
}: {
  homeHref?: string
  label?: string
}) {
  async function signOut() {
    await createClient().auth.signOut()
    const signedOutHeaderState = {
      authenticated: false,
      unreadMessages: 0,
      conversationCount: 0,
    }
    ;(window as Window & { __autorellHeaderAccount?: typeof signedOutHeaderState }).__autorellHeaderAccount =
      signedOutHeaderState
    try {
      window.sessionStorage.setItem('autorell-header-account', JSON.stringify(signedOutHeaderState))
    } catch {
      // Ignore blocked session storage; the in-memory header event still updates the UI.
    }
    window.dispatchEvent(
      new CustomEvent('autorell:header-account', {
        detail: signedOutHeaderState,
      }),
    )
    window.dispatchEvent(new CustomEvent('autorell:auth-changed'))
    window.location.assign(homeHref)
  }

  return (
    <button
      type="button"
      onClick={signOut}
      className="inline-flex min-h-10 items-center gap-2 rounded-[12px] px-4 text-sm font-semibold text-[#475467] hover:bg-[#fff1f1] hover:text-[#b42318]"
    >
      <LogOut className="h-4 w-4" />
      {label}
    </button>
  )
}
