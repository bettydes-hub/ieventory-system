const AuditService = require('../services/auditService');

/**
 * Audit Middleware - Automatically logs CRUD operations
 * This middleware should be applied to models that need audit logging
 */

// Store the current user context for audit logging
let currentUserContext = null;

/**
 * Set the current user context for audit logging
 * @param {string} userId - Current user ID
 */
const setCurrentUser = (userId) => {
  currentUserContext = userId;
};

/**
 * Get the current user context
 * @returns {string} Current user ID or null
 */
const getCurrentUser = () => {
  return currentUserContext;
};

/**
 * Create audit hooks for a model
 * @param {Object} model - Sequelize model
 * @param {string} tableName - Table name for audit logging
 */
const addAuditHooks = (model, tableName) => {
  // Before Create - Log INSERT
  model.addHook('afterCreate', async (instance, options) => {
    const userId = getCurrentUser();
    if (userId) {
      await AuditService.logInsert(
        userId,
        tableName,
        instance.id,
        instance.toJSON()
      );
    }
  });

  // Before Update - Log UPDATE
  model.addHook('afterUpdate', async (instance, options) => {
    const userId = getCurrentUser();
    if (userId) {
      await AuditService.logUpdate(
        userId,
        tableName,
        instance.id,
        instance._previousDataValues || {},
        instance.toJSON()
      );
    }
  });

  // Before Destroy - Log DELETE
  model.addHook('beforeDestroy', async (instance, options) => {
    const userId = getCurrentUser();
    if (userId) {
      await AuditService.logDelete(
        userId,
        tableName,
        instance.id,
        instance.toJSON()
      );
    }
  });
};

/**
 * Express middleware to set user context
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const auditMiddleware = (req, res, next) => {
  // Extract user ID from request (adjust based on your auth system)
  const userId = req.user?.id || req.headers['user-id'] || null;
  
  if (userId) {
    setCurrentUser(userId);
  }
  
  next();
};

/**
 * Apply audit hooks to multiple models
 * @param {Object} models - Object containing models
 */
const applyAuditToModels = (models) => {
  // Apply audit hooks to main models
  if (models.User) {
    addAuditHooks(models.User, 'users');
  }
  
  if (models.Item) {
    addAuditHooks(models.Item, 'items');
  }
  
  if (models.Transaction) {
    addAuditHooks(models.Transaction, 'transactions');
  }
  
  if (models.Delivery) {
    addAuditHooks(models.Delivery, 'deliveries');
  }
  
  if (models.Damage) {
    addAuditHooks(models.Damage, 'damages');
  }
  
  if (models.MaintenanceLog) {
    addAuditHooks(models.MaintenanceLog, 'maintenance_logs');
  }
  
  if (models.Supplier) {
    addAuditHooks(models.Supplier, 'suppliers');
  }
  
  console.log('✅ Audit hooks applied to models');
};

module.exports = {
  setCurrentUser,
  getCurrentUser,
  addAuditHooks,
  auditMiddleware,
  applyAuditToModels
};
