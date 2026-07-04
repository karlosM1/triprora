import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type PageHeaderProps = {
  eyebrow?: string
  title: string
  subtitle?: string
  action?: ReactNode
  className?: string
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      <div>
        {eyebrow && (
          <p className="text-[13px] font-medium tracking-wide text-[#0066cc] uppercase">
            {eyebrow}
          </p>
        )}
        <h1 className="text-[28px] leading-tight font-semibold tracking-[-0.02em] text-[#1d1d1f] break-words sm:text-[32px] lg:text-[40px]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 max-w-2xl text-[17px] leading-relaxed text-[#86868b]">
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  )
}

export function AppleCard({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-white ring-1 ring-black/5',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function SectionTitle({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-[#1d1d1f] sm:text-[28px]">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-[15px] text-[#86868b]">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  )
}
