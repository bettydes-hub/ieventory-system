const express = require('express');
const router = express.Router();
const damageController = require('../controllers/damageController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Apply authentication to all routes
router.use(authenticateToken);

// ==================== DAMAGE REPORTING ====================

// Create damage report (All authenticated users)
router.post('/',
  damageController.createDamageReport
);

// Get user's damage reports (All authenticated users)
router.get('/my-reports',
  damageController.getUserDamageReports
);

// ==================== DAMAGE MANAGEMENT ====================

// Get all damage reports (Store Keepers and Admins)
router.get('/',
  requireRole(['Store Keeper', 'Admin']),
  damageController.getAllDamageReports
);

// Update damage status (Store Keepers and Admins)
router.patch('/:damageId/status',
  requireRole(['Store Keeper', 'Admin']),
  damageController.updateDamageStatus
);

// ==================== DASHBOARD DATA ====================

// Get damage statistics
router.get('/stats',
  damageController.getDamageStats
);

module.exports = router;
