/**
 * Role hierarchy and permission matrix.
 *
 *   super_admin  →  full system access
 *   admin        →  manage staff, users, plans, subscriptions, seats, inventory
 *   staff        →  manage users, payments, seat bookings, inventory reads
 *   user         →  self-service (own profile, own bookings, own payments)
 */

const ROLE_HIERARCHY = {
  super_admin: 4,
  admin: 3,
  staff: 2,
  user: 1,
};

/**
 * Returns true if `role` has equal or higher privilege than `requiredRole`.
 */
const hasMinRole = (role, requiredRole) => {
  return (ROLE_HIERARCHY[role] || 0) >= (ROLE_HIERARCHY[requiredRole] || Infinity);
};

module.exports = { ROLE_HIERARCHY, hasMinRole };
