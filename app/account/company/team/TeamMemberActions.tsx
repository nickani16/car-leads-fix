'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { localizedAccountError } from '@/lib/account-error-i18n'
import type { PublicLocale } from '@/lib/public-i18n'

type TeamMemberActionsProps = {
  userId?: string
  email?: string
  invitationId?: string
  target?: 'member' | 'invitation'
  locale: PublicLocale
  copy: {
    removeMember: string
    removingMember: string
    removeMemberConfirm: string
    removeMemberError: string
    removeInvitation?: string
    removingInvitation?: string
    removeInvitationConfirm?: string
    removeInvitationError?: string
  }
}

export default function TeamMemberActions({
  userId,
  email,
  invitationId,
  target = 'member',
  locale,
  copy,
}: TeamMemberActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function removeMember() {
    if (loading) return
    const isInvitation = target === 'invitation'
    const confirmText = isInvitation
      ? copy.removeInvitationConfirm || copy.removeMemberConfirm
      : copy.removeMemberConfirm
    if (!window.confirm(confirmText)) return
    setLoading(true)
    setError('')
    try {
      const response = await fetch(
        isInvitation
          ? '/api/account/company/team/invitations'
          : '/api/account/company/team/members',
        {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(isInvitation ? { invitationId, email } : { userId, email }),
        },
      )
      const result = (await response.json()) as { error?: string }
      if (!response.ok) {
        setError(localizedAccountError(
          locale,
          result,
          isInvitation
            ? copy.removeInvitationError || copy.removeMemberError
            : copy.removeMemberError,
        ))
        return
      }
      router.refresh()
    } catch {
      setError(target === 'invitation'
        ? copy.removeInvitationError || copy.removeMemberError
        : copy.removeMemberError)
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
        {target === 'invitation'
          ? loading
            ? copy.removingInvitation || copy.removingMember
            : copy.removeInvitation || copy.removeMember
          : loading
            ? copy.removingMember
            : copy.removeMember}
      </button>
      {error ? <p className="mt-2 text-xs font-semibold text-[#b42318]">{error}</p> : null}
    </div>
  )
}
