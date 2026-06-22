import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import MessageComposer from './MessageComposer'

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ conversation?: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/konto/meddelanden')
  const admin = createAdminClient()
  const { data: conversations } = await admin.from('marketplace_conversations').select('id,listing_id,buyer_user_id,seller_user_id,last_message_at').not('listing_id', 'is', null).or(`buyer_user_id.eq.${user.id},seller_user_id.eq.${user.id}`).order('last_message_at', { ascending: false })
  const selectedId = (await searchParams).conversation || conversations?.[0]?.id
  const selected = conversations?.find((item) => item.id === selectedId)
  const { data: messages } = selected ? await admin.from('marketplace_messages').select('id,sender_user_id,body,created_at').eq('conversation_id', selected.id).order('created_at') : { data: [] }
  return <main className="mx-auto grid max-w-[1200px] gap-5 px-5 py-10 sm:px-8 lg:grid-cols-[320px_1fr]"><aside className="rounded-[22px] border bg-white p-3"><h1 className="px-3 py-3 text-xl font-bold">Meddelanden</h1>{conversations?.map((conversation) => <Link key={conversation.id} href={`/konto/meddelanden?conversation=${conversation.id}`} className={`block rounded-[14px] px-4 py-4 text-sm ${selectedId === conversation.id ? 'bg-[#eef4ff] text-[#0866ff]' : 'hover:bg-[#f7f8fb]'}`}>Konversation om annons</Link>)}</aside><section className="min-h-[500px] rounded-[22px] border bg-white p-5 sm:p-7">{selected ? <><div className="space-y-3">{messages?.map((message) => <div key={message.id} className={`max-w-[75%] rounded-[16px] px-4 py-3 text-sm ${message.sender_user_id === user.id ? 'ml-auto bg-[#0866ff] text-white' : 'bg-[#f0f2f5]'}`}>{message.body}</div>)}</div><MessageComposer conversationId={selected.id} /></> : <div className="grid h-full place-items-center text-[#667085]">Ingen konversation vald.</div>}</section></main>
}
