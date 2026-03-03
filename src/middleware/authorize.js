const { hasMinRole } = require('../config/roles');
const AppError = require('../utils/AppError');

/**
 * Factory: returns middleware that restricts access to users
 * whose role is at least `minimumRole`.
 *
 * Usage:  router.get('/admin-only', authorize('admin'), controller);
 */
const authorize = (...allowedRoles) => {
  return (req, _res, next) => {
    // If any allowed role is satisfied, pass through
    const permitted = allowedRoles.some((role) => hasMinRole(req.user.role, role));
    if (!permitted) {
      return next(
        new AppError('You do not have permission to perform this action.', 403)
      );
    }
    next();
  };
};

module.exports = authorize;
