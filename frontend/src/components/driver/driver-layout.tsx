import { Link, Outlet, useRouterState } from '@tanstack/react-router'
import {
  Banknote,
  CircleHelp,
  LayoutDashboard,
  MapPinPlus,
  Route,
  Settings,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard', to: '/driver' as const, icon: LayoutDashboard, exact: true },
  { label: 'My Trips', to: '/driver/trips' as const, icon: Route, exact: false },
  { label: 'Create Trip', to: '/driver/create' as const, icon: MapPinPlus, exact: false },
  { label: 'Earnings', to: '/driver' as const, icon: Banknote, exact: false },
] as const

type DriverLayoutProps = {
  searchPlaceholder?: string
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function DriverLayout({
  searchPlaceholder = 'Search trips or documents...',
}: DriverLayoutProps) {
  const { profile } = useAuth()
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <SidebarProvider>
      <div className="flex min-h-svh w-full bg-slate-50">
        <Sidebar className="border-r border-border bg-white [&_[data-slot=sidebar-inner]]:rounded-none">
          <SidebarHeader className="border-b border-border px-5 py-6">
            <Link to="/driver" className="block">
              <p className="text-lg font-bold text-primary">Triprora</p>
              <p className="text-xs text-muted-foreground">Driver Portal</p>
            </Link>
          </SidebarHeader>

          <SidebarContent className="px-3 py-4">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => {
                    const isActive =
                      item.label === 'Earnings'
                        ? false
                        : item.exact
                          ? pathname === '/driver' || pathname === '/driver/'
                          : pathname.startsWith(item.to)

                    return (
                      <SidebarMenuItem key={item.label}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          className={cn(
                            'relative rounded-sm border border-transparent px-3 py-2.5',
                            isActive &&
                              'border-primary/10 bg-primary/5 text-primary hover:bg-primary/5 hover:text-primary after:absolute after:inset-y-2 after:right-0 after:w-0.5 after:rounded-sm after:bg-primary',
                          )}
                        >
                          <Link to={item.to}>
                            <item.icon className="size-4" />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-border px-3 py-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="rounded-sm">
                  <Link to="/driver">
                    <Settings className="size-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>

            <div className="mt-4 flex items-center gap-3 rounded-sm border border-border px-3 py-2.5">
              <Avatar className="size-9 rounded-sm">
                <AvatarFallback className="rounded-sm bg-primary/10 text-xs font-semibold text-primary">
                  {getInitials(profile?.fullName ?? profile?.email ?? 'DR')}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {profile?.fullName ?? 'Driver'}
                </p>
                <p className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                  Senior Driver
                </p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col bg-slate-50">
          <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border bg-white px-6">
            <div className="relative max-w-xl flex-1">
              <Input
                placeholder={searchPlaceholder}
                className="h-10 rounded-sm border-border bg-slate-50 pl-10"
              />
              <svg
                className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-sm">
                <CircleHelp className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-sm">
                <svg
                  className="size-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </Button>
              <Avatar className="size-9 rounded-sm">
                <AvatarFallback className="rounded-sm bg-primary/10 text-xs font-semibold text-primary">
                  {getInitials(profile?.fullName ?? profile?.email ?? 'DR')}
                </AvatarFallback>
              </Avatar>
            </div>
          </header>

          <main className="flex-1 px-6 py-8">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
