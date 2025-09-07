const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Apply authentication to all routes
router.use(authenticateToken);

// ==================== CRUD OPERATIONS ====================

// Get all suppliers with pagination and filtering
router.get('/', 
  requireRole(['Admin', 'Store Keeper', 'Employee']),
  supplierController.getAllSuppliers
);

// Get single supplier by ID
router.get('/:id', 
  requireRole(['Admin', 'Store Keeper', 'Employee']),
  supplierController.getSupplierById
);

// Create new supplier (Admin and Store Keeper only)
router.post('/', 
  requireRole(['Admin', 'Store Keeper']),
  supplierController.createSupplier
);

// Update supplier (Admin and Store Keeper only)
router.put('/:id', 
  requireRole(['Admin', 'Store Keeper']),
  supplierController.updateSupplier
);

// Delete supplier (Admin only)
router.delete('/:id', 
  requireRole(['Admin']),
  supplierController.deleteSupplier
);

// ==================== LINK SUPPLIERS TO SUPPLIED ITEMS ====================

// Link supplier to item
router.post('/link-item', 
  requireRole(['Admin', 'Store Keeper']),
  supplierController.linkSupplierToItem
);

// Unlink supplier from item
router.delete('/unlink-item/:itemId', 
  requireRole(['Admin', 'Store Keeper']),
  supplierController.unlinkSupplierFromItem
);

// Get items supplied by supplier
router.get('/:supplierId/items', 
  requireRole(['Admin', 'Store Keeper', 'Employee']),
  supplierController.getSupplierItems
);

// ==================== SUPPLIER PERFORMANCE TRACKING ====================

// Get supplier performance report
router.get('/:supplierId/performance', 
  requireRole(['Admin', 'Store Keeper']),
  supplierController.getSupplierPerformanceReport
);

// Get supplier comparison report
router.post('/comparison', 
  requireRole(['Admin', 'Store Keeper']),
  supplierController.getSupplierComparison
);

module.exports = router;
