import { createFileRoute } from '@tanstack/react-router'
import { ProfilePage } from '@/components/profile/profile-page'
import { requireAuth } from '@/lib/route-guards'

export const Route = createFileRoute('/profile')({
  beforeLoad: async () => {
    await requireAuth('/profile')
  },
  component: ProfilePage,
})
