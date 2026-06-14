import { Home, MapPin } from 'lucide-react'
import type { TripAddresses } from '@/lib/booking'

type TripAddressFormProps = {
  values: TripAddresses
  onChange: (values: TripAddresses) => void
}

export function TripAddressForm({ values, onChange }: TripAddressFormProps) {
  function update(field: keyof TripAddresses, value: string) {
    onChange({ ...values, [field]: value })
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5">
      <div className="flex items-center gap-2">
        <MapPin className="size-4 text-primary" />
        <h2 className="text-base font-bold text-foreground">Your Trip Addresses</h2>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Door-to-door service — no terminals. Enter where the van should pick you
        up and where you want to be dropped off.
      </p>

      <div className="mt-5 space-y-4">
        <AddressField
          icon={<Home className="size-4 text-primary" />}
          label="Pickup Address"
          hint="Your home or pickup point in Casiguran, Aurora"
          placeholder="e.g. Brgy. Poblacion, Casiguran, Aurora"
          value={values.pickupAddress}
          onChange={(v) => update('pickupAddress', v)}
        />
        <AddressField
          icon={<MapPin className="size-4 text-primary" />}
          label="Destination Address"
          hint="Your exact drop-off location in Metro Manila"
          placeholder="e.g. 123 EDSA, Cubao, Quezon City"
          value={values.dropoffAddress}
          onChange={(v) => update('dropoffAddress', v)}
        />
      </div>
    </div>
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
      <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="mt-0.5 block text-[11px] text-muted-foreground/80">{hint}</span>
      <textarea
        placeholder={placeholder}
        value={value}
        rows={2}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full resize-none rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </label>
  )
}
