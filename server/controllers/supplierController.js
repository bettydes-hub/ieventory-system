const { Supplier, Item, Transaction, AuditLog } = require('../models');
const { Op } = require('sequelize');

class SupplierController {
  // ==================== CRUD OPERATIONS ====================
  
  /**
   * Get all suppliers with pagination and filtering
   */
  async getAllSuppliers(req, res) {
    try {
      const { page = 1, limit = 10, search, isActive, location } = req.query;
      const offset = (page - 1) * limit;
      
      const whereClause = {};
      
      // Search filter
      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { contact: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
          { phone: { [Op.iLike]: `%${search}%` } }
        ];
      }
      
      // Active status filter
      if (isActive !== undefined) {
        whereClause.isActive = isActive === 'true';
      }
      
      // Location filter
      if (location) {
        whereClause.address = { [Op.iLike]: `%${location}%` };
      }
      
      const { count, rows: suppliers } = await Supplier.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Item,
            attributes: ['itemId', 'name', 'quantity', 'status'],
            required: false
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['name', 'ASC']]
      });
      
      // Add item count and performance metrics for each supplier
      const suppliersWithMetrics = await Promise.all(
        suppliers.map(async (supplier) => {
          const itemCount = await Item.count({ where: { supplierId: supplier.supplierId } });
          const totalQuantity = await Item.sum('quantity', { where: { supplierId: supplier.supplierId } });
          const totalValue = await Item.sum('purchasePrice', { where: { supplierId: supplier.supplierId } });
          
          // Get recent transactions
          const recentTransactions = await Transaction.count({
            where: {
              supplierId: supplier.supplierId,
              createdAt: { [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
            }
          });
          
          return {
            ...supplier.toJSON(),
            metrics: {
              itemCount: itemCount || 0,
              totalQuantity: totalQuantity || 0,
              totalValue: totalValue || 0,
              recentTransactions: recentTransactions || 0
            }
          };
        })
      );
      
      res.json({
        success: true,
        data: {
          suppliers: suppliersWithMetrics,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalSuppliers: count,
            suppliersPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Error getting suppliers:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve suppliers',
        error: error.message
      });
    }
  }
  
  /**
   * Get single supplier by ID
   */
  async getSupplierById(req, res) {
    try {
      const { id } = req.params;
      
      const supplier = await Supplier.findByPk(id, {
        include: [
          {
            model: Item,
            include: [
              { model: Category, attributes: ['categoryId', 'name'] }
            ],
            required: false
          }
        ]
      });
      
      if (!supplier) {
        return res.status(404).json({
          success: false,
          message: 'Supplier not found'
        });
      }
      
      // Get detailed performance metrics
      const performanceMetrics = await this.getSupplierPerformanceMetrics(id);
      
      res.json({
        success: true,
        data: {
          ...supplier.toJSON(),
          performanceMetrics
        }
      });
    } catch (error) {
      console.error('Error getting supplier:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve supplier',
        error: error.message
      });
    }
  }
  
  /**
   * Create new supplier
   */
  async createSupplier(req, res) {
    try {
      const {
        name,
        contact,
        email,
        address,
        phone,
        website,
        taxId,
        paymentTerms,
        creditLimit,
        isActive = true,
        notes
      } = req.body;
      
      // Validate required fields
      if (!name || !contact || !email) {
        return res.status(400).json({
          success: false,
          message: 'Name, contact, and email are required'
        });
      }
      
      // Check if supplier name already exists
      const existingSupplier = await Supplier.findOne({
        where: { name: { [Op.iLike]: name } }
      });
      
      if (existingSupplier) {
        return res.status(400).json({
          success: false,
          message: 'Supplier with this name already exists'
        });
      }
      
      // Check if email already exists
      const existingEmail = await Supplier.findOne({
        where: { email: { [Op.iLike]: email } }
      });
      
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Supplier with this email already exists'
        });
      }
      
      // Create supplier
      const supplier = await Supplier.create({
        name,
        contact,
        email,
        address,
        phone,
        website,
        taxId,
        paymentTerms,
        creditLimit,
        isActive,
        notes
      });
      
      // Log audit
      await AuditLog.create({
        userId: req.user.userId,
        targetTable: 'suppliers',
        targetId: supplier.supplierId,
        actionType: 'CREATE',
        newValue: JSON.stringify(supplier.toJSON())
      });
      
      res.status(201).json({
        success: true,
        message: 'Supplier created successfully',
        data: supplier
      });
    } catch (error) {
      console.error('Error creating supplier:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create supplier',
        error: error.message
      });
    }
  }
  
  /**
   * Update supplier
   */
  async updateSupplier(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const supplier = await Supplier.findByPk(id);
      if (!supplier) {
        return res.status(404).json({
          success: false,
          message: 'Supplier not found'
        });
      }
      
      // Check for duplicate name if name is being updated
      if (updateData.name && updateData.name !== supplier.name) {
        const existingSupplier = await Supplier.findOne({
          where: { 
            name: { [Op.iLike]: updateData.name },
            supplierId: { [Op.ne]: id }
          }
        });
        
        if (existingSupplier) {
          return res.status(400).json({
            success: false,
            message: 'Supplier with this name already exists'
          });
        }
      }
      
      // Check for duplicate email if email is being updated
      if (updateData.email && updateData.email !== supplier.email) {
        const existingEmail = await Supplier.findOne({
          where: { 
            email: { [Op.iLike]: updateData.email },
            supplierId: { [Op.ne]: id }
          }
        });
        
        if (existingEmail) {
          return res.status(400).json({
            success: false,
            message: 'Supplier with this email already exists'
          });
        }
      }
      
      const oldData = supplier.toJSON();
      
      // Update supplier
      await supplier.update(updateData);
      
      // Log audit
      await AuditLog.create({
        userId: req.user.userId,
        targetTable: 'suppliers',
        targetId: supplier.supplierId,
        actionType: 'UPDATE',
        oldValue: JSON.stringify(oldData),
        newValue: JSON.stringify(supplier.toJSON())
      });
      
      res.json({
        success: true,
        message: 'Supplier updated successfully',
        data: supplier
      });
    } catch (error) {
      console.error('Error updating supplier:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update supplier',
        error: error.message
      });
    }
  }
  
  /**
   * Delete supplier
   */
  async deleteSupplier(req, res) {
    try {
      const { id } = req.params;
      
      const supplier = await Supplier.findByPk(id);
      if (!supplier) {
        return res.status(404).json({
          success: false,
          message: 'Supplier not found'
        });
      }
      
      // Check if supplier has items
      const itemCount = await Item.count({ where: { supplierId: id } });
      if (itemCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete supplier with existing items. Please reassign or remove all items first.'
        });
      }
      
      // Check if supplier has transactions
      const transactionCount = await Transaction.count({ where: { supplierId: id } });
      if (transactionCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete supplier with existing transactions. Please reassign or remove all transactions first.'
        });
      }
      
      const oldData = supplier.toJSON();
      
      // Delete supplier
      await supplier.destroy();
      
      // Log audit
      await AuditLog.create({
        userId: req.user.userId,
        targetTable: 'suppliers',
        targetId: id,
        actionType: 'DELETE',
        oldValue: JSON.stringify(oldData)
      });
      
      res.json({
        success: true,
        message: 'Supplier deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting supplier:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete supplier',
        error: error.message
      });
    }
  }
  
  // ==================== LINK SUPPLIERS TO SUPPLIED ITEMS ====================
  
  /**
   * Link supplier to item
   */
  async linkSupplierToItem(req, res) {
    try {
      const { supplierId, itemId } = req.body;
      
      if (!supplierId || !itemId) {
        return res.status(400).json({
          success: false,
          message: 'Supplier ID and Item ID are required'
        });
      }
      
      // Validate supplier exists
      const supplier = await Supplier.findByPk(supplierId);
      if (!supplier) {
        return res.status(404).json({
          success: false,
          message: 'Supplier not found'
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
      
      const oldSupplierId = item.supplierId;
      
      // Update item with supplier
      await item.update({ supplierId });
      
      // Log audit
      await AuditLog.create({
        userId: req.user.userId,
        targetTable: 'items',
        targetId: item.itemId,
        actionType: 'SUPPLIER_LINK',
        oldValue: JSON.stringify({ supplierId: oldSupplierId }),
        newValue: JSON.stringify({ supplierId })
      });
      
      res.json({
        success: true,
        message: 'Supplier linked to item successfully',
        data: {
          item: {
            itemId: item.itemId,
            name: item.name,
            supplierId
          },
          supplier: {
            supplierId: supplier.supplierId,
            name: supplier.name,
            contact: supplier.contact
          }
        }
      });
    } catch (error) {
      console.error('Error linking supplier to item:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to link supplier to item',
        error: error.message
      });
    }
  }
  
  /**
   * Unlink supplier from item
   */
  async unlinkSupplierFromItem(req, res) {
    try {
      const { itemId } = req.params;
      
      const item = await Item.findByPk(itemId);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        });
      }
      
      if (!item.supplierId) {
        return res.status(400).json({
          success: false,
          message: 'Item is not linked to any supplier'
        });
      }
      
      const oldSupplierId = item.supplierId;
      
      // Remove supplier link
      await item.update({ supplierId: null });
      
      // Log audit
      await AuditLog.create({
        userId: req.user.userId,
        targetTable: 'items',
        targetId: item.itemId,
        actionType: 'SUPPLIER_UNLINK',
        oldValue: JSON.stringify({ supplierId: oldSupplierId }),
        newValue: JSON.stringify({ supplierId: null })
      });
      
      res.json({
        success: true,
        message: 'Supplier unlinked from item successfully',
        data: {
          itemId: item.itemId,
          name: item.name,
          oldSupplierId
        }
      });
    } catch (error) {
      console.error('Error unlinking supplier from item:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to unlink supplier from item',
        error: error.message
      });
    }
  }
  
  /**
   * Get items supplied by supplier
   */
  async getSupplierItems(req, res) {
    try {
      const { supplierId } = req.params;
      const { 
        page = 1, 
        limit = 10, 
        search, 
        category, 
        status,
        sortBy = 'name',
        sortOrder = 'ASC'
      } = req.query;
      const offset = (page - 1) * limit;
      
      const supplier = await Supplier.findByPk(supplierId);
      if (!supplier) {
        return res.status(404).json({
          success: false,
          message: 'Supplier not found'
        });
      }
      
      const whereClause = { supplierId };
      
      // Search filter
      if (search) {
        whereClause[Op.and] = [
          whereClause,
          {
            [Op.or]: [
              { name: { [Op.iLike]: `%${search}%` } },
              { model: { [Op.iLike]: `%${search}%` } },
              { serialNumber: { [Op.iLike]: `%${search}%` } },
              { manufacturer: { [Op.iLike]: `%${search}%` } }
            ]
          }
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
          supplier: {
            supplierId: supplier.supplierId,
            name: supplier.name,
            contact: supplier.contact,
            email: supplier.email
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
      console.error('Error getting supplier items:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve supplier items',
        error: error.message
      });
    }
  }
  
  // ==================== SUPPLIER PERFORMANCE TRACKING ====================
  
  /**
   * Get supplier performance metrics
   */
  async getSupplierPerformanceMetrics(supplierId) {
    try {
      const [
        totalItems,
        totalQuantity,
        totalValue,
        lowStockItems,
        outOfStockItems,
        recentTransactions,
        averageDeliveryTime,
        itemsByCategory,
        itemsByStatus
      ] = await Promise.all([
        Item.count({ where: { supplierId } }),
        Item.sum('quantity', { where: { supplierId } }),
        Item.sum('purchasePrice', { where: { supplierId } }),
        Item.count({
          where: {
            supplierId,
            quantity: { [Op.lte]: { [Op.col]: 'minStockLevel' } }
          }
        }),
        Item.count({
          where: {
            supplierId,
            quantity: 0
          }
        }),
        Transaction.count({
          where: {
            supplierId,
            createdAt: { [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
          }
        }),
        this.calculateAverageDeliveryTime(supplierId),
        Item.findAll({
          attributes: [
            'categoryId',
            [Item.sequelize.fn('COUNT', Item.sequelize.col('itemId')), 'count'],
            [Item.sequelize.fn('SUM', Item.sequelize.col('quantity')), 'totalQuantity']
          ],
          where: { supplierId },
          include: [{ model: Category, attributes: ['name'] }],
          group: ['categoryId', 'Category.categoryId'],
          raw: true
        }),
        Item.findAll({
          attributes: [
            'status',
            [Item.sequelize.fn('COUNT', Item.sequelize.col('itemId')), 'count']
          ],
          where: { supplierId },
          group: ['status'],
          raw: true
        })
      ]);
      
      return {
        totalItems: totalItems || 0,
        totalQuantity: totalQuantity || 0,
        totalValue: totalValue || 0,
        lowStockItems: lowStockItems || 0,
        outOfStockItems: outOfStockItems || 0,
        recentTransactions: recentTransactions || 0,
        averageDeliveryTime: averageDeliveryTime || 0,
        itemsByCategory,
        itemsByStatus
      };
    } catch (error) {
      console.error('Error getting supplier performance metrics:', error);
      return null;
    }
  }
  
  /**
   * Get supplier performance report
   */
  async getSupplierPerformanceReport(req, res) {
    try {
      const { supplierId } = req.params;
      const { period = '30' } = req.query; // days
      
      const supplier = await Supplier.findByPk(supplierId);
      if (!supplier) {
        return res.status(404).json({
          success: false,
          message: 'Supplier not found'
        });
      }
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(period));
      
      const [
        totalTransactions,
        totalValue,
        averageOrderValue,
        onTimeDeliveries,
        lateDeliveries,
        itemsSupplied,
        categoriesSupplied,
        performanceScore
      ] = await Promise.all([
        Transaction.count({
          where: {
            supplierId,
            createdAt: { [Op.gte]: startDate }
          }
        }),
        Transaction.sum('amount', {
          where: {
            supplierId,
            createdAt: { [Op.gte]: startDate }
          }
        }),
        this.calculateAverageOrderValue(supplierId, startDate),
        this.calculateOnTimeDeliveries(supplierId, startDate),
        this.calculateLateDeliveries(supplierId, startDate),
        Item.count({ where: { supplierId } }),
        Item.count({
          distinct: true,
          col: 'categoryId',
          where: { supplierId }
        }),
        this.calculatePerformanceScore(supplierId, startDate)
      ]);
      
      res.json({
        success: true,
        data: {
          supplier: {
            supplierId: supplier.supplierId,
            name: supplier.name,
            contact: supplier.contact,
            email: supplier.email
          },
          period: `${period} days`,
          metrics: {
            totalTransactions: totalTransactions || 0,
            totalValue: totalValue || 0,
            averageOrderValue: averageOrderValue || 0,
            onTimeDeliveries: onTimeDeliveries || 0,
            lateDeliveries: lateDeliveries || 0,
            deliveryRate: onTimeDeliveries + lateDeliveries > 0 ? 
              (onTimeDeliveries / (onTimeDeliveries + lateDeliveries)) * 100 : 0,
            itemsSupplied: itemsSupplied || 0,
            categoriesSupplied: categoriesSupplied || 0,
            performanceScore: performanceScore || 0
          }
        }
      });
    } catch (error) {
      console.error('Error getting supplier performance report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve supplier performance report',
        error: error.message
      });
    }
  }
  
  /**
   * Get supplier comparison report
   */
  async getSupplierComparison(req, res) {
    try {
      const { supplierIds } = req.body;
      
      if (!supplierIds || !Array.isArray(supplierIds) || supplierIds.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'At least 2 supplier IDs are required for comparison'
        });
      }
      
      const comparison = await Promise.all(
        supplierIds.map(async (supplierId) => {
          const supplier = await Supplier.findByPk(supplierId);
          if (!supplier) {
            return null;
          }
          
          const metrics = await this.getSupplierPerformanceMetrics(supplierId);
          
          return {
            supplier: {
              supplierId: supplier.supplierId,
              name: supplier.name,
              contact: supplier.contact,
              email: supplier.email
            },
            metrics
          };
        })
      );
      
      // Filter out null results
      const validComparison = comparison.filter(item => item !== null);
      
      if (validComparison.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'At least 2 valid suppliers are required for comparison'
        });
      }
      
      res.json({
        success: true,
        data: {
          comparison: validComparison,
          summary: this.generateComparisonSummary(validComparison)
        }
      });
    } catch (error) {
      console.error('Error getting supplier comparison:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve supplier comparison',
        error: error.message
      });
    }
  }
  
  // ==================== HELPER METHODS ====================
  
  /**
   * Calculate average delivery time for supplier
   */
  async calculateAverageDeliveryTime(supplierId) {
    try {
      // This would typically involve delivery records
      // For now, return a placeholder value
      return 5; // days
    } catch (error) {
      console.error('Error calculating average delivery time:', error);
      return 0;
    }
  }
  
  /**
   * Calculate average order value for supplier
   */
  async calculateAverageOrderValue(supplierId, startDate) {
    try {
      const result = await Transaction.findOne({
        attributes: [
          [Transaction.sequelize.fn('AVG', Transaction.sequelize.col('amount')), 'averageValue']
        ],
        where: {
          supplierId,
          createdAt: { [Op.gte]: startDate }
        },
        raw: true
      });
      
      return result ? parseFloat(result.averageValue) || 0 : 0;
    } catch (error) {
      console.error('Error calculating average order value:', error);
      return 0;
    }
  }
  
  /**
   * Calculate on-time deliveries for supplier
   */
  async calculateOnTimeDeliveries(supplierId, startDate) {
    try {
      // This would typically involve delivery records with due dates
      // For now, return a placeholder value
      return 8;
    } catch (error) {
      console.error('Error calculating on-time deliveries:', error);
      return 0;
    }
  }
  
  /**
   * Calculate late deliveries for supplier
   */
  async calculateLateDeliveries(supplierId, startDate) {
    try {
      // This would typically involve delivery records with due dates
      // For now, return a placeholder value
      return 2;
    } catch (error) {
      console.error('Error calculating late deliveries:', error);
      return 0;
    }
  }
  
  /**
   * Calculate performance score for supplier
   */
  async calculatePerformanceScore(supplierId, startDate) {
    try {
      const metrics = await this.getSupplierPerformanceMetrics(supplierId);
      
      // Simple scoring algorithm (0-100)
      let score = 0;
      
      // Item availability score (40%)
      if (metrics.totalItems > 0) {
        const availabilityRate = (metrics.totalItems - metrics.outOfStockItems) / metrics.totalItems;
        score += availabilityRate * 40;
      }
      
      // Stock level score (30%)
      if (metrics.totalItems > 0) {
        const stockRate = (metrics.totalItems - metrics.lowStockItems) / metrics.totalItems;
        score += stockRate * 30;
      }
      
      // Transaction activity score (30%)
      if (metrics.recentTransactions > 0) {
        score += Math.min(metrics.recentTransactions * 3, 30);
      }
      
      return Math.round(score);
    } catch (error) {
      console.error('Error calculating performance score:', error);
      return 0;
    }
  }
  
  /**
   * Generate comparison summary
   */
  generateComparisonSummary(comparison) {
    const summary = {
      bestPerformer: null,
      worstPerformer: null,
      averageScore: 0,
      totalSuppliers: comparison.length
    };
    
    let totalScore = 0;
    let bestScore = 0;
    let worstScore = 100;
    
    comparison.forEach(item => {
      const score = item.metrics.performanceScore || 0;
      totalScore += score;
      
      if (score > bestScore) {
        bestScore = score;
        summary.bestPerformer = item.supplier;
      }
      
      if (score < worstScore) {
        worstScore = score;
        summary.worstPerformer = item.supplier;
      }
    });
    
    summary.averageScore = Math.round(totalScore / comparison.length);
    
    return summary;
  }
}

module.exports = new SupplierController();
