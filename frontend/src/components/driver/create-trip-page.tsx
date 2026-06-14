import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Briefcase, Calendar, Car, Clock, Info, MapPin, Users, Zap } from 'lucide-react'
import { AppleCard, PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
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

const pickupAreas = [
  'Casiguran, Aurora (Door-to-Door)',
  'Brgy. Poblacion, Casiguran',
  'Brgy. Calabgan, Casiguran',
  'Brgy. Dibacong, Casiguran',
  'Brgy. Esteves, Casiguran',
]

const manilaDropOffAreas = [
  'Cubao, Quezon City',
  'Makati CBD',
  'Pasay / NAIA Area',
  'Quezon City',
  'Manila City',
  'Taguig / BGC',
  'Pasig City',
]

type FormState = {
  departureLocation: string
  arrivalLocation: string
  departureDate: string
  departureTime: string
  tripCategory: CreateDriverTripPayload['tripCategory']
  vehicleName: string
  plateNumber: string
  price: string
}

const initialForm: FormState = {
  departureLocation: 'Casiguran, Aurora (Door-to-Door)',
  arrivalLocation: '',
  departureDate: '',
  departureTime: '',
  tripCategory: 'standard',
  vehicleName: '',
  plateNumber: '',
  price: '',
}

const appleInputClass =
  'h-11 rounded-xl border-[#d2d2d7] bg-white text-[15px] focus-visible:ring-[#0071e3]/40'

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
        plateNumber: form.plateNumber.trim() || undefined,
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
    if (!form.departureLocation.trim()) return 'Select a pickup service area.'
    if (!form.arrivalLocation.trim()) return 'Select a Metro Manila drop-off area.'
    if (!form.departureDate) return 'Select a departure date.'
    if (!form.departureTime) return 'Select a departure time.'
    if (!form.vehicleName.trim()) return 'Enter a vehicle name.'
    if (!form.plateNumber.trim()) return 'Enter the plate number.'
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
    <div className="space-y-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          eyebrow="Driver portal"
          title="Create a trip."
          subtitle="Publish a door-to-door trip between Aurora and Metro Manila."
        />
        <div className="flex shrink-0 gap-2 pt-2">
          <Button
            variant="ghost"
            className="h-10 rounded-full px-5 text-[14px] text-[#0066cc] hover:bg-[#0071e3]/5"
            disabled={createMutation.isPending}
            onClick={() => handleSubmit('draft')}
          >
            Save draft
          </Button>
          <Button
            className="h-10 rounded-full bg-[#0071e3] px-5 text-[14px] font-normal hover:bg-[#0077ed]"
            disabled={createMutation.isPending}
            onClick={() => handleSubmit('published')}
          >
            Publish trip
          </Button>
        </div>
      </div>

      {error && (
        <p className="rounded-xl bg-[#fff2f2] px-4 py-3 text-[14px] text-[#bf4800] ring-1 ring-[#bf4800]/15">
          {error}
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <AppleCard className="overflow-hidden">
            <div className="flex items-center gap-2 border-b border-[#d2d2d7]/60 px-6 py-4">
              <MapPin className="size-4 text-[#86868b]" />
              <h2 className="text-[17px] font-semibold text-[#1d1d1f]">Route details</h2>
            </div>
            <div className="space-y-5 p-6">
              <div className="space-y-2">
                <Label htmlFor="pickup-area" className="text-[13px] text-[#1d1d1f]">
                  Pickup service area
                </Label>
                <Select
                  value={form.departureLocation}
                  onValueChange={(value) => updateField('departureLocation', value)}
                >
                  <SelectTrigger id="pickup-area" className={cn('w-full', appleInputClass)}>
                    <SelectValue placeholder="Select pickup area" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {pickupAreas.map((area) => (
                      <SelectItem key={area} value={area}>
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[13px] text-[#86868b]">
                  Passengers enter their exact home address when booking.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination" className="text-[13px] text-[#1d1d1f]">
                  Metro Manila drop-off area
                </Label>
                <Select
                  value={form.arrivalLocation}
                  onValueChange={(value) => updateField('arrivalLocation', value)}
                >
                  <SelectTrigger id="destination" className={cn('w-full', appleInputClass)}>
                    <SelectValue placeholder="Select Metro Manila area" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {manilaDropOffAreas.map((area) => (
                      <SelectItem key={area} value={area}>
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-[13px] text-[#1d1d1f]">Trip category</Label>
                <div className="grid gap-3 sm:grid-cols-3">
                  {tripCategories.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => updateField('tripCategory', item.id)}
                      className={cn(
                        'flex flex-col items-center gap-2 rounded-xl px-4 py-4 text-[14px] font-medium transition-all',
                        form.tripCategory === item.id
                          ? 'bg-[#1d1d1f] text-white ring-1 ring-[#1d1d1f]'
                          : 'bg-[#f5f5f7] text-[#86868b] ring-1 ring-[#d2d2d7] hover:text-[#1d1d1f]',
                      )}
                    >
                      <item.icon className="size-5" />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </AppleCard>

          <AppleCard className="overflow-hidden">
            <div className="flex items-center gap-2 border-b border-[#d2d2d7]/60 px-6 py-4">
              <Calendar className="size-4 text-[#86868b]" />
              <h2 className="text-[17px] font-semibold text-[#1d1d1f]">Schedule</h2>
            </div>
            <div className="grid gap-5 p-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="departure-date" className="text-[13px] text-[#1d1d1f]">
                  Departure date
                </Label>
                <Input
                  id="departure-date"
                  type="date"
                  className={appleInputClass}
                  value={form.departureDate}
                  onChange={(event) => updateField('departureDate', event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="departure-time" className="text-[13px] text-[#1d1d1f]">
                  Departure time
                </Label>
                <Input
                  id="departure-time"
                  type="time"
                  className={appleInputClass}
                  value={form.departureTime}
                  onChange={(event) => updateField('departureTime', event.target.value)}
                />
              </div>
            </div>
          </AppleCard>

          <AppleCard className="overflow-hidden">
            <div className="flex items-center gap-2 border-b border-[#d2d2d7]/60 px-6 py-4">
              <Car className="size-4 text-[#86868b]" />
              <h2 className="text-[17px] font-semibold text-[#1d1d1f]">Vehicle</h2>
            </div>
            <div className="space-y-5 p-6">
              <div className="space-y-2">
                <Label htmlFor="vehicle-name" className="text-[13px] text-[#1d1d1f]">
                  Vehicle name / model
                </Label>
                <Input
                  id="vehicle-name"
                  placeholder="e.g. Toyota Hiace GL Grandia"
                  className={appleInputClass}
                  value={form.vehicleName}
                  onChange={(event) => updateField('vehicleName', event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plate-number" className="text-[13px] text-[#1d1d1f]">
                  Plate number
                </Label>
                <Input
                  id="plate-number"
                  placeholder="e.g. ABC 1234"
                  className={appleInputClass}
                  value={form.plateNumber}
                  onChange={(event) => updateField('plateNumber', event.target.value)}
                />
              </div>
              {profile?.driverApplication?.vehicleInfo && (
                <p className="text-[13px] text-[#86868b]">
                  Registered: {profile.driverApplication.vehicleInfo}
                  {profile.driverApplication.licenseNo &&
                    ` · License ${profile.driverApplication.licenseNo}`}
                </p>
              )}
            </div>
          </AppleCard>
        </div>

        <AppleCard className="h-fit overflow-hidden">
          <div className="flex items-center gap-2 border-b border-[#d2d2d7]/60 px-6 py-4">
            <Clock className="size-4 text-[#86868b]" />
            <h2 className="text-[17px] font-semibold text-[#1d1d1f]">Pricing</h2>
          </div>
          <div className="space-y-5 p-6">
            <div className="space-y-2">
              <Label htmlFor="base-fare" className="text-[13px] text-[#1d1d1f]">
                Base fare per seat (₱)
              </Label>
              <div className="relative">
                <span className="absolute top-1/2 left-4 -translate-y-1/2 text-[15px] text-[#86868b]">
                  ₱
                </span>
                <Input
                  id="base-fare"
                  type="number"
                  min="1"
                  placeholder="850"
                  className={cn(appleInputClass, 'pl-8')}
                  value={form.price}
                  onChange={(event) => updateField('price', event.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-[13px] text-[#1d1d1f]">Total seats</Label>
                <span className="rounded-full bg-[#f5f5f7] px-3 py-1 text-[14px] font-medium text-[#1d1d1f]">
                  {seats[0]}
                </span>
              </div>
              <Slider
                value={seats}
                onValueChange={setSeats}
                min={1}
                max={18}
                step={1}
                className="py-2 accent-[#0071e3]"
              />
            </div>

            <div className="space-y-2 border-t border-[#d2d2d7]/60 pt-4 text-[14px]">
              <div className="flex justify-between text-[#86868b]">
                <span>Estimated revenue</span>
                <span className="font-medium text-[#1d1d1f]">
                  ₱{estimatedRevenue.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-[#86868b]">
                <span>System fee (8%)</span>
                <span className="text-[#bf4800]">−₱{systemFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-[#d2d2d7]/60 pt-3">
                <span className="font-medium text-[#1d1d1f]">Expected net</span>
                <span className="text-[19px] font-semibold text-[#1d1d1f]">
                  ₱{expectedNet.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex gap-3 rounded-xl bg-[#f0f7ff] p-4 text-[13px] text-[#86868b]">
              <Info className="mt-0.5 size-4 shrink-0 text-[#0066cc]" />
              <p>
                Door-to-door service — passengers provide exact pickup and drop-off
                addresses when booking.
              </p>
            </div>
          </div>
        </AppleCard>
      </div>
    </div>
  )
}
