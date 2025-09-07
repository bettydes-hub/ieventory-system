const { MaintenanceLog, Item, User, AuditLog } = require('../models');
const { Op } = require('sequelize');

class MaintenanceController {
  // ==================== CRUD OPERATIONS ====================
  
  /**
   * Get all maintenance logs with pagination and filtering
   */
  async getAllMaintenanceLogs(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search, 
        itemId, 
        status, 
        priority,
        maintenanceType,
        assignedTo,
        dateFrom,
        dateTo
      } = req.query;
      const offset = (page - 1) * limit;
      
      const whereClause = {};
      
      // Search filter
      if (search) {
        whereClause[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
          { notes: { [Op.iLike]: `%${search}%` } }
        ];
      }
      
      // Item filter
      if (itemId) {
        whereClause.itemId = itemId;
      }
      
      // Status filter
      if (status) {
        whereClause.status = status;
      }
      
      // Priority filter
      if (priority) {
        whereClause.priority = priority;
      }
      
      // Maintenance type filter
      if (maintenanceType) {
        whereClause.maintenanceType = maintenanceType;
      }
      
      // Assigned to filter
      if (assignedTo) {
        whereClause.assignedTo = assignedTo;
      }
      
      // Date range filter
      if (dateFrom || dateTo) {
        whereClause.scheduledDate = {};
        if (dateFrom) {
          whereClause.scheduledDate[Op.gte] = new Date(dateFrom);
        }
        if (dateTo) {
          whereClause.scheduledDate[Op.lte] = new Date(dateTo);
        }
      }
      
      const { count, rows: maintenanceLogs } = await MaintenanceLog.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Item,
            attributes: ['itemId', 'name', 'model', 'serialNumber', 'status'],
            required: false
          },
          {
            model: User,
            as: 'assignedUser',
            attributes: ['userId', 'name', 'email', 'role'],
            required: false
          },
          {
            model: User,
            as: 'createdByUser',
            attributes: ['userId', 'name', 'email', 'role'],
            required: false
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['scheduledDate', 'DESC']]
      });
      
      res.json({
        success: true,
        data: {
          maintenanceLogs,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalLogs: count,
            logsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Error getting maintenance logs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve maintenance logs',
        error: error.message
      });
    }
  }
  
  /**
   * Get single maintenance log by ID
   */
  async getMaintenanceLogById(req, res) {
    try {
      const { id } = req.params;
      
      const maintenanceLog = await MaintenanceLog.findByPk(id, {
        include: [
          {
            model: Item,
            attributes: ['itemId', 'name', 'model', 'serialNumber', 'status', 'purchaseDate'],
            required: false
          },
          {
            model: User,
            as: 'assignedUser',
            attributes: ['userId', 'name', 'email', 'role'],
            required: false
          },
          {
            model: User,
            as: 'createdByUser',
            attributes: ['userId', 'name', 'email', 'role'],
            required: false
          }
        ]
      });
      
      if (!maintenanceLog) {
        return res.status(404).json({
          success: false,
          message: 'Maintenance log not found'
        });
      }
      
      res.json({
        success: true,
        data: maintenanceLog
      });
    } catch (error) {
      console.error('Error getting maintenance log:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve maintenance log',
        error: error.message
      });
    }
  }
  
  /**
   * Create new maintenance log
   */
  async createMaintenanceLog(req, res) {
    try {
      const {
        itemId,
        title,
        description,
        maintenanceType,
        priority = 'medium',
        scheduledDate,
        estimatedDuration,
        assignedTo,
        notes,
        status = 'scheduled'
      } = req.body;
      
      // Validate required fields
      if (!itemId || !title || !maintenanceType || !scheduledDate) {
        return res.status(400).json({
          success: false,
          message: 'Item ID, title, maintenance type, and scheduled date are required'
        });
      }
      
      // Validate item exists
      const item = await Item.findByPk(itemId);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        });
      }
      
      // Validate assigned user if provided
      if (assignedTo) {
        const assignedUser = await User.findByPk(assignedTo);
        if (!assignedUser) {
          return res.status(400).json({
            success: false,
            message: 'Assigned user not found'
          });
        }
      }
      
      // Create maintenance log
      const maintenanceLog = await MaintenanceLog.create({
        itemId,
        title,
        description,
        maintenanceType,
        priority,
        scheduledDate: new Date(scheduledDate),
        estimatedDuration,
        assignedTo,
        notes,
        status,
        createdBy: req.user.userId
      });
      
      // Log audit
      await AuditLog.create({
        userId: req.user.userId,
        targetTable: 'maintenance_logs',
        targetId: maintenanceLog.maintenanceLogId,
        actionType: 'CREATE',
        newValue: JSON.stringify(maintenanceLog.toJSON())
      });
      
      res.status(201).json({
        success: true,
        message: 'Maintenance log created successfully',
        data: maintenanceLog
      });
    } catch (error) {
      console.error('Error creating maintenance log:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create maintenance log',
        error: error.message
      });
    }
  }
  
  /**
   * Update maintenance log
   */
  async updateMaintenanceLog(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const maintenanceLog = await MaintenanceLog.findByPk(id);
      if (!maintenanceLog) {
        return res.status(404).json({
          success: false,
          message: 'Maintenance log not found'
        });
      }
      
      // Validate assigned user if being updated
      if (updateData.assignedTo) {
        const assignedUser = await User.findByPk(updateData.assignedTo);
        if (!assignedUser) {
          return res.status(400).json({
            success: false,
            message: 'Assigned user not found'
          });
        }
      }
      
      // Validate item if being updated
      if (updateData.itemId) {
        const item = await Item.findByPk(updateData.itemId);
        if (!item) {
          return res.status(400).json({
            success: false,
            message: 'Item not found'
          });
        }
      }
      
      const oldData = maintenanceLog.toJSON();
      
      // Update maintenance log
      await maintenanceLog.update(updateData);
      
      // Log audit
      await AuditLog.create({
        userId: req.user.userId,
        targetTable: 'maintenance_logs',
        targetId: maintenanceLog.maintenanceLogId,
        actionType: 'UPDATE',
        oldValue: JSON.stringify(oldData),
        newValue: JSON.stringify(maintenanceLog.toJSON())
      });
      
      res.json({
        success: true,
        message: 'Maintenance log updated successfully',
        data: maintenanceLog
      });
    } catch (error) {
      console.error('Error updating maintenance log:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update maintenance log',
        error: error.message
      });
    }
  }
  
  /**
   * Delete maintenance log
   */
  async deleteMaintenanceLog(req, res) {
    try {
      const { id } = req.params;
      
      const maintenanceLog = await MaintenanceLog.findByPk(id);
      if (!maintenanceLog) {
        return res.status(404).json({
          success: false,
          message: 'Maintenance log not found'
        });
      }
      
      // Check if maintenance is in progress or completed
      if (['in_progress', 'completed'].includes(maintenanceLog.status)) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete maintenance log that is in progress or completed'
        });
      }
      
      const oldData = maintenanceLog.toJSON();
      
      // Delete maintenance log
      await maintenanceLog.destroy();
      
      // Log audit
      await AuditLog.create({
        userId: req.user.userId,
        targetTable: 'maintenance_logs',
        targetId: id,
        actionType: 'DELETE',
        oldValue: JSON.stringify(oldData)
      });
      
      res.json({
        success: true,
        message: 'Maintenance log deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting maintenance log:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete maintenance log',
        error: error.message
      });
    }
  }
  
  // ==================== MAINTENANCE SCHEDULING ====================
  
  /**
   * Get maintenance schedule
   */
  async getMaintenanceSchedule(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        dateFrom, 
        dateTo, 
        assignedTo,
        priority,
        status = 'scheduled'
      } = req.query;
      const offset = (page - 1) * limit;
      
      const whereClause = { status };
      
      // Date range filter
      if (dateFrom || dateTo) {
        whereClause.scheduledDate = {};
        if (dateFrom) {
          whereClause.scheduledDate[Op.gte] = new Date(dateFrom);
        }
        if (dateTo) {
          whereClause.scheduledDate[Op.lte] = new Date(dateTo);
        }
      }
      
      // Assigned to filter
      if (assignedTo) {
        whereClause.assignedTo = assignedTo;
      }
      
      // Priority filter
      if (priority) {
        whereClause.priority = priority;
      }
      
      const { count, rows: schedule } = await MaintenanceLog.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Item,
            attributes: ['itemId', 'name', 'model', 'serialNumber', 'status'],
            required: false
          },
          {
            model: User,
            as: 'assignedUser',
            attributes: ['userId', 'name', 'email', 'role'],
            required: false
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['scheduledDate', 'ASC']]
      });
      
      res.json({
        success: true,
        data: {
          schedule,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalScheduled: count,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Error getting maintenance schedule:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve maintenance schedule',
        error: error.message
      });
    }
  }
  
  /**
   * Get upcoming maintenance
   */
  async getUpcomingMaintenance(req, res) {
    try {
      const { days = 7, limit = 10 } = req.query;
      
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + parseInt(days));
      
      const upcomingMaintenance = await MaintenanceLog.findAll({
        where: {
          status: 'scheduled',
          scheduledDate: {
            [Op.between]: [new Date(), futureDate]
          }
        },
        include: [
          {
            model: Item,
            attributes: ['itemId', 'name', 'model', 'serialNumber'],
            required: false
          },
          {
            model: User,
            as: 'assignedUser',
            attributes: ['userId', 'name', 'email'],
            required: false
          }
        ],
        limit: parseInt(limit),
        order: [['scheduledDate', 'ASC']]
      });
      
      res.json({
        success: true,
        data: {
          upcomingMaintenance,
          period: `${days} days`,
          totalUpcoming: upcomingMaintenance.length
        }
      });
    } catch (error) {
      console.error('Error getting upcoming maintenance:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve upcoming maintenance',
        error: error.message
      });
    }
  }
  
  /**
   * Reschedule maintenance
   */
  async rescheduleMaintenance(req, res) {
    try {
      const { id } = req.params;
      const { newScheduledDate, reason } = req.body;
      
      if (!newScheduledDate) {
        return res.status(400).json({
          success: false,
          message: 'New scheduled date is required'
        });
      }
      
      const maintenanceLog = await MaintenanceLog.findByPk(id);
      if (!maintenanceLog) {
        return res.status(404).json({
          success: false,
          message: 'Maintenance log not found'
        });
      }
      
      if (maintenanceLog.status !== 'scheduled') {
        return res.status(400).json({
          success: false,
          message: 'Can only reschedule maintenance that is in scheduled status'
        });
      }
      
      const oldScheduledDate = maintenanceLog.scheduledDate;
      
      // Update scheduled date
      await maintenanceLog.update({ 
        scheduledDate: new Date(newScheduledDate),
        notes: maintenanceLog.notes ? 
          `${maintenanceLog.notes}\n\nRescheduled on ${new Date().toISOString()}: ${reason || 'No reason provided'}` :
          `Rescheduled on ${new Date().toISOString()}: ${reason || 'No reason provided'}`
      });
      
      // Log audit
      await AuditLog.create({
        userId: req.user.userId,
        targetTable: 'maintenance_logs',
        targetId: maintenanceLog.maintenanceLogId,
        actionType: 'RESCHEDULE',
        oldValue: JSON.stringify({ scheduledDate: oldScheduledDate }),
        newValue: JSON.stringify({ 
          scheduledDate: new Date(newScheduledDate),
          reason: reason || 'No reason provided'
        })
      });
      
      res.json({
        success: true,
        message: 'Maintenance rescheduled successfully',
        data: {
          maintenanceLogId: maintenanceLog.maintenanceLogId,
          oldScheduledDate,
          newScheduledDate: new Date(newScheduledDate),
          reason: reason || 'No reason provided'
        }
      });
    } catch (error) {
      console.error('Error rescheduling maintenance:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reschedule maintenance',
        error: error.message
      });
    }
  }
  
  // ==================== MAINTENANCE LOGS MANAGEMENT ====================
  
  /**
   * Start maintenance
   */
  async startMaintenance(req, res) {
    try {
      const { id } = req.params;
      const { actualStartTime, notes } = req.body;
      
      const maintenanceLog = await MaintenanceLog.findByPk(id);
      if (!maintenanceLog) {
        return res.status(404).json({
          success: false,
          message: 'Maintenance log not found'
        });
      }
      
      if (maintenanceLog.status !== 'scheduled') {
        return res.status(400).json({
          success: false,
          message: 'Can only start maintenance that is in scheduled status'
        });
      }
      
      const startTime = actualStartTime ? new Date(actualStartTime) : new Date();
      
      // Update maintenance status
      await maintenanceLog.update({
        status: 'in_progress',
        actualStartTime: startTime,
        notes: maintenanceLog.notes ? 
          `${maintenanceLog.notes}\n\nStarted on ${startTime.toISOString()}: ${notes || 'Maintenance started'}` :
          `Started on ${startTime.toISOString()}: ${notes || 'Maintenance started'}`
      });
      
      // Log audit
      await AuditLog.create({
        userId: req.user.userId,
        targetTable: 'maintenance_logs',
        targetId: maintenanceLog.maintenanceLogId,
        actionType: 'START_MAINTENANCE',
        oldValue: JSON.stringify({ status: 'scheduled' }),
        newValue: JSON.stringify({ 
          status: 'in_progress',
          actualStartTime: startTime,
          notes: notes || 'Maintenance started'
        })
      });
      
      res.json({
        success: true,
        message: 'Maintenance started successfully',
        data: {
          maintenanceLogId: maintenanceLog.maintenanceLogId,
          status: 'in_progress',
          actualStartTime: startTime
        }
      });
    } catch (error) {
      console.error('Error starting maintenance:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to start maintenance',
        error: error.message
      });
    }
  }
  
  /**
   * Complete maintenance
   */
  async completeMaintenance(req, res) {
    try {
      const { id } = req.params;
      const { 
        actualEndTime, 
        actualDuration, 
        workPerformed, 
        partsUsed, 
        cost, 
        notes,
        itemStatus = 'available'
      } = req.body;
      
      const maintenanceLog = await MaintenanceLog.findByPk(id);
      if (!maintenanceLog) {
        return res.status(404).json({
          success: false,
          message: 'Maintenance log not found'
        });
      }
      
      if (maintenanceLog.status !== 'in_progress') {
        return res.status(400).json({
          success: false,
          message: 'Can only complete maintenance that is in progress'
        });
      }
      
      const endTime = actualEndTime ? new Date(actualEndTime) : new Date();
      
      // Calculate actual duration if not provided
      let calculatedDuration = actualDuration;
      if (!calculatedDuration && maintenanceLog.actualStartTime) {
        calculatedDuration = Math.round((endTime - maintenanceLog.actualStartTime) / (1000 * 60)); // minutes
      }
      
      // Update maintenance status
      await maintenanceLog.update({
        status: 'completed',
        actualEndTime: endTime,
        actualDuration: calculatedDuration,
        workPerformed,
        partsUsed,
        cost: cost ? parseFloat(cost) : null,
        notes: maintenanceLog.notes ? 
          `${maintenanceLog.notes}\n\nCompleted on ${endTime.toISOString()}: ${notes || 'Maintenance completed'}` :
          `Completed on ${endTime.toISOString()}: ${notes || 'Maintenance completed'}`
      });
      
      // Update item status if provided
      if (itemStatus && maintenanceLog.itemId) {
        const item = await Item.findByPk(maintenanceLog.itemId);
        if (item) {
          await item.update({ status: itemStatus });
        }
      }
      
      // Log audit
      await AuditLog.create({
        userId: req.user.userId,
        targetTable: 'maintenance_logs',
        targetId: maintenanceLog.maintenanceLogId,
        actionType: 'COMPLETE_MAINTENANCE',
        oldValue: JSON.stringify({ status: 'in_progress' }),
        newValue: JSON.stringify({ 
          status: 'completed',
          actualEndTime: endTime,
          actualDuration: calculatedDuration,
          workPerformed,
          partsUsed,
          cost: cost ? parseFloat(cost) : null,
          itemStatus
        })
      });
      
      res.json({
        success: true,
        message: 'Maintenance completed successfully',
        data: {
          maintenanceLogId: maintenanceLog.maintenanceLogId,
          status: 'completed',
          actualEndTime: endTime,
          actualDuration: calculatedDuration,
          itemStatus
        }
      });
    } catch (error) {
      console.error('Error completing maintenance:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to complete maintenance',
        error: error.message
      });
    }
  }
  
  /**
   * Cancel maintenance
   */
  async cancelMaintenance(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      
      const maintenanceLog = await MaintenanceLog.findByPk(id);
      if (!maintenanceLog) {
        return res.status(404).json({
          success: false,
          message: 'Maintenance log not found'
        });
      }
      
      if (!['scheduled', 'in_progress'].includes(maintenanceLog.status)) {
        return res.status(400).json({
          success: false,
          message: 'Can only cancel maintenance that is scheduled or in progress'
        });
      }
      
      const oldStatus = maintenanceLog.status;
      
      // Update maintenance status
      await maintenanceLog.update({
        status: 'cancelled',
        notes: maintenanceLog.notes ? 
          `${maintenanceLog.notes}\n\nCancelled on ${new Date().toISOString()}: ${reason || 'No reason provided'}` :
          `Cancelled on ${new Date().toISOString()}: ${reason || 'No reason provided'}`
      });
      
      // Log audit
      await AuditLog.create({
        userId: req.user.userId,
        targetTable: 'maintenance_logs',
        targetId: maintenanceLog.maintenanceLogId,
        actionType: 'CANCEL_MAINTENANCE',
        oldValue: JSON.stringify({ status: oldStatus }),
        newValue: JSON.stringify({ 
          status: 'cancelled',
          reason: reason || 'No reason provided'
        })
      });
      
      res.json({
        success: true,
        message: 'Maintenance cancelled successfully',
        data: {
          maintenanceLogId: maintenanceLog.maintenanceLogId,
          status: 'cancelled',
          reason: reason || 'No reason provided'
        }
      });
    } catch (error) {
      console.error('Error cancelling maintenance:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel maintenance',
        error: error.message
      });
    }
  }
  
  // ==================== EQUIPMENT STATUS TRACKING ====================
  
  /**
   * Get equipment maintenance status
   */
  async getEquipmentMaintenanceStatus(req, res) {
    try {
      const { itemId } = req.params;
      
      const item = await Item.findByPk(itemId);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        });
      }
      
      // Get maintenance statistics
      const [
        totalMaintenance,
        completedMaintenance,
        scheduledMaintenance,
        inProgressMaintenance,
        overdueMaintenance,
        lastMaintenance,
        nextMaintenance
      ] = await Promise.all([
        MaintenanceLog.count({ where: { itemId } }),
        MaintenanceLog.count({ where: { itemId, status: 'completed' } }),
        MaintenanceLog.count({ where: { itemId, status: 'scheduled' } }),
        MaintenanceLog.count({ where: { itemId, status: 'in_progress' } }),
        MaintenanceLog.count({ 
          where: { 
            itemId, 
            status: 'scheduled',
            scheduledDate: { [Op.lt]: new Date() }
          } 
        }),
        MaintenanceLog.findOne({
          where: { itemId, status: 'completed' },
          order: [['actualEndTime', 'DESC']],
          include: [
            { model: User, as: 'assignedUser', attributes: ['userId', 'name'] }
          ]
        }),
        MaintenanceLog.findOne({
          where: { itemId, status: 'scheduled' },
          order: [['scheduledDate', 'ASC']],
          include: [
            { model: User, as: 'assignedUser', attributes: ['userId', 'name'] }
          ]
        })
      ]);
      
      res.json({
        success: true,
        data: {
          item: {
            itemId: item.itemId,
            name: item.name,
            model: item.model,
            serialNumber: item.serialNumber,
            status: item.status
          },
          maintenanceStatus: {
            totalMaintenance,
            completedMaintenance,
            scheduledMaintenance,
            inProgressMaintenance,
            overdueMaintenance,
            lastMaintenance,
            nextMaintenance
          }
        }
      });
    } catch (error) {
      console.error('Error getting equipment maintenance status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve equipment maintenance status',
        error: error.message
      });
    }
  }
  
  /**
   * Get items requiring maintenance
   */
  async getItemsRequiringMaintenance(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        priority, 
        daysOverdue = 0,
        maintenanceType 
      } = req.query;
      const offset = (page - 1) * limit;
      
      const whereClause = {
        status: 'scheduled'
      };
      
      // Priority filter
      if (priority) {
        whereClause.priority = priority;
      }
      
      // Maintenance type filter
      if (maintenanceType) {
        whereClause.maintenanceType = maintenanceType;
      }
      
      // Overdue filter
      if (daysOverdue > 0) {
        const overdueDate = new Date();
        overdueDate.setDate(overdueDate.getDate() - parseInt(daysOverdue));
        whereClause.scheduledDate = { [Op.lt]: overdueDate };
      }
      
      const { count, rows: itemsRequiringMaintenance } = await MaintenanceLog.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Item,
            attributes: ['itemId', 'name', 'model', 'serialNumber', 'status'],
            required: false
          },
          {
            model: User,
            as: 'assignedUser',
            attributes: ['userId', 'name', 'email'],
            required: false
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['scheduledDate', 'ASC']]
      });
      
      res.json({
        success: true,
        data: {
          itemsRequiringMaintenance,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Error getting items requiring maintenance:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve items requiring maintenance',
        error: error.message
      });
    }
  }
  
  // ==================== MAINTENANCE HISTORY ====================
  
  /**
   * Get maintenance history for item
   */
  async getItemMaintenanceHistory(req, res) {
    try {
      const { itemId } = req.params;
      const { 
        page = 1, 
        limit = 10, 
        status, 
        maintenanceType,
        dateFrom,
        dateTo
      } = req.query;
      const offset = (page - 1) * limit;
      
      const item = await Item.findByPk(itemId);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        });
      }
      
      const whereClause = { itemId };
      
      // Status filter
      if (status) {
        whereClause.status = status;
      }
      
      // Maintenance type filter
      if (maintenanceType) {
        whereClause.maintenanceType = maintenanceType;
      }
      
      // Date range filter
      if (dateFrom || dateTo) {
        whereClause.scheduledDate = {};
        if (dateFrom) {
          whereClause.scheduledDate[Op.gte] = new Date(dateFrom);
        }
        if (dateTo) {
          whereClause.scheduledDate[Op.lte] = new Date(dateTo);
        }
      }
      
      const { count, rows: maintenanceHistory } = await MaintenanceLog.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'assignedUser',
            attributes: ['userId', 'name', 'email'],
            required: false
          },
          {
            model: User,
            as: 'createdByUser',
            attributes: ['userId', 'name', 'email'],
            required: false
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['scheduledDate', 'DESC']]
      });
      
      res.json({
        success: true,
        data: {
          item: {
            itemId: item.itemId,
            name: item.name,
            model: item.model,
            serialNumber: item.serialNumber
          },
          maintenanceHistory,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalHistory: count,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Error getting item maintenance history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve item maintenance history',
        error: error.message
      });
    }
  }
  
  /**
   * Get maintenance statistics
   */
  async getMaintenanceStatistics(req, res) {
    try {
      const { period = '30' } = req.query; // days
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(period));
      
      const [
        totalMaintenance,
        completedMaintenance,
        scheduledMaintenance,
        inProgressMaintenance,
        cancelledMaintenance,
        overdueMaintenance,
        maintenanceByType,
        maintenanceByPriority,
        averageDuration,
        totalCost
      ] = await Promise.all([
        MaintenanceLog.count({
          where: { createdAt: { [Op.gte]: startDate } }
        }),
        MaintenanceLog.count({
          where: { 
            status: 'completed',
            createdAt: { [Op.gte]: startDate }
          }
        }),
        MaintenanceLog.count({
          where: { 
            status: 'scheduled',
            createdAt: { [Op.gte]: startDate }
          }
        }),
        MaintenanceLog.count({
          where: { 
            status: 'in_progress',
            createdAt: { [Op.gte]: startDate }
          }
        }),
        MaintenanceLog.count({
          where: { 
            status: 'cancelled',
            createdAt: { [Op.gte]: startDate }
          }
        }),
        MaintenanceLog.count({
          where: { 
            status: 'scheduled',
            scheduledDate: { [Op.lt]: new Date() },
            createdAt: { [Op.gte]: startDate }
          }
        }),
        MaintenanceLog.findAll({
          attributes: [
            'maintenanceType',
            [MaintenanceLog.sequelize.fn('COUNT', MaintenanceLog.sequelize.col('maintenanceLogId')), 'count']
          ],
          where: { createdAt: { [Op.gte]: startDate } },
          group: ['maintenanceType'],
          raw: true
        }),
        MaintenanceLog.findAll({
          attributes: [
            'priority',
            [MaintenanceLog.sequelize.fn('COUNT', MaintenanceLog.sequelize.col('maintenanceLogId')), 'count']
          ],
          where: { createdAt: { [Op.gte]: startDate } },
          group: ['priority'],
          raw: true
        }),
        MaintenanceLog.findOne({
          attributes: [
            [MaintenanceLog.sequelize.fn('AVG', MaintenanceLog.sequelize.col('actualDuration')), 'averageDuration']
          ],
          where: { 
            status: 'completed',
            actualDuration: { [Op.ne]: null },
            createdAt: { [Op.gte]: startDate }
          },
          raw: true
        }),
        MaintenanceLog.sum('cost', {
          where: { 
            status: 'completed',
            cost: { [Op.ne]: null },
            createdAt: { [Op.gte]: startDate }
          }
        })
      ]);
      
      res.json({
        success: true,
        data: {
          period: `${period} days`,
          statistics: {
            totalMaintenance: totalMaintenance || 0,
            completedMaintenance: completedMaintenance || 0,
            scheduledMaintenance: scheduledMaintenance || 0,
            inProgressMaintenance: inProgressMaintenance || 0,
            cancelledMaintenance: cancelledMaintenance || 0,
            overdueMaintenance: overdueMaintenance || 0,
            completionRate: totalMaintenance > 0 ? 
              Math.round((completedMaintenance / totalMaintenance) * 100) : 0,
            averageDuration: averageDuration ? 
              Math.round(parseFloat(averageDuration.averageDuration)) : 0,
            totalCost: totalCost || 0,
            maintenanceByType,
            maintenanceByPriority
          }
        }
      });
    } catch (error) {
      console.error('Error getting maintenance statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve maintenance statistics',
        error: error.message
      });
    }
  }
}

module.exports = new MaintenanceController();
