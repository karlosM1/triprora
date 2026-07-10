import { createFileRoute } from '@tanstack/react-router'
import { AdminWalletPage } from '@/components/admin/admin-wallet-page'

export const Route = createFileRoute('/admin/wallets')({
  component: AdminWalletPage,
})
