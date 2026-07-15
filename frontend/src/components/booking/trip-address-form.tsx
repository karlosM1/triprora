import { useQuery } from '@tanstack/react-query'
import { Home, MapPin, UserRound } from 'lucide-react'
import { AppleCard, SectionTitle } from '@/components/layout/page-header'
import {
  destinationAddressesQueryKey,
  fetchDestinationAddresses,
} from '@/lib/api/destination-addresses'
import { useAuth } from '@/lib/auth-context'
import type { TripAddresses } from '@/lib/booking'
import { formatProfileAddress } from '@/lib/format-profile-address'
import { cn } from '@/lib/utils'

type TripAddressFormProps = {
  values: TripAddresses
  onChange: (values: TripAddresses) => void
}

type AddressSuggestion = {
  key: string
  label: string
  address: string
  onSelect: () => void
}

export function TripAddressForm({ values, onChange }: TripAddressFormProps) {
  const { profile, user } = useAuth()
  const destinationsQuery = useQuery({
    queryKey: destinationAddressesQueryKey,
    queryFn: fetchDestinationAddresses,
    enabled: Boolean(user),
  })

  function update(field: keyof TripAddresses, value: string) {
    onChange({ ...values, [field]: value })
  }

  const profileAddress = formatProfileAddress(profile)
  const showPickupSuggestion =
    Boolean(profileAddress) &&
    values.pickupAddress.trim() !== profileAddress

  const destinationSuggestions: AddressSuggestion[] = (destinationsQuery.data ?? [])
    .map((destination) => {
      const address = formatProfileAddress(destination)
      if (!address) return null
      return {
        key: destination.id,
        label: destination.label,
        address,
        onSelect: () => update('dropoffAddress', address),
      }
    })
    .filter((item): item is AddressSuggestion => item !== null)
    .filter((item) => item.address !== values.dropoffAddress.trim())

  return (
    <AppleCard className="p-6 sm:p-8">
      <SectionTitle
        title="Your addresses"
        subtitle="Door-to-door service, no terminals. Tell us where to pick you up and drop you off."
      />

      <div className="space-y-5">
        <AddressField
          icon={<Home className="size-4 text-[#0066cc]" strokeWidth={1.75} />}
          label="Pickup address"
          hint="Your home or pickup point in Casiguran, Aurora"
          placeholder="e.g. Brgy. Poblacion, Casiguran, Aurora"
          value={values.pickupAddress}
          onChange={(v) => update('pickupAddress', v)}
          suggestions={
            showPickupSuggestion && profileAddress
              ? [
                  {
                    key: 'profile-home',
                    label: 'Suggested from your profile',
                    address: profileAddress,
                    onSelect: () => update('pickupAddress', profileAddress),
                  },
                ]
              : []
          }
        />
        <AddressField
          icon={<MapPin className="size-4 text-[#0066cc]" strokeWidth={1.75} />}
          label="Destination address"
          hint="Your exact drop-off location in Metro Manila"
          placeholder="e.g. 123 EDSA, Cubao, Quezon City"
          value={values.dropoffAddress}
          onChange={(v) => update('dropoffAddress', v)}
          suggestions={destinationSuggestions}
        />
      </div>
    </AppleCard>
  )
}

function AddressField({
  icon,
  label,
  hint,
  placeholder,
  value,
  onChange,
  suggestions = [],
}: {
  icon: React.ReactNode
  label: string
  hint: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  suggestions?: AddressSuggestion[]
}) {
  return (
    <label className="block">
      <span className="flex items-center gap-2 text-[13px] font-medium text-[#1d1d1f]">
        {icon}
        {label}
      </span>
      <span className="mt-0.5 block text-[12px] text-[#86868b]">{hint}</span>

      {suggestions.length > 0 && (
        <div className="mt-2 space-y-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.key}
              type="button"
              onClick={suggestion.onSelect}
              className="flex w-full items-start gap-3 rounded-xl bg-[#f0f7ff] px-3.5 py-3 text-left ring-1 ring-[#0071e3]/15 transition-colors hover:bg-[#e8f2ff]"
            >
              <UserRound
                className="mt-0.5 size-4 shrink-0 text-[#0066cc]"
                strokeWidth={1.75}
              />
              <span className="min-w-0">
                <span className="block text-[12px] font-medium text-[#0066cc]">
                  {suggestion.label}
                </span>
                <span className="mt-0.5 block text-[13px] leading-snug text-[#1d1d1f]">
                  {suggestion.address}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}

      <textarea
        placeholder={placeholder}
        value={value}
        rows={2}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          // text-base (16px) prevents iOS Safari auto-zoom on focus
          'mt-2 w-full resize-none rounded-xl bg-white px-4 py-3 text-base text-[#1d1d1f] placeholder:text-[#86868b]/70 ring-1 ring-[#d2d2d7] transition-all outline-none',
          'focus:ring-2 focus:ring-[#0071e3]/40',
        )}
      />
    </label>
  )
}
