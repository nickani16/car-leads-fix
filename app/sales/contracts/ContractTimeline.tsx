import { CheckCircle2, Circle, Clock3, Mail, PenLine } from 'lucide-react'

const date = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export default function ContractTimeline({
  events,
}: {
  events: {
    id: string
    event_type: string
    summary: string
    actor_role: string | null
    created_at: string
  }[]
}) {
  return (
    <section className="mx-auto mt-5 max-w-[1014px] px-5 sm:px-8 lg:px-12">
      <div className="rounded-[20px] border border-[#deddd7] bg-white p-5 sm:p-6">
        <h2 className="font-semibold">Agreement history</h2>
        {events.length ? (
          <ol className="mt-5 space-y-4">
            {events.map((event) => {
              const Icon =
                event.event_type === 'contract_signed'
                  ? PenLine
                  : event.event_type === 'contract_sent'
                    ? Mail
                    : event.event_type === 'contract_packet_completed'
                      ? CheckCircle2
                      : event.event_type.includes('workflow')
                        ? Clock3
                        : Circle
              return (
                <li key={event.id} className="flex gap-3">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#eff8fd] text-[#52768a]">
                    <Icon size={15} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{event.summary}</p>
                    <p className="mt-1 text-xs text-[#7d8386]">
                      {date.format(new Date(event.created_at))}
                      {event.actor_role ? ` / ${event.actor_role}` : ''}
                    </p>
                  </div>
                </li>
              )
            })}
          </ol>
        ) : (
          <p className="mt-3 text-sm text-[#73797c]">No recorded events yet.</p>
        )}
      </div>
    </section>
  )
}
