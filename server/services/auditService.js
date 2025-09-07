const { AuditLog, User } = require('../models');

class AuditService {
  /**
   * Create audit log entry
   */
  static async logAction(auditData) {
    try {
      const audit = await AuditLog.create({
        ...auditData,
        timestamp: new Date()
      });

      return audit;
    } catch (error) {
      console.error('Failed to create audit log:', error);
      // Don't throw error - audit failure shouldn't break main operations
      return null;
    }
  }

  /**
   * Log INSERT operation
   */
  static async logInsert(userId, tableName, recordId, newData) {
    return await this.logAction({
      user_id: userId,
      action_type: 'INSERT',
      target_table: tableName,
      target_id: recordId,
      new_value: newData
    });
  }

  /**
   * Log UPDATE operation
   */
  static async logUpdate(userId, tableName, recordId, oldData, newData) {
    return await this.logAction({
      user_id: userId,
      action_type: 'UPDATE',
      target_table: tableName,
      target_id: recordId,
      old_value: oldData,
      new_value: newData
    });
  }

  /**
   * Log DELETE operation
   */
  static async logDelete(userId, tableName, recordId, deletedData) {
    return await this.logAction({
      user_id: userId,
      action_type: 'DELETE',
      target_table: tableName,
      target_id: recordId,
      old_value: deletedData
    });
  }

  /**
   * Get audit logs by user
   */
  static async getAuditLogsByUser(userId, limit = 100) {
    try {
      return await AuditLog.findAll({
        where: { user_id: userId },
        order: [['timestamp', 'DESC']],
        limit: limit
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get recent audit activity (last 24 hours)
   */
  static async getRecentActivity() {
    try {
      const yesterday = new Date(Date.now() - (24 * 60 * 60 * 1000));
      
      return await AuditLog.findAll({
        where: {
          timestamp: {
            [require('sequelize').Op.gte]: yesterday
          }
        },
        include: [
          {
            model: User,
            attributes: ['id', 'name', 'email']
          }
        ],
        order: [['timestamp', 'DESC']],
        limit: 50
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Log BORROW operation
   */
  static async logBorrow(userId, itemId, itemData) {
    return await this.logAction({
      user_id: userId,
      action_type: 'BORROW',
      target_table: 'transactions',
      target_id: itemId,
      new_value: itemData
    });
  }

  /**
   * Log RETURN operation
   */
  static async logReturn(userId, itemId, returnData) {
    return await this.logAction({
      user_id: userId,
      action_type: 'RETURN',
      target_table: 'transactions',
      target_id: itemId,
      new_value: returnData
    });
  }

  /**
   * Log TRANSFER operation
   */
  static async logTransfer(userId, itemId, transferData) {
    return await this.logAction({
      user_id: userId,
      action_type: 'TRANSFER',
      target_table: 'transactions',
      target_id: itemId,
      new_value: transferData
    });
  }

  /**
   * Log DAMAGE_REPORT operation
   */
  static async logDamageReport(userId, damageId, damageData) {
    return await this.logAction({
      user_id: userId,
      action_type: 'DAMAGE_REPORT',
      target_table: 'damages',
      target_id: damageId,
      new_value: damageData
    });
  }

  /**
   * Log DELIVERY_UPDATE operation
   */
  static async logDeliveryUpdate(userId, deliveryId, oldData, newData) {
    return await this.logAction({
      user_id: userId,
      action_type: 'DELIVERY_UPDATE',
      target_table: 'deliveries',
      target_id: deliveryId,
      old_value: oldData,
      new_value: newData
    });
  }

  /**
   * Get audit logs with advanced filtering
   */
  static async getFilteredAuditLogs(filters = {}) {
    try {
      const {
        actionType,
        targetTable,
        userId,
        startDate,
        endDate,
        limit = 100,
        offset = 0
      } = filters;

      const whereClause = {};
      
      if (actionType) {
        whereClause.action_type = {
          [require('sequelize').Op.iLike]: `%${actionType}%`
        };
      }
      
      if (targetTable) {
        whereClause.target_table = {
          [require('sequelize').Op.iLike]: `%${targetTable}%`
        };
      }
      
      if (userId) {
        whereClause.user_id = userId;
      }
      
      if (startDate || endDate) {
        whereClause.timestamp = {};
        if (startDate) whereClause.timestamp[require('sequelize').Op.gte] = new Date(startDate);
        if (endDate) whereClause.timestamp[require('sequelize').Op.lte] = new Date(endDate);
      }

      return await AuditLog.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            attributes: ['id', 'name', 'email', 'role']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['timestamp', 'DESC']]
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get audit statistics
   */
  static async getAuditStatistics(period = 30) {
    try {
      const cutoffDate = new Date(Date.now() - (period * 24 * 60 * 60 * 1000));

      const stats = await AuditLog.findAll({
        where: {
          timestamp: {
            [require('sequelize').Op.gte]: cutoffDate
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
            [require('sequelize').Op.gte]: cutoffDate
          }
        }
      });

      return {
        period: `${period} days`,
        totalAudits,
        breakdown: stats.map(stat => ({
          actionType: stat.action_type,
          targetTable: stat.target_table,
          count: parseInt(stat.dataValues.count)
        }))
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Perform data integrity check
   */
  static async performIntegrityCheck() {
    try {
      const results = {
        timestamp: new Date(),
        checks: [],
        overallStatus: 'PASS',
        issues: []
      };

      // Check for orphaned audit logs
      const orphanedAudits = await AuditLog.findAll({
        where: {
          user_id: {
            [require('sequelize').Op.not]: null
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
      results.checks.push({
        name: 'Orphaned Audit Logs',
        status: orphanedCount === 0 ? 'PASS' : 'FAIL',
        details: `${orphanedCount} audit logs reference non-existent users`,
        count: orphanedCount
      });

      if (orphanedCount > 0) {
        results.overallStatus = 'FAIL';
        results.issues.push('Orphaned audit logs detected');
      }

      // Check for missing timestamps
      const missingTimestamps = await AuditLog.count({
        where: {
          timestamp: null
        }
      });

      results.checks.push({
        name: 'Missing Timestamps',
        status: missingTimestamps === 0 ? 'PASS' : 'FAIL',
        details: `${missingTimestamps} audit logs missing timestamps`,
        count: missingTimestamps
      });

      if (missingTimestamps > 0) {
        results.overallStatus = 'FAIL';
        results.issues.push('Missing timestamps detected');
      }

      return results;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = AuditService;
