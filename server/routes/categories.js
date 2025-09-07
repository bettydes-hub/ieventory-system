const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Apply authentication to all routes
router.use(authenticateToken);

// ==================== CRUD OPERATIONS ====================

// Get all categories with pagination and filtering
router.get('/', 
  requireRole(['Admin', 'Store Keeper', 'Employee']),
  categoryController.getAllCategories
);

// Get single category by ID
router.get('/:id', 
  requireRole(['Admin', 'Store Keeper', 'Employee']),
  categoryController.getCategoryById
);

// Create new category (Admin and Store Keeper only)
router.post('/', 
  requireRole(['Admin', 'Store Keeper']),
  categoryController.createCategory
);

// Update category (Admin and Store Keeper only)
router.put('/:id', 
  requireRole(['Admin', 'Store Keeper']),
  categoryController.updateCategory
);

// Delete category (Admin only)
router.delete('/:id', 
  requireRole(['Admin']),
  categoryController.deleteCategory
);

// ==================== CATEGORY-BASED FILTERING ====================

// Get items by category with filtering
router.get('/:categoryId/items', 
  requireRole(['Admin', 'Store Keeper', 'Employee']),
  categoryController.getItemsByCategory
);

// ==================== CATEGORY HIERARCHY MANAGEMENT ====================

// Get category hierarchy (tree structure)
router.get('/hierarchy/tree', 
  requireRole(['Admin', 'Store Keeper', 'Employee']),
  categoryController.getCategoryHierarchy
);

// Get category breadcrumb path
router.get('/:categoryId/breadcrumb', 
  requireRole(['Admin', 'Store Keeper', 'Employee']),
  categoryController.getCategoryBreadcrumb
);

// Move category to different parent
router.patch('/:id/move', 
  requireRole(['Admin', 'Store Keeper']),
  categoryController.moveCategory
);

module.exports = router;
