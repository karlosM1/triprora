import { Prisma } from '@prisma/client'
import type { ErrorRequestHandler } from 'express'
import { ZodError } from 'zod'
import { logger } from '../lib/logger.js'
import { AppError } from '../utils/app-error.js'

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      message: 'Validation failed',
      errors: err.flatten().fieldErrors,
    })
    return
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message })
    return
  }

  if (err instanceof Error && err.message === 'Not allowed by CORS') {
    res.status(403).json({ message: 'Origin not allowed' })
    return
  }

  // Known Prisma errors: a unique-constraint collision is a conflict, not a 500.
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json({ message: 'A conflicting record already exists' })
      return
    }
    if (err.code === 'P2025') {
      res.status(404).json({ message: 'Record not found' })
      return
    }
  }

  logger.error('Unhandled request error', {
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl,
    error: err,
  })

  res.status(500).json({ message: 'Internal server error' })
}
