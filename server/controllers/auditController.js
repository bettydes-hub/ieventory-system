const { AuditLog, User, Transaction, Delivery, Damage, MaintenanceLog, Supplier } = require('../models');
const AuditService = require('../services/auditService');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');
const { Op } = require('sequelize');

class AuditController {
  /**
   * @route   GET /api/audit/logs
   * @desc    Get audit logs with filtering and pagination
   * @access  Private/Admin
   */
  static async getAuditLogs(req, res) {
    try {
      const {
        page = 1,
        limit = 50,
        actionType,
        targetTable,
        userId,
        startDate,
        endDate,
        search
      } = req.query;

      const offset = (page - 1) * limit;

      // Build where clause
      const whereClause = {};
      
      if (actionType) {
        whereClause.action_type = {
          [Op.iLike]: `%${actionType}%`
        };
      }
      
      if (targetTable) {
        whereClause.target_table = {
          [Op.iLike]: `%${targetTable}%`
        };
      }
      
      if (userId) {
        whereClause.user_id = userId;
      }
      
      if (startDate || endDate) {
        whereClause.timestamp = {};
        if (startDate) whereClause.timestamp[Op.gte] = new Date(startDate);
        if (endDate) whereClause.timestamp[Op.lte] = new Date(endDate);
      }

      // Search functionality
      if (search) {
        whereClause[Op.or] = [
          { action_type: { [Op.iLike]: `%${search}%` } },
          { target_table: { [Op.iLike]: `%${search}%` } },
          { target_id: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const auditLogs = await AuditLog.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            attributes: ['id', 'firstName', 'lastName', 'email', 'role']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['timestamp', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          auditLogs: auditLogs.rows,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(auditLogs.count / limit),
            totalLogs: auditLogs.count,
            limit: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Get audit logs error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch audit logs'
      });
    }
  }

  /**
   * @route   GET /api/audit/logs/:id
   * @desc    Get specific audit log entry
   * @access  Private/Admin
   */
  static async getAuditLogById(req, res) {
    try {
      const auditLog = await AuditLog.findByPk(req.params.id, {
        include: [
          {
            model: User,
            attributes: ['id', 'firstName', 'lastName', 'email', 'role']
          }
        ]
      });

      if (!auditLog) {
        return res.status(404).json({
          success: false,
          message: 'Audit log not found'
        });
      }

      res.json({
        success: true,
        data: auditLog
      });
    } catch (error) {
      console.error('Get audit log error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch audit log'
      });
    }
  }

  /**
   * @route   GET /api/audit/activity
   * @desc    Get recent system activity
   * @access  Private/Admin
   */
  static async getRecentActivity(req, res) {
    try {
      const { hours = 24, limit = 100 } = req.query;
      const cutoffTime = new Date(Date.now() - (hours * 60 * 60 * 1000));

      const recentActivity = await AuditLog.findAll({
        where: {
          timestamp: {
            [Op.gte]: cutoffTime
          }
        },
        include: [
          {
            model: User,
            attributes: ['id', 'firstName', 'lastName', 'email', 'role']
          }
        ],
        order: [['timestamp', 'DESC']],
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: recentActivity
      });
    } catch (error) {
      console.error('Get recent activity error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch recent activity'
      });
    }
  }

  /**
   * @route   GET /api/audit/user/:userId
   * @desc    Get audit logs for specific user
   * @access  Private/Admin
   */
  static async getUserAuditLogs(req, res) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 50, actionType, startDate, endDate } = req.query;
      const offset = (page - 1) * limit;

      // Build where clause
      const whereClause = { user_id: userId };
      
      if (actionType) {
        whereClause.action_type = {
          [Op.iLike]: `%${actionType}%`
        };
      }
      
      if (startDate || endDate) {
        whereClause.timestamp = {};
        if (startDate) whereClause.timestamp[Op.gte] = new Date(startDate);
        if (endDate) whereClause.timestamp[Op.lte] = new Date(endDate);
      }

      const auditLogs = await AuditLog.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            attributes: ['id', 'firstName', 'lastName', 'email', 'role']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['timestamp', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          auditLogs: auditLogs.rows,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(auditLogs.count / limit),
            totalLogs: auditLogs.count,
            limit: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Get user audit logs error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user audit logs'
      });
    }
  }

  /**
   * @route   GET /api/audit/reports/inventory
   * @desc    Generate inventory audit report
   * @access  Private/Admin
   */
  static async getInventoryReport(req, res) {
    try {
      const { startDate, endDate, actionType } = req.query;

      const whereClause = {
        target_table: {
          [Op.in]: ['items', 'inventory', 'stock']
        }
      };

      if (actionType) {
        whereClause.action_type = {
          [Op.iLike]: `%${actionType}%`
        };
      }

      if (startDate || endDate) {
        whereClause.timestamp = {};
        if (startDate) whereClause.timestamp[Op.gte] = new Date(startDate);
        if (endDate) whereClause.timestamp[Op.lte] = new Date(endDate);
      }

      const inventoryAudits = await AuditLog.findAll({
        where: whereClause,
        include: [
          {
            model: User,
            attributes: ['id', 'firstName', 'lastName', 'email', 'role']
          }
        ],
        order: [['timestamp', 'DESC']]
      });

      // Generate summary statistics
      const summary = {
        totalActions: inventoryAudits.length,
        actionTypes: {},
        users: {},
        dateRange: {
          start: startDate || 'All time',
          end: endDate || 'Present'
        }
      };

      inventoryAudits.forEach(audit => {
        // Count action types
        summary.actionTypes[audit.action_type] = 
          (summary.actionTypes[audit.action_type] || 0) + 1;
        
        // Count user activity
        const userName = `${audit.User.firstName} ${audit.User.lastName}`;
        summary.users[userName] = (summary.users[userName] || 0) + 1;
      });

      res.json({
        success: true,
        data: {
          summary,
          auditLogs: inventoryAudits
        }
      });
    } catch (error) {
      console.error('Get inventory report error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate inventory report'
      });
    }
  }

  /**
   * @route   GET /api/audit/reports/transactions
   * @desc    Generate transaction audit report
   * @access  Private/Admin
   */
  static async getTransactionReport(req, res) {
    try {
      const { startDate, endDate, actionType } = req.query;

      const whereClause = {
        target_table: 'transactions'
      };

      if (actionType) {
        whereClause.action_type = {
          [Op.iLike]: `%${actionType}%`
        };
      }

      if (startDate || endDate) {
        whereClause.timestamp = {};
        if (startDate) whereClause.timestamp[Op.gte] = new Date(startDate);
        if (endDate) whereClause.timestamp[Op.lte] = new Date(endDate);
      }

      const transactionAudits = await AuditLog.findAll({
        where: whereClause,
        include: [
          {
            model: User,
            attributes: ['id', 'firstName', 'lastName', 'email', 'role']
          }
        ],
        order: [['timestamp', 'DESC']]
      });

      // Generate summary statistics
      const summary = {
        totalActions: transactionAudits.length,
        actionTypes: {},
        users: {},
        dateRange: {
          start: startDate || 'All time',
          end: endDate || 'Present'
        }
      };

      transactionAudits.forEach(audit => {
        summary.actionTypes[audit.action_type] = 
          (summary.actionTypes[audit.action_type] || 0) + 1;
        
        const userName = `${audit.User.firstName} ${audit.User.lastName}`;
        summary.users[userName] = (summary.users[userName] || 0) + 1;
      });

      res.json({
        success: true,
        data: {
          summary,
          auditLogs: transactionAudits
        }
      });
    } catch (error) {
      console.error('Get transaction report error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate transaction report'
      });
    }
  }

  /**
   * @route   GET /api/audit/reports/damages
   * @desc    Generate damage audit report
   * @access  Private/Admin
   */
  static async getDamageReport(req, res) {
    try {
      const { startDate, endDate, actionType } = req.query;

      const whereClause = {
        target_table: 'damages'
      };

      if (actionType) {
        whereClause.action_type = {
          [Op.iLike]: `%${actionType}%`
        };
      }

      if (startDate || endDate) {
        whereClause.timestamp = {};
        if (startDate) whereClause.timestamp[Op.gte] = new Date(startDate);
        if (endDate) whereClause.timestamp[Op.lte] = new Date(endDate);
      }

      const damageAudits = await AuditLog.findAll({
        where: whereClause,
        include: [
          {
            model: User,
            attributes: ['id', 'firstName', 'lastName', 'email', 'role']
          }
        ],
        order: [['timestamp', 'DESC']]
      });

      const summary = {
        totalActions: damageAudits.length,
        actionTypes: {},
        users: {},
        dateRange: {
          start: startDate || 'All time',
          end: endDate || 'Present'
        }
      };

      damageAudits.forEach(audit => {
        summary.actionTypes[audit.action_type] = 
          (summary.actionTypes[audit.action_type] || 0) + 1;
        
        const userName = `${audit.User.firstName} ${audit.User.lastName}`;
        summary.users[userName] = (summary.users[userName] || 0) + 1;
      });

      res.json({
        success: true,
        data: {
          summary,
          auditLogs: damageAudits
        }
      });
    } catch (error) {
      console.error('Get damage report error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate damage report'
      });
    }
  }

  /**
   * @route   GET /api/audit/reports/deliveries
   * @desc    Generate delivery audit report
   * @access  Private/Admin
   */
  static async getDeliveryReport(req, res) {
    try {
      const { startDate, endDate, actionType } = req.query;

      const whereClause = {
        target_table: 'deliveries'
      };

      if (actionType) {
        whereClause.action_type = {
          [Op.iLike]: `%${actionType}%`
        };
      }

      if (startDate || endDate) {
        whereClause.timestamp = {};
        if (startDate) whereClause.timestamp[Op.gte] = new Date(startDate);
        if (endDate) whereClause.timestamp[Op.lte] = new Date(endDate);
      }

      const deliveryAudits = await AuditLog.findAll({
        where: whereClause,
        include: [
          {
            model: User,
            attributes: ['id', 'firstName', 'lastName', 'email', 'role']
          }
        ],
        order: [['timestamp', 'DESC']]
      });

      const summary = {
        totalActions: deliveryAudits.length,
        actionTypes: {},
        users: {},
        dateRange: {
          start: startDate || 'All time',
          end: endDate || 'Present'
        }
      };

      deliveryAudits.forEach(audit => {
        summary.actionTypes[audit.action_type] = 
          (summary.actionTypes[audit.action_type] || 0) + 1;
        
        const userName = `${audit.User.firstName} ${audit.User.lastName}`;
        summary.users[userName] = (summary.users[userName] || 0) + 1;
      });

      res.json({
        success: true,
        data: {
          summary,
          auditLogs: deliveryAudits
        }
      });
    } catch (error) {
      console.error('Get delivery report error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate delivery report'
      });
    }
  }

  /**
   * @route   GET /api/audit/reports/comprehensive
   * @desc    Generate comprehensive audit report
   * @access  Private/Admin
   */
  static async getComprehensiveReport(req, res) {
    try {
      const { startDate, endDate } = req.query;

      const whereClause = {};
      if (startDate || endDate) {
        whereClause.timestamp = {};
        if (startDate) whereClause.timestamp[Op.gte] = new Date(startDate);
        if (endDate) whereClause.timestamp[Op.lte] = new Date(endDate);
      }

      const allAudits = await AuditLog.findAll({
        where: whereClause,
        include: [
          {
            model: User,
            attributes: ['id', 'firstName', 'lastName', 'email', 'role']
          }
        ],
        order: [['timestamp', 'DESC']]
      });

      // Generate comprehensive statistics
      const comprehensiveReport = {
        summary: {
          totalActions: allAudits.length,
          dateRange: {
            start: startDate || 'All time',
            end: endDate || 'Present'
          }
        },
        byTable: {},
        byAction: {},
        byUser: {},
        byRole: {},
        timeline: []
      };

      allAudits.forEach(audit => {
        // By table
        const table = audit.target_table;
        comprehensiveReport.byTable[table] = 
          (comprehensiveReport.byTable[table] || 0) + 1;

        // By action
        const action = audit.action_type;
        comprehensiveReport.byAction[action] = 
          (comprehensiveReport.byAction[action] || 0) + 1;

        // By user
        const userName = `${audit.User.firstName} ${audit.User.lastName}`;
        comprehensiveReport.byUser[userName] = 
          (comprehensiveReport.byUser[userName] || 0) + 1;

        // By role
        const role = audit.User.role;
        comprehensiveReport.byRole[role] = 
          (comprehensiveReport.byRole[role] || 0) + 1;

        // Timeline data
        comprehensiveReport.timeline.push({
          timestamp: audit.timestamp,
          action: audit.action_type,
          table: audit.target_table,
          user: userName,
          role: role
        });
      });

      res.json({
        success: true,
        data: comprehensiveReport
      });
    } catch (error) {
      console.error('Get comprehensive report error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate comprehensive report'
      });
    }
  }

  /**
   * @route   GET /api/audit/integrity-check
   * @desc    Perform data integrity monitoring
   * @access  Private/Admin
   */
  static async performIntegrityCheck(req, res) {
    try {
      const integrityResults = {
        timestamp: new Date(),
        checks: [],
        overallStatus: 'PASS',
        issues: []
      };

      // Check 1: Orphaned audit logs (user_id references non-existent users)
      const orphanedAudits = await AuditLog.findAll({
        where: {
          user_id: {
            [Op.not]: null
          }
        },
        include: [
          {
            model: User,
            required: false
          }
        ]
      });

      const orphanedCount = orphanedAudits.filter(audit => !audit.User).length;
      integrityResults.checks.push({
        name: 'Orphaned Audit Logs',
        status: orphanedCount === 0 ? 'PASS' : 'FAIL',
        details: `${orphanedCount} audit logs reference non-existent users`,
        count: orphanedCount
      });

      if (orphanedCount > 0) {
        integrityResults.overallStatus = 'FAIL';
        integrityResults.issues.push('Orphaned audit logs detected');
      }

      // Check 2: Missing timestamps
      const missingTimestamps = await AuditLog.count({
        where: {
          timestamp: null
        }
      });

      integrityResults.checks.push({
        name: 'Missing Timestamps',
        status: missingTimestamps === 0 ? 'PASS' : 'FAIL',
        details: `${missingTimestamps} audit logs missing timestamps`,
        count: missingTimestamps
      });

      if (missingTimestamps > 0) {
        integrityResults.overallStatus = 'FAIL';
        integrityResults.issues.push('Missing timestamps detected');
      }

      // Check 3: Invalid action types
      const validActionTypes = [
        'INSERT', 'UPDATE', 'DELETE', 'BORROW', 'RETURN', 
        'TRANSFER', 'DAMAGE_REPORT', 'DELIVERY_UPDATE'
      ];

      const invalidActions = await AuditLog.findAll({
        where: {
          action_type: {
            [Op.notIn]: validActionTypes
          }
        }
      });

      integrityResults.checks.push({
        name: 'Invalid Action Types',
        status: invalidActions.length === 0 ? 'PASS' : 'FAIL',
        details: `${invalidActions.length} audit logs with invalid action types`,
        count: invalidActions.length
      });

      if (invalidActions.length > 0) {
        integrityResults.overallStatus = 'FAIL';
        integrityResults.issues.push('Invalid action types detected');
      }

      // Check 4: Recent activity validation
      const recentActivity = await AuditLog.count({
        where: {
          timestamp: {
            [Op.gte]: new Date(Date.now() - (24 * 60 * 60 * 1000))
          }
        }
      });

      integrityResults.checks.push({
        name: 'Recent Activity',
        status: recentActivity > 0 ? 'PASS' : 'WARNING',
        details: `${recentActivity} audit entries in last 24 hours`,
        count: recentActivity
      });

      if (recentActivity === 0) {
        integrityResults.issues.push('No recent audit activity detected');
      }

      res.json({
        success: true,
        data: integrityResults
      });
    } catch (error) {
      console.error('Integrity check error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to perform integrity check'
      });
    }
  }

  /**
   * @route   GET /api/audit/stats
   * @desc    Get audit statistics
   * @access  Private/Admin
   */
  static async getAuditStats(req, res) {
    try {
      const { period = '30' } = req.query; // days
      const cutoffDate = new Date(Date.now() - (period * 24 * 60 * 60 * 1000));

      const stats = await AuditLog.findAll({
        where: {
          timestamp: {
            [Op.gte]: cutoffDate
          }
        },
        attributes: [
          'action_type',
          'target_table',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
        ],
        group: ['action_type', 'target_table'],
        order: [[require('sequelize').fn('COUNT', require('sequelize').col('id')), 'DESC']]
      });

      const totalAudits = await AuditLog.count({
        where: {
          timestamp: {
            [Op.gte]: cutoffDate
          }
        }
      });

      const uniqueUsers = await AuditLog.findAll({
        where: {
          timestamp: {
            [Op.gte]: cutoffDate
          }
        },
        attributes: [
          [require('sequelize').fn('DISTINCT', require('sequelize').col('user_id')), 'user_id']
        ]
      });

      res.json({
        success: true,
        data: {
          period: `${period} days`,
          totalAudits,
          uniqueUsers: uniqueUsers.length,
          breakdown: stats.map(stat => ({
            actionType: stat.action_type,
            targetTable: stat.target_table,
            count: parseInt(stat.dataValues.count)
          }))
        }
      });
    } catch (error) {
      console.error('Get audit stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch audit statistics'
      });
    }
  }

  /**
   * @route   DELETE /api/audit/logs/cleanup
   * @desc    Clean up old audit logs (Admin only)
   * @access  Private/Admin
   */
  static async cleanupOldLogs(req, res) {
    try {
      const { days = 365 } = req.body; // Keep logs for specified days
      const cutoffDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));

      const deletedCount = await AuditLog.destroy({
        where: {
          timestamp: {
            [Op.lt]: cutoffDate
          }
        }
      });

      res.json({
        success: true,
        message: `Cleaned up ${deletedCount} audit logs older than ${days} days`,
        data: {
          deletedCount,
          cutoffDate
        }
      });
    } catch (error) {
      console.error('Cleanup old logs error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cleanup old audit logs'
      });
    }
  }
}

module.exports = AuditController;
