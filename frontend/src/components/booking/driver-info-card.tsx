import type { ReactNode } from 'react'
import { Car, CreditCard, Phone, User } from 'lucide-react'
import { AppleCard } from '@/components/layout/page-header'
import type { VanResult } from '@/lib/vans'

type DriverInfoCardProps = {
  van: VanResult
}

export function DriverInfoCard({ van }: DriverInfoCardProps) {
  const driver = van.driver

  return (
    <AppleCard className="p-6">
      <h2 className="text-[17px] font-semibold text-[#1d1d1f]">Driver & vehicle</h2>

      <div className="mt-4 space-y-4">
        <InfoRow
          icon={<User className="size-4 text-[#86868b]" strokeWidth={1.75} />}
          label="Driver"
          value={driver?.name ?? van.operator}
        />
        {driver?.phone && (
          <InfoRow
            icon={<Phone className="size-4 text-[#86868b]" strokeWidth={1.75} />}
            label="Phone"
            value={driver.phone}
          />
        )}
        {driver?.licenseNo && (
          <InfoRow
            icon={<CreditCard className="size-4 text-[#86868b]" strokeWidth={1.75} />}
            label="License"
            value={driver.licenseNo}
          />
        )}
        <InfoRow
          icon={<Car className="size-4 text-[#86868b]" strokeWidth={1.75} />}
          label="Vehicle"
          value={van.vehicleName ?? driver?.vehicleInfo ?? 'Van'}
        />
        {van.plateNumber && (
          <InfoRow
            icon={<Car className="size-4 text-[#86868b]" strokeWidth={1.75} />}
            label="Plate no."
            value={van.plateNumber}
          />
        )}
      </div>

      <p className="mt-5 text-[13px] leading-relaxed text-[#86868b]">
        Door-to-door service — your driver picks you up at your door and drops
        you off at your destination, Aurora or Metro Manila.
      </p>
    </AppleCard>
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
        <p className="text-[12px] font-medium text-[#86868b]">{label}</p>
        <p className="text-[15px] font-medium text-[#1d1d1f]">{value}</p>
      </div>
    </div>
  )
}
