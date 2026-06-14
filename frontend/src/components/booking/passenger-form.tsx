import { User } from 'lucide-react'
import type { PassengerDetails } from '@/lib/booking'

type PassengerFormProps = {
  values: PassengerDetails
  onChange: (values: PassengerDetails) => void
  readOnly?: boolean
}

export function PassengerForm({
  values,
  onChange,
  readOnly = false,
}: PassengerFormProps) {
  function update(field: keyof PassengerDetails, value: string) {
    onChange({ ...values, [field]: value })
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5">
      <div className="flex items-center gap-2">
        <User className="size-4 text-primary" />
        <h2 className="text-base font-bold text-foreground">Passenger Details</h2>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field
          label="First Name"
          placeholder="John"
          value={values.firstName}
          onChange={(v) => update('firstName', v)}
          readOnly={readOnly}
        />
        <Field
          label="Last Name"
          placeholder="Doe"
          value={values.lastName}
          onChange={(v) => update('lastName', v)}
          readOnly={readOnly}
        />
        <div className="sm:col-span-2">
          <Field
            label="Email Address"
            placeholder="john.doe@email.com"
            type="email"
            value={values.email}
            onChange={(v) => update('email', v)}
            readOnly={readOnly}
          />
        </div>
        <div className="sm:col-span-2">
          <Field
            label="Phone Number"
            placeholder="+63 (555) 000-0000"
            type="tel"
            value={values.phone}
            onChange={(v) => update('phone', v)}
            readOnly={readOnly}
          />
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  readOnly,
}: {
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  type?: string
  readOnly?: boolean
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 read-only:bg-muted/30"
      />
    </label>
  )
}
