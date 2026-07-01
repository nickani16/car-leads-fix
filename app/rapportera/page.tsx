import Link from 'next/link'
import { headers } from 'next/headers'
import { ShieldAlert } from 'lucide-react'
import PublicHeader from '@/app/components/PublicHeader'
import PublicFooter from '@/app/components/PublicFooter'
import ReportForm from './ReportForm'

export default async function ReportPage() {
  const requestHeaders = await headers()
  const marketCode = requestHeaders.get('x-autorell-market') || undefined

  return (
    <main className="min-h-screen bg-[#f7f8fb] text-[#101828]">
      <PublicHeader locale="en" marketCode={marketCode} />
      <section className="mx-auto grid max-w-[1100px] gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[.85fr_1.15fr] lg:py-20">
        <div>
          <span className="grid h-12 w-12 place-items-center rounded-[15px] bg-red-50 text-red-600">
            <ShieldAlert />
          </span>
          <h1 className="mt-6 text-5xl tracking-[-.05em]">
            Report fraud or a safety issue.
          </h1>
          <p className="mt-5 leading-7 text-[#667085]">
            Sign in and report a listing, conversation, payment request or
            suspected identity misuse. Never send money outside the flow shown
            in your Autorell account.
          </p>
          <div className="mt-6 rounded-[18px] border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
            <strong>Immediate risk or an ongoing crime?</strong>
            <br />
            Call your local emergency number, local police or relevant
            authorities first. An Autorell report does not replace a police
            report, bank dispute, insurance claim or authority notification.
          </div>
          <div className="mt-4 rounded-[18px] border border-[#dfe6f2] bg-white p-5 text-sm leading-6 text-[#475467]">
            <strong className="text-[#101828]">
              What Autorell can help with
            </strong>
            <br />
            We can preserve listing, account, message and payment-reference
            data, review suspicious activity, restrict accounts and provide
            relevant platform information for a lawful investigation.
          </div>
          <Link
            href="/help-center"
            className="mt-6 inline-block font-bold text-[#0866ff]"
          >
            Open help center -&gt;
          </Link>
        </div>
        <ReportForm />
      </section>
      <PublicFooter locale="en" />
    </main>
  )
}
