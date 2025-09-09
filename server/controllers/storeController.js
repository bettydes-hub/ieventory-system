const { Store, Item, Category, User, Transaction, AuditLog } = require('../models');
const { Op } = require('sequelize');

class StoreController {
  // ==================== CRUD OPERATIONS ====================
  
  /**
   * Get all stores with pagination and filtering
   */
  async getAllStores(req, res) {
    try {
      const { page = 1, limit = 10, search, location, status } = req.query;
      const offset = (page - 1) * limit;
      
      const whereClause = {};
      
      // Search filter
      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { location: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ];
      }
      
      // Location filter
      if (location) {
        whereClause.location = { [Op.iLike]: `%${location}%` };
      }
      
      // Status filter
      if (status) {
        whereClause.isActive = status === 'active';
      }
      
      const { count, rows: stores } = await Store.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'Users',
            attributes: ['user_id', 'name', 'email', 'role'],
            where: { role: 'Store Keeper' },
            required: false
          },
          {
            model: Item,
            attributes: ['item_id', 'name', 'amount', 'status'],
            required: false
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });
      
      // Add inventory summary for each store
      const storesWithSummary = await Promise.all(
        stores.map(async (store) => {
          const itemCount = await Item.count({ where: { storeId: store.storeId } });
          const totalQuantity = await Item.sum('quantity', { where: { storeId: store.storeId } });
          const lowStockItems = await Item.count({
            where: {
              storeId: store.storeId,
              quantity: { [Op.lte]: { [Op.col]: 'minStockLevel' } }
            }
          });
          const outOfStockItems = await Item.count({
            where: {
              storeId: store.storeId,
              quantity: 0
            }
          });
          
          return {
            ...store.toJSON(),
            inventorySummary: {
              totalItems: itemCount || 0,
              totalQuantity: totalQuantity || 0,
              lowStockItems: lowStockItems || 0,
              outOfStockItems: outOfStockItems || 0
            }
          };
        })
      );
      
      res.json({
        success: true,
        data: {
          stores: storesWithSummary,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalStores: count,
            storesPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Error getting stores:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve stores',
        error: error.message
      });
    }
  }
  
  /**
   * Get single store by ID
   */
  async getStoreById(req, res) {
    try {
      const { id } = req.params;
      
      const store = await Store.findByPk(id, {
        include: [
          {
            model: User,
            as: 'Users',
            attributes: ['user_id', 'name', 'email', 'role'],
            where: { role: 'Store Keeper' },
            required: false
          },
          {
            model: Item,
            include: [
              { model: Category, attributes: ['categoryId', 'name'] }
            ],
            required: false
          }
        ]
      });
      
      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Store not found'
        });
      }
      
      // Get detailed inventory summary
      const inventorySummary = await this.getStoreInventorySummary(id);
      
      res.json({
        success: true,
        data: {
          ...store.toJSON(),
          inventorySummary
        }
      });
    } catch (error) {
      console.error('Error getting store:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve store',
        error: error.message
      });
    }
  }
  
  /**
   * Create new store
   */
  async createStore(req, res) {
    try {
      const {
        name,
        location,
        description,
        address,
        phone,
        email,
        managerId,
        isActive = true,
        settings = {}
      } = req.body;
      
      // Validate required fields
      if (!name || !location) {
        return res.status(400).json({
          success: false,
          message: 'Name and location are required'
        });
      }
      
      // Check if store name already exists
      const existingStore = await Store.findOne({
        where: { name: { [Op.iLike]: name } }
      });
      
      if (existingStore) {
        return res.status(400).json({
          success: false,
          message: 'Store with this name already exists'
        });
      }
      
      // Validate manager if provided
      if (managerId) {
        const manager = await User.findByPk(managerId);
        if (!manager || manager.role !== 'Store Keeper') {
          return res.status(400).json({
            success: false,
            message: 'Manager must be a valid Store Keeper'
          });
        }
      }
      
      // Create store
      const store = await Store.create({
        name,
        location,
        description,
        address,
        phone,
        email,
        managerId,
        isActive,
        settings
      });
      
      // Log audit
      await AuditLog.create({
        user_id: req.user.userId,
        targetTable: 'stores',
        targetId: store.storeId,
        actionType: 'CREATE',
        newValue: JSON.stringify(store.toJSON())
      });
      
      res.status(201).json({
        success: true,
        message: 'Store created successfully',
        data: store
      });
    } catch (error) {
      console.error('Error creating store:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create store',
        error: error.message
      });
    }
  }
  
  /**
   * Update store
   */
  async updateStore(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const store = await Store.findByPk(id);
      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Store not found'
        });
      }
      
      // Validate manager if being updated
      if (updateData.managerId) {
        const manager = await User.findByPk(updateData.managerId);
        if (!manager || manager.role !== 'Store Keeper') {
          return res.status(400).json({
            success: false,
            message: 'Manager must be a valid Store Keeper'
          });
        }
      }
      
      // Check for duplicate name if name is being updated
      if (updateData.name && updateData.name !== store.name) {
        const existingStore = await Store.findOne({
          where: { 
            name: { [Op.iLike]: updateData.name },
            storeId: { [Op.ne]: id }
          }
        });
        
        if (existingStore) {
          return res.status(400).json({
            success: false,
            message: 'Store with this name already exists'
          });
        }
      }
      
      const oldData = store.toJSON();
      
      // Update store
      await store.update(updateData);
      
      // Log audit
      await AuditLog.create({
        user_id: req.user.userId,
        targetTable: 'stores',
        targetId: store.storeId,
        actionType: 'UPDATE',
        oldValue: JSON.stringify(oldData),
        newValue: JSON.stringify(store.toJSON())
      });
      
      res.json({
        success: true,
        message: 'Store updated successfully',
        data: store
      });
    } catch (error) {
      console.error('Error updating store:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update store',
        error: error.message
      });
    }
  }
  
  /**
   * Delete store
   */
  async deleteStore(req, res) {
    try {
      const { id } = req.params;
      
      const store = await Store.findByPk(id);
      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Store not found'
        });
      }
      
      // Check if store has items
      const itemCount = await Item.count({ where: { storeId: id } });
      if (itemCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete store with existing items. Please transfer or remove all items first.'
        });
      }
      
      // Check if store has active transactions
      const activeTransactions = await Transaction.count({
        where: {
          [Op.or]: [
            { fromStoreId: id },
            { toStoreId: id }
          ],
          status: { [Op.in]: ['pending', 'approved', 'in_transit'] }
        }
      });
      
      if (activeTransactions > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete store with active transactions'
        });
      }
      
      const oldData = store.toJSON();
      
      // Delete store
      await store.destroy();
      
      // Log audit
      await AuditLog.create({
        user_id: req.user.userId,
        targetTable: 'stores',
        targetId: id,
        actionType: 'DELETE',
        oldValue: JSON.stringify(oldData)
      });
      
      res.json({
        success: true,
        message: 'Store deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting store:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete store',
        error: error.message
      });
    }
  }
  
  // ==================== STORE-TO-STORE TRANSFERS ====================
  
  /**
   * Transfer items between stores
   */
  async transferItemsBetweenStores(req, res) {
    try {
      const { 
        item_id: itemId, 
        fromStoreId, 
        toStoreId, 
        quantity, 
        reason, 
        notes,
        assignedTo 
      } = req.body;
      
      // Validate required fields
      if (!itemId || !fromStoreId || !toStoreId || !quantity) {
        return res.status(400).json({
          success: false,
          message: 'Item ID, from store, to store, and quantity are required'
        });
      }
      
      if (fromStoreId === toStoreId) {
        return res.status(400).json({
          success: false,
          message: 'Cannot transfer to the same store'
        });
      }
      
      // Validate stores exist
      const [fromStore, toStore] = await Promise.all([
        Store.findByPk(fromStoreId),
        Store.findByPk(toStoreId)
      ]);
      
      if (!fromStore || !toStore) {
        return res.status(400).json({
          success: false,
          message: 'One or both stores not found'
        });
      }
      
      // Validate item exists and is in source store
      const item = await Item.findByPk(itemId);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        });
      }
      
      if (item.storeId !== fromStoreId) {
        return res.status(400).json({
          success: false,
          message: 'Item is not in the specified source store'
        });
      }
      
      if (item.quantity < quantity) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock for transfer'
        });
      }
      
      // Validate assigned user if provided
      if (assignedTo) {
        const assignedUser = await User.findByPk(assignedTo);
        if (!assignedUser || !['Store Keeper', 'Delivery Staff'].includes(assignedUser.role)) {
          return res.status(400).json({
            success: false,
            message: 'Assigned user must be a Store Keeper or Delivery Staff'
          });
        }
      }
      
      // Update item stock and location
      const oldQuantity = item.quantity;
      const newQuantity = oldQuantity - quantity;
      
      await item.update({ 
        quantity: newQuantity,
        storeId: toStoreId
      });
      
      // Create transfer transaction
      const transaction = await Transaction.create({
        item_id: itemId,
        fromStoreId,
        toStoreId,
        user_id: req.user.userId,
        amount: quantity,
        transactionType: 'transfer',
        status: 'completed',
        notes: `Store-to-store transfer: ${reason}. ${notes || ''}`,
        assignedTo
      });
      
      // Log audit
      await AuditLog.create({
        user_id: req.user.userId,
        targetTable: 'items',
        targetId: item.item_id,
        actionType: 'STORE_TRANSFER',
        oldValue: JSON.stringify({ 
          storeId: fromStoreId, 
          quantity: oldQuantity 
        }),
        newValue: JSON.stringify({ 
          storeId: toStoreId, 
          quantity: newQuantity,
          transferQuantity: quantity,
          reason,
          notes,
          assignedTo
        })
      });
      
      res.json({
        success: true,
        message: 'Items transferred successfully between stores',
        data: {
          transaction,
          item: {
            item_id: item.item_id,
            name: item.name,
            oldQuantity,
            newQuantity,
            fromStore: fromStore.name,
            toStore: toStore.name
          }
        }
      });
    } catch (error) {
      console.error('Error transferring items between stores:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to transfer items between stores',
        error: error.message
      });
    }
  }
  
  /**
   * Get transfer history between stores
   */
  async getStoreTransferHistory(req, res) {
    try {
      const { storeId } = req.params;
      const { page = 1, limit = 10, type = 'all' } = req.query;
      const offset = (page - 1) * limit;
      
      const store = await Store.findByPk(storeId);
      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Store not found'
        });
      }
      
      let whereClause = {
        transactionType: 'transfer'
      };
      
      // Filter by transfer type
      if (type === 'outgoing') {
        whereClause.fromStoreId = storeId;
      } else if (type === 'incoming') {
        whereClause.toStoreId = storeId;
      } else {
        whereClause[Op.or] = [
          { fromStoreId: storeId },
          { toStoreId: storeId }
        ];
      }
      
      const { count, rows: transfers } = await Transaction.findAndCountAll({
        where: whereClause,
        include: [
          { model: Item, attributes: ['item_id', 'name', 'model'] },
          { model: Store, as: 'fromStore', attributes: ['store_id', 'store_name'] },
          { model: Store, as: 'toStore', attributes: ['store_id', 'store_name'] },
          { model: User, attributes: ['user_id', 'name', 'role'] },
          { model: User, as: 'assignedUser', attributes: ['user_id', 'name', 'role'] }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });
      
      res.json({
        success: true,
        data: {
          store: {
            storeId: store.storeId,
            name: store.name,
            location: store.location
          },
          transfers,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalTransfers: count,
            transfersPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Error getting store transfer history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve transfer history',
        error: error.message
      });
    }
  }
  
  // ==================== STORE-SPECIFIC INVENTORY VIEWS ====================
  
  /**
   * Get store-specific inventory summary
   */
  async getStoreInventorySummary(storeId) {
    try {
      const [
        totalItems,
        totalQuantity,
        lowStockItems,
        outOfStockItems,
        itemsByCategory,
        itemsByStatus,
        recentTransactions
      ] = await Promise.all([
        Item.count({ where: { storeId } }),
        Item.sum('quantity', { where: { storeId } }),
        Item.count({
          where: {
            storeId,
            quantity: { [Op.lte]: { [Op.col]: 'minStockLevel' } }
          }
        }),
        Item.count({
          where: {
            storeId,
            quantity: 0
          }
        }),
        Item.findAll({
          attributes: [
            'categoryId',
            [Item.sequelize.fn('COUNT', Item.sequelize.col('item_id')), 'count'],
            [Item.sequelize.fn('SUM', Item.sequelize.col('quantity')), 'totalQuantity']
          ],
          where: { storeId },
          include: [{ model: Category, attributes: ['name'] }],
          group: ['categoryId', 'Category.categoryId'],
          raw: true
        }),
        Item.findAll({
          attributes: [
            'status',
            [Item.sequelize.fn('COUNT', Item.sequelize.col('itemId')), 'count']
          ],
          where: { storeId },
          group: ['status'],
          raw: true
        }),
        Transaction.findAll({
          where: {
            [Op.or]: [
              { fromStoreId: storeId },
              { toStoreId: storeId }
            ]
          },
          include: [
            { model: Item, attributes: ['item_id', 'name'] },
            { model: User, attributes: ['user_id', 'name'] }
          ],
          limit: 5,
          order: [['created_at', 'DESC']]
        })
      ]);
      
      return {
        summary: {
          totalItems: totalItems || 0,
          totalQuantity: totalQuantity || 0,
          lowStockItems: lowStockItems || 0,
          outOfStockItems: outOfStockItems || 0
        },
        itemsByCategory,
        itemsByStatus,
        recentTransactions
      };
    } catch (error) {
      console.error('Error getting store inventory summary:', error);
      return null;
    }
  }
  
  /**
   * Get store inventory with detailed filtering
   */
  async getStoreInventory(req, res) {
    try {
      const { storeId } = req.params;
      const { 
        page = 1, 
        limit = 10, 
        search, 
        category, 
        status, 
        lowStock = false,
        sortBy = 'name',
        sortOrder = 'ASC'
      } = req.query;
      const offset = (page - 1) * limit;
      
      const store = await Store.findByPk(storeId);
      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Store not found'
        });
      }
      
      const whereClause = { storeId };
      
      // Search filter
      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { model: { [Op.iLike]: `%${search}%` } },
          { serialNumber: { [Op.iLike]: `%${search}%` } },
          { manufacturer: { [Op.iLike]: `%${search}%` } }
        ];
      }
      
      // Category filter
      if (category) {
        whereClause.categoryId = category;
      }
      
      // Status filter
      if (status) {
        whereClause.status = status;
      }
      
      // Low stock filter
      if (lowStock === 'true') {
        whereClause.quantity = { [Op.lte]: { [Op.col]: 'minStockLevel' } };
      }
      
      const { count, rows: items } = await Item.findAndCountAll({
        where: whereClause,
        include: [
          { model: Category, attributes: ['categoryId', 'name'] }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[sortBy, sortOrder.toUpperCase()]]
      });
      
      res.json({
        success: true,
        data: {
          store: {
            storeId: store.storeId,
            name: store.name,
            location: store.location
          },
          items,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Error getting store inventory:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve store inventory',
        error: error.message
      });
    }
  }
  
  /**
   * Get store performance metrics
   */
  async getStorePerformance(req, res) {
    try {
      const { storeId } = req.params;
      const { period = '30' } = req.query; // days
      
      const store = await Store.findByPk(storeId);
      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Store not found'
        });
      }
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(period));
      
      const [
        totalTransactions,
        outgoingTransfers,
        incomingTransfers,
        lowStockAlerts,
        itemsAdded,
        itemsRemoved
      ] = await Promise.all([
        Transaction.count({
          where: {
            [Op.or]: [
              { fromStoreId: storeId },
              { toStoreId: storeId }
            ],
            createdAt: { [Op.gte]: startDate }
          }
        }),
        Transaction.count({
          where: {
            fromStoreId: storeId,
            transactionType: 'transfer',
            createdAt: { [Op.gte]: startDate }
          }
        }),
        Transaction.count({
          where: {
            toStoreId: storeId,
            transactionType: 'transfer',
            createdAt: { [Op.gte]: startDate }
          }
        }),
        Item.count({
          where: {
            storeId,
            quantity: { [Op.lte]: { [Op.col]: 'minStockLevel' } }
          }
        }),
        Transaction.count({
          where: {
            toStoreId: storeId,
            transactionType: { [Op.in]: ['borrow', 'return'] },
            createdAt: { [Op.gte]: startDate }
          }
        }),
        Transaction.count({
          where: {
            fromStoreId: storeId,
            transactionType: { [Op.in]: ['borrow', 'return'] },
            createdAt: { [Op.gte]: startDate }
          }
        })
      ]);
      
      res.json({
        success: true,
        data: {
          store: {
            storeId: store.storeId,
            name: store.name,
            location: store.location
          },
          period: `${period} days`,
          metrics: {
            totalTransactions,
            outgoingTransfers,
            incomingTransfers,
            lowStockAlerts,
            itemsAdded,
            itemsRemoved,
            netFlow: itemsAdded - itemsRemoved
          }
        }
      });
    } catch (error) {
      console.error('Error getting store performance:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve store performance',
        error: error.message
      });
    }
  }
  
  // ==================== STORE MANAGEMENT & CONFIGURATION ====================
  
  /**
   * Update store settings
   */
  async updateStoreSettings(req, res) {
    try {
      const { id } = req.params;
      const { settings } = req.body;
      
      const store = await Store.findByPk(id);
      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Store not found'
        });
      }
      
      const oldSettings = store.settings;
      const newSettings = { ...oldSettings, ...settings };
      
      await store.update({ settings: newSettings });
      
      // Log audit
      await AuditLog.create({
        user_id: req.user.userId,
        targetTable: 'stores',
        targetId: store.storeId,
        actionType: 'SETTINGS_UPDATE',
        oldValue: JSON.stringify({ settings: oldSettings }),
        newValue: JSON.stringify({ settings: newSettings })
      });
      
      res.json({
        success: true,
        message: 'Store settings updated successfully',
        data: {
          storeId: store.storeId,
          settings: newSettings
        }
      });
    } catch (error) {
      console.error('Error updating store settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update store settings',
        error: error.message
      });
    }
  }
  
  /**
   * Assign store manager
   */
  async assignStoreManager(req, res) {
    try {
      const { id } = req.params;
      const { managerId } = req.body;
      
      const store = await Store.findByPk(id);
      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Store not found'
        });
      }
      
      // Validate manager
      const manager = await User.findByPk(managerId);
      if (!manager || manager.role !== 'Store Keeper') {
        return res.status(400).json({
          success: false,
          message: 'Manager must be a valid Store Keeper'
        });
      }
      
      // Check if manager is already assigned to another store
      const existingAssignment = await Store.findOne({
        where: {
          managerId,
          storeId: { [Op.ne]: id }
        }
      });
      
      if (existingAssignment) {
        return res.status(400).json({
          success: false,
          message: 'This manager is already assigned to another store'
        });
      }
      
      const oldManagerId = store.managerId;
      
      await store.update({ managerId });
      
      // Update manager's store assignment
      await manager.update({ storeId: id });
      
      // Log audit
      await AuditLog.create({
        user_id: req.user.userId,
        targetTable: 'stores',
        targetId: store.storeId,
        actionType: 'MANAGER_ASSIGNMENT',
        oldValue: JSON.stringify({ managerId: oldManagerId }),
        newValue: JSON.stringify({ managerId })
      });
      
      res.json({
        success: true,
        message: 'Store manager assigned successfully',
        data: {
          store: {
            storeId: store.storeId,
            name: store.name,
            managerId
          },
          manager: {
            user_id: manager.user_id,
            name: manager.name,
            email: manager.email
          }
        }
      });
    } catch (error) {
      console.error('Error assigning store manager:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to assign store manager',
        error: error.message
      });
    }
  }
  
  /**
   * Get store configuration
   */
  async getStoreConfiguration(req, res) {
    try {
      const { id } = req.params;
      
      const store = await Store.findByPk(id, {
        include: [
          {
            model: User,
            as: 'manager',
            attributes: ['user_id', 'name', 'email', 'role']
          }
        ]
      });
      
      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Store not found'
        });
      }
      
      res.json({
        success: true,
        data: {
          store: {
            storeId: store.storeId,
            name: store.name,
            location: store.location,
            description: store.description,
            address: store.address,
            phone: store.phone,
            email: store.email,
            isActive: store.isActive,
            settings: store.settings,
            manager: store.manager
          }
        }
      });
    } catch (error) {
      console.error('Error getting store configuration:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve store configuration',
        error: error.message
      });
    }
  }
  
  /**
   * Toggle store status (active/inactive)
   */
  async toggleStoreStatus(req, res) {
    try {
      const { id } = req.params;
      
      const store = await Store.findByPk(id);
      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Store not found'
        });
      }
      
      const newStatus = !store.isActive;
      
      await store.update({ isActive: newStatus });
      
      // Log audit
      await AuditLog.create({
        user_id: req.user.userId,
        targetTable: 'stores',
        targetId: store.storeId,
        actionType: 'STATUS_TOGGLE',
        oldValue: JSON.stringify({ isActive: store.isActive }),
        newValue: JSON.stringify({ isActive: newStatus })
      });
      
      res.json({
        success: true,
        message: `Store ${newStatus ? 'activated' : 'deactivated'} successfully`,
        data: {
          storeId: store.storeId,
          name: store.name,
          isActive: newStatus
        }
      });
    } catch (error) {
      console.error('Error toggling store status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle store status',
        error: error.message
      });
    }
  }
}

module.exports = new StoreController();
