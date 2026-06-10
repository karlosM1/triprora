import type { Request, Response } from 'express'
import { VanModel } from '../models/van.model.js'
import { AppError } from '../utils/app-error.js'

export async function getVans(_req: Request, res: Response) {
  const vans = await VanModel.findAll()
  res.json(vans)
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
