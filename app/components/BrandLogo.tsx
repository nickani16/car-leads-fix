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
    <span className="inline-flex items-center" aria-label="Autorell">
      <Image
        src="/autorell-brand-logo-symbol.png"
        alt="Autorell"
        width={858}
        height={147}
        priority
        className={`h-auto object-contain ${
          compact
            ? 'w-[112px]'
            : 'w-[148px] sm:w-[164px] lg:w-[176px]'
        } ${inverted ? 'brightness-0 invert' : ''}`}
      />
    </span>
  )
}
