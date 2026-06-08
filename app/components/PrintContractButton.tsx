'use client'

import { FileText } from 'lucide-react'

export default function PrintContractButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-full bg-[#242424] px-5 py-3 text-sm text-white print:hidden"
    >
      <FileText size={16} />
      Print / save as PDF
    </button>
  )
}
