import { StatusCodes } from 'http-status-codes'
import { env } from '~/configs/environment'

export const errorHandlingMiddleware = (err, req, res, next) => {
  // Default error
  if (!err.statusCode) err.statusCode = StatusCodes.INTERNAL_SERVER_ERROR

  const responseError = {
    statusCode: err.statusCode,
    message: err.message || StatusCodes[err.statusCode],
    stack: err.stack
  }

  // Only show error stack in development mode
  if (env.NODE_ENV !== 'development') delete responseError.stack

  res.status(responseError.statusCode).json(responseError)
}
