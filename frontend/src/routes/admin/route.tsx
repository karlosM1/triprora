import { createFileRoute } from '@tanstack/react-router'
import { AdminLayout } from '@/components/admin/admin-layout'
import { requireRole } from '@/lib/route-guards'

export const Route = createFileRoute('/admin')({
  beforeLoad: async () => {
    await requireRole('/admin', 'admin')
  },
  component: AdminLayout,
})
