const { errorHandlingMiddleware } = require('./errorHandlingMiddleware');
const { isAuthenticated, hasRole, isAdmin, isDoctor } = require('./authMiddleware');

module.exports = {
  errorHandlingMiddleware,
  isAuthenticated,
  hasRole,
  isAdmin,
  isDoctor
};
