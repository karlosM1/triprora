import type { Request, Response } from 'express'
import { VanModel } from '../models/van.model.js'
import { AppError } from '../utils/app-error.js'
import type { ListVansQuery } from '../validators/vans.validator.js'

export async function getVans(req: Request, res: Response) {
  const query = req.query as unknown as ListVansQuery
  const result = await VanModel.findAll(query)
  res.json(result)
}

export async function getVanById(req: Request, res: Response) {
  const van = await VanModel.findById(req.params.vanId)

  if (!van) {
    throw new AppError('Van not found', 404)
  }

  res.json(van)
}

export async function getVanSeats(req: Request, res: Response) {
  const seats = await VanModel.findSeatsByVanId(req.params.vanId)

  if (!seats) {
    throw new AppError('Van not found', 404)
  }

  res.json(seats)
}
