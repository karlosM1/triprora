import type { Request, Response } from 'express'
import { DestinationAddressModel } from '../models/destination-address.model.js'
import { AppError } from '../utils/app-error.js'

const MAX_DESTINATION_ADDRESSES = 10

export async function listDestinationAddresses(req: Request, res: Response) {
  const addresses = await DestinationAddressModel.listByProfileId(req.profile!.id)
  res.json(addresses.map(DestinationAddressModel.serialize))
}

export async function createDestinationAddress(req: Request, res: Response) {
  const count = await DestinationAddressModel.countByProfileId(req.profile!.id)
  if (count >= MAX_DESTINATION_ADDRESSES) {
    throw new AppError(
      `You can save up to ${MAX_DESTINATION_ADDRESSES} destination addresses`,
      400,
    )
  }

  const address = await DestinationAddressModel.create(req.profile!.id, req.body)
  res.status(201).json(DestinationAddressModel.serialize(address))
}

export async function updateDestinationAddress(req: Request, res: Response) {
  const existing = await DestinationAddressModel.findOwned(
    req.params.id,
    req.profile!.id,
  )
  if (!existing) {
    throw new AppError('Destination address not found', 404)
  }

  const address = await DestinationAddressModel.update(existing.id, req.body)
  res.json(DestinationAddressModel.serialize(address))
}

export async function deleteDestinationAddress(req: Request, res: Response) {
  const existing = await DestinationAddressModel.findOwned(
    req.params.id,
    req.profile!.id,
  )
  if (!existing) {
    throw new AppError('Destination address not found', 404)
  }

  await DestinationAddressModel.delete(existing.id)
  res.status(204).send()
}
