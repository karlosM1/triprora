import { User } from 'lucide-react'
import { AppleCard, SectionTitle } from '@/components/layout/page-header'
import type { PassengerDetails } from '@/lib/booking'
import { cn } from '@/lib/utils'

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
    <AppleCard className="p-6 sm:p-8">
      <SectionTitle
        title="Passenger details"
        subtitle="We'll send your booking confirmation to this email."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="First name"
          placeholder="John"
          value={values.firstName}
          onChange={(v) => update('firstName', v)}
          readOnly={readOnly}
        />
        <Field
          label="Last name"
          placeholder="Doe"
          value={values.lastName}
          onChange={(v) => update('lastName', v)}
          readOnly={readOnly}
        />
        <div className="sm:col-span-2">
          <Field
            label="Email"
            placeholder="john.doe@email.com"
            type="email"
            value={values.email}
            onChange={(v) => update('email', v)}
            readOnly={readOnly}
          />
        </div>
        <div className="sm:col-span-2">
          <Field
            label="Phone"
            placeholder="+63 912 345 6789"
            type="tel"
            value={values.phone}
            onChange={(v) => update('phone', v)}
            readOnly={readOnly}
          />
        </div>
      </div>
    </AppleCard>
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
      <span className="mb-2 block text-[13px] font-medium text-[#1d1d1f]">
        {label}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'h-11 w-full rounded-xl bg-white px-4 text-[15px] text-[#1d1d1f] placeholder:text-[#86868b]/70 ring-1 ring-[#d2d2d7] transition-all outline-none',
          'focus:ring-2 focus:ring-[#0071e3]/40',
          readOnly && 'bg-[#f5f5f7] text-[#86868b]',
        )}
      />
    </label>
  )
}
