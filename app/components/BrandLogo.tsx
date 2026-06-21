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
      className={`inline-flex items-center ${
        compact ? 'gap-1' : 'gap-1.5 sm:gap-2'
      }`}
      aria-label="Autorell"
    >
      <Image
        src="/autorell-brand-mark.png"
        alt=""
        width={290}
        height={145}
        priority
        className={`h-auto object-contain ${
          compact
            ? 'w-[34px]'
            : 'w-[40px] sm:w-[44px] lg:w-[48px]'
        } ${inverted ? 'brightness-0 invert' : ''}`}
      />
      <span
        aria-hidden="true"
        className={`leading-none tracking-[-0.045em] ${
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
