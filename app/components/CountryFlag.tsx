type CountryFlagProps = {
  code: string
  className?: string
}

const flagBackgrounds: Record<string, string> = {
  at: 'linear-gradient(#ed2939 0 33.33%,#fff 33.33% 66.66%,#ed2939 66.66%)',
  be: 'linear-gradient(90deg,#111 0 33.33%,#ffd90c 33.33% 66.66%,#ef3340 66.66%)',
  bg: 'linear-gradient(#fff 0 33.33%,#00966e 33.33% 66.66%,#d62612 66.66%)',
  cy: 'radial-gradient(ellipse at 52% 48%,#d99b32 0 15%,transparent 16%),linear-gradient(#fff,#fff)',
  cz: 'linear-gradient(150deg,#11457e 0 34%,transparent 35%),linear-gradient(#fff 0 50%,#d7141a 50%)',
  de: 'linear-gradient(#111 0 33.33%,#dd0000 33.33% 66.66%,#ffce00 66.66%)',
  dk: 'linear-gradient(90deg,transparent 0 29%,#fff 29% 38%,transparent 38%),linear-gradient(transparent 0 42%,#fff 42% 56%,transparent 56%),#c8102e',
  ee: 'linear-gradient(#4891d9 0 33.33%,#111 33.33% 66.66%,#fff 66.66%)',
  es: 'linear-gradient(#aa151b 0 25%,#f1bf00 25% 75%,#aa151b 75%)',
  fi: 'linear-gradient(90deg,transparent 0 30%,#003580 30% 43%,transparent 43%),linear-gradient(transparent 0 40%,#003580 40% 58%,transparent 58%),#fff',
  fr: 'linear-gradient(90deg,#0055a4 0 33.33%,#fff 33.33% 66.66%,#ef4135 66.66%)',
  gr: 'repeating-linear-gradient(#0d5eaf 0 11.11%,#fff 11.11% 22.22%)',
  hr: 'linear-gradient(#ff0000 0 33.33%,#fff 33.33% 66.66%,#171796 66.66%)',
  hu: 'linear-gradient(#ce2939 0 33.33%,#fff 33.33% 66.66%,#477050 66.66%)',
  ie: 'linear-gradient(90deg,#169b62 0 33.33%,#fff 33.33% 66.66%,#ff883e 66.66%)',
  it: 'linear-gradient(90deg,#009246 0 33.33%,#fff 33.33% 66.66%,#ce2b37 66.66%)',
  lt: 'linear-gradient(#fdb913 0 33.33%,#006a44 33.33% 66.66%,#c1272d 66.66%)',
  lu: 'linear-gradient(#ed2939 0 33.33%,#fff 33.33% 66.66%,#00a1de 66.66%)',
  lv: 'linear-gradient(#9e3039 0 40%,#fff 40% 60%,#9e3039 60%)',
  mt: 'linear-gradient(90deg,#fff 0 50%,#cf142b 50%)',
  nl: 'linear-gradient(#ae1c28 0 33.33%,#fff 33.33% 66.66%,#21468b 66.66%)',
  pl: 'linear-gradient(#fff 0 50%,#dc143c 50%)',
  pt: 'linear-gradient(90deg,#046a38 0 40%,#da291c 40%)',
  ro: 'linear-gradient(90deg,#002b7f 0 33.33%,#fcd116 33.33% 66.66%,#ce1126 66.66%)',
  se: 'linear-gradient(90deg,transparent 0 30%,#fecb00 30% 42%,transparent 42%),linear-gradient(transparent 0 42%,#fecb00 42% 58%,transparent 58%),#006aa7',
  si: 'linear-gradient(#fff 0 33.33%,#005da4 33.33% 66.66%,#ed1c24 66.66%)',
  sk: 'linear-gradient(#fff 0 33.33%,#0b4ea2 33.33% 66.66%,#ee1c25 66.66%)',
}

const flagCodeAliases: Record<string, string> = {
  cs: 'cz',
  da: 'dk',
  el: 'gr',
  en: 'eu',
  et: 'ee',
  sl: 'si',
  sv: 'se',
}

export default function CountryFlag({
  code,
  className = '',
}: CountryFlagProps) {
  const requestedCode = code.toLowerCase()
  const normalized = flagCodeAliases[requestedCode] || requestedCode

  if (normalized === 'eu') {
    return (
      <span
        className={`relative block overflow-hidden rounded-[5px] bg-[#1747a6] shadow-[inset_0_0_0_1px_rgba(14,32,68,.16),0_2px_7px_rgba(25,42,63,.14)] ${className}`}
        aria-hidden="true"
      >
        {Array.from({ length: 12 }, (_, index) => {
          const angle = (index / 12) * Math.PI * 2
          return (
            <span
              key={index}
              className="absolute h-[2px] w-[2px] rounded-full bg-[#ffd83d]"
              style={{
                left: `${(50 + Math.cos(angle) * 27).toFixed(4)}%`,
                top: `${(50 + Math.sin(angle) * 32).toFixed(4)}%`,
              }}
            />
          )
        })}
      </span>
    )
  }

  return (
    <span
      className={`grid place-items-center overflow-hidden rounded-[5px] bg-cover bg-center text-[8px] font-semibold tracking-[0.08em] text-white shadow-[inset_0_0_0_1px_rgba(14,32,68,.14),0_2px_7px_rgba(25,42,63,.14)] ${className}`}
      style={{
        background: flagBackgrounds[normalized] || '#365363',
      }}
      aria-hidden="true"
    >
      {!flagBackgrounds[normalized] && normalized.toUpperCase()}
    </span>
  )
}
