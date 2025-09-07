const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Apply authentication to all routes
router.use(authenticateToken);

// ==================== CRUD OPERATIONS ====================

// Get all maintenance logs with pagination and filtering
router.get('/', 
  requireRole(['Admin', 'Store Keeper', 'Employee']),
  maintenanceController.getAllMaintenanceLogs
);

// Get single maintenance log by ID
router.get('/:id', 
  requireRole(['Admin', 'Store Keeper', 'Employee']),
  maintenanceController.getMaintenanceLogById
);

// Create new maintenance log (Admin and Store Keeper only)
router.post('/', 
  requireRole(['Admin', 'Store Keeper']),
  maintenanceController.createMaintenanceLog
);

// Update maintenance log (Admin and Store Keeper only)
router.put('/:id', 
  requireRole(['Admin', 'Store Keeper']),
  maintenanceController.updateMaintenanceLog
);

// Delete maintenance log (Admin only)
router.delete('/:id', 
  requireRole(['Admin']),
  maintenanceController.deleteMaintenanceLog
);

// ==================== MAINTENANCE SCHEDULING ====================

// Get maintenance schedule
router.get('/schedule/list', 
  requireRole(['Admin', 'Store Keeper', 'Employee']),
  maintenanceController.getMaintenanceSchedule
);

// Get upcoming maintenance
router.get('/schedule/upcoming', 
  requireRole(['Admin', 'Store Keeper', 'Employee']),
  maintenanceController.getUpcomingMaintenance
);

// Reschedule maintenance
router.patch('/:id/reschedule', 
  requireRole(['Admin', 'Store Keeper']),
  maintenanceController.rescheduleMaintenance
);

// ==================== MAINTENANCE LOGS MANAGEMENT ====================

// Start maintenance
router.patch('/:id/start', 
  requireRole(['Admin', 'Store Keeper', 'Employee']),
  maintenanceController.startMaintenance
);

// Complete maintenance
router.patch('/:id/complete', 
  requireRole(['Admin', 'Store Keeper', 'Employee']),
  maintenanceController.completeMaintenance
);

// Cancel maintenance
router.patch('/:id/cancel', 
  requireRole(['Admin', 'Store Keeper']),
  maintenanceController.cancelMaintenance
);

// ==================== EQUIPMENT STATUS TRACKING ====================

// Get equipment maintenance status
router.get('/equipment/:itemId/status', 
  requireRole(['Admin', 'Store Keeper', 'Employee']),
  maintenanceController.getEquipmentMaintenanceStatus
);

// Get items requiring maintenance
router.get('/equipment/requiring', 
  requireRole(['Admin', 'Store Keeper', 'Employee']),
  maintenanceController.getItemsRequiringMaintenance
);

// ==================== MAINTENANCE HISTORY ====================

// Get maintenance history for item
router.get('/equipment/:itemId/history', 
  requireRole(['Admin', 'Store Keeper', 'Employee']),
  maintenanceController.getItemMaintenanceHistory
);

// Get maintenance statistics
router.get('/statistics/overview', 
  requireRole(['Admin', 'Store Keeper']),
  maintenanceController.getMaintenanceStatistics
);

module.exports = router;
