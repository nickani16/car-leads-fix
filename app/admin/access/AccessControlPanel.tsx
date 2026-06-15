'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { KeyRound, Plus, Power, Trash2, UserCog } from 'lucide-react'

type StaffUser = {
  user_id: string
  role: string
  display_name: string
  email: string
  username: string | null
  is_active: boolean
  must_change_password: boolean
  created_at: string
}

export default function AccessControlPanel({
  initialStaff,
}: {
  initialStaff: StaffUser[]
}) {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [busyId, setBusyId] = useState('')
  const [resetUserId, setResetUserId] = useState('')
  const [temporaryPassword, setTemporaryPassword] = useState('')

  async function createStaff(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    const form = new FormData(event.currentTarget)
    const response = await fetch('/api/admin/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        displayName: form.get('displayName'),
        email: form.get('email'),
        username: form.get('username'),
        password: form.get('password'),
        role: form.get('role'),
      }),
    })
    const result = (await response.json().catch(() => ({}))) as {
      error?: string
    }
    if (!response.ok) {
      setMessage(result.error || 'The account could not be created.')
      return
    }
    event.currentTarget.reset()
    setMessage('Account created. The user must change the password at first login.')
    router.refresh()
  }

  async function updateStaff(
    userId: string,
    payload: { isActive?: boolean; password?: string }
  ) {
    setBusyId(userId)
    setMessage('')
    const response = await fetch(`/api/admin/staff/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const result = (await response.json().catch(() => ({}))) as {
      error?: string
    }
    setBusyId('')
    if (!response.ok) {
      setMessage(result.error || 'The account could not be updated.')
      return
    }
    router.refresh()
  }

  async function resetPassword(userId: string) {
    if (temporaryPassword.length < 8) {
      setMessage('The temporary password must contain at least 8 characters.')
      return
    }
    await updateStaff(userId, { password: temporaryPassword })
    setResetUserId('')
    setTemporaryPassword('')
  }

  async function deleteStaff(user: StaffUser) {
    const reason = window.prompt(
      `Reason for permanently deleting ${user.display_name}:`
    )
    if (!reason) return
    setBusyId(user.user_id)
    const response = await fetch(`/api/admin/staff/${user.user_id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    })
    const result = (await response.json().catch(() => ({}))) as {
      error?: string
    }
    setBusyId('')
    if (!response.ok) {
      setMessage(result.error || 'The account could not be deleted.')
      return
    }
    router.refresh()
  }

  return (
    <div className="grid gap-7 xl:grid-cols-[.78fr_1.22fr]">
      <section className="rounded-[22px] border border-[#deddd7] bg-white p-6 shadow-[0_10px_30px_rgba(32,33,36,.045)]">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-[13px] bg-[#e8f4fa] text-[#315f74]">
            <Plus size={19} />
          </span>
          <div>
            <h2 className="text-lg font-semibold">Create staff account</h2>
            <p className="mt-1 text-xs text-[#6d777b]">
              Username and temporary password are ready immediately.
            </p>
          </div>
        </div>

        <form onSubmit={createStaff} className="mt-6 grid gap-4">
          {[
            ['displayName', 'Full name', 'Nikolai Parkkila', 'text'],
            ['email', 'Work email', 'name@autorell.com', 'email'],
            ['username', 'Username', 'nikolai', 'text'],
            ['password', 'Temporary password', 'At least 8 characters', 'password'],
          ].map(([name, label, placeholder, type]) => (
            <label key={name} className="grid gap-1.5 text-sm font-medium">
              {label}
              <input
                name={name}
                type={type}
                placeholder={placeholder}
                required
                minLength={name === 'password' ? 8 : undefined}
                className="min-h-11 rounded-[12px] border border-[#d8d7d1] px-3 outline-none transition focus:border-[#78afc9] focus:ring-2 focus:ring-[#dceef7]"
              />
            </label>
          ))}
          <label className="grid gap-1.5 text-sm font-medium">
            Role
            <select
              name="role"
              className="min-h-11 rounded-[12px] border border-[#d8d7d1] bg-white px-3"
            >
              <option value="sales">Sales</option>
              <option value="operations">Operations</option>
              <option value="legal">Legal</option>
            </select>
          </label>
          <button
            type="submit"
            className="mt-1 min-h-12 rounded-full bg-[#202124] px-5 text-sm font-semibold text-white transition hover:bg-[#315f74]"
          >
            Create account
          </button>
        </form>
      </section>

      <section className="rounded-[22px] border border-[#deddd7] bg-white p-6 shadow-[0_10px_30px_rgba(32,33,36,.045)]">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-[13px] bg-[#f0f1ef] text-[#58666c]">
            <UserCog size={19} />
          </span>
          <div>
            <h2 className="text-lg font-semibold">Staff accounts</h2>
            <p className="mt-1 text-xs text-[#6d777b]">
              Disable access, issue a new password or permanently remove an account.
            </p>
          </div>
        </div>

        {message && (
          <p
            role="status"
            className="mt-5 rounded-[12px] bg-[#eef6f9] p-3 text-sm text-[#315f74]"
          >
            {message}
          </p>
        )}

        <div className="mt-5 space-y-3">
          {initialStaff.map((user) => (
            <article
              key={user.user_id}
              className="rounded-[16px] border border-[#e4e2dc] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{user.display_name}</p>
                  <p className="mt-1 text-xs text-[#6d777b]">
                    @{user.username || 'no-username'} · {user.email}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.1em]">
                    <span className="rounded-full bg-[#eef1ef] px-2.5 py-1">
                      {user.role}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 ${
                        user.is_active
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {user.is_active ? 'active' : 'disabled'}
                    </span>
                    {user.must_change_password && (
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-700">
                        password change required
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busyId === user.user_id}
                    onClick={() =>
                      updateStaff(user.user_id, { isActive: !user.is_active })
                    }
                    className="grid h-9 w-9 place-items-center rounded-full border border-[#d8d7d1] hover:bg-[#f4f3ef]"
                    title={user.is_active ? 'Disable account' : 'Enable account'}
                  >
                    <Power size={15} />
                  </button>
                  <button
                    type="button"
                    disabled={busyId === user.user_id}
                    onClick={() => {
                      setResetUserId(
                        resetUserId === user.user_id ? '' : user.user_id
                      )
                      setTemporaryPassword('')
                    }}
                    className="grid h-9 w-9 place-items-center rounded-full border border-[#d8d7d1] hover:bg-[#f4f3ef]"
                    title="Reset password"
                  >
                    <KeyRound size={15} />
                  </button>
                  <button
                    type="button"
                    disabled={busyId === user.user_id}
                    onClick={() => deleteStaff(user)}
                    className="grid h-9 w-9 place-items-center rounded-full border border-red-200 text-red-700 hover:bg-red-50"
                    title="Delete account"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              {resetUserId === user.user_id && (
                <div className="mt-4 flex flex-col gap-2 border-t border-[#e7e5df] pt-4 sm:flex-row">
                  <input
                    type="password"
                    value={temporaryPassword}
                    onChange={(event) =>
                      setTemporaryPassword(event.target.value)
                    }
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="New temporary password"
                    aria-label="New temporary password"
                    className="min-h-10 flex-1 rounded-[10px] border border-[#d8d7d1] px-3 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => resetPassword(user.user_id)}
                    className="min-h-10 rounded-full bg-[#315f74] px-4 text-sm font-semibold text-white"
                  >
                    Set password
                  </button>
                </div>
              )}
            </article>
          ))}
          {!initialStaff.length && (
            <p className="text-sm text-[#6d777b]">No staff accounts yet.</p>
          )}
        </div>
      </section>
    </div>
  )
}
