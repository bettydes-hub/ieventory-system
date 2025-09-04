const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Apply authentication to all routes
router.use(authMiddleware);

// ==================== CRUD OPERATIONS ====================

// Get all maintenance logs with pagination and filtering
router.get('/', 
  roleMiddleware(['Admin', 'Store Keeper', 'Employee']),
  maintenanceController.getAllMaintenanceLogs
);

// Get single maintenance log by ID
router.get('/:id', 
  roleMiddleware(['Admin', 'Store Keeper', 'Employee']),
  maintenanceController.getMaintenanceLogById
);

// Create new maintenance log (Admin and Store Keeper only)
router.post('/', 
  roleMiddleware(['Admin', 'Store Keeper']),
  maintenanceController.createMaintenanceLog
);

// Update maintenance log (Admin and Store Keeper only)
router.put('/:id', 
  roleMiddleware(['Admin', 'Store Keeper']),
  maintenanceController.updateMaintenanceLog
);

// Delete maintenance log (Admin only)
router.delete('/:id', 
  roleMiddleware(['Admin']),
  maintenanceController.deleteMaintenanceLog
);

// ==================== MAINTENANCE SCHEDULING ====================

// Get maintenance schedule
router.get('/schedule/list', 
  roleMiddleware(['Admin', 'Store Keeper', 'Employee']),
  maintenanceController.getMaintenanceSchedule
);

// Get upcoming maintenance
router.get('/schedule/upcoming', 
  roleMiddleware(['Admin', 'Store Keeper', 'Employee']),
  maintenanceController.getUpcomingMaintenance
);

// Reschedule maintenance
router.patch('/:id/reschedule', 
  roleMiddleware(['Admin', 'Store Keeper']),
  maintenanceController.rescheduleMaintenance
);

// ==================== MAINTENANCE LOGS MANAGEMENT ====================

// Start maintenance
router.patch('/:id/start', 
  roleMiddleware(['Admin', 'Store Keeper', 'Employee']),
  maintenanceController.startMaintenance
);

// Complete maintenance
router.patch('/:id/complete', 
  roleMiddleware(['Admin', 'Store Keeper', 'Employee']),
  maintenanceController.completeMaintenance
);

// Cancel maintenance
router.patch('/:id/cancel', 
  roleMiddleware(['Admin', 'Store Keeper']),
  maintenanceController.cancelMaintenance
);

// ==================== EQUIPMENT STATUS TRACKING ====================

// Get equipment maintenance status
router.get('/equipment/:itemId/status', 
  roleMiddleware(['Admin', 'Store Keeper', 'Employee']),
  maintenanceController.getEquipmentMaintenanceStatus
);

// Get items requiring maintenance
router.get('/equipment/requiring', 
  roleMiddleware(['Admin', 'Store Keeper', 'Employee']),
  maintenanceController.getItemsRequiringMaintenance
);

// ==================== MAINTENANCE HISTORY ====================

// Get maintenance history for item
router.get('/equipment/:itemId/history', 
  roleMiddleware(['Admin', 'Store Keeper', 'Employee']),
  maintenanceController.getItemMaintenanceHistory
);

// Get maintenance statistics
router.get('/statistics/overview', 
  roleMiddleware(['Admin', 'Store Keeper']),
  maintenanceController.getMaintenanceStatistics
);

module.exports = router;
