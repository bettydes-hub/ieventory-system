const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Apply authentication to all routes
router.use(authenticateToken);

// ==================== CRUD OPERATIONS ====================

// Get all items with pagination and filtering
router.get('/', 
  requireRole(['Admin', 'Store Keeper', 'Employee']),
  inventoryController.getAllItems
);

// Get single item by ID
router.get('/:id', 
  requireRole(['Admin', 'Store Keeper', 'Employee']),
  inventoryController.getItemById
);

// Create new item (Admin and Store Keeper only)
router.post('/', 
  requireRole(['Admin', 'Store Keeper']),
  inventoryController.createItem
);

// Update item (Admin and Store Keeper only)
router.put('/:id', 
  requireRole(['Admin', 'Store Keeper']),
  inventoryController.updateItem
);

// Delete item (Admin only)
router.delete('/:id', 
  requireRole(['Admin']),
  inventoryController.deleteItem
);

// ==================== STOCK MANAGEMENT ====================

// Update stock levels
router.patch('/:id/stock', 
  requireRole(['Admin', 'Store Keeper']),
  inventoryController.updateStock
);

// Get low stock alerts
router.get('/alerts/low-stock', 
  requireRole(['Admin', 'Store Keeper']),
  inventoryController.getLowStockAlerts
);

// Get stock levels by store
router.get('/store/:storeId/stock', 
  requireRole(['Admin', 'Store Keeper', 'Employee']),
  inventoryController.getStockByStore
);

// ==================== ITEM TRANSFERS ====================

// Transfer items between stores
router.post('/transfer', 
  requireRole(['Admin', 'Store Keeper']),
  inventoryController.transferItems
);

// ==================== QR CODE SUPPORT ====================

// Get QR code for item
router.get('/:id/qr-code', 
  requireRole(['Admin', 'Store Keeper', 'Employee']),
  inventoryController.getItemQRCode
);

// Scan QR code and get item info
router.post('/scan-qr', 
  requireRole(['Admin', 'Store Keeper', 'Employee']),
  inventoryController.scanQRCode
);

// ==================== REPORTS & ANALYTICS ====================

// Get inventory summary
router.get('/reports/summary', 
  requireRole(['Admin', 'Store Keeper']),
  inventoryController.getInventorySummary
);

// Get item history
router.get('/:id/history', 
  requireRole(['Admin', 'Store Keeper']),
  inventoryController.getItemHistory
);

module.exports = router;
