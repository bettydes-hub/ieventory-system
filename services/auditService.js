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
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ],
        order: [['timestamp', 'DESC']],
        limit: 50
      });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = AuditService;
