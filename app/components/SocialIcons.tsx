const socialIcons = [
  {
    label: 'Facebook',
    path: 'M14 8.5h3V5h-3c-3.4 0-5.5 2.1-5.5 5.7V13H6v3.5h2.5V23h4v-6.5h3.2l.6-3.5h-3.8v-2c0-1.7.5-2.5 1.5-2.5Z',
  },
  {
    label: 'Instagram',
    path: 'M12 7.8A4.2 4.2 0 1 0 12 16.2 4.2 4.2 0 0 0 12 7.8Zm0 6.9a2.7 2.7 0 1 1 0-5.4 2.7 2.7 0 0 1 0 5.4Zm5.4-7.1a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM20.2 8c-.1-1.5-.4-2.7-1.5-3.7S16.5 2.9 15 2.8c-1.5-.1-6.5-.1-8 0-1.5.1-2.7.4-3.7 1.5S1.9 6.5 1.8 8c-.1 1.5-.1 6.5 0 8 .1 1.5.4 2.7 1.5 3.7s2.2 1.4 3.7 1.5c1.5.1 6.5.1 8 0 1.5-.1 2.7-.4 3.7-1.5s1.4-2.2 1.5-3.7c.1-1.5.1-6.5 0-8Zm-1.9 9.6c-.3.8-.9 1.4-1.7 1.7-1.2.5-4 .4-4.6.4s-3.4.1-4.6-.4a3 3 0 0 1-1.7-1.7c-.5-1.2-.4-4-.4-4.6s-.1-3.4.4-4.6A3 3 0 0 1 7.4 6.7c1.2-.5 4-.4 4.6-.4s3.4-.1 4.6.4a3 3 0 0 1 1.7 1.7c.5 1.2.4 4 .4 4.6s.1 3.4-.4 4.6Z',
  },
  {
    label: 'LinkedIn',
    path: 'M5.3 7.6A2.3 2.3 0 1 0 5.3 3a2.3 2.3 0 0 0 0 4.6ZM3.4 9.3h3.8V21H3.4V9.3Zm6.1 0h3.6v1.6h.1c.5-1 1.8-2 3.6-2 3.9 0 4.6 2.5 4.6 5.9V21h-3.8v-5.5c0-1.3 0-3-1.9-3s-2.2 1.4-2.2 2.9V21H9.5V9.3Z',
  },
  {
    label: 'WhatsApp',
    path: 'M20.5 3.5A11.8 11.8 0 0 0 1.9 17.7L.3 23.7l6.1-1.6A11.8 11.8 0 0 0 24 11.8c0-3.1-1.2-6-3.5-8.3Zm-8.3 18.2c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.6.9 1-3.5-.2-.4a9.6 9.6 0 1 1 8.2 4.6Zm5.3-7.2c-.3-.1-1.7-.8-2-1-.3-.1-.5-.1-.7.2l-.9 1.1c-.2.2-.4.2-.7.1-2-.8-3.4-2.4-4-3.5-.2-.3 0-.6.1-.7l.5-.6.3-.6c.1-.2 0-.5 0-.7l-.9-2c-.2-.5-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.9s1.2 3.3 1.4 3.6c.2.2 2.4 3.7 5.9 5.2.8.4 1.5.6 2 .7.8.3 1.6.2 2.2.1.7-.1 1.7-.7 1.9-1.3.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.4Z',
  },
]

export default function SocialIcons({ className = '' }: { className?: string }) {
  return (
    <div
      className={`flex items-center gap-2 ${className}`}
      aria-label="Sociala medier, länkar kommer snart"
    >
      {socialIcons.map(({ label, path }) => (
        <span
          key={label}
          role="img"
          aria-label={`${label}, kommer snart`}
          title={`${label} - kommer snart`}
          className="flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-full border border-[#d5d4ce] bg-white/55 text-[#777975] opacity-65"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-[17px] w-[17px] fill-current"
          >
            <path d={path} />
          </svg>
        </span>
      ))}
    </div>
  )
}
