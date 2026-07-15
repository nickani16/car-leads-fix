export default function BusinessStatusPage() {
  const review = true
  return <main className="min-h-screen bg-[#f7f9fc] px-5 py-20"><div className="mx-auto max-w-xl rounded-3xl border border-[#dbe4f0] bg-white p-8 shadow-sm"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#0866ff]">Autorell för företag</p><h1 className="mt-3 text-3xl font-semibold">{review ? 'Din ansökan granskas' : 'Företagsstatus'}</h1><p className="mt-4 text-[#667085]">{review ? 'Vi återkommer när företagsverifieringen är klar. Därefter väljer du abonnemang.' : 'Kontakta support om du behöver hjälp med onboarding.'}</p></div></main>
}
