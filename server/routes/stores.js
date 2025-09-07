const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Apply authentication to all routes
router.use(authMiddleware);

// ==================== CRUD OPERATIONS ====================

// Get all stores with pagination and filtering
router.get('/', 
  roleMiddleware(['Admin', 'Store Keeper', 'Employee']),
  storeController.getAllStores
);

// Get single store by ID
router.get('/:id', 
  roleMiddleware(['Admin', 'Store Keeper', 'Employee']),
  storeController.getStoreById
);

// Create new store (Admin only)
router.post('/', 
  roleMiddleware(['Admin']),
  storeController.createStore
);

// Update store (Admin and Store Keeper only)
router.put('/:id', 
  roleMiddleware(['Admin', 'Store Keeper']),
  storeController.updateStore
);

// Delete store (Admin only)
router.delete('/:id', 
  roleMiddleware(['Admin']),
  storeController.deleteStore
);

// ==================== STORE-TO-STORE TRANSFERS ====================

// Transfer items between stores
router.post('/transfer', 
  roleMiddleware(['Admin', 'Store Keeper']),
  storeController.transferItemsBetweenStores
);

// Get transfer history between stores
router.get('/:storeId/transfers', 
  roleMiddleware(['Admin', 'Store Keeper']),
  storeController.getStoreTransferHistory
);

// ==================== STORE-SPECIFIC INVENTORY VIEWS ====================

// Get store inventory with detailed filtering
router.get('/:storeId/inventory', 
  roleMiddleware(['Admin', 'Store Keeper', 'Employee']),
  storeController.getStoreInventory
);

// Get store performance metrics
router.get('/:storeId/performance', 
  roleMiddleware(['Admin', 'Store Keeper']),
  storeController.getStorePerformance
);

// ==================== STORE MANAGEMENT & CONFIGURATION ====================

// Get store configuration
router.get('/:id/config', 
  roleMiddleware(['Admin', 'Store Keeper']),
  storeController.getStoreConfiguration
);

// Update store settings
router.patch('/:id/settings', 
  roleMiddleware(['Admin', 'Store Keeper']),
  storeController.updateStoreSettings
);

// Assign store manager
router.patch('/:id/manager', 
  roleMiddleware(['Admin']),
  storeController.assignStoreManager
);

// Toggle store status (active/inactive)
router.patch('/:id/status', 
  roleMiddleware(['Admin']),
  storeController.toggleStoreStatus
);

module.exports = router;
