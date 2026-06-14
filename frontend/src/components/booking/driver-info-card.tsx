import type { ReactNode } from 'react'
import { Car, CreditCard, Phone, User } from 'lucide-react'
import type { VanResult } from '@/lib/vans'

type DriverInfoCardProps = {
  van: VanResult
}

export function DriverInfoCard({ van }: DriverInfoCardProps) {
  const driver = van.driver

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <h2 className="text-base font-bold text-foreground">Driver & Vehicle</h2>

      <div className="mt-4 space-y-3">
        <InfoRow
          icon={<User className="size-4 text-primary" />}
          label="Driver"
          value={driver?.name ?? van.operator}
        />
        {driver?.phone && (
          <InfoRow
            icon={<Phone className="size-4 text-primary" />}
            label="Phone"
            value={driver.phone}
          />
        )}
        {driver?.licenseNo && (
          <InfoRow
            icon={<CreditCard className="size-4 text-primary" />}
            label="License No."
            value={driver.licenseNo}
          />
        )}
        <InfoRow
          icon={<Car className="size-4 text-primary" />}
          label="Vehicle"
          value={van.vehicleName ?? driver?.vehicleInfo ?? 'Van'}
        />
        {van.plateNumber && (
          <InfoRow
            icon={<Car className="size-4 text-primary" />}
            label="Plate No."
            value={van.plateNumber}
          />
        )}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        Door-to-door service — the driver will pick you up at your home in
        Casiguran and drop you off at your destination in Metro Manila.
      </p>
    </div>
  )
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5">{icon}</div>
      <div>
        <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  )
}
