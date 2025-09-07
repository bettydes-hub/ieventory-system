const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Apply authentication to all routes
router.use(authenticateToken);

// ==================== CRUD OPERATIONS ====================

// Get all stores with pagination and filtering
router.get('/', 
  requireRole(['Admin', 'Store Keeper', 'Employee']),
  storeController.getAllStores
);

// Get single store by ID
router.get('/:id', 
  requireRole(['Admin', 'Store Keeper', 'Employee']),
  storeController.getStoreById
);

// Create new store (Admin only)
router.post('/', 
  requireRole(['Admin']),
  storeController.createStore
);

// Update store (Admin and Store Keeper only)
router.put('/:id', 
  requireRole(['Admin', 'Store Keeper']),
  storeController.updateStore
);

// Delete store (Admin only)
router.delete('/:id', 
  requireRole(['Admin']),
  storeController.deleteStore
);

// ==================== STORE-TO-STORE TRANSFERS ====================

// Transfer items between stores
router.post('/transfer', 
  requireRole(['Admin', 'Store Keeper']),
  storeController.transferItemsBetweenStores
);

// Get transfer history between stores
router.get('/:storeId/transfers', 
  requireRole(['Admin', 'Store Keeper']),
  storeController.getStoreTransferHistory
);

// ==================== STORE-SPECIFIC INVENTORY VIEWS ====================

// Get store inventory with detailed filtering
router.get('/:storeId/inventory', 
  requireRole(['Admin', 'Store Keeper', 'Employee']),
  storeController.getStoreInventory
);

// Get store performance metrics
router.get('/:storeId/performance', 
  requireRole(['Admin', 'Store Keeper']),
  storeController.getStorePerformance
);

// ==================== STORE MANAGEMENT & CONFIGURATION ====================

// Get store configuration
router.get('/:id/config', 
  requireRole(['Admin', 'Store Keeper']),
  storeController.getStoreConfiguration
);

// Update store settings
router.patch('/:id/settings', 
  requireRole(['Admin', 'Store Keeper']),
  storeController.updateStoreSettings
);

// Assign store manager
router.patch('/:id/manager', 
  requireRole(['Admin']),
  storeController.assignStoreManager
);

// Toggle store status (active/inactive)
router.patch('/:id/status', 
  requireRole(['Admin']),
  storeController.toggleStoreStatus
);

module.exports = router;
