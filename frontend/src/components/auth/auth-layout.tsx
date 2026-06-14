import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { Header } from '@/components/landing/header'
import { cn } from '@/lib/utils'

type AuthLayoutProps = {
  title: string
  subtitle?: string
  children: ReactNode
  footer: ReactNode
  className?: string
}

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  className,
}: AuthLayoutProps) {
  return (
    <div className="auth-page min-h-svh bg-[#f5f5f7]">
      <Header />

      <main className="mx-auto flex min-h-[calc(100svh-2.75rem)] max-w-[420px] flex-col justify-center px-6 py-12">
        <div className={cn('w-full', className)}>
          <div className="mb-8 text-center">
            <h1 className="text-[32px] leading-tight font-semibold tracking-[-0.02em] text-[#1d1d1f]">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-[15px] leading-relaxed text-[#86868b]">
                {subtitle}
              </p>
            )}
          </div>

          {children}

          <div className="mt-8 text-center text-[14px] text-[#86868b]">{footer}</div>
        </div>
      </main>
    </div>
  )
}

export function AuthLink({
  to,
  search,
  children,
}: {
  to: string
  search?: Record<string, string>
  children: ReactNode
}) {
  return (
    <Link
      to={to}
      search={search}
      className="font-medium text-[#0066cc] transition-colors hover:text-[#0077ed] hover:underline"
    >
      {children}
    </Link>
  )
}

export function AuthAlert({
  variant,
  children,
}: {
  variant: 'error' | 'success'
  children: ReactNode
}) {
  return (
    <p
      className={cn(
        'mb-5 rounded-xl px-4 py-3 text-[14px] leading-relaxed',
        variant === 'error'
          ? 'bg-[#fff2f2] text-[#bf4800] ring-1 ring-[#bf4800]/15'
          : 'bg-[#f0f7ff] text-[#0066cc] ring-1 ring-[#0066cc]/15',
      )}
    >
      {children}
    </p>
  )
}

export function AuthDivider({ label = 'or' }: { label?: string }) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center" aria-hidden>
        <div className="w-full border-t border-[#d2d2d7]" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-[#f5f5f7] px-3 text-[13px] text-[#86868b] uppercase">
          {label}
        </span>
      </div>
    </div>
  )
}
