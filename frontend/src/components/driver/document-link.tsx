import { ExternalLink } from 'lucide-react'

export function DocumentLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 text-[13px] text-[#0066cc] hover:underline"
    >
      {label}
      <ExternalLink className="size-3.5" />
    </a>
  )
}
