import type {
  CreateDeliveryInput,
  CreatedDelivery,
  DeliveryDetail,
  DeliveryListItem,
  DeliveryStatus,
  DriverDeliveryRequest,
  PackageSize,
  PackageType,
  PackageWeightBand,
  PayDeliveryInput,
  PaymentMethod,
} from './delivery.types.js'
import {
  canCancelBeforePickup,
  CANCELLATION_TOO_LATE_MESSAGE,
} from '../lib/booking-cancellation.js'
import { calculateDeliveryTotals, totalsFromDeliveryFee } from '../lib/delivery-fare.js'
import { prisma } from '../lib/prisma.js'
import { presentVan, vanInclude } from '../lib/van-presenter.js'
import { AppError } from '../utils/app-error.js'

export type {
  CreateDeliveryInput,
  CreatedDelivery,
  DeliveryDetail,
  DeliveryListItem,
  DeliveryStatus,
  DriverDeliveryRequest,
  PackageSize,
  PackageType,
  PackageWeightBand,
  PayDeliveryInput,
  PaymentMethod,
} from './delivery.types.js'

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1603292444039-af0812cb5226?w=800&h=500&fit=crop&q=80'

const PACKAGE_TYPE_LABELS: Record<PackageType, string> = {
  documents: 'Documents',
  food: 'Food',
  clothes: 'Clothes',
  electronics: 'Electronics',
  others: 'Others',
}

const WEIGHT_BAND_LABELS: Record<PackageWeightBand, string> = {
  up_to_1kg: '0–1 kg',
  one_to_5kg: '1–5 kg',
  five_to_10kg: '5–10 kg',
}

const SIZE_LABELS: Record<PackageSize, string> = {
  small: 'Small',
  medium: 'Medium',
  large: 'Large',
}

function formatDisplayDate(dateStr: string) {
  const date = new Date(`${dateStr}T00:00:00`)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function createDeliveryId() {
  return `DL-${Date.now().toString(36).toUpperCase()}`
}

function createReference() {
  return `PKG-${Date.now().toString().slice(-8)}`
}

function formatPrice(amount: number) {
  return `₱${amount.toLocaleString()}`
}

function packageLabel(
  packageType: PackageType,
  weightBand: PackageWeightBand,
  size: PackageSize,
) {
  return `${PACKAGE_TYPE_LABELS[packageType]} · ${SIZE_LABELS[size]} · ${WEIGHT_BAND_LABELS[weightBand]}`
}

function paymentFields(payment: { provider: string; status: string } | null | undefined): {
  paymentMethod: PaymentMethod | null
  isPaid: boolean
} {
  if (!payment) {
    return { paymentMethod: null, isPaid: false }
  }

  const paymentMethod: PaymentMethod =
    payment.provider === 'cash' ? 'cash' : 'qrph'

  return {
    paymentMethod,
    // Cash stays unpaid until collected on the trip; only succeeded QR counts as paid.
    isPaid: payment.status === 'succeeded',
  }
}

function toListItem(delivery: {
  id: string
  reference: string | null
  pickupAddress: string
  dropoffAddress: string
  receiverName: string
  receiverPhone: string
  description?: string
  status: DeliveryStatus
  snapshot: {
    routeLabel: string
    departureDate: string
    departureTime: string | null
    packageLabel: string
    priceDisplay: string
  } | null
  van: { departureDate: string; departureTime: string } | null
  payment?: { provider: string; status: string } | null
}): DeliveryListItem | null {
  if (!delivery.reference || !delivery.snapshot || !delivery.snapshot.departureTime) {
    return null
  }

  // Unpaid requests (pending / accepted) can always be cancelled — e.g. if the
  // driver's fee is too high. Paid (confirmed) still needs the 24h window.
  const canCancelUnpaid =
    delivery.status === 'pending' || delivery.status === 'accepted'
  const canCancelPaid =
    delivery.status === 'confirmed' &&
    delivery.van != null &&
    canCancelBeforePickup(
      delivery.van.departureDate,
      delivery.van.departureTime,
    )
  const { paymentMethod, isPaid } = paymentFields(delivery.payment)

  return {
    id: delivery.id,
    reference: delivery.reference,
    date: delivery.snapshot.departureDate,
    time: delivery.snapshot.departureTime,
    route: delivery.snapshot.routeLabel,
    packageLabel: delivery.snapshot.packageLabel,
    pickupAddress: delivery.pickupAddress,
    dropoffAddress: delivery.dropoffAddress,
    receiverName: delivery.receiverName,
    receiverPhone: delivery.receiverPhone,
    description: delivery.description,
    price: delivery.snapshot.priceDisplay,
    status: delivery.status,
    canCancel: canCancelUnpaid || canCancelPaid,
    canPay: delivery.status === 'accepted',
    paymentMethod,
    isPaid,
  }
}

function toDriverRequest(delivery: {
  id: string
  reference: string | null
  status: DeliveryStatus
  description: string
  packageType: PackageType
  weightBand: PackageWeightBand
  size: PackageSize
  pickupAddress: string
  dropoffAddress: string
  receiverName: string
  receiverPhone: string
  specialInstructions: string | null
  createdAt: Date
  snapshot: {
    packageLabel: string
    priceDisplay: string
    baseFareCents: number
  } | null
  user: { fullName: string | null; email: string; phone: string | null } | null
  payment?: { provider: string; status: string } | null
}): DriverDeliveryRequest | null {
  if (!delivery.reference || !delivery.snapshot) return null

  const { paymentMethod, isPaid } = paymentFields(delivery.payment)

  return {
    id: delivery.id,
    reference: delivery.reference,
    status: delivery.status,
    packageLabel: delivery.snapshot.packageLabel,
    description: delivery.description,
    packageType: delivery.packageType,
    weightBand: delivery.weightBand,
    size: delivery.size,
    pickupAddress: delivery.pickupAddress,
    dropoffAddress: delivery.dropoffAddress,
    receiverName: delivery.receiverName,
    receiverPhone: delivery.receiverPhone,
    specialInstructions: delivery.specialInstructions,
    price: delivery.snapshot.priceDisplay,
    suggestedFee: Math.round(delivery.snapshot.baseFareCents / 100),
    senderName:
      delivery.user?.fullName?.trim() || delivery.user?.email || 'Sender',
    senderPhone: delivery.user?.phone ?? null,
    createdAt: delivery.createdAt.toISOString(),
    paymentMethod,
    isPaid,
  }
}

export const DeliveryModel = {
  async create(input: CreateDeliveryInput): Promise<CreatedDelivery> {
    const van = await prisma.van.findFirst({
      where: { id: input.vanId, status: 'published' },
      include: vanInclude,
    })

    if (!van) {
      throw new AppError('Trip not found or no longer available', 404)
    }

    const presented = presentVan(van)
    const fare = calculateDeliveryTotals({
      packageType: input.packageType,
      size: input.size,
      weightBand: input.weightBand,
    })

    const reference = createReference()
    const routeLabel = `${presented.departureLocation} → ${presented.arrivalLocation}`
    const vehicleLabel = presented.vehicleName ?? presented.operator
    const date = formatDisplayDate(van.departureDate)
    const tripType = van.tripCategory ?? presented.classType
    const label = packageLabel(input.packageType, input.weightBand, input.size)
    const specialInstructions = input.specialInstructions?.trim() || null

    const delivery = await prisma.delivery.create({
      data: {
        id: createDeliveryId(),
        userId: input.userId,
        vanId: van.id,
        reference,
        pickupAddress: input.pickupAddress.trim(),
        dropoffAddress: input.dropoffAddress.trim(),
        packageType: input.packageType,
        weightBand: input.weightBand,
        size: input.size,
        description: input.description.trim(),
        receiverName: input.receiverName.trim(),
        receiverPhone: input.receiverPhone.trim(),
        specialInstructions,
        status: 'pending',
        snapshot: {
          create: {
            routeCode: van.id,
            routeLabel,
            imageUrl: DEFAULT_IMAGE,
            departureDate: date,
            departureTime: van.departureTime,
            packageLabel: label,
            vehicleLabel,
            tripType,
            baseFareCents: fare.baseFare * 100,
            serviceFeeCents: fare.serviceFee * 100,
            taxCents: fare.tax * 100,
            totalCents: fare.total * 100,
            priceDisplay: formatPrice(fare.total),
          },
        },
      },
    })

    return {
      id: delivery.id,
      reference: delivery.reference!,
      route: routeLabel,
      date,
      time: van.departureTime,
      pickupAddress: input.pickupAddress.trim(),
      dropoffAddress: input.dropoffAddress.trim(),
      packageType: input.packageType,
      weightBand: input.weightBand,
      size: input.size,
      description: input.description.trim(),
      receiverName: input.receiverName.trim(),
      receiverPhone: input.receiverPhone.trim(),
      specialInstructions,
      vehicle: vehicleLabel,
      operator: presented.operator,
      price: formatPrice(fare.total),
      status: 'pending',
      canPay: false,
      paymentMethod: null,
      isPaid: false,
    }
  },

  async pay(input: PayDeliveryInput): Promise<CreatedDelivery> {
    return prisma.$transaction(async (tx) => {
      const delivery = await tx.delivery.findFirst({
        where: { id: input.deliveryId, userId: input.userId },
        include: {
          snapshot: true,
          van: { include: vanInclude },
          payment: true,
        },
      })

      if (!delivery || !delivery.snapshot || !delivery.van) {
        throw new AppError('Delivery not found', 404)
      }

      if (delivery.status !== 'accepted') {
        throw new AppError(
          delivery.status === 'pending'
            ? 'Wait for the driver to accept before paying'
            : 'This delivery cannot be paid right now',
          400,
        )
      }

      if (delivery.payment) {
        throw new AppError('This delivery already has a payment recorded', 409)
      }

      const fareTotal = Math.round(delivery.snapshot.totalCents / 100)
      let existingPaymentId: string | null = null

      if (input.paymentMethod === 'qrph') {
        if (!input.paymentIntentId) {
          throw new AppError('paymentIntentId is required for QR Ph payments', 400)
        }

        const payment = await tx.payment.findFirst({
          where: {
            providerIntentId: input.paymentIntentId,
            userId: input.userId,
          },
        })

        if (!payment) {
          throw new AppError('Payment not found', 404)
        }

        if (payment.bookingId || payment.deliveryId) {
          throw new AppError('This payment has already been used', 409)
        }

        if (payment.status !== 'succeeded') {
          throw new AppError('Payment is not completed yet', 402)
        }

        if (payment.amount !== fareTotal) {
          throw new AppError('Payment amount does not match delivery total', 400)
        }

        existingPaymentId = payment.id
      }

      if (existingPaymentId) {
        const claimed = await tx.payment.updateMany({
          where: {
            id: existingPaymentId,
            bookingId: null,
            deliveryId: null,
            status: 'succeeded',
          },
          data: { deliveryId: delivery.id },
        })

        if (claimed.count !== 1) {
          throw new AppError('This payment has already been used', 409)
        }
      } else {
        await tx.payment.create({
          data: {
            userId: input.userId,
            deliveryId: delivery.id,
            provider: 'cash',
            providerIntentId: `cash_${delivery.id}`,
            amount: fareTotal,
            currency: 'PHP',
            status: 'pending',
          },
        })
      }

      const updated = await tx.delivery.update({
        where: { id: delivery.id },
        data: { status: 'confirmed' },
        include: { snapshot: true, van: { include: vanInclude } },
      })

      const presented = presentVan(updated.van!)
      const { paymentMethod, isPaid } = paymentFields({
        provider: input.paymentMethod === 'cash' ? 'cash' : 'qrph',
        status: input.paymentMethod === 'cash' ? 'pending' : 'succeeded',
      })

      return {
        id: updated.id,
        reference: updated.reference!,
        route: updated.snapshot!.routeLabel,
        date: updated.snapshot!.departureDate,
        time: updated.van!.departureTime,
        pickupAddress: updated.pickupAddress,
        dropoffAddress: updated.dropoffAddress,
        packageType: updated.packageType as PackageType,
        weightBand: updated.weightBand as PackageWeightBand,
        size: updated.size as PackageSize,
        description: updated.description,
        receiverName: updated.receiverName,
        receiverPhone: updated.receiverPhone,
        specialInstructions: updated.specialInstructions,
        vehicle: updated.snapshot!.vehicleLabel ?? presented.operator,
        operator: presented.operator,
        price: updated.snapshot!.priceDisplay,
        status: 'confirmed',
        canPay: false,
        paymentMethod,
        isPaid,
      }
    })
  },

  async list(
    userId: string,
    filter: 'upcoming' | 'history' | 'all' = 'all',
  ): Promise<DeliveryListItem[]> {
    const statusFilter =
      filter === 'upcoming'
        ? (['pending', 'accepted', 'confirmed', 'picked_up'] as DeliveryStatus[])
        : filter === 'history'
          ? (['delivered', 'cancelled', 'declined'] as DeliveryStatus[])
          : undefined

    const deliveries = await prisma.delivery.findMany({
      where: {
        userId,
        ...(statusFilter ? { status: { in: statusFilter } } : {}),
      },
      include: { snapshot: true, van: true, payment: true },
      orderBy: { createdAt: 'desc' },
    })

    return deliveries
      .map((delivery) =>
        toListItem({
          id: delivery.id,
          reference: delivery.reference,
          pickupAddress: delivery.pickupAddress,
          dropoffAddress: delivery.dropoffAddress,
          receiverName: delivery.receiverName,
          receiverPhone: delivery.receiverPhone,
          description: delivery.description,
          status: delivery.status as DeliveryStatus,
          snapshot: delivery.snapshot,
          van: delivery.van
            ? {
                departureDate: delivery.van.departureDate,
                departureTime: delivery.van.departureTime,
              }
            : null,
          payment: delivery.payment,
        }),
      )
      .filter((item): item is DeliveryListItem => item != null)
  },

  async getById(userId: string, deliveryId: string): Promise<DeliveryDetail> {
    const delivery = await prisma.delivery.findFirst({
      where: { id: deliveryId, userId },
      include: { snapshot: true, van: true, payment: true },
    })

    if (!delivery || !delivery.snapshot) {
      throw new AppError('Delivery not found', 404)
    }

    const listItem = toListItem({
      id: delivery.id,
      reference: delivery.reference,
      pickupAddress: delivery.pickupAddress,
      dropoffAddress: delivery.dropoffAddress,
      receiverName: delivery.receiverName,
      receiverPhone: delivery.receiverPhone,
      description: delivery.description,
      status: delivery.status as DeliveryStatus,
      snapshot: delivery.snapshot,
      van: delivery.van
        ? {
            departureDate: delivery.van.departureDate,
            departureTime: delivery.van.departureTime,
          }
        : null,
      payment: delivery.payment,
    })

    if (!listItem) {
      throw new AppError('Delivery not found', 404)
    }

    return {
      ...listItem,
      packageType: delivery.packageType as PackageType,
      weightBand: delivery.weightBand as PackageWeightBand,
      size: delivery.size as PackageSize,
      description: delivery.description,
      specialInstructions: delivery.specialInstructions,
      vehicle: delivery.snapshot.vehicleLabel ?? '',
      tripType: delivery.snapshot.tripType,
      vanId: delivery.vanId,
      baseFare: Math.round(delivery.snapshot.baseFareCents / 100),
      serviceFee: Math.round(delivery.snapshot.serviceFeeCents / 100),
      total: Math.round(delivery.snapshot.totalCents / 100),
    }
  },

  async cancel(userId: string, deliveryId: string): Promise<DeliveryListItem> {
    return prisma.$transaction(async (tx) => {
      const delivery = await tx.delivery.findFirst({
        where: {
          id: deliveryId,
          userId,
          status: { in: ['pending', 'accepted', 'confirmed'] },
        },
        include: { snapshot: true, van: true, payment: true },
      })

      if (!delivery || !delivery.snapshot) {
        throw new AppError('Delivery not found', 404)
      }

      if (!delivery.van) {
        throw new AppError('Unable to cancel this delivery', 400)
      }

      const isUnpaid =
        delivery.status === 'pending' || delivery.status === 'accepted'
      if (
        !isUnpaid &&
        !canCancelBeforePickup(
          delivery.van.departureDate,
          delivery.van.departureTime,
        )
      ) {
        throw new AppError(CANCELLATION_TOO_LATE_MESSAGE, 400)
      }

      const updated = await tx.delivery.update({
        where: { id: deliveryId },
        data: { status: 'cancelled' },
        include: { snapshot: true, van: true, payment: true },
      })

      const listItem = toListItem({
        id: updated.id,
        reference: updated.reference,
        pickupAddress: updated.pickupAddress,
        dropoffAddress: updated.dropoffAddress,
        receiverName: updated.receiverName,
        receiverPhone: updated.receiverPhone,
        description: updated.description,
        status: updated.status as DeliveryStatus,
        snapshot: updated.snapshot,
        van: updated.van
          ? {
              departureDate: updated.van.departureDate,
              departureTime: updated.van.departureTime,
            }
          : null,
        payment: updated.payment,
      })

      if (!listItem) {
        throw new AppError('Unable to load cancelled delivery', 500)
      }

      return listItem
    })
  },

  mapDriverRequests(
    deliveries: Array<{
      id: string
      reference: string | null
      status: string
      description: string
      packageType: string
      weightBand: string
      size: string
      pickupAddress: string
      dropoffAddress: string
      receiverName: string
      receiverPhone: string
      specialInstructions: string | null
      createdAt: Date
      snapshot: {
        packageLabel: string
        priceDisplay: string
        baseFareCents: number
      } | null
      user: { fullName: string | null; email: string; phone: string | null } | null
      payment?: { provider: string; status: string } | null
    }>,
  ): DriverDeliveryRequest[] {
    return deliveries
      .map((delivery) =>
        toDriverRequest({
          ...delivery,
          status: delivery.status as DeliveryStatus,
          packageType: delivery.packageType as PackageType,
          weightBand: delivery.weightBand as PackageWeightBand,
          size: delivery.size as PackageSize,
        }),
      )
      .filter((item): item is DriverDeliveryRequest => item != null)
  },

  async listForDriverTrip(
    tripId: string,
    driverId: string,
  ): Promise<DriverDeliveryRequest[]> {
    const van = await prisma.van.findFirst({
      where: { id: tripId, driverId },
      select: { id: true },
    })
    if (!van) {
      throw new AppError('Trip not found', 404)
    }

    const deliveries = await prisma.delivery.findMany({
      where: {
        vanId: tripId,
        status: {
          in: [
            'pending',
            'accepted',
            'confirmed',
            'picked_up',
            'cancelled',
            'declined',
          ],
        },
      },
      include: {
        snapshot: true,
        payment: true,
        user: { select: { fullName: true, email: true, phone: true } },
      },
      orderBy: { createdAt: 'asc' },
    })

    return DeliveryModel.mapDriverRequests(deliveries)
  },

  async acceptByDriver(
    tripId: string,
    deliveryId: string,
    driverId: string,
    deliveryFee: number,
  ): Promise<DriverDeliveryRequest> {
    const van = await prisma.van.findFirst({
      where: { id: tripId, driverId, status: 'published' },
      select: { id: true },
    })
    if (!van) {
      throw new AppError('Trip not found or not available', 404)
    }

    if (!Number.isInteger(deliveryFee) || deliveryFee < 1 || deliveryFee > 100_000) {
      throw new AppError('Enter a valid delivery fee in pesos', 400)
    }

    const delivery = await prisma.delivery.findFirst({
      where: { id: deliveryId, vanId: tripId, status: 'pending' },
      include: {
        snapshot: true,
        payment: true,
        user: { select: { fullName: true, email: true, phone: true } },
      },
    })

    if (!delivery || !delivery.snapshot) {
      throw new AppError('Package request not found or already handled', 404)
    }

    const fare = totalsFromDeliveryFee(deliveryFee)

    const updated = await prisma.delivery.update({
      where: { id: deliveryId },
      data: {
        status: 'accepted',
        snapshot: {
          update: {
            baseFareCents: fare.baseFare * 100,
            serviceFeeCents: fare.serviceFee * 100,
            taxCents: fare.tax * 100,
            totalCents: fare.total * 100,
            priceDisplay: formatPrice(fare.total),
          },
        },
      },
      include: {
        snapshot: true,
        payment: true,
        user: { select: { fullName: true, email: true, phone: true } },
      },
    })

    const item = toDriverRequest({
      ...updated,
      status: updated.status as DeliveryStatus,
      packageType: updated.packageType as PackageType,
      weightBand: updated.weightBand as PackageWeightBand,
      size: updated.size as PackageSize,
    })
    if (!item) {
      throw new AppError('Unable to load accepted delivery', 500)
    }
    return item
  },

  async declineByDriver(
    tripId: string,
    deliveryId: string,
    driverId: string,
  ): Promise<DriverDeliveryRequest> {
    const van = await prisma.van.findFirst({
      where: { id: tripId, driverId },
      select: { id: true },
    })
    if (!van) {
      throw new AppError('Trip not found', 404)
    }

    const delivery = await prisma.delivery.findFirst({
      where: { id: deliveryId, vanId: tripId, status: 'pending' },
      include: {
        snapshot: true,
        payment: true,
        user: { select: { fullName: true, email: true, phone: true } },
      },
    })

    if (!delivery) {
      throw new AppError('Package request not found or already handled', 404)
    }

    const updated = await prisma.delivery.update({
      where: { id: deliveryId },
      data: { status: 'declined' },
      include: {
        snapshot: true,
        payment: true,
        user: { select: { fullName: true, email: true, phone: true } },
      },
    })

    const item = toDriverRequest({
      ...updated,
      status: updated.status as DeliveryStatus,
      packageType: updated.packageType as PackageType,
      weightBand: updated.weightBand as PackageWeightBand,
      size: updated.size as PackageSize,
    })
    if (!item) {
      throw new AppError('Unable to load declined delivery', 500)
    }
    return item
  },
}
