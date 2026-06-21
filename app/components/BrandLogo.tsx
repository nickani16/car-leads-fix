import Image from 'next/image'

type BrandLogoProps = {
  inverted?: boolean
  compact?: boolean
}

export default function BrandLogo({
  inverted = false,
  compact = false,
}: BrandLogoProps) {
  return (
    <span
      className={`inline-flex items-end ${
        compact ? 'gap-1.5' : 'gap-2 sm:gap-2.5'
      }`}
      aria-label="Autorell"
    >
      <Image
        src="/autorell-brand-mark.png"
        alt=""
        width={282}
        height={212}
        priority
        className={`h-auto object-contain ${
          compact
            ? 'w-[25px]'
            : 'w-[30px] sm:w-[33px] lg:w-[36px]'
        } ${inverted ? 'brightness-0 invert' : ''}`}
      />
      <span
        aria-hidden="true"
        className={`translate-y-[1px] leading-none tracking-[-0.045em] ${
          compact
            ? 'text-[19px] font-medium'
            : 'text-[22px] font-medium sm:text-[24px] lg:text-[25px]'
        } ${inverted ? 'text-white' : 'text-[#24272b]'}`}
      >
        Autorell
      </span>
    </span>
  )
}
