const { Damage, Item, User, Store, Category, AuditLog } = require('../models');
const { Op } = require('sequelize');
const { mapItemToFrontend, mapUserToFrontend } = require('../utils/fieldMapper');

class DamageController {
  // ==================== DAMAGE REPORTING ====================
  
  /**
   * Create a new damage report
   */
  async createDamageReport(req, res) {
    try {
      const {
        itemId,
        description,
        severity = 'Medium',
        itemType = 'bulk',
        serialNumber,
        quantityDamaged,
        notes
      } = req.body;
      
      const userId = req.user.userId;
      
      // Validate required fields
      if (!itemId || !description) {
        return res.status(400).json({
          success: false,
          message: 'Item ID and description are required'
        });
      }
      
      // Validate item type specific fields
      if (itemType === 'serial' && !serialNumber) {
        return res.status(400).json({
          success: false,
          message: 'Serial number is required for serial items'
        });
      }
      
      if (itemType === 'bulk' && (!quantityDamaged || quantityDamaged < 1)) {
        return res.status(400).json({
          success: false,
          message: 'Quantity damaged is required and must be at least 1 for bulk items'
        });
      }
      
      // Check if item exists
      const item = await Item.findByPk(itemId, {
        include: [
          { model: Store, attributes: ['storeId', 'name', 'location'] },
          { model: Category, attributes: ['categoryId', 'name'] }
        ]
      });
      
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        });
      }
      
      // For serial items, verify the serial number exists
      if (itemType === 'serial' && item.serial_number !== serialNumber) {
        return res.status(400).json({
          success: false,
          message: 'Serial number does not match the item'
        });
      }
      
      // For bulk items, verify sufficient quantity
      if (itemType === 'bulk' && item.amount < quantityDamaged) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient quantity available for damage report'
        });
      }
      
      // Create damage report
      const damage = await Damage.create({
        item_id: itemId,
        item_type: itemType,
        serial_number: itemType === 'serial' ? serialNumber : null,
        quantity_damaged: itemType === 'bulk' ? quantityDamaged : null,
        reported_by: userId,
        description,
        severity,
        notes
      });
      
      // Update item status if critical damage
      if (severity === 'Critical') {
        await item.update({ status: 'damaged' });
      }
      
      // Log audit
      await AuditLog.create({
        userId: userId,
        targetTable: 'damages',
        targetId: damage.damage_id,
        actionType: 'CREATE',
        newValue: JSON.stringify(damage.toJSON())
      });
      
      res.status(201).json({
        success: true,
        message: 'Damage report created successfully',
        data: {
          damage: {
            id: damage.damage_id,
            description: damage.description,
            severity: damage.severity,
            status: damage.status,
            itemType: damage.item_type,
            serialNumber: damage.serial_number,
            quantityDamaged: damage.quantity_damaged,
            reportedAt: damage.date_reported,
            notes: damage.notes
          },
          item: mapItemToFrontend(item)
        }
      });
    } catch (error) {
      console.error('Error creating damage report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create damage report',
        error: error.message
      });
    }
  }
  
  /**
   * Get user's damage reports
   */
  async getUserDamageReports(req, res) {
    try {
      const userId = req.user.userId;
      const { status, severity, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;
      
      const whereClause = {
        reported_by: userId
      };
      
      if (status) {
        whereClause.status = status;
      }
      
      if (severity) {
        whereClause.severity = severity;
      }
      
      const { count, rows: damages } = await Damage.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Item,
            include: [
              { model: Store, attributes: ['storeId', 'name', 'location'] },
              { model: Category, attributes: ['categoryId', 'name'] }
            ]
          },
          {
            model: User,
            as: 'Resolver',
            attributes: ['userId', 'name', 'email'],
            foreignKey: 'resolved_by'
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['date_reported', 'DESC']]
      });
      
      const mappedDamages = damages.map(damage => {
        const data = damage.toJSON();
        return {
          id: data.damage_id,
          description: data.description,
          severity: data.severity,
          status: data.status,
          itemType: data.item_type,
          serialNumber: data.serial_number,
          quantityDamaged: data.quantity_damaged,
          reportedAt: data.date_reported,
          resolvedAt: data.resolution_date,
          notes: data.notes,
          item: mapItemToFrontend(data.Item),
          resolver: data.Resolver ? mapUserToFrontend(data.Resolver) : null,
          resolutionTime: damage.getResolutionTime(),
          isCritical: damage.isCritical(),
          isHighSeverity: damage.isHighSeverity()
        };
      });
      
      res.json({
        success: true,
        data: {
          damages: mappedDamages,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Error getting user damage reports:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve damage reports',
        error: error.message
      });
    }
  }
  
  // ==================== DAMAGE MANAGEMENT ====================
  
  /**
   * Get all damage reports (Store Keepers and Admins)
   */
  async getAllDamageReports(req, res) {
    try {
      const { status, severity, page = 1, limit = 10, storeId } = req.query;
      const offset = (page - 1) * limit;
      
      const whereClause = {};
      
      if (status) {
        whereClause.status = status;
      }
      
      if (severity) {
        whereClause.severity = severity;
      }
      
      const includeClause = [
        {
          model: Item,
          include: [
            { model: Store, attributes: ['storeId', 'name', 'location'] },
            { model: Category, attributes: ['categoryId', 'name'] }
          ]
        },
        {
          model: User,
          as: 'Reporter',
          attributes: ['userId', 'name', 'email', 'role'],
          foreignKey: 'reported_by'
        },
        {
          model: User,
          as: 'Resolver',
          attributes: ['userId', 'name', 'email'],
          foreignKey: 'resolved_by'
        }
      ];
      
      // Filter by store if specified
      if (storeId) {
        includeClause[0].where = { store_id: storeId };
      }
      
      const { count, rows: damages } = await Damage.findAndCountAll({
        where: whereClause,
        include: includeClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['date_reported', 'DESC']]
      });
      
      const mappedDamages = damages.map(damage => {
        const data = damage.toJSON();
        return {
          id: data.damage_id,
          description: data.description,
          severity: data.severity,
          status: data.status,
          itemType: data.item_type,
          serialNumber: data.serial_number,
          quantityDamaged: data.quantity_damaged,
          reportedAt: data.date_reported,
          resolvedAt: data.resolution_date,
          notes: data.notes,
          item: mapItemToFrontend(data.Item),
          reporter: mapUserToFrontend(data.Reporter),
          resolver: data.Resolver ? mapUserToFrontend(data.Resolver) : null,
          resolutionTime: damage.getResolutionTime(),
          isCritical: damage.isCritical(),
          isHighSeverity: damage.isHighSeverity()
        };
      });
      
      res.json({
        success: true,
        data: {
          damages: mappedDamages,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Error getting all damage reports:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve damage reports',
        error: error.message
      });
    }
  }
  
  /**
   * Update damage report status (Store Keepers and Admins)
   */
  async updateDamageStatus(req, res) {
    try {
      const { damageId } = req.params;
      const { status, notes } = req.body;
      const userId = req.user.userId;
      
      const damage = await Damage.findByPk(damageId, {
        include: [
          {
            model: Item,
            include: [
              { model: Store, attributes: ['storeId', 'name', 'location'] },
              { model: Category, attributes: ['categoryId', 'name'] }
            ]
          }
        ]
      });
      
      if (!damage) {
        return res.status(404).json({
          success: false,
          message: 'Damage report not found'
        });
      }
      
      const oldStatus = damage.status;
      
      // Update damage status
      await damage.update({
        status,
        resolved_by: status === 'Resolved' ? userId : null,
        resolution_date: status === 'Resolved' ? new Date() : null,
        notes: notes || damage.notes
      });
      
      // If resolved, update item status back to available
      if (status === 'Resolved' && damage.Item.status === 'damaged') {
        await damage.Item.update({ status: 'available' });
      }
      
      // Log audit
      await AuditLog.create({
        userId: userId,
        targetTable: 'damages',
        targetId: damage.damage_id,
        actionType: 'UPDATE',
        oldValue: JSON.stringify({ status: oldStatus }),
        newValue: JSON.stringify({ 
          status, 
          resolved_by: status === 'Resolved' ? userId : null,
          resolution_date: status === 'Resolved' ? new Date() : null
        })
      });
      
      res.json({
        success: true,
        message: 'Damage report status updated successfully',
        data: {
          damage: {
            id: damage.damage_id,
            status: damage.status,
            resolvedAt: damage.resolution_date,
            notes: damage.notes
          },
          item: mapItemToFrontend(damage.Item)
        }
      });
    } catch (error) {
      console.error('Error updating damage status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update damage status',
        error: error.message
      });
    }
  }
  
  // ==================== DASHBOARD DATA ====================
  
  /**
   * Get damage statistics for dashboard
   */
  async getDamageStats(req, res) {
    try {
      const { storeId } = req.query;
      
      const whereClause = {};
      if (storeId) {
        whereClause['$Item.store_id$'] = storeId;
      }
      
      const [
        totalDamages,
        pendingDamages,
        criticalDamages,
        resolvedDamages,
        damagesBySeverity
      ] = await Promise.all([
        Damage.count({
          where: whereClause,
          include: storeId ? [{ model: Item, where: { store_id: storeId } }] : [{ model: Item }]
        }),
        Damage.count({
          where: { ...whereClause, status: 'Pending' },
          include: storeId ? [{ model: Item, where: { store_id: storeId } }] : [{ model: Item }]
        }),
        Damage.count({
          where: { ...whereClause, severity: 'Critical' },
          include: storeId ? [{ model: Item, where: { store_id: storeId } }] : [{ model: Item }]
        }),
        Damage.count({
          where: { ...whereClause, status: 'Resolved' },
          include: storeId ? [{ model: Item, where: { store_id: storeId } }] : [{ model: Item }]
        }),
        Damage.findAll({
          attributes: [
            'severity',
            [Damage.sequelize.fn('COUNT', Damage.sequelize.col('damage_id')), 'count']
          ],
          where: whereClause,
          include: storeId ? [{ model: Item, where: { store_id: storeId } }] : [{ model: Item }],
          group: ['severity'],
          raw: true
        })
      ]);
      
      res.json({
        success: true,
        data: {
          totalDamages,
          pendingDamages,
          criticalDamages,
          resolvedDamages,
          damagesBySeverity
        }
      });
    } catch (error) {
      console.error('Error getting damage stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve damage statistics',
        error: error.message
      });
    }
  }
}

module.exports = new DamageController();
