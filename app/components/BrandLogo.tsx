import Image from 'next/image'

type BrandLogoProps = {
  inverted?: boolean
  compact?: boolean
  iconOnly?: boolean
  underline?: boolean
}

export default function BrandLogo({
  inverted = false,
  compact = false,
  iconOnly = false,
  underline = true,
}: BrandLogoProps) {
  return (
    <span className="group/logo inline-flex flex-col items-start" aria-label="Autorell">
      <Image
        src="/autorell-logo-primary.png"
        alt=""
        width={1072}
        height={221}
        preload
        className={`h-auto object-contain ${
          iconOnly
            ? 'w-[92px]'
            : compact
              ? 'w-[88px]'
              : 'w-[108px] sm:w-[112px] lg:w-[122px]'
        } ${inverted ? 'brightness-0 invert' : ''}`}
      />
      {underline ? (
        <span
          aria-hidden="true"
          className="mt-1 h-[2px] w-full origin-left scale-x-0 rounded-full bg-[#0866ff] transition-transform duration-200 group-hover/logo:scale-x-100"
        />
      ) : null}
    </span>
  )
}
