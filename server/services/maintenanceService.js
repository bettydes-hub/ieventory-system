const { MaintenanceLog, User, Item } = require('../models');

class MaintenanceService {
  /**
   * Schedule maintenance for an item
   * @param {Object} maintenanceData - Maintenance information
   * @param {string} maintenanceData.item_id - Item ID
   * @param {Date} maintenanceData.scheduled_date - Scheduled maintenance date
   * @param {string} maintenanceData.assigned_to - User assigned to perform maintenance
   * @param {string} maintenanceData.notes - Maintenance notes
   */
  static async scheduleMaintenance(maintenanceData) {
    try {
      // Validate item exists
      const item = await Item.findByPk(maintenanceData.item_id);
      if (!item) {
        throw new Error('Item not found');
      }

      // Validate assigned user exists
      const assignedUser = await User.findByPk(maintenanceData.assigned_to);
      if (!assignedUser) {
        throw new Error('Assigned user not found');
      }

      // Check if item already has pending maintenance
      const existingMaintenance = await MaintenanceLog.findOne({
        where: {
          item_id: maintenanceData.item_id,
          status: 'Pending'
        }
      });

      if (existingMaintenance) {
        throw new Error('Item already has pending maintenance scheduled');
      }

      // Create maintenance record
      const maintenance = await MaintenanceLog.create({
        ...maintenanceData,
        status: 'Pending'
      });

      return maintenance;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Complete maintenance for an item
   * @param {string} maintenanceId - Maintenance record ID
   * @param {string} performedBy - User who performed the maintenance
   * @param {string} notes - Completion notes
   */
  static async completeMaintenance(maintenanceId, performedBy, notes = '') {
    try {
      const maintenance = await MaintenanceLog.findByPk(maintenanceId);
      if (!maintenance) {
        throw new Error('Maintenance record not found');
      }

      if (maintenance.status !== 'Pending') {
        throw new Error('Maintenance is already completed');
      }

      // Update maintenance record
      await maintenance.update({
        status: 'Completed',
        completed_date: new Date(),
        performed_by: performedBy,
        notes: notes || maintenance.notes
      });

      return maintenance;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get overdue maintenance (scheduled but not completed)
   * @returns {Array} Array of overdue maintenance records
   */
  static async getOverdueMaintenance() {
    try {
      const today = new Date();
      
      return await MaintenanceLog.findAll({
        where: {
          status: 'Pending',
          scheduled_date: {
            [require('sequelize').Op.lt]: today
          }
        },
        include: [
          {
            model: User,
            as: 'assignee',
            attributes: ['id', 'firstName', 'lastName', 'email']
          },
          {
            model: Item,
            attributes: ['id', 'name', 'item_type']
          }
        ],
        order: [['scheduled_date', 'ASC']]
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get maintenance by item
   * @param {string} itemId - Item ID
   * @returns {Array} Array of maintenance records for this item
   */
  static async getMaintenanceByItem(itemId) {
    try {
      return await MaintenanceLog.findAll({
        where: { item_id: itemId },
        include: [
          {
            model: User,
            as: 'assignee',
            attributes: ['id', 'firstName', 'lastName', 'email']
          },
          {
            model: User,
            as: 'performer',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ],
        order: [['scheduled_date', 'DESC']]
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get maintenance by assigned user
   * @param {string} userId - User ID
   * @returns {Array} Array of maintenance records assigned to this user
   */
  static async getMaintenanceByUser(userId) {
    try {
      return await MaintenanceLog.findAll({
        where: { assigned_to: userId },
        include: [
          {
            model: Item,
            attributes: ['id', 'name', 'item_type']
          }
        ],
        order: [['scheduled_date', 'ASC']]
      });
  }

  /**
   * Get maintenance statistics
   * @returns {Object} Maintenance statistics
   */
  static async getMaintenanceStats() {
    try {
      const stats = await MaintenanceLog.findAll({
        attributes: [
          'status',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
        ],
        group: ['status']
      });

      const result = {
        Pending: 0,
        Completed: 0,
        total: 0
      };

      stats.forEach(stat => {
        const status = stat.dataValues.status;
        const count = parseInt(stat.dataValues.count);
        result[status] = count;
        result.total += count;
      });

      // Add overdue count
      const overdueCount = await this.getOverdueMaintenance();
      result.Overdue = overdueCount.length;

      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reschedule maintenance
   * @param {string} maintenanceId - Maintenance record ID
   * @param {Date} newDate - New scheduled date
   * @param {string} reason - Reason for rescheduling
   */
  static async rescheduleMaintenance(maintenanceId, newDate, reason = '') {
    try {
      const maintenance = await MaintenanceLog.findByPk(maintenanceId);
      if (!maintenance) {
        throw new Error('Maintenance record not found');
      }

      if (maintenance.status !== 'Pending') {
        throw new Error('Cannot reschedule completed maintenance');
      }

      // Update scheduled date
      await maintenance.update({
        scheduled_date: newDate,
        notes: reason ? `${maintenance.notes || ''}\nRescheduled: ${reason}` : maintenance.notes
      });

      return maintenance;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cancel maintenance
   * @param {string} maintenanceId - Maintenance record ID
   * @param {string} reason - Reason for cancellation
   */
  static async cancelMaintenance(maintenanceId, reason = '') {
    try {
      const maintenance = await MaintenanceLog.findByPk(maintenanceId);
      if (!maintenance) {
        throw new Error('Maintenance record not found');
      }

      if (maintenance.status !== 'Pending') {
        throw new Error('Cannot cancel completed maintenance');
      }

      // Delete the maintenance record
      await maintenance.destroy();

      return { message: 'Maintenance cancelled successfully', reason };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get upcoming maintenance (scheduled within next 7 days)
   * @returns {Array} Array of upcoming maintenance records
   */
  static async getUpcomingMaintenance() {
    try {
      const today = new Date();
      const nextWeek = new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000));
      
      return await MaintenanceLog.findAll({
        where: {
          status: 'Pending',
          scheduled_date: {
            [require('sequelize').Op.between]: [today, nextWeek]
          }
        },
        include: [
          {
            model: User,
            as: 'assignee',
            attributes: ['id', 'firstName', 'lastName', 'email']
          },
          {
            model: Item,
            attributes: ['id', 'name', 'item_type']
          }
        ],
        order: [['scheduled_date', 'ASC']]
      });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = MaintenanceService;
