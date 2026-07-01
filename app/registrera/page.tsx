import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import PublicFooter from '@/app/components/PublicFooter'
import PublicHeader from '@/app/components/PublicHeader'
import { getRequestLocale } from '@/lib/request-locale'
import {
  localizePublicHref,
  translatePublicObject,
  type PublicLocale,
} from '@/lib/public-i18n'
import { createClient } from '@/lib/supabase/server'
import EmailCodeAuth from '../components/EmailCodeAuth'
import RegisterForm from './RegisterForm'

export default async function RegisterPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const locale = await getRequestLocale()
  const copy = getRegisterPageCopy(locale)
  const query = searchParams ? await searchParams : {}
  const accountParam = Array.isArray(query.account) ? query.account[0] : query.account
  const initialAccountType = accountParam === 'business' ? 'business' : 'private'
  const requestHeaders = await headers()
  const marketCode = requestHeaders.get('x-autorell-market') || undefined
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return <EmailCodeAuth locale={locale} mode="register" />

  const { data: profile } = await supabase
    .from('marketplace_profiles')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (profile) redirect(localizePublicHref(locale, '/account'))

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-[#101828]">
      <PublicHeader locale={locale} marketCode={marketCode} />
      <section className="border-b border-[#e4eaf3] bg-white">
        <div className="mx-auto grid max-w-[var(--autorell-page-max)] gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start lg:py-12">
          <div className="lg:sticky lg:top-28">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0866ff]">
              {copy.eyebrow}
            </p>
            <h1 className="mt-4 max-w-xl text-4xl leading-[1.02] tracking-[-0.055em] sm:text-6xl">
              {copy.title}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#667085] sm:text-lg sm:leading-8">
              {copy.intro}
            </p>
            <div className="mt-7 grid gap-3 text-sm font-medium text-[#475467]">
              {copy.points.map((item) => (
                <p key={item} className="flex items-start gap-3">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-[3px] bg-[#0866ff]" />
                  {item}
                </p>
              ))}
            </div>
          </div>
          <RegisterForm
            locale={locale}
            email={user.email || ''}
            initialCountryCode={marketCode}
            initialAccountType={initialAccountType}
          />
        </div>
      </section>
      <PublicFooter locale={locale} />
    </main>
  )
}

function getRegisterPageCopy(locale: PublicLocale) {
  const en = {
    eyebrow: 'Autorell account',
    title: 'One account for safer vehicle trading in Europe.',
    intro:
      'Create a private or business account to publish listings, save searches and contact sellers securely across Europe.',
    points: [
      'Private person or verifiable business account',
      'Contact details and address connected to the account',
      'Message sellers and keep conversations in one place',
      'Checks that reduce false and duplicate accounts',
    ],
  }

  if (locale === 'sv') {
    return {
      eyebrow: 'Autorell-konto',
      title: 'Ett konto för tryggare fordonsaffärer i Europa.',
      intro:
        'Skapa ett privatkonto eller företagskonto för att publicera annonser, spara sökningar och kontakta säljare tryggt i hela Europa.',
      points: [
        'Privatperson eller verifierbart företag',
        'Kontaktuppgifter och adress kopplas till kontot',
        'Skriv till säljare och samla ärenden på ett ställe',
        'Kontroller som minskar falska och dubbla konton',
      ],
    }
  }

  if (locale === 'de') {
    return {
      eyebrow: 'Autorell-Konto',
      title: 'Ein Konto für sichereren Fahrzeughandel in Europa.',
      intro:
        'Erstellen Sie ein Privat- oder Unternehmenskonto, um Anzeigen zu veröffentlichen, Suchen zu speichern und Verkäufer sicher in ganz Europa zu kontaktieren.',
      points: [
        'Privatperson oder verifizierbares Unternehmen',
        'Kontaktdaten und Adresse werden mit dem Konto verknüpft',
        'Verkäufer anschreiben und Gespräche an einem Ort sammeln',
        'Prüfungen reduzieren falsche und doppelte Konten',
      ],
    }
  }

  return translatePublicObject(locale, en)
}
