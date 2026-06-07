import type { NextFunction, Request, Response, RequestHandler } from 'express'

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void> | void

export function asyncHandler(handler: AsyncRequestHandler): RequestHandler {
  return (req, res, next) => {
    try {
      Promise.resolve(handler(req, res, next)).catch(next)
    } catch (error) {
      next(error)
    }
  }
}
