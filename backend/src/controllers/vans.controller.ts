import type { Request, Response } from 'express'
import { VanModel } from '../models/van.model.js'
import { AppError } from '../utils/app-error.js'

export function getVans(_req: Request, res: Response) {
  res.json(VanModel.findAll())
}

export function getVanById(req: Request, res: Response) {
  const van = VanModel.findById(req.params.vanId)

  if (!van) {
    throw new AppError('Van not found', 404)
  }

  res.json(van)
}

export function getVanSeats(req: Request, res: Response) {
  const seats = VanModel.findSeatsByVanId(req.params.vanId)

  if (!seats) {
    throw new AppError('Van not found', 404)
  }

  res.json(seats)
}
