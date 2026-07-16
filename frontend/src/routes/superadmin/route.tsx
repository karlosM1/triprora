import { createFileRoute } from '@tanstack/react-router'
import { SuperadminLayout } from '@/components/superadmin/superadmin-layout'
import { requireRole } from '@/lib/route-guards'

export const Route = createFileRoute('/superadmin')({
  beforeLoad: async () => {
    await requireRole('/superadmin', 'superadmin')
  },
  component: SuperadminLayout,
})
