import { Home, MapPin } from 'lucide-react'
import { AppleCard, SectionTitle } from '@/components/layout/page-header'
import type { TripAddresses } from '@/lib/booking'
import { cn } from '@/lib/utils'

type TripAddressFormProps = {
  values: TripAddresses
  onChange: (values: TripAddresses) => void
}

export function TripAddressForm({ values, onChange }: TripAddressFormProps) {
  function update(field: keyof TripAddresses, value: string) {
    onChange({ ...values, [field]: value })
  }

  return (
    <AppleCard className="p-6 sm:p-8">
      <SectionTitle
        title="Your addresses"
        subtitle="Door-to-door service — no terminals. Tell us where to pick you up and drop you off."
      />

      <div className="space-y-5">
        <AddressField
          icon={<Home className="size-4 text-[#0066cc]" strokeWidth={1.75} />}
          label="Pickup address"
          hint="Your home or pickup point in Casiguran, Aurora"
          placeholder="e.g. Brgy. Poblacion, Casiguran, Aurora"
          value={values.pickupAddress}
          onChange={(v) => update('pickupAddress', v)}
        />
        <AddressField
          icon={<MapPin className="size-4 text-[#0066cc]" strokeWidth={1.75} />}
          label="Destination address"
          hint="Your exact drop-off location in Metro Manila"
          placeholder="e.g. 123 EDSA, Cubao, Quezon City"
          value={values.dropoffAddress}
          onChange={(v) => update('dropoffAddress', v)}
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
}: {
  icon: React.ReactNode
  label: string
  hint: string
  placeholder: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <span className="flex items-center gap-2 text-[13px] font-medium text-[#1d1d1f]">
        {icon}
        {label}
      </span>
      <span className="mt-0.5 block text-[12px] text-[#86868b]">{hint}</span>
      <textarea
        placeholder={placeholder}
        value={value}
        rows={2}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'mt-2 w-full resize-none rounded-xl bg-white px-4 py-3 text-[15px] text-[#1d1d1f] placeholder:text-[#86868b]/70 ring-1 ring-[#d2d2d7] transition-all outline-none',
          'focus:ring-2 focus:ring-[#0071e3]/40',
        )}
      />
    </label>
  )
}
