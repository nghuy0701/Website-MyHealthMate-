const { StatusCodes } = require('http-status-codes');
const ApiError = require('../utils/ApiError');

// Check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  return next(new ApiError(StatusCodes.UNAUTHORIZED, 'You must be logged in to access this resource'));
};

// Check if user has specific role
const hasRole = (...roles) => {
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      return next(new ApiError(StatusCodes.UNAUTHORIZED, 'You must be logged in'));
    }
    
    if (!roles.includes(req.session.user.role)) {
      return next(new ApiError(StatusCodes.FORBIDDEN, 'You do not have permission to access this resource'));
    }
    
    return next();
  };
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return next(new ApiError(StatusCodes.UNAUTHORIZED, 'You must be logged in'));
  }
  
  if (req.session.user.role !== 'admin') {
    return next(new ApiError(StatusCodes.FORBIDDEN, 'Admin access required'));
  }
  
  return next();
};

// Check if user is doctor
const isDoctor = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return next(new ApiError(StatusCodes.UNAUTHORIZED, 'You must be logged in'));
  }
  
  if (req.session.user.role !== 'doctor' && req.session.user.role !== 'admin') {
    return next(new ApiError(StatusCodes.FORBIDDEN, 'Doctor access required'));
  }
  
  return next();
};

module.exports = {
  isAuthenticated,
  hasRole,
  isAdmin,
  isDoctor
};
