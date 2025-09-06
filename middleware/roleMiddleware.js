/**
 * Role-based Access Control Middleware
 * Controls access based on user roles
 */

/**
 * Check if user has required role
 * @param {string|Array} requiredRoles - Required role(s)
 * @returns {Function} Express middleware function
 */
const requireRole = (requiredRoles) => {
  return (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Convert single role to array
      const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

      // Check if user has required role
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required role: ${roles.join(' or ')}`
        });
      }

      next();
    } catch (error) {
      console.error('Role middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authorization error'
      });
    }
  };
};

/**
 * Admin only access
 */
const requireAdmin = requireRole('Admin');

/**
 * Store Keeper or Admin access
 */
const requireStoreKeeperOrAdmin = requireRole(['Store Keeper', 'Admin']);

/**
 * Any authenticated user
 */
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  next();
};

/**
 * Check if user can approve transactions
 */
const canApproveTransactions = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (!req.user.canApprove(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Only Store Keepers and Admins can approve transactions'
    });
  }

  next();
};

/**
 * Check if user can manage users (Admin only)
 */
const canManageUsers = requireAdmin;

/**
 * Check if user can manage system settings (Admin only)
 */
const canManageSystem = requireAdmin;

/**
 * Check if user can view audit logs (Admin only)
 */
const canViewAuditLogs = requireAdmin;

/**
 * Check if user can resolve damage reports
 */
const canResolveDamage = requireRole(['Store Keeper', 'Admin']);

/**
 * Check if user can assign deliveries
 */
const canAssignDeliveries = requireRole(['Store Keeper', 'Admin']);

module.exports = {
  requireRole,
  requireAdmin,
  requireStoreKeeperOrAdmin,
  requireAuth,
  canApproveTransactions,
  canManageUsers,
  canManageSystem,
  canViewAuditLogs,
  canResolveDamage,
  canAssignDeliveries
};
