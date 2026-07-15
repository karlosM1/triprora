import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { ArrowLeft, Calendar, Car, Clock, Info, MapPin } from 'lucide-react'
import { AppleCard, PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PlaceInput } from '@/components/ui/place-input'
import { TimePicker } from '@/components/ui/time-picker'
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
  driverTripDetailsQueryKey,
  driverTripDetailsQueryOptions,
  driverTripsQueryKey,
  updateDriverTrip,
  type CreateDriverTripPayload,
} from '@/lib/api/driver-trips'
import { vansQueryKey } from '@/lib/api/vans'
import { useAuth } from '@/lib/auth-context'
import { TRIP_DESTINATION_PLACES } from '@/lib/places'
import type { DriverApplication } from '@/lib/types/profile'
import { todayDateInputValue } from '@/lib/trip-search'
import { cn } from '@/lib/utils'

type FormState = {
  departureLocation: string
  arrivalLocation: string
  departureDate: string
  departureTime: string
  durationHours: string
  durationMinutes: string
  vehicleName: string
  plateNumber: string
  price: string
}

const initialForm: FormState = {
  departureLocation: 'Aurora',
  arrivalLocation: 'Metro Manila',
  departureDate: '',
  departureTime: '',
  durationHours: '8',
  durationMinutes: '0',
  vehicleName: '',
  plateNumber: '',
  price: '',
}

const appleInputClass =
  'h-11 rounded-xl border-[#d2d2d7] bg-white text-[15px] focus-visible:ring-[#0071e3]/40'

const placeFieldClass =
  'h-11 gap-2 rounded-xl bg-white px-3 ring-1 ring-[#d2d2d7] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0071e3]/40'

const DURATION_MINUTE_OPTIONS = [
  { value: '0', label: '0 min' },
  { value: '15', label: '15 min' },
  { value: '30', label: '30 min' },
  { value: '45', label: '45 min' },
] as const

function parseDurationParts(duration: string): {
  durationHours: string
  durationMinutes: string
} {
  const match = duration.trim().match(/^(\d+)\s*h(?:\s+(\d+)\s*m)?$/i)
  if (!match) {
    return { durationHours: '8', durationMinutes: '0' }
  }

  const hours = Number(match[1])
  const minutes = Number(match[2] ?? 0)
  const nearest = DURATION_MINUTE_OPTIONS.reduce((best, option) => {
    const candidate = Number(option.value)
    return Math.abs(candidate - minutes) < Math.abs(Number(best) - minutes)
      ? option.value
      : best
  }, '0')

  return {
    durationHours: String(hours),
    durationMinutes: nearest,
  }
}

function toDurationHours(hours: string, minutes: string) {
  return Number(hours) + Number(minutes) / 60
}

function formatDurationPreview(hours: string, minutes: string) {
  const wholeHours = Number(hours)
  const mins = Number(minutes)
  if (!Number.isFinite(wholeHours) || wholeHours < 1) return null
  if (mins === 0) return `${wholeHours}h`
  return `${wholeHours}h ${mins}m`
}

type DriverCreateTripPageProps = {
  draftTripId?: string
}

function formStateFromTrip(trip: {
  departureLocation: string
  arrivalLocation: string
  departureDate: string
  departureTime: string
  duration: string
  vehicleName: string | null
  plateNumber?: string | null
  price: number
}): FormState {
  return {
    departureLocation: trip.departureLocation,
    arrivalLocation: trip.arrivalLocation,
    departureDate: trip.departureDate,
    departureTime: trip.departureTime,
    ...parseDurationParts(trip.duration),
    vehicleName: trip.vehicleName ?? '',
    plateNumber: trip.plateNumber ?? '',
    price: String(trip.price),
  }
}

function vehicleDefaultsFromApplication(application: DriverApplication) {
  return {
    vehicleName: `${application.vehicleMake} ${application.vehicleModel} ${application.vehicleYear}`.trim(),
    plateNumber: application.vehiclePlateNumber,
    totalSeats: application.vehicleCapacity,
  }
}

export function DriverCreateTripPage({ draftTripId }: DriverCreateTripPageProps = {}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { profile } = useAuth()
  const isEditing = Boolean(draftTripId)
  const draftQuery = useQuery({
    ...driverTripDetailsQueryOptions(draftTripId!),
    enabled: isEditing,
  })
  const [form, setForm] = useState<FormState>(initialForm)
  const [seats, setSeats] = useState([13])
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)
  const [vehiclePrefilled, setVehiclePrefilled] = useState(false)

  useEffect(() => {
    if (isEditing || vehiclePrefilled) return

    const application = profile?.driverApplication
    if (!application || application.status !== 'approved') return

    const defaults = vehicleDefaultsFromApplication(application)
    setForm((current) => ({
      ...current,
      vehicleName: defaults.vehicleName,
      plateNumber: defaults.plateNumber,
    }))
    setSeats([defaults.totalSeats])
    setVehiclePrefilled(true)
  }, [isEditing, profile?.driverApplication, vehiclePrefilled])

  useEffect(() => {
    if (!isEditing || !draftQuery.data || initialized) return

    const { trip } = draftQuery.data
    if (trip.status !== 'draft') {
      void navigate({ to: '/driver/trips/$tripId', params: { tripId: trip.id } })
      return
    }

    setForm(formStateFromTrip(trip))
    setSeats([trip.totalSeats ?? 13])
    setInitialized(true)
  }, [draftQuery.data, initialized, isEditing, navigate])

  const baseFare = Number.parseFloat(form.price) || 0
  const durationHoursValue = toDurationHours(form.durationHours, form.durationMinutes)
  const durationPreview = formatDurationPreview(
    form.durationHours,
    form.durationMinutes,
  )
  const estimatedRevenue = baseFare * seats[0]!
  const systemFee = estimatedRevenue * 0.04
  const expectedNet = estimatedRevenue - systemFee

  const saveMutation = useMutation({
    mutationFn: (status: 'draft' | 'published') => {
      const payload: CreateDriverTripPayload = {
        departureLocation: form.departureLocation,
        arrivalLocation: form.arrivalLocation,
        departureDate: form.departureDate,
        departureTime: form.departureTime,
        durationHours: durationHoursValue,
        tripCategory: 'standard',
        vehicleName: form.vehicleName,
        plateNumber: form.plateNumber.trim() || undefined,
        price: Math.round(baseFare),
        totalSeats: seats[0]!,
        status,
      }
      return isEditing
        ? updateDriverTrip(draftTripId!, payload)
        : createDriverTrip(payload)
    },
    onSuccess: async (_trip, status) => {
      setError(null)
      await queryClient.invalidateQueries({ queryKey: driverTripsQueryKey })
      if (draftTripId) {
        await queryClient.invalidateQueries({
          queryKey: driverTripDetailsQueryKey(draftTripId),
        })
      }
      await queryClient.invalidateQueries({ queryKey: vansQueryKey })
      await navigate({ to: status === 'draft' ? '/driver/trips' : '/driver' })
    },
    onError: () => {
      setError(
        isEditing
          ? 'Failed to update trip. Check all fields and try again.'
          : 'Failed to save trip. Check all fields and try again.',
      )
    },
  })

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function validateForm() {
    if (!form.departureLocation.trim()) return 'Select a pickup service area.'
    if (!form.arrivalLocation.trim()) return 'Select a drop-off service area.'
    if (!form.departureDate) return 'Select a departure date.'
    if (!form.departureTime) return 'Select a departure time.'
    if (
      !Number.isFinite(durationHoursValue) ||
      durationHoursValue < 1 ||
      durationHoursValue > 24
    ) {
      return 'Enter a trip duration between 1 and 24 hours.'
    }
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
    saveMutation.mutate(status)
  }

  if (isEditing && draftQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Link
          to="/driver/trips"
          className="inline-flex items-center gap-2 text-[14px] text-[#0066cc] hover:underline"
        >
          <ArrowLeft className="size-4" />
          Back to My Trips
        </Link>
        <p className="text-[15px] text-[#86868b]">Loading draft...</p>
      </div>
    )
  }

  if (isEditing && draftQuery.isError) {
    return (
      <div className="space-y-4">
        <Link
          to="/driver/trips"
          className="inline-flex items-center gap-2 text-[14px] text-[#0066cc] hover:underline"
        >
          <ArrowLeft className="size-4" />
          Back to My Trips
        </Link>
        <p className="rounded-xl bg-[#fff2f2] px-4 py-3 text-[14px] text-[#bf4800] ring-1 ring-[#bf4800]/15">
          Unable to load this draft. It may have been removed or already published.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {isEditing && (
        <Link
          to="/driver/trips"
          className="inline-flex items-center gap-2 text-[14px] text-[#0066cc] hover:underline"
        >
          <ArrowLeft className="size-4" />
          Back to My Trips
        </Link>
      )}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          eyebrow="Driver portal"
          title={isEditing ? 'Continue your trip.' : 'Create a trip.'}
          subtitle={
            isEditing
              ? 'Finish setting up your draft and publish when you are ready.'
              : 'Publish a door-to-door trip between Aurora and Metro Manila.'
          }
        />
        <div className="flex shrink-0 gap-2 pt-2">
          <Button
            variant="ghost"
            className="h-10 rounded-full px-5 text-[14px] text-[#0066cc] hover:bg-[#0071e3]/5"
            disabled={saveMutation.isPending}
            onClick={() => handleSubmit('draft')}
          >
            Save draft
          </Button>
          <Button
            className="h-10 rounded-full bg-[#0071e3] px-5 text-[14px] font-normal hover:bg-[#0077ed]"
            disabled={saveMutation.isPending}
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
                <PlaceInput
                  value={form.departureLocation}
                  onChange={(value) => updateField('departureLocation', value)}
                  places={TRIP_DESTINATION_PLACES}
                  placeholder="Aurora or Metro Manila"
                  fieldClassName={placeFieldClass}
                  inputClassName="text-[15px] placeholder:text-[#86868b]"
                />
                <p className="text-[13px] text-[#86868b]">
                  Passengers enter their exact home address when booking.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination" className="text-[13px] text-[#1d1d1f]">
                  Drop-off service area
                </Label>
                <PlaceInput
                  value={form.arrivalLocation}
                  onChange={(value) => updateField('arrivalLocation', value)}
                  places={TRIP_DESTINATION_PLACES}
                  placeholder="Metro Manila or Aurora"
                  fieldClassName={placeFieldClass}
                  inputClassName="text-[15px] placeholder:text-[#86868b]"
                />
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
                <DatePicker
                  value={form.departureDate}
                  onChange={(value) => updateField('departureDate', value)}
                  min={todayDateInputValue()}
                  placeholder="Select date"
                  className={cn(
                    appleInputClass,
                    'border px-3 hover:bg-[#fafafa]',
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="departure-time" className="text-[13px] text-[#1d1d1f]">
                  Departure time
                </Label>
                <TimePicker
                  value={form.departureTime}
                  onChange={(value) => updateField('departureTime', value)}
                  placeholder="Select time"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-[13px] text-[#1d1d1f]">
                  Estimated trip duration
                </Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="relative">
                    <Input
                      id="duration-hours"
                      type="number"
                      min={1}
                      max={24}
                      step={1}
                      placeholder="8"
                      className={cn(
                        appleInputClass,
                        'pr-14 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
                      )}
                      value={form.durationHours}
                      onChange={(event) =>
                        updateField('durationHours', event.target.value)
                      }
                    />
                    <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-[13px] text-[#86868b]">
                      hours
                    </span>
                  </div>
                  <div className="relative">
                    <Select
                      value={form.durationMinutes}
                      onValueChange={(value) =>
                        updateField('durationMinutes', value)
                      }
                    >
                      <SelectTrigger
                        className={cn(
                          '!h-11 min-h-11 w-full rounded-xl border-[#d2d2d7] bg-white pr-14 text-[15px] shadow-none focus-visible:ring-[#0071e3]/40',
                          '[&_svg]:hidden',
                        )}
                      >
                        <SelectValue placeholder="0" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {DURATION_MINUTE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="pointer-events-none absolute top-1/2 right-4 z-10 -translate-y-1/2 text-[13px] text-[#86868b]">
                      mins
                    </span>
                  </div>
                </div>
                <p className="text-[13px] text-[#86868b]">
                  {durationPreview
                    ? `Shown to passengers as ${durationPreview}. Arrival time is calculated from departure.`
                    : 'Passengers will see this duration on Find Vans.'}
                </p>
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
              {profile?.driverApplication?.status === 'approved' && (
                <p className="text-[13px] text-[#86868b]">
                  Filled from your registered vehicle
                  {profile.driverApplication.licenseNo
                    ? ` · License ${profile.driverApplication.licenseNo}`
                    : ''}
                  .
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
                <span>System fee (4%)</span>
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
                Door-to-door service. Passengers provide exact pickup and drop-off
                addresses when booking.
              </p>
            </div>
          </div>
        </AppleCard>
      </div>
    </div>
  )
}
