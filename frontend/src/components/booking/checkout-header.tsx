import { Link } from '@tanstack/react-router'
import { Lock } from 'lucide-react'

export function CheckoutHeader() {
  return (
    <header className="border-b border-border/60 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link to="/" className="text-xl font-bold tracking-tight text-foreground">
          Crabi
        </Link>
        <p className="text-xs font-semibold tracking-[0.15em] text-muted-foreground uppercase">
          Secure Checkout
        </p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="size-3.5" />
          256-bit SSL
        </div>
      </div>
    </header>
  )
}
