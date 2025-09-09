const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Apply authentication to all routes
router.use(authenticateToken);

// ==================== BORROW OPERATIONS ====================

// Create borrow request (Employees only)
router.post('/borrow', 
  requireRole(['Employee']),
  transactionController.createBorrowRequest
);

// Get user's borrow requests (Employees only)
router.get('/borrow/my-requests', 
  requireRole(['Employee']),
  transactionController.getUserBorrowRequests
);

// ==================== APPROVAL OPERATIONS ====================

// Get pending requests for approval (Store Keepers and Admins)
router.get('/pending', 
  requireRole(['Store Keeper', 'Admin']),
  transactionController.getPendingRequests
);

// Approve borrow request (Store Keepers and Admins)
router.patch('/:transactionId/approve', 
  requireRole(['Store Keeper', 'Admin']),
  transactionController.approveBorrowRequest
);

// Reject borrow request (Store Keepers and Admins)
router.patch('/:transactionId/reject', 
  requireRole(['Store Keeper', 'Admin']),
  transactionController.rejectBorrowRequest
);

// ==================== RETURN OPERATIONS ====================

// Return borrowed item (Employees only)
router.patch('/:transactionId/return', 
  requireRole(['Employee']),
  transactionController.returnItem
);

// ==================== DASHBOARD DATA ====================

// Get user dashboard statistics
router.get('/dashboard/stats', 
  transactionController.getUserDashboardStats
);

module.exports = router;
