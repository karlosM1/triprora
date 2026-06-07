import type { NextFunction, Request, Response } from 'express'
import type { ZodTypeAny } from 'zod'
import { ZodError } from 'zod'

type RequestSchemas = {
  params?: ZodTypeAny
  query?: ZodTypeAny
  body?: ZodTypeAny
}

export function validateRequest(schemas: RequestSchemas) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as Request['params']
      }

      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as Request['query']
      }

      if (schemas.body) {
        req.body = schemas.body.parse(req.body) as Request['body']
      }

      next()
    } catch (error) {
      if (error instanceof ZodError) {
        next(error)
        return
      }

      next(error)
    }
  }
}
