'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function MessageComposer({ conversationId }: { conversationId: string }) {
  const router = useRouter()
  const [message, setMessage] = useState('')
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!message.trim()) return
    const response = await fetch('/api/account/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ conversationId, message }) })
    if (response.ok) { setMessage(''); router.refresh() }
  }
  return <form onSubmit={submit} className="mt-4 flex gap-2"><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Skriv ett meddelande…" maxLength={3000} className="h-12 flex-1 rounded-[14px] border px-4 outline-none focus:border-[#0866ff]" /><button className="rounded-[14px] bg-[#0866ff] px-5 font-bold text-white">Skicka</button></form>
}
