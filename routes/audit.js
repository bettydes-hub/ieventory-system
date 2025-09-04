const express = require('express');
const router = express.Router();
const AuditController = require('../controllers/auditController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

/**
 * @route   GET /api/audit/logs
 * @desc    Get audit logs with filtering and pagination
 * @access  Private/Admin
 */
router.get('/logs', authenticateToken, requireAdmin, AuditController.getAuditLogs);

/**
 * @route   GET /api/audit/logs/:id
 * @desc    Get specific audit log entry
 * @access  Private/Admin
 */
router.get('/logs/:id', authenticateToken, requireAdmin, AuditController.getAuditLogById);

/**
 * @route   GET /api/audit/activity
 * @desc    Get recent system activity
 * @access  Private/Admin
 */
router.get('/activity', authenticateToken, requireAdmin, AuditController.getRecentActivity);

/**
 * @route   GET /api/audit/user/:userId
 * @desc    Get audit logs for specific user
 * @access  Private/Admin
 */
router.get('/user/:userId', authenticateToken, requireAdmin, AuditController.getUserAuditLogs);

/**
 * @route   GET /api/audit/reports/inventory
 * @desc    Generate inventory audit report
 * @access  Private/Admin
 */
router.get('/reports/inventory', authenticateToken, requireAdmin, AuditController.getInventoryReport);

/**
 * @route   GET /api/audit/reports/transactions
 * @desc    Generate transaction audit report
 * @access  Private/Admin
 */
router.get('/reports/transactions', authenticateToken, requireAdmin, AuditController.getTransactionReport);

/**
 * @route   GET /api/audit/reports/damages
 * @desc    Generate damage audit report
 * @access  Private/Admin
 */
router.get('/reports/damages', authenticateToken, requireAdmin, AuditController.getDamageReport);

/**
 * @route   GET /api/audit/reports/deliveries
 * @desc    Generate delivery audit report
 * @access  Private/Admin
 */
router.get('/reports/deliveries', authenticateToken, requireAdmin, AuditController.getDeliveryReport);

/**
 * @route   GET /api/audit/reports/comprehensive
 * @desc    Generate comprehensive audit report
 * @access  Private/Admin
 */
router.get('/reports/comprehensive', authenticateToken, requireAdmin, AuditController.getComprehensiveReport);

/**
 * @route   GET /api/audit/integrity-check
 * @desc    Perform data integrity monitoring
 * @access  Private/Admin
 */
router.get('/integrity-check', authenticateToken, requireAdmin, AuditController.performIntegrityCheck);

/**
 * @route   GET /api/audit/stats
 * @desc    Get audit statistics
 * @access  Private/Admin
 */
router.get('/stats', authenticateToken, requireAdmin, AuditController.getAuditStats);

/**
 * @route   DELETE /api/audit/logs/cleanup
 * @desc    Clean up old audit logs
 * @access  Private/Admin
 */
router.delete('/logs/cleanup', authenticateToken, requireAdmin, AuditController.cleanupOldLogs);

module.exports = router;
