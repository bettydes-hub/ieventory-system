const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Apply authentication to all routes
router.use(authenticateToken);

// ==================== ADVANCED SEARCH FUNCTIONALITY ====================

// Global search across all entities
router.get('/global', 
  requireRole(['Admin', 'Store Keeper', 'Employee']),
  searchController.globalSearch
);

// ==================== MULTI-CRITERIA FILTERING ====================

// Advanced multi-criteria search for items
router.get('/items', 
  requireRole(['Admin', 'Store Keeper', 'Employee']),
  searchController.searchItems
);

// Advanced multi-criteria search for transactions
router.get('/transactions', 
  requireRole(['Admin', 'Store Keeper', 'Employee']),
  searchController.searchTransactions
);

// Advanced multi-criteria search for deliveries
router.get('/deliveries', 
  requireRole(['Admin', 'Store Keeper', 'Employee']),
  searchController.searchDeliveries
);

// ==================== FULL-TEXT SEARCH ====================

// Full-text search with ranking and relevance
router.get('/fulltext', 
  requireRole(['Admin', 'Store Keeper', 'Employee']),
  searchController.fullTextSearch
);

// ==================== SEARCH ACROSS MULTIPLE ENTITIES ====================

// Search across items, transactions, and deliveries with relationships
router.get('/cross-entity', 
  requireRole(['Admin', 'Store Keeper', 'Employee']),
  searchController.crossEntitySearch
);

// ==================== SEARCH SUGGESTIONS & AUTOCOMPLETE ====================

// Get search suggestions for autocomplete
router.get('/suggestions', 
  requireRole(['Admin', 'Store Keeper', 'Employee']),
  searchController.getSearchSuggestions
);

// ==================== SEARCH ANALYTICS ====================

// Get search analytics and popular searches
router.get('/analytics', 
  requireRole(['Admin', 'Store Keeper']),
  searchController.getSearchAnalytics
);

module.exports = router;
