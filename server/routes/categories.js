const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Apply authentication to all routes
router.use(authMiddleware);

// ==================== CRUD OPERATIONS ====================

// Get all categories with pagination and filtering
router.get('/', 
  roleMiddleware(['Admin', 'Store Keeper', 'Employee']),
  categoryController.getAllCategories
);

// Get single category by ID
router.get('/:id', 
  roleMiddleware(['Admin', 'Store Keeper', 'Employee']),
  categoryController.getCategoryById
);

// Create new category (Admin and Store Keeper only)
router.post('/', 
  roleMiddleware(['Admin', 'Store Keeper']),
  categoryController.createCategory
);

// Update category (Admin and Store Keeper only)
router.put('/:id', 
  roleMiddleware(['Admin', 'Store Keeper']),
  categoryController.updateCategory
);

// Delete category (Admin only)
router.delete('/:id', 
  roleMiddleware(['Admin']),
  categoryController.deleteCategory
);

// ==================== CATEGORY-BASED FILTERING ====================

// Get items by category with filtering
router.get('/:categoryId/items', 
  roleMiddleware(['Admin', 'Store Keeper', 'Employee']),
  categoryController.getItemsByCategory
);

// ==================== CATEGORY HIERARCHY MANAGEMENT ====================

// Get category hierarchy (tree structure)
router.get('/hierarchy/tree', 
  roleMiddleware(['Admin', 'Store Keeper', 'Employee']),
  categoryController.getCategoryHierarchy
);

// Get category breadcrumb path
router.get('/:categoryId/breadcrumb', 
  roleMiddleware(['Admin', 'Store Keeper', 'Employee']),
  categoryController.getCategoryBreadcrumb
);

// Move category to different parent
router.patch('/:id/move', 
  roleMiddleware(['Admin', 'Store Keeper']),
  categoryController.moveCategory
);

module.exports = router;
