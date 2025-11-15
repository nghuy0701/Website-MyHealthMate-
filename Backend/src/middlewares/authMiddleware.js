import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

// Check if user is authenticated
export const isAuthenticated = (req, res, next) => {
  // Check both user and admin sessions
  if (req.session && (req.session.user || req.session.admin)) {
    return next()
  }
  return next(new ApiError(StatusCodes.UNAUTHORIZED, 'You must be logged in to access this resource'))
}

// Check if user has specific role
export const hasRole = (...roles) => {
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      return next(new ApiError(StatusCodes.UNAUTHORIZED, 'You must be logged in'))
    }
    
    if (!roles.includes(req.session.user.role)) {
      return next(new ApiError(StatusCodes.FORBIDDEN, 'You do not have permission to access this resource'))
    }
    
    return next()
  }
}

// Check if user is admin
export const isAdmin = (req, res, next) => {
  if (!req.session || (!req.session.user && !req.session.admin)) {
    return next(new ApiError(StatusCodes.UNAUTHORIZED, 'You must be logged in'))
  }
  
  // Check if logged in as admin directly
  if (req.session.admin && req.session.admin.role === 'admin') {
    return next()
  }
  
  // Check if logged in as user with admin role
  if (req.session.user && req.session.user.role === 'admin') {
    return next()
  }
  
  return next(new ApiError(StatusCodes.FORBIDDEN, 'Admin access required'))
}

// Check if user is doctor
export const isDoctor = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return next(new ApiError(StatusCodes.UNAUTHORIZED, 'You must be logged in'))
  }
  
  if (req.session.user.role !== 'doctor' && req.session.user.role !== 'admin') {
    return next(new ApiError(StatusCodes.FORBIDDEN, 'Doctor access required'))
  }
  
  return next()
}
