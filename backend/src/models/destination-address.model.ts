import { prisma } from '../lib/prisma.js'
import type { UpsertDestinationAddressBody } from '../validators/destination-addresses.validator.js'

export const DestinationAddressModel = {
  async listByProfileId(profileId: string) {
    return prisma.destinationAddress.findMany({
      where: { profileId },
      orderBy: [{ createdAt: 'asc' }],
    })
  },

  async countByProfileId(profileId: string) {
    return prisma.destinationAddress.count({ where: { profileId } })
  },

  async findOwned(id: string, profileId: string) {
    return prisma.destinationAddress.findFirst({
      where: { id, profileId },
    })
  },

  async create(profileId: string, data: UpsertDestinationAddressBody) {
    return prisma.destinationAddress.create({
      data: {
        profileId,
        label: data.label,
        houseStreet: data.houseStreet,
        barangay: data.barangay,
        city: data.city,
        province: data.province,
        zipCode: data.zipCode,
      },
    })
  },

  async update(
    id: string,
    data: UpsertDestinationAddressBody,
  ) {
    return prisma.destinationAddress.update({
      where: { id },
      data: {
        label: data.label,
        houseStreet: data.houseStreet,
        barangay: data.barangay,
        city: data.city,
        province: data.province,
        zipCode: data.zipCode,
      },
    })
  },

  async delete(id: string) {
    return prisma.destinationAddress.delete({
      where: { id },
    })
  },

  serialize(address: {
    id: string
    label: string
    houseStreet: string
    barangay: string | null
    city: string
    province: string
    zipCode: string | null
    createdAt: Date
    updatedAt: Date
  }) {
    return {
      id: address.id,
      label: address.label,
      houseStreet: address.houseStreet,
      barangay: address.barangay,
      city: address.city,
      province: address.province,
      zipCode: address.zipCode,
      createdAt: address.createdAt.toISOString(),
      updatedAt: address.updatedAt.toISOString(),
    }
  },
}
