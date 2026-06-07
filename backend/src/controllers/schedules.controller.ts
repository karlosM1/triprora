import type { Request, Response } from 'express'
import { ScheduleModel } from '../models/schedule.model.js'

export function getSchedules(_req: Request, res: Response) {
  res.json(ScheduleModel.getAll())
}
