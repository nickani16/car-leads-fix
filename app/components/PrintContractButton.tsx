'use client'

import { FileText } from 'lucide-react'

export default function PrintContractButton({
  locale = 'en',
}: {
  locale?: 'sv' | 'en'
}) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-full bg-[#242424] px-5 py-3 text-sm text-white print:hidden"
    >
      <FileText size={16} />
      {locale === 'sv' ? 'Skriv ut / spara som PDF' : 'Print / save as PDF'}
    </button>
  )
}
