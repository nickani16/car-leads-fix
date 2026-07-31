'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { localizedAccountError } from '@/lib/account-error-i18n'
import type { PublicLocale } from '@/lib/public-i18n'

type TeamMemberActionsProps = {
  userId: string
  locale: PublicLocale
  copy: {
    removeMember: string
    removingMember: string
    removeMemberConfirm: string
    removeMemberError: string
  }
}

export default function TeamMemberActions({ userId, locale, copy }: TeamMemberActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function removeMember() {
    if (loading) return
    if (!window.confirm(copy.removeMemberConfirm)) return
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/account/company/team/members', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      const result = (await response.json()) as { error?: string }
      if (!response.ok) {
        setError(localizedAccountError(locale, result, copy.removeMemberError))
        return
      }
      router.refresh()
    } catch {
      setError(copy.removeMemberError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={removeMember}
        disabled={loading}
        className="inline-flex min-h-9 items-center justify-center gap-2 rounded-[10px] border border-[#f3c7c2] bg-white px-3 text-xs font-semibold text-[#b42318] transition hover:bg-[#fff4f2] disabled:cursor-wait disabled:opacity-60"
      >
        <Trash2 className="h-3.5 w-3.5" />
        {loading ? copy.removingMember : copy.removeMember}
      </button>
      {error ? <p className="mt-2 text-xs font-semibold text-[#b42318]">{error}</p> : null}
    </div>
  )
}
