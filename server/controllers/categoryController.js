const { Category, Item, AuditLog } = require('../models');
const { Op } = require('sequelize');

class CategoryController {
  // ==================== CRUD OPERATIONS ====================
  
  /**
   * Get all categories with pagination and filtering
   */
  async getAllCategories(req, res) {
    try {
      const { page = 1, limit = 10, search, parent_id, isActive } = req.query;
      const offset = (page - 1) * limit;
      
      const whereClause = {};
      
      // Search filter
      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ];
      }
      
      // Parent category filter
      if (parent_id) {
        whereClause.parent_id = parent_id;
      }
      
      // Active status filter
      if (isActive !== undefined) {
        whereClause.isActive = isActive === 'true';
      }
      
      const { count, rows: categories } = await Category.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Item,
            attributes: ['item_id', 'name', 'amount', 'status'],
            required: false
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['name', 'ASC']]
      });
      
      // Add item count for each category
      const categoriesWithCounts = await Promise.all(
        categories.map(async (category) => {
          const itemCount = await Item.count({ where: { category_id: category.category_id } });
          const totalQuantity = await Item.sum('amount', { where: { category_id: category.category_id } });
          const lowStockItems = await Item.count({
            where: {
              categoryId: category.categoryId,
              quantity: { [Op.lte]: { [Op.col]: 'minStockLevel' } }
            }
          });
          
          return {
            ...category.toJSON(),
            itemCount: itemCount || 0,
            totalQuantity: totalQuantity || 0,
            lowStockItems: lowStockItems || 0
          };
        })
      );
      
      res.json({
        success: true,
        data: {
          categories: categoriesWithCounts,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalCategories: count,
            categoriesPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Error getting categories:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve categories',
        error: error.message
      });
    }
  }
  
  /**
   * Get single category by ID
   */
  async getCategoryById(req, res) {
    try {
      const { id } = req.params;
      
      const category = await Category.findByPk(id, {
        include: [
          {
            model: Category,
            as: 'parent',
            attributes: ['categoryId', 'name', 'description'],
            required: false
          },
          {
            model: Category,
            as: 'children',
            attributes: ['categoryId', 'name', 'description', 'isActive'],
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
      
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
      
      // Get detailed statistics
      const statistics = await this.getCategoryStatistics(id);
      
      res.json({
        success: true,
        data: {
          ...category.toJSON(),
          statistics
        }
      });
    } catch (error) {
      console.error('Error getting category:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve category',
        error: error.message
      });
    }
  }
  
  /**
   * Create new category
   */
  async createCategory(req, res) {
    try {
      const {
        name,
        description,
        parentId,
        isActive = true,
        metadata = {}
      } = req.body;
      
      // Validate required fields
      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Category name is required'
        });
      }
      
      // Check if category name already exists
      const existingCategory = await Category.findOne({
        where: { name: { [Op.iLike]: name } }
      });
      
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category with this name already exists'
        });
      }
      
      // Validate parent category if provided
      if (parentId) {
        const parentCategory = await Category.findByPk(parentId);
        if (!parentCategory) {
          return res.status(400).json({
            success: false,
            message: 'Parent category not found'
          });
        }
        
        // Check for circular reference
        if (parentId === req.body.categoryId) {
          return res.status(400).json({
            success: false,
            message: 'Category cannot be its own parent'
          });
        }
      }
      
      // Create category
      const category = await Category.create({
        name,
        description,
        parentId,
        isActive,
        metadata
      });
      
      // Log audit
      await AuditLog.create({
        userId: req.user.userId,
        targetTable: 'categories',
        targetId: category.categoryId,
        actionType: 'CREATE',
        newValue: JSON.stringify(category.toJSON())
      });
      
      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category
      });
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create category',
        error: error.message
      });
    }
  }
  
  /**
   * Update category
   */
  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const category = await Category.findByPk(id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
      
      // Validate parent category if being updated
      if (updateData.parentId) {
        const parentCategory = await Category.findByPk(updateData.parentId);
        if (!parentCategory) {
          return res.status(400).json({
            success: false,
            message: 'Parent category not found'
          });
        }
        
        // Check for circular reference
        if (updateData.parentId === id) {
          return res.status(400).json({
            success: false,
            message: 'Category cannot be its own parent'
          });
        }
        
        // Check if parent would create a circular reference
        const wouldCreateCircular = await this.wouldCreateCircularReference(id, updateData.parentId);
        if (wouldCreateCircular) {
          return res.status(400).json({
            success: false,
            message: 'This would create a circular reference in the category hierarchy'
          });
        }
      }
      
      // Check for duplicate name if name is being updated
      if (updateData.name && updateData.name !== category.name) {
        const existingCategory = await Category.findOne({
          where: { 
            name: { [Op.iLike]: updateData.name },
            categoryId: { [Op.ne]: id }
          }
        });
        
        if (existingCategory) {
          return res.status(400).json({
            success: false,
            message: 'Category with this name already exists'
          });
        }
      }
      
      const oldData = category.toJSON();
      
      // Update category
      await category.update(updateData);
      
      // Log audit
      await AuditLog.create({
        userId: req.user.userId,
        targetTable: 'categories',
        targetId: category.categoryId,
        actionType: 'UPDATE',
        oldValue: JSON.stringify(oldData),
        newValue: JSON.stringify(category.toJSON())
      });
      
      res.json({
        success: true,
        message: 'Category updated successfully',
        data: category
      });
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update category',
        error: error.message
      });
    }
  }
  
  /**
   * Delete category
   */
  async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      
      const category = await Category.findByPk(id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
      
      // Check if category has items
      const itemCount = await Item.count({ where: { categoryId: id } });
      if (itemCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete category with existing items. Please reassign or remove all items first.'
        });
      }
      
      // Check if category has children
      const childrenCount = await Category.count({ where: { parentId: id } });
      if (childrenCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete category with subcategories. Please delete or reassign all subcategories first.'
        });
      }
      
      const oldData = category.toJSON();
      
      // Delete category
      await category.destroy();
      
      // Log audit
      await AuditLog.create({
        userId: req.user.userId,
        targetTable: 'categories',
        targetId: id,
        actionType: 'DELETE',
        oldValue: JSON.stringify(oldData)
      });
      
      res.json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete category',
        error: error.message
      });
    }
  }
  
  // ==================== CATEGORY-BASED FILTERING ====================
  
  /**
   * Get items by category with filtering
   */
  async getItemsByCategory(req, res) {
    try {
      const { categoryId } = req.params;
      const { 
        page = 1, 
        limit = 10, 
        search, 
        store, 
        status, 
        lowStock = false,
        sortBy = 'name',
        sortOrder = 'ASC',
        includeSubcategories = false
      } = req.query;
      const offset = (page - 1) * limit;
      
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
      
      let whereClause = {};
      
      // Category filter
      if (includeSubcategories === 'true') {
        // Get all subcategory IDs
        const subcategoryIds = await this.getAllSubcategoryIds(categoryId);
        whereClause.categoryId = { [Op.in]: [categoryId, ...subcategoryIds] };
      } else {
        whereClause.categoryId = categoryId;
      }
      
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
      
      // Store filter
      if (store) {
        whereClause.storeId = store;
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
          { model: Category, attributes: ['categoryId', 'name', 'description'] }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[sortBy, sortOrder.toUpperCase()]]
      });
      
      res.json({
        success: true,
        data: {
          category: {
            categoryId: category.categoryId,
            name: category.name,
            description: category.description
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
      console.error('Error getting items by category:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve items by category',
        error: error.message
      });
    }
  }
  
  /**
   * Get category statistics
   */
  async getCategoryStatistics(categoryId) {
    try {
      const [
        totalItems,
        totalQuantity,
        lowStockItems,
        outOfStockItems,
        itemsByStatus,
        itemsByStore
      ] = await Promise.all([
        Item.count({ where: { categoryId } }),
        Item.sum('quantity', { where: { categoryId } }),
        Item.count({
          where: {
            categoryId,
            quantity: { [Op.lte]: { [Op.col]: 'minStockLevel' } }
          }
        }),
        Item.count({
          where: {
            categoryId,
            quantity: 0
          }
        }),
        Item.findAll({
          attributes: [
            'status',
            [Item.sequelize.fn('COUNT', Item.sequelize.col('itemId')), 'count']
          ],
          where: { categoryId },
          group: ['status'],
          raw: true
        }),
        Item.findAll({
          attributes: [
            'storeId',
            [Item.sequelize.fn('COUNT', Item.sequelize.col('itemId')), 'count'],
            [Item.sequelize.fn('SUM', Item.sequelize.col('quantity')), 'totalQuantity']
          ],
          where: { categoryId },
          group: ['storeId'],
          raw: true
        })
      ]);
      
      return {
        totalItems: totalItems || 0,
        totalQuantity: totalQuantity || 0,
        lowStockItems: lowStockItems || 0,
        outOfStockItems: outOfStockItems || 0,
        itemsByStatus,
        itemsByStore
      };
    } catch (error) {
      console.error('Error getting category statistics:', error);
      return null;
    }
  }
  
  // ==================== CATEGORY HIERARCHY MANAGEMENT ====================
  
  /**
   * Get category hierarchy (tree structure)
   */
  async getCategoryHierarchy(req, res) {
    try {
      const { includeInactive = false } = req.query;
      
      const whereClause = {};
      if (includeInactive !== 'true') {
        whereClause.isActive = true;
      }
      
      const categories = await Category.findAll({
        where: whereClause,
        include: [
          {
            model: Category,
            as: 'parent',
            attributes: ['categoryId', 'name'],
            required: false
          },
          {
            model: Category,
            as: 'children',
            attributes: ['categoryId', 'name', 'description', 'isActive'],
            required: false,
            where: includeInactive === 'true' ? {} : { isActive: true }
          }
        ],
        order: [['name', 'ASC']]
      });
      
      // Build tree structure
      const tree = this.buildCategoryTree(categories);
      
      res.json({
        success: true,
        data: {
          hierarchy: tree,
          totalCategories: categories.length
        }
      });
    } catch (error) {
      console.error('Error getting category hierarchy:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve category hierarchy',
        error: error.message
      });
    }
  }
  
  /**
   * Get category breadcrumb path
   */
  async getCategoryBreadcrumb(req, res) {
    try {
      const { categoryId } = req.params;
      
      const breadcrumb = await this.getBreadcrumbPath(categoryId);
      
      if (!breadcrumb) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
      
      res.json({
        success: true,
        data: {
          breadcrumb
        }
      });
    } catch (error) {
      console.error('Error getting category breadcrumb:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve category breadcrumb',
        error: error.message
      });
    }
  }
  
  /**
   * Move category to different parent
   */
  async moveCategory(req, res) {
    try {
      const { id } = req.params;
      const { newParentId } = req.body;
      
      const category = await Category.findByPk(id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
      
      // Validate new parent if provided
      if (newParentId) {
        const newParent = await Category.findByPk(newParentId);
        if (!newParent) {
          return res.status(400).json({
            success: false,
            message: 'New parent category not found'
          });
        }
        
        // Check for circular reference
        if (newParentId === id) {
          return res.status(400).json({
            success: false,
            message: 'Category cannot be its own parent'
          });
        }
        
        // Check if new parent would create a circular reference
        const wouldCreateCircular = await this.wouldCreateCircularReference(id, newParentId);
        if (wouldCreateCircular) {
          return res.status(400).json({
            success: false,
            message: 'This would create a circular reference in the category hierarchy'
          });
        }
      }
      
      const oldParentId = category.parentId;
      
      // Update category parent
      await category.update({ parentId: newParentId });
      
      // Log audit
      await AuditLog.create({
        userId: req.user.userId,
        targetTable: 'categories',
        targetId: category.categoryId,
        actionType: 'MOVE',
        oldValue: JSON.stringify({ parentId: oldParentId }),
        newValue: JSON.stringify({ parentId: newParentId })
      });
      
      res.json({
        success: true,
        message: 'Category moved successfully',
        data: {
          categoryId: category.categoryId,
          name: category.name,
          oldParentId,
          newParentId
        }
      });
    } catch (error) {
      console.error('Error moving category:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to move category',
        error: error.message
      });
    }
  }
  
  // ==================== HELPER METHODS ====================
  
  /**
   * Build category tree structure
   */
  buildCategoryTree(categories) {
    const categoryMap = new Map();
    const roots = [];
    
    // Create map of categories
    categories.forEach(category => {
      categoryMap.set(category.categoryId, {
        ...category.toJSON(),
        children: []
      });
    });
    
    // Build tree structure
    categories.forEach(category => {
      const categoryNode = categoryMap.get(category.categoryId);
      
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          parent.children.push(categoryNode);
        }
      } else {
        roots.push(categoryNode);
      }
    });
    
    return roots;
  }
  
  /**
   * Get breadcrumb path for a category
   */
  async getBreadcrumbPath(categoryId) {
    const breadcrumb = [];
    let currentId = categoryId;
    
    while (currentId) {
      const category = await Category.findByPk(currentId, {
        attributes: ['categoryId', 'name', 'parentId']
      });
      
      if (!category) {
        return null;
      }
      
      breadcrumb.unshift({
        categoryId: category.categoryId,
        name: category.name
      });
      
      currentId = category.parentId;
    }
    
    return breadcrumb;
  }
  
  /**
   * Get all subcategory IDs recursively
   */
  async getAllSubcategoryIds(categoryId) {
    const subcategoryIds = [];
    
    const children = await Category.findAll({
      where: { parentId: categoryId },
      attributes: ['categoryId']
    });
    
    for (const child of children) {
      subcategoryIds.push(child.categoryId);
      const grandChildren = await this.getAllSubcategoryIds(child.categoryId);
      subcategoryIds.push(...grandChildren);
    }
    
    return subcategoryIds;
  }
  
  /**
   * Check if moving a category would create a circular reference
   */
  async wouldCreateCircularReference(categoryId, newParentId) {
    let currentId = newParentId;
    
    while (currentId) {
      if (currentId === categoryId) {
        return true;
      }
      
      const parent = await Category.findByPk(currentId, {
        attributes: ['parentId']
      });
      
      currentId = parent ? parent.parentId : null;
    }
    
    return false;
  }
}

module.exports = new CategoryController();
