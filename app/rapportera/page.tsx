import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'
import PublicHeader from '@/app/components/PublicHeader'
import PublicFooter from '@/app/components/PublicFooter'
import ReportForm from './ReportForm'

export default function ReportPage() {
  return <main className="min-h-screen bg-[#f7f8fb] text-[#101828]"><PublicHeader /><section className="mx-auto grid max-w-[1100px] gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[.85fr_1.15fr] lg:py-20"><div><span className="grid h-12 w-12 place-items-center rounded-[15px] bg-red-50 text-red-600"><ShieldAlert /></span><h1 className="mt-6 text-5xl tracking-[-.05em]">Rapportera bedrägeri eller problem.</h1><p className="mt-5 leading-7 text-[#667085]">Logga in och rapportera en annons, konversation, betalningsförfrågan eller misstänkt identitetsanvändning. Skicka aldrig pengar utanför det flöde som visas i ditt Autorell-konto.</p><div className="mt-6 rounded-[18px] border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900"><strong>Akut risk eller pågående brott?</strong><br />Kontakta lokal polis eller 112. Autorell ersätter inte myndighetsanmälan.</div><Link href="/hjalpcenter" className="mt-6 inline-block font-bold text-[#0866ff]">Öppna hjälpcentret →</Link></div><ReportForm /></section><PublicFooter /></main>
}
