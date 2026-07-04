import { createFileRoute } from '@tanstack/react-router'
import { DriverCreateTripPage } from '@/components/driver/create-trip-page'

export const Route = createFileRoute('/driver/trips/$tripId/edit')({
  component: DriverEditTripPage,
})

function DriverEditTripPage() {
  const { tripId } = Route.useParams()
  return <DriverCreateTripPage draftTripId={tripId} />
}
