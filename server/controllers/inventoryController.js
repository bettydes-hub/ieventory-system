const { Item, Store, Category, Transaction, User, AuditLog } = require('../models');
const { Op } = require('sequelize');
const QRCode = require('qrcode');
const fs = require('fs').promises;
const path = require('path');
const { mapItemToFrontend } = require('../utils/fieldMapper');

class InventoryController {
  // ==================== CRUD OPERATIONS ====================
  
  /**
   * Get all items with pagination and filtering
   */
  async getAllItems(req, res) {
    try {
      const { page = 1, limit = 10, search, category, store, status } = req.query;
      const offset = (page - 1) * limit;
      
      const whereClause = {};
      
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
      
      // Store filter
      if (store) {
        whereClause.storeId = store;
      }
      
      // Status filter
      if (status) {
        whereClause.status = status;
      }
      
      const { count, rows: items } = await Item.findAndCountAll({
        where: whereClause,
        include: [
          { model: Store, attributes: ['storeId', 'name', 'location'] },
          { model: Category, attributes: ['categoryId', 'name'] }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });
      
      // Map items to frontend format
      const mappedItems = items.map(item => mapItemToFrontend(item));
      
      res.json({
        success: true,
        data: {
          items: mappedItems,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Error getting items:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve items',
        error: error.message
      });
    }
  }
  
  /**
   * Get single item by ID
   */
  async getItemById(req, res) {
    try {
      const { id } = req.params;
      
      const item = await Item.findByPk(id, {
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
      
      res.json({
        success: true,
        data: mapItemToFrontend(item)
      });
    } catch (error) {
      console.error('Error getting item:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve item',
        error: error.message
      });
    }
  }
  
  /**
   * Create new item
   */
  async createItem(req, res) {
    try {
      const {
        name,
        description,
        model,
        serialNumber,
        manufacturer,
        purchaseDate,
        purchasePrice,
        categoryId,
        storeId,
        quantity,
        minStockLevel,
        maxStockLevel,
        status = 'available',
        notes
      } = req.body;
      
      // Validate required fields
      if (!name || !categoryId || !storeId) {
        return res.status(400).json({
          success: false,
          message: 'Name, category, and store are required'
        });
      }
      
      // Check if store exists
      const store = await Store.findByPk(storeId);
      if (!store) {
        return res.status(400).json({
          success: false,
          message: 'Store not found'
        });
      }
      
      // Check if category exists
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Category not found'
        });
      }
      
      // Determine image path from uploaded file (if any)
      let imagePath = null;
      if (req.file) {
        // Expose as URL path under /uploads
        const relative = req.file.path.replace(/.*server[\\/]/, '');
        imagePath = '/' + relative.replace(/\\/g, '/');
      }

      // Create item with proper field mapping (camelCase -> snake_case)
      const item = await Item.create({
        name,
        description,
        model,
        serial_number: serialNumber,
        manufacturer,
        purchase_date: purchaseDate,
        purchase_price: purchasePrice,
        category_id: categoryId,
        store_id: storeId,
        amount: quantity || 0,
        low_stock_threshold: minStockLevel || 0,
        max_stock_level: maxStockLevel || 100,
        status,
        image_path: imagePath,
        notes
      });
      
      // Generate QR code
      // Only attempt QR if item has a compatible primary key
      try {
        const id = item.item_id || item.itemId || item.id;
        if (id) {
          const qrCodeData = await this.generateQRCode(id);
          // Store QR code with proper field mapping
          await item.update({ qr_code: qrCodeData }, { silent: true }).catch(() => {});
        }
      } catch (_) { /* no-op */ }
      
      // Log audit
      await AuditLog.create({
        userId: req.user.userId,
        targetTable: 'items',
        targetId: item.itemId || item.item_id,
        actionType: 'CREATE',
        newValue: JSON.stringify(item.toJSON())
      });
      
      res.status(201).json({
        success: true,
        message: 'Item created successfully',
        data: mapItemToFrontend(item)
      });
    } catch (error) {
      console.error('Error creating item:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create item',
        error: error.message
      });
    }
  }
  
  /**
   * Update item
   */
  async updateItem(req, res) {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      const item = await Item.findByPk(id);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        });
      }

      const oldData = item.toJSON();

      // If a new image is uploaded, update image_path
      if (req.file) {
        const relative = req.file.path.replace(/.*server[\\/]/, '');
        updateData.image_path = '/' + relative.replace(/\\/g, '/');
      }

      // Map camelCase -> snake_case for known fields
      if (updateData.storeId && !updateData.store_id) updateData.store_id = updateData.storeId;
      if (updateData.categoryId && !updateData.category_id) updateData.category_id = updateData.categoryId;
      if (updateData.quantity && !updateData.amount) updateData.amount = updateData.quantity;
      if (updateData.minStockLevel && !updateData.low_stock_threshold) updateData.low_stock_threshold = updateData.minStockLevel;
      if (updateData.maxStockLevel && !updateData.max_stock_level) updateData.max_stock_level = updateData.maxStockLevel;
      if (updateData.serialNumber && !updateData.serial_number) updateData.serial_number = updateData.serialNumber;
      if (updateData.purchaseDate && !updateData.purchase_date) updateData.purchase_date = updateData.purchaseDate;
      if (updateData.purchasePrice && !updateData.purchase_price) updateData.purchase_price = updateData.purchasePrice;
      if (updateData.warrantyExpiry && !updateData.warranty_expiry) updateData.warranty_expiry = updateData.warrantyExpiry;
      
      // Clean up camelCase fields to avoid conflicts
      delete updateData.storeId;
      delete updateData.categoryId;
      delete updateData.quantity;
      delete updateData.minStockLevel;
      delete updateData.maxStockLevel;
      delete updateData.serialNumber;
      delete updateData.purchaseDate;
      delete updateData.purchasePrice;
      delete updateData.warrantyExpiry;

      // Update item
      await item.update(updateData);
      
      // Log audit
      await AuditLog.create({
        userId: req.user.userId,
        targetTable: 'items',
        targetId: item.itemId || item.item_id,
        actionType: 'UPDATE',
        oldValue: JSON.stringify(oldData),
        newValue: JSON.stringify(item.toJSON())
      });
      
      res.json({
        success: true,
        message: 'Item updated successfully',
        data: mapItemToFrontend(item)
      });
    } catch (error) {
      console.error('Error updating item:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update item',
        error: error.message
      });
    }
  }
  
  /**
   * Delete item
   */
  async deleteItem(req, res) {
    try {
      const { id } = req.params;
      
      const item = await Item.findByPk(id);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        });
      }
      
      const oldData = item.toJSON();
      
      // Check if item has active transactions
      const activeTransactions = await Transaction.count({
        where: {
          itemId: id,
          status: { [Op.in]: ['pending', 'approved', 'in_transit'] }
        }
      });
      
      if (activeTransactions > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete item with active transactions'
        });
      }
      
      // Delete item
      await item.destroy();
      
      // Log audit
      await AuditLog.create({
        userId: req.user.userId,
        targetTable: 'items',
        targetId: id,
        actionType: 'DELETE',
        oldValue: JSON.stringify(oldData)
      });
      
      res.json({
        success: true,
        message: 'Item deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete item',
        error: error.message
      });
    }
  }
  
  // ==================== STOCK MANAGEMENT ====================
  
  /**
   * Update stock levels
   */
  async updateStock(req, res) {
    try {
      const { id } = req.params;
      const { quantity, operation, reason, notes } = req.body;
      
      if (!['add', 'subtract', 'set'].includes(operation)) {
        return res.status(400).json({
          success: false,
          message: 'Operation must be add, subtract, or set'
        });
      }
      
      const item = await Item.findByPk(id);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        });
      }
      
      const oldQuantity = item.quantity;
      let newQuantity;
      
      switch (operation) {
        case 'add':
          newQuantity = oldQuantity + quantity;
          break;
        case 'subtract':
          newQuantity = Math.max(0, oldQuantity - quantity);
          break;
        case 'set':
          newQuantity = quantity;
          break;
      }
      
      await item.update({ quantity: newQuantity });
      
      // Log audit
      await AuditLog.create({
        userId: req.user.userId,
        targetTable: 'items',
        targetId: item.itemId,
        actionType: 'STOCK_UPDATE',
        oldValue: JSON.stringify({ quantity: oldQuantity }),
        newValue: JSON.stringify({ 
          quantity: newQuantity, 
          operation, 
          reason, 
          notes 
        })
      });
      
      res.json({
        success: true,
        message: 'Stock updated successfully',
        data: {
          itemId: item.itemId,
          oldQuantity,
          newQuantity,
          operation,
          reason,
          notes
        }
      });
    } catch (error) {
      console.error('Error updating stock:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update stock',
        error: error.message
      });
    }
  }
  
  /**
   * Get low stock alerts
   */
  async getLowStockAlerts(req, res) {
    try {
      const { storeId } = req.query;
      
      const whereClause = {
        quantity: { [Op.lte]: { [Op.col]: 'minStockLevel' } }
      };
      
      if (storeId) {
        whereClause.storeId = storeId;
      }
      
      const lowStockItems = await Item.findAll({
        where: whereClause,
        include: [
          { model: Store, attributes: ['storeId', 'name', 'location'] },
          { model: Category, attributes: ['categoryId', 'name'] }
        ],
        order: [['quantity', 'ASC']]
      });
      
      res.json({
        success: true,
        data: lowStockItems,
        count: lowStockItems.length
      });
    } catch (error) {
      console.error('Error getting low stock alerts:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve low stock alerts',
        error: error.message
      });
    }
  }
  
  /**
   * Get stock levels by store
   */
  async getStockByStore(req, res) {
    try {
      const { storeId } = req.params;
      
      const store = await Store.findByPk(storeId);
      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Store not found'
        });
      }
      
      const items = await Item.findAll({
        where: { storeId },
        include: [
          { model: Category, attributes: ['categoryId', 'name'] }
        ],
        order: [['name', 'ASC']]
      });
      
      const stockSummary = {
        totalItems: items.length,
        totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
        lowStockItems: items.filter(item => item.quantity <= item.minStockLevel).length,
        outOfStockItems: items.filter(item => item.quantity === 0).length,
        items: items
      };
      
      res.json({
        success: true,
        data: stockSummary
      });
    } catch (error) {
      console.error('Error getting stock by store:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve stock information',
        error: error.message
      });
    }
  }
  
  // ==================== ITEM TRANSFERS ====================
  
  /**
   * Transfer items between stores
   */
  async transferItems(req, res) {
    try {
      const { itemId, fromStoreId, toStoreId, quantity, reason, notes } = req.body;
      
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
      
      // Check if destination store exists
      const toStore = await Store.findByPk(toStoreId);
      if (!toStore) {
        return res.status(400).json({
          success: false,
          message: 'Destination store not found'
        });
      }
      
      // Update item stock
      await item.update({ 
        quantity: item.quantity - quantity,
        storeId: toStoreId
      });
      
      // Create transfer transaction
      const transaction = await Transaction.create({
        itemId,
        fromStoreId,
        toStoreId,
        userId: req.user.userId,
        amount: quantity,
        transactionType: 'transfer',
        status: 'completed',
        notes: `Transfer: ${reason}. ${notes || ''}`
      });
      
      // Log audit
      await AuditLog.create({
        userId: req.user.userId,
        targetTable: 'items',
        targetId: item.itemId,
        actionType: 'TRANSFER',
        oldValue: JSON.stringify({ 
          storeId: fromStoreId, 
          quantity: item.quantity + quantity 
        }),
        newValue: JSON.stringify({ 
          storeId: toStoreId, 
          quantity: item.quantity,
          transferQuantity: quantity,
          reason,
          notes
        })
      });
      
      res.json({
        success: true,
        message: 'Items transferred successfully',
        data: {
          transaction,
          item: {
            itemId: item.itemId,
            name: item.name,
            newQuantity: item.quantity,
            newStoreId: toStoreId
          }
        }
      });
    } catch (error) {
      console.error('Error transferring items:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to transfer items',
        error: error.message
      });
    }
  }
  
  // ==================== QR CODE SUPPORT ====================
  
  /**
   * Generate QR code for item
   */
  async generateQRCode(itemId) {
    try {
      const qrData = {
        itemId,
        timestamp: new Date().toISOString(),
        type: 'inventory_item'
      };
      
      const qrCodeString = await QRCode.toDataURL(JSON.stringify(qrData));
      return qrCodeString;
    } catch (error) {
      console.error('Error generating QR code:', error);
      return null;
    }
  }
  
  /**
   * Get QR code for item
   */
  async getItemQRCode(req, res) {
    try {
      const { id } = req.params;
      
      const item = await Item.findByPk(id);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        });
      }
      
      let qrCode = item.qrCode;
      
      // Generate new QR code if none exists
      if (!qrCode) {
        qrCode = await this.generateQRCode(item.itemId);
        await item.update({ qrCode });
      }
      
      res.json({
        success: true,
        data: {
          itemId: item.itemId,
          name: item.name,
          qrCode
        }
      });
    } catch (error) {
      console.error('Error getting QR code:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate QR code',
        error: error.message
      });
    }
  }
  
  /**
   * Scan QR code and get item info
   */
  async scanQRCode(req, res) {
    try {
      const { qrData } = req.body;
      
      if (!qrData) {
        return res.status(400).json({
          success: false,
          message: 'QR code data is required'
        });
      }
      
      let parsedData;
      try {
        parsedData = JSON.parse(qrData);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid QR code format'
        });
      }
      
      if (parsedData.type !== 'inventory_item' || !parsedData.itemId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid QR code type'
        });
      }
      
      const item = await Item.findByPk(parsedData.itemId, {
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
      
      res.json({
        success: true,
        data: item
      });
    } catch (error) {
      console.error('Error scanning QR code:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to scan QR code',
        error: error.message
      });
    }
  }
  
  // ==================== REPORTS & ANALYTICS ====================
  
  /**
   * Get inventory summary
   */
  async getInventorySummary(req, res) {
    try {
      const { storeId } = req.query;
      
      const whereClause = storeId ? { storeId } : {};
      
      const [
        totalItems,
        totalQuantity,
        lowStockItems,
        outOfStockItems,
        itemsByCategory,
        itemsByStatus
      ] = await Promise.all([
        Item.count({ where: whereClause }),
        Item.sum('quantity', { where: whereClause }),
        Item.count({ 
          where: { 
            ...whereClause,
            quantity: { [Op.lte]: { [Op.col]: 'minStockLevel' } }
          }
        }),
        Item.count({ 
          where: { 
            ...whereClause,
            quantity: 0
          }
        }),
        Item.findAll({
          attributes: [
            'categoryId',
            [Item.sequelize.fn('COUNT', Item.sequelize.col('itemId')), 'count'],
            [Item.sequelize.fn('SUM', Item.sequelize.col('quantity')), 'totalQuantity']
          ],
          where: whereClause,
          include: [{ model: Category, attributes: ['name'] }],
          group: ['categoryId', 'Category.categoryId'],
          raw: true
        }),
        Item.findAll({
          attributes: [
            'status',
            [Item.sequelize.fn('COUNT', Item.sequelize.col('itemId')), 'count']
          ],
          where: whereClause,
          group: ['status'],
          raw: true
        })
      ]);
      
      res.json({
        success: true,
        data: {
          summary: {
            totalItems: totalItems || 0,
            totalQuantity: totalQuantity || 0,
            lowStockItems: lowStockItems || 0,
            outOfStockItems: outOfStockItems || 0
          },
          itemsByCategory,
          itemsByStatus
        }
      });
    } catch (error) {
      console.error('Error getting inventory summary:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve inventory summary',
        error: error.message
      });
    }
  }
  
  /**
   * Get item history
   */
  async getItemHistory(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;
      
      const item = await Item.findByPk(id);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        });
      }
      
      const { count, rows: history } = await AuditLog.findAndCountAll({
        where: {
          targetTable: 'items',
          targetId: id
        },
        include: [
          { model: User, attributes: ['userId', 'name', 'role'] }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });
      
      res.json({
        success: true,
        data: {
          item: {
            itemId: item.itemId,
            name: item.name,
            currentQuantity: item.quantity,
            currentStoreId: item.storeId
          },
          history,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalRecords: count,
            recordsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Error getting item history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve item history',
        error: error.message
      });
    }
  }
}

module.exports = new InventoryController();
