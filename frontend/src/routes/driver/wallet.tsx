import { createFileRoute } from '@tanstack/react-router'
import { DriverWalletPage } from '@/components/driver/driver-wallet-page'

export const Route = createFileRoute('/driver/wallet')({
  component: DriverWalletPage,
})
