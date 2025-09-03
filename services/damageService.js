const { Damage, User, Item } = require('../models');

class DamageService {
  /**
   * Report damage for an item (handles both serial and bulk items)
   * @param {Object} damageData - Damage information
   * @param {string} damageData.item_id - Item ID
   * @param {string} damageData.item_type - 'serial' or 'bulk'
   * @param {string} damageData.serial_number - Required for serial items
   * @param {number} damageData.quantity_damaged - Required for bulk items
   * @param {string} damageData.description - Damage description
   * @param {string} damageData.reported_by - User reporting the damage
   * @param {string} damageData.notes - Additional notes
   */
  static async reportDamage(damageData) {
    try {
      // Validate item exists
      const item = await Item.findByPk(damageData.item_id);
      if (!item) {
        throw new Error('Item not found');
      }

      // Validate item type matches the item's actual type
      if (item.item_type !== damageData.item_type) {
        throw new Error(`Item type mismatch: Item is ${item.item_type}, but damage reported as ${damageData.item_type}`);
      }

      // Additional validation for serial items
      if (damageData.item_type === 'serial') {
        // Check if serial number exists for this item
        if (!item.serial_numbers || !item.serial_numbers.includes(damageData.serial_number)) {
          throw new Error(`Serial number ${damageData.serial_number} not found for this item`);
        }
        
        // Check if this serial number is already reported as damaged
        const existingDamage = await Damage.findOne({
          where: {
            item_id: damageData.item_id,
            serial_number: damageData.serial_number,
            status: ['Pending', 'Fixed'] // Not discarded
          }
        });
        
        if (existingDamage) {
          throw new Error(`Serial number ${damageData.serial_number} already has a pending or fixed damage report`);
        }
      }

      // Additional validation for bulk items
      if (damageData.item_type === 'bulk') {
        // Check if quantity damaged doesn't exceed available quantity
        if (damageData.quantity_damaged > item.quantity) {
          throw new Error(`Quantity damaged (${damageData.quantity_damaged}) cannot exceed available quantity (${item.quantity})`);
        }
        
        // Check if this would make the item unavailable
        const totalDamaged = await this.getTotalDamagedQuantity(damageData.item_id);
        const remainingAfterDamage = item.quantity - totalDamaged - damageData.quantity_damaged;
        
        if (remainingAfterDamage < 0) {
          throw new Error(`Cannot damage ${damageData.quantity_damaged} items. Only ${item.quantity - totalDamaged} items available for damage reporting.`);
        }
      }

      // Create the damage record
      const damage = await Damage.create(damageData);
      
      return damage;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get total damaged quantity for a bulk item
   * @param {string} itemId - Item ID
   * @returns {number} Total damaged quantity
   */
  static async getTotalDamagedQuantity(itemId) {
    try {
      const result = await Damage.sum('quantity_damaged', {
        where: {
          item_id: itemId,
          item_type: 'bulk',
          status: ['Pending', 'Fixed'] // Not discarded
        }
      });
      
      return result || 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get damage by serial number
   * @param {string} serialNumber - Serial number to search for
   * @returns {Array} Array of damage records for this serial number
   */
  static async getDamageBySerial(serialNumber) {
    try {
      return await Damage.findAll({
        where: {
          serial_number: serialNumber,
          item_type: 'serial'
        },
        include: [
          {
            model: User,
            as: 'reporter',
            attributes: ['id', 'firstName', 'lastName', 'email']
          },
          {
            model: User,
            as: 'resolver',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ],
        order: [['date_reported', 'DESC']]
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get damage by item type
   * @param {string} itemType - 'serial' or 'bulk'
   * @returns {Array} Array of damage records for this item type
   */
  static async getDamageByType(itemType) {
    try {
      if (!['serial', 'bulk'].includes(itemType)) {
        throw new Error('Item type must be either "serial" or "bulk"');
      }

      return await Damage.findAll({
        where: {
          item_type: itemType
        },
        include: [
          {
            model: User,
            as: 'reporter',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ],
        order: [['date_reported', 'DESC']]
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Resolve damage (mark as fixed or discarded)
   * @param {string} damageId - Damage record ID
   * @param {string} status - 'Fixed' or 'Discarded'
   * @param {string} resolvedBy - User ID resolving the damage
   * @param {string} notes - Resolution notes
   */
  static async resolveDamage(damageId, status, resolvedBy, notes = '') {
    try {
      if (!['Fixed', 'Discarded'].includes(status)) {
        throw new Error('Status must be either "Fixed" or "Discarded"');
      }

      const damage = await Damage.findByPk(damageId);
      if (!damage) {
        throw new Error('Damage record not found');
      }

      if (damage.status !== 'Pending') {
        throw new Error('Only pending damage can be resolved');
      }

      // Update damage record
      await damage.update({
        status: status,
        resolved_by: resolvedBy,
        resolution_date: new Date(),
        notes: notes || damage.notes
      });

      return damage;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get damage statistics by type
   * @returns {Object} Statistics for serial and bulk items
   */
  static async getDamageStats() {
    try {
      const stats = await Damage.findAll({
        attributes: [
          'item_type',
          'status',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
        ],
        group: ['item_type', 'status']
      });

      const result = {
        serial: { Pending: 0, Fixed: 0, Discarded: 0, total: 0 },
        bulk: { Pending: 0, Fixed: 0, Discarded: 0, total: 0 }
      };

      stats.forEach(stat => {
        const itemType = stat.dataValues.item_type;
        const status = stat.dataValues.status;
        const count = parseInt(stat.dataValues.count);
        
        result[itemType][status] = count;
        result[itemType].total += count;
      });

      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get overdue damage (damage pending for more than 7 days)
   * @returns {Array} Array of overdue damage records
   */
  static async getOverdueDamage() {
    try {
      const sevenDaysAgo = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000));
      
      return await Damage.findAll({
        where: {
          status: 'Pending',
          date_reported: {
            [require('sequelize').Op.lt]: sevenDaysAgo
          }
        },
        include: [
          {
            model: User,
            as: 'reporter',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ],
        order: [['date_reported', 'ASC']]
      });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = DamageService;
