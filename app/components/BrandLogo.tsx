import Image from 'next/image'

type BrandLogoProps = {
  inverted?: boolean
  compact?: boolean
  iconOnly?: boolean
}

export default function BrandLogo({
  inverted = false,
  compact = false,
  iconOnly = false,
}: BrandLogoProps) {
  return (
    <span className="inline-flex items-center" aria-label="Autorell">
      <Image
        src="/autorell-wordmark-navy.png"
        alt=""
        width={1642}
        height={300}
        priority
        className={`h-auto object-contain ${
          iconOnly
            ? 'w-[98px]'
            : compact
              ? 'w-[94px]'
              : 'w-[116px] sm:w-[122px] lg:w-[128px]'
        } ${inverted ? 'brightness-0 invert' : ''}`}
      />
    </span>
  )
}
