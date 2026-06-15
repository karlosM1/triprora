import { Navigate, Outlet } from '@tanstack/react-router'
import { DriverSubNav } from '@/components/driver/driver-sub-nav'
import { Footer } from '@/components/landing/footer'
import { Header } from '@/components/landing/header'
import { useAuth } from '@/lib/auth-context'

export function DriverLayout() {
  const { profile, profileReady, user } = useAuth()

  if (user && profileReady && profile?.role !== 'driver') {
    return <Navigate to="/my-bookings" />
  }

  if (user && !profile) {
    return (
      <div className="app-page min-h-svh bg-[#f5f5f7]">
        <Header activeLink="driver-portal" />
        <main className="mx-auto max-w-[980px] px-6 py-16 lg:px-8">
          <p className="text-sm text-[#86868b]">Loading driver portal...</p>
        </main>
      </div>
    )
  }

  return (
    <div className="app-page min-h-svh bg-[#f5f5f7]">
      <Header activeLink="driver-portal" />
      <DriverSubNav />

      {profile && (
        <div className="border-b border-black/5 bg-[#f5f5f7]">
          <div className="mx-auto max-w-[980px] px-6 py-3 lg:px-8">
            <p className="text-[13px] text-[#86868b]">
              Signed in as{' '}
              <span className="font-medium text-[#1d1d1f]">
                {profile.fullName ?? profile.email}
              </span>
            </p>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-[980px] px-6 py-10 lg:px-8 lg:py-14">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}
