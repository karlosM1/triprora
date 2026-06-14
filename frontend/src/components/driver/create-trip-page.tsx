import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Briefcase,
  Calendar,
  Car,
  Clock,
  Info,
  MapPin,
  Users,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import {
  createDriverTrip,
  driverTripsQueryKey,
  type CreateDriverTripPayload,
} from '@/lib/api/driver-trips'
import { vansQueryKey } from '@/lib/api/vans'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'

const tripCategories = [
  { id: 'express', label: 'Express', icon: Zap },
  { id: 'business', label: 'Business', icon: Briefcase },
  { id: 'standard', label: 'Standard', icon: Users },
] as const

const terminals = [
  'Manila (PITX)',
  'Cubao Terminal',
  'Pasay (PITX)',
  'NAIA Terminal 3',
  'Makati CBD Terminal',
  'Baguio (Victory)',
  'Baguio Plaza',
]

type FormState = {
  departureLocation: string
  arrivalLocation: string
  departureDate: string
  departureTime: string
  tripCategory: CreateDriverTripPayload['tripCategory']
  vehicleName: string
  price: string
}

const initialForm: FormState = {
  departureLocation: '',
  arrivalLocation: '',
  departureDate: '',
  departureTime: '',
  tripCategory: 'express',
  vehicleName: '',
  price: '',
}

export function DriverCreateTripPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { profile } = useAuth()
  const [form, setForm] = useState<FormState>(initialForm)
  const [seats, setSeats] = useState([12])
  const [error, setError] = useState<string | null>(null)

  const baseFare = Number.parseFloat(form.price) || 0
  const estimatedRevenue = baseFare * seats[0]!
  const systemFee = estimatedRevenue * 0.08
  const expectedNet = estimatedRevenue - systemFee

  const createMutation = useMutation({
    mutationFn: (status: 'draft' | 'published') => {
      const payload: CreateDriverTripPayload = {
        departureLocation: form.departureLocation,
        arrivalLocation: form.arrivalLocation,
        departureDate: form.departureDate,
        departureTime: form.departureTime,
        tripCategory: form.tripCategory,
        vehicleName: form.vehicleName,
        price: Math.round(baseFare),
        totalSeats: seats[0]!,
        status,
      }
      return createDriverTrip(payload)
    },
    onSuccess: async (_trip, status) => {
      setError(null)
      await queryClient.invalidateQueries({ queryKey: driverTripsQueryKey })
      await queryClient.invalidateQueries({ queryKey: vansQueryKey })
      await navigate({ to: status === 'draft' ? '/driver/trips' : '/driver' })
    },
    onError: () => {
      setError('Failed to save trip. Check all fields and try again.')
    },
  })

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function validateForm() {
    if (!form.departureLocation.trim()) return 'Select a starting point.'
    if (!form.arrivalLocation.trim()) return 'Enter a destination.'
    if (!form.departureDate) return 'Select a departure date.'
    if (!form.departureTime) return 'Select a departure time.'
    if (!form.vehicleName.trim()) return 'Enter a vehicle name.'
    if (!baseFare || baseFare <= 0) return 'Enter a valid base fare.'
    return null
  }

  function handleSubmit(status: 'draft' | 'published') {
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }
    createMutation.mutate(status)
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Trip</h1>
          <p className="mt-1 text-muted-foreground">
            Configure a new route assignment for the premium fleet.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="rounded-sm"
            disabled={createMutation.isPending}
            onClick={() => handleSubmit('draft')}
          >
            Save as Draft
          </Button>
          <Button
            className="rounded-sm"
            disabled={createMutation.isPending}
            onClick={() => handleSubmit('published')}
          >
            Publish Trip
          </Button>
        </div>
      </div>

      {error && (
        <p className="rounded-sm border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card className="rounded-sm border border-border bg-white py-0 shadow-none ring-0">
            <CardHeader className="flex flex-row items-center gap-2 border-b border-border px-5 py-4">
              <MapPin className="size-4 text-primary" />
              <CardTitle className="text-base font-semibold">Route Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 px-5 py-5">
              <div className="space-y-2">
                <Label htmlFor="starting-point">Starting Point</Label>
                <Select
                  value={form.departureLocation}
                  onValueChange={(value) => updateField('departureLocation', value)}
                >
                  <SelectTrigger id="starting-point" className="w-full rounded-sm">
                    <SelectValue placeholder="Select Terminal" />
                  </SelectTrigger>
                  <SelectContent className="rounded-sm">
                    {terminals.map((terminal) => (
                      <SelectItem key={terminal} value={terminal}>
                        {terminal}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <Input
                  id="destination"
                  placeholder="e.g. Downtown Plaza"
                  className="rounded-sm"
                  value={form.arrivalLocation}
                  onChange={(event) =>
                    updateField('arrivalLocation', event.target.value)
                  }
                />
              </div>

              <div className="space-y-3">
                <Label>Trip Category</Label>
                <div className="grid gap-3 sm:grid-cols-3">
                  {tripCategories.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => updateField('tripCategory', item.id)}
                      className={cn(
                        'flex flex-col items-center gap-2 rounded-sm border px-4 py-4 text-sm font-medium transition-colors',
                        form.tripCategory === item.id
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border bg-white text-muted-foreground hover:border-primary/30',
                      )}
                    >
                      <item.icon className="size-5" />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-sm border border-border bg-white py-0 shadow-none ring-0">
            <CardHeader className="flex flex-row items-center gap-2 border-b border-border px-5 py-4">
              <Calendar className="size-4 text-primary" />
              <CardTitle className="text-base font-semibold">Schedule</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5 px-5 py-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="departure-date">Departure Date</Label>
                <Input
                  id="departure-date"
                  type="date"
                  className="rounded-sm"
                  value={form.departureDate}
                  onChange={(event) =>
                    updateField('departureDate', event.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="departure-time">Departure Time</Label>
                <Input
                  id="departure-time"
                  type="time"
                  className="rounded-sm"
                  value={form.departureTime}
                  onChange={(event) =>
                    updateField('departureTime', event.target.value)
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-sm border border-border bg-white py-0 shadow-none ring-0">
            <CardHeader className="flex flex-row items-center gap-2 border-b border-border px-5 py-4">
              <Car className="size-4 text-primary" />
              <CardTitle className="text-base font-semibold">
                Vehicle Assignment
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 py-5">
              <div className="space-y-2">
                <Label htmlFor="vehicle-name">Vehicle Name</Label>
                <Input
                  id="vehicle-name"
                  placeholder="e.g. Toyota Coaster"
                  className="rounded-sm"
                  value={form.vehicleName}
                  onChange={(event) =>
                    updateField('vehicleName', event.target.value)
                  }
                />
                {profile?.driverApplication?.vehicleInfo && (
                  <p className="text-xs text-muted-foreground">
                    Registered vehicle: {profile.driverApplication.vehicleInfo}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-sm border border-border bg-white py-0 shadow-none ring-0">
            <CardHeader className="flex flex-row items-center gap-2 border-b border-border px-5 py-4">
              <Clock className="size-4 text-primary" />
              <CardTitle className="text-base font-semibold">
                Pricing & Capacity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 px-5 py-5">
              <div className="space-y-2">
                <Label htmlFor="base-fare">Base Fare (₱)</Label>
                <div className="relative">
                  <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
                    ₱
                  </span>
                  <Input
                    id="base-fare"
                    type="number"
                    min="1"
                    placeholder="850"
                    className="rounded-sm pl-7"
                    value={form.price}
                    onChange={(event) => updateField('price', event.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Total Seats Available</Label>
                  <span className="rounded-sm border border-border px-2 py-0.5 text-sm font-medium">
                    {seats[0]}
                  </span>
                </div>
                <Slider
                  value={seats}
                  onValueChange={setSeats}
                  min={1}
                  max={18}
                  step={1}
                  className="py-2"
                />
              </div>

              <div className="space-y-2 border-t border-border pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated Revenue</span>
                  <span className="font-semibold">₱{estimatedRevenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">System Fee (8%)</span>
                  <span className="text-destructive">-₱{systemFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2">
                  <span className="font-medium">Expected Net</span>
                  <span className="text-lg font-bold text-primary">
                    ₱{expectedNet.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 rounded-sm bg-primary/5 p-3 text-xs text-muted-foreground">
                <Info className="mt-0.5 size-4 shrink-0 text-primary" />
                <p>
                  Publishing this trip will make it instantly visible to passengers
                  on Find Vans.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
