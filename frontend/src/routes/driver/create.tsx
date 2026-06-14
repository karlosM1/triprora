import { createFileRoute } from '@tanstack/react-router'
import { DriverCreateTripPage } from '@/components/driver/create-trip-page'

export const Route = createFileRoute('/driver/create')({
  component: DriverCreateTripPage,
})
