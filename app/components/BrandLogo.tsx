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
        src="/autorell-brand-logo.png"
        alt="Autorell"
        width={1184}
        height={211}
        priority
        className={`h-auto object-contain ${
          compact ? 'w-[88px]' : 'w-[104px] sm:w-[116px]'
        } ${inverted ? 'brightness-0 invert' : ''}`}
      />
    </span>
  )
}
