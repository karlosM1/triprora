import type { Van, VanDriver } from '../models/van.types.js'

export type VanWithRelations = {
  id: string
  departureTime: string
  arrivalTime: string
  duration: string
  price: number
  seatsLeft: number
  totalSeats: number | null
  departureDate: string
  tripCategory: string | null
  status: string
  driverId: string | null
  createdAt: Date
  route: {
    departureLocation: string
    arrivalLocation: string
  }
  operator: {
    name: string
  }
  vanClass: {
    classType: string
    classVariant: string
  }
  vehicle: {
    plateNumber: string
    make: string
    model: string
  } | null
  driver?: {
    fullName: string | null
    phone: string | null
    driverApplication: {
      licenseNo: string
      vehicle: {
        make: string
        model: string
        plateNumber: string
      } | null
    } | null
  } | null
}

function formatRegisteredVehicle(
  vehicle: {
    make: string
    model: string
    plateNumber: string
  } | null,
) {
  if (!vehicle) return null
  return `${vehicle.make} ${vehicle.model} · ${vehicle.plateNumber}`
}

export function mapDriverInfo(
  driver: VanWithRelations['driver'],
): VanDriver | null {
  if (!driver) return null

  const vehicle = driver.driverApplication?.vehicle ?? null
  return {
    name: driver.fullName?.trim() || 'Driver',
    phone: driver.phone,
    licenseNo: driver.driverApplication?.licenseNo ?? null,
    vehicleInfo: formatRegisteredVehicle(vehicle),
  }
}

export function presentVan(van: VanWithRelations): Van {
  const vehicleName = van.vehicle
    ? `${van.vehicle.make} ${van.vehicle.model}`.trim()
    : null

  return {
    id: van.id,
    classType: van.vanClass.classType as Van['classType'],
    classVariant: van.vanClass.classVariant as Van['classVariant'],
    departureTime: van.departureTime,
    departureLocation: van.route.departureLocation,
    arrivalTime: van.arrivalTime,
    arrivalLocation: van.route.arrivalLocation,
    duration: van.duration,
    operator: van.operator.name,
    price: van.price,
    seatsLeft: van.seatsLeft,
    totalSeats: van.totalSeats ?? undefined,
    departureDate: van.departureDate,
    tripCategory: van.tripCategory,
    vehicleName,
    plateNumber: van.vehicle?.plateNumber ?? null,
    driver: mapDriverInfo(van.driver ?? null),
  }
}

export const vanInclude = {
  route: true,
  operator: true,
  vanClass: true,
  vehicle: true,
  driver: {
    select: {
      fullName: true,
      phone: true,
      driverApplication: {
        select: {
          licenseNo: true,
          vehicle: {
            select: {
              make: true,
              model: true,
              plateNumber: true,
            },
          },
        },
      },
    },
  },
} as const
