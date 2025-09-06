const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Apply authentication to all routes
router.use(authMiddleware);

// ==================== ADVANCED SEARCH FUNCTIONALITY ====================

// Global search across all entities
router.get('/global', 
  roleMiddleware(['Admin', 'Store Keeper', 'Employee']),
  searchController.globalSearch
);

// ==================== MULTI-CRITERIA FILTERING ====================

// Advanced multi-criteria search for items
router.get('/items', 
  roleMiddleware(['Admin', 'Store Keeper', 'Employee']),
  searchController.searchItems
);

// Advanced multi-criteria search for transactions
router.get('/transactions', 
  roleMiddleware(['Admin', 'Store Keeper', 'Employee']),
  searchController.searchTransactions
);

// Advanced multi-criteria search for deliveries
router.get('/deliveries', 
  roleMiddleware(['Admin', 'Store Keeper', 'Employee']),
  searchController.searchDeliveries
);

// ==================== FULL-TEXT SEARCH ====================

// Full-text search with ranking and relevance
router.get('/fulltext', 
  roleMiddleware(['Admin', 'Store Keeper', 'Employee']),
  searchController.fullTextSearch
);

// ==================== SEARCH ACROSS MULTIPLE ENTITIES ====================

// Search across items, transactions, and deliveries with relationships
router.get('/cross-entity', 
  roleMiddleware(['Admin', 'Store Keeper', 'Employee']),
  searchController.crossEntitySearch
);

// ==================== SEARCH SUGGESTIONS & AUTOCOMPLETE ====================

// Get search suggestions for autocomplete
router.get('/suggestions', 
  roleMiddleware(['Admin', 'Store Keeper', 'Employee']),
  searchController.getSearchSuggestions
);

// ==================== SEARCH ANALYTICS ====================

// Get search analytics and popular searches
router.get('/analytics', 
  roleMiddleware(['Admin', 'Store Keeper']),
  searchController.getSearchAnalytics
);

module.exports = router;
