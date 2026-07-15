import PublicHeader from '@/app/components/PublicHeader'
import AcceptTeamInvitation from './AcceptTeamInvitation'
import { getRequestLocale } from '@/lib/request-locale'
import { translatePublicObject } from '@/lib/public-i18n'

const baseCopy = {
  eyebrow: 'Company invitation',
  title: 'Accept team invitation',
  description: 'Accept the invitation using the same email address that received the message. If you are not signed in, sign in first and open the link again.',
  accept: 'Accept invitation',
  accepting: 'Accepting...',
  success: 'Invitation accepted. Opening the company portal.',
  signInFirst: 'Sign in with the invited email address and open the link again.',
  failed: 'The invitation could not be accepted.',
}

export default async function AcceptCompanyTeamInvitationPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const locale = await getRequestLocale()
  const params = await searchParams
  const token = String(Array.isArray(params?.token) ? params?.token[0] : params?.token || '')
  const copy = translatePublicObject(locale, baseCopy)

  return (
    <>
      <PublicHeader locale={locale} />
      <main className="min-h-[calc(100vh-64px)] bg-[#f6f8fb] px-5 py-12">
        <section className="mx-auto max-w-2xl rounded-[18px] border border-[#d9e2ef] bg-white p-6 shadow-[0_18px_50px_rgba(16,24,40,.055)] sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#0866ff]">{copy.eyebrow}</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-.045em] text-[#101828]">{copy.title}</h1>
          <p className="mt-3 text-sm leading-6 text-[#667085]">{copy.description}</p>
          <div className="mt-6">
            <AcceptTeamInvitation token={token} copy={copy} />
          </div>
        </section>
      </main>
    </>
  )
}
