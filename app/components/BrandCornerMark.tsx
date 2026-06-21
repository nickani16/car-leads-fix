type BrandCornerMarkProps = {
  className?: string
}

export default function BrandCornerMark({
  className = '',
}: BrandCornerMarkProps) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute block bg-current ${className}`}
      style={{
        WebkitMask: 'url("/autorell-brand-mark.png") center / contain no-repeat',
        mask: 'url("/autorell-brand-mark.png") center / contain no-repeat',
      }}
    />
  )
}
