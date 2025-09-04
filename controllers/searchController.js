const { 
  Item, 
  Transaction, 
  Delivery, 
  User, 
  Store, 
  Category, 
  Supplier,
  MaintenanceLog,
  Damage,
  AuditLog
} = require('../models');
const { Op } = require('sequelize');

class SearchController {
  // ==================== ADVANCED SEARCH FUNCTIONALITY ====================
  
  /**
   * Global search across all entities
   */
  async globalSearch(req, res) {
    try {
      const { 
        query, 
        page = 1, 
        limit = 10, 
        entities = ['items', 'transactions', 'deliveries', 'users', 'stores', 'categories', 'suppliers', 'maintenance', 'damages'],
        dateFrom,
        dateTo
      } = req.query;
      
      if (!query || query.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Search query must be at least 2 characters long'
        });
      }
      
      const offset = (page - 1) * limit;
      const searchTerm = query.trim();
      const results = {};
      const totalResults = {};
      
      // Build date filter if provided
      const dateFilter = {};
      if (dateFrom || dateTo) {
        dateFilter.createdAt = {};
        if (dateFrom) dateFilter.createdAt[Op.gte] = new Date(dateFrom);
        if (dateTo) dateFilter.createdAt[Op.lte] = new Date(dateTo);
      }
      
      // Search Items
      if (entities.includes('items')) {
        const { count: itemCount, rows: items } = await Item.findAndCountAll({
          where: {
            [Op.and]: [
              dateFilter,
              {
                [Op.or]: [
                  { name: { [Op.iLike]: `%${searchTerm}%` } },
                  { description: { [Op.iLike]: `%${searchTerm}%` } },
                  { model: { [Op.iLike]: `%${searchTerm}%` } },
                  { serialNumber: { [Op.iLike]: `%${searchTerm}%` } },
                  { manufacturer: { [Op.iLike]: `%${searchTerm}%` } },
                  { barcode: { [Op.iLike]: `%${searchTerm}%` } }
                ]
              }
            ]
          },
          include: [
            { model: Category, attributes: ['categoryId', 'name'] },
            { model: Store, attributes: ['storeId', 'name', 'location'] },
            { model: Supplier, attributes: ['supplierId', 'name'] }
          ],
          limit: parseInt(limit),
          offset: parseInt(offset),
          order: [['name', 'ASC']]
        });
        
        results.items = items;
        totalResults.items = itemCount;
      }
      
      // Search Transactions
      if (entities.includes('transactions')) {
        const { count: transactionCount, rows: transactions } = await Transaction.findAndCountAll({
          where: {
            [Op.and]: [
              dateFilter,
              {
                [Op.or]: [
                  { transactionType: { [Op.iLike]: `%${searchTerm}%` } },
                  { status: { [Op.iLike]: `%${searchTerm}%` } },
                  { notes: { [Op.iLike]: `%${searchTerm}%` } },
                  { purpose: { [Op.iLike]: `%${searchTerm}%` } }
                ]
              }
            ]
          },
          include: [
            { model: User, as: 'borrower', attributes: ['userId', 'name', 'email'] },
            { model: User, as: 'approver', attributes: ['userId', 'name', 'email'] },
            { model: Item, attributes: ['itemId', 'name', 'model', 'serialNumber'] },
            { model: Store, attributes: ['storeId', 'name', 'location'] }
          ],
          limit: parseInt(limit),
          offset: parseInt(offset),
          order: [['createdAt', 'DESC']]
        });
        
        results.transactions = transactions;
        totalResults.transactions = transactionCount;
      }
      
      // Search Deliveries
      if (entities.includes('deliveries')) {
        const { count: deliveryCount, rows: deliveries } = await Delivery.findAndCountAll({
          where: {
            [Op.and]: [
              dateFilter,
              {
                [Op.or]: [
                  { status: { [Op.iLike]: `%${searchTerm}%` } },
                  { deliveryType: { [Op.iLike]: `%${searchTerm}%` } },
                  { notes: { [Op.iLike]: `%${searchTerm}%` } },
                  { trackingNumber: { [Op.iLike]: `%${searchTerm}%` } }
                ]
              }
            ]
          },
          include: [
            { model: User, as: 'assignedTo', attributes: ['userId', 'name', 'email'] },
            { model: Transaction, attributes: ['transactionId', 'transactionType'] },
            { model: Store, as: 'fromStore', attributes: ['storeId', 'name', 'location'] },
            { model: Store, as: 'toStore', attributes: ['storeId', 'name', 'location'] }
          ],
          limit: parseInt(limit),
          offset: parseInt(offset),
          order: [['createdAt', 'DESC']]
        });
        
        results.deliveries = deliveries;
        totalResults.deliveries = deliveryCount;
      }
      
      // Search Users
      if (entities.includes('users')) {
        const { count: userCount, rows: users } = await User.findAndCountAll({
          where: {
            [Op.and]: [
              dateFilter,
              {
                [Op.or]: [
                  { name: { [Op.iLike]: `%${searchTerm}%` } },
                  { email: { [Op.iLike]: `%${searchTerm}%` } },
                  { role: { [Op.iLike]: `%${searchTerm}%` } },
                  { department: { [Op.iLike]: `%${searchTerm}%` } }
                ]
              }
            ]
          },
          attributes: ['userId', 'name', 'email', 'role', 'department', 'isActive'],
          limit: parseInt(limit),
          offset: parseInt(offset),
          order: [['name', 'ASC']]
        });
        
        results.users = users;
        totalResults.users = userCount;
      }
      
      // Search Stores
      if (entities.includes('stores')) {
        const { count: storeCount, rows: stores } = await Store.findAndCountAll({
          where: {
            [Op.and]: [
              dateFilter,
              {
                [Op.or]: [
                  { name: { [Op.iLike]: `%${searchTerm}%` } },
                  { location: { [Op.iLike]: `%${searchTerm}%` } },
                  { description: { [Op.iLike]: `%${searchTerm}%` } }
                ]
              }
            ]
          },
          limit: parseInt(limit),
          offset: parseInt(offset),
          order: [['name', 'ASC']]
        });
        
        results.stores = stores;
        totalResults.stores = storeCount;
      }
      
      // Search Categories
      if (entities.includes('categories')) {
        const { count: categoryCount, rows: categories } = await Category.findAndCountAll({
          where: {
            [Op.and]: [
              dateFilter,
              {
                [Op.or]: [
                  { name: { [Op.iLike]: `%${searchTerm}%` } },
                  { description: { [Op.iLike]: `%${searchTerm}%` } }
                ]
              }
            ]
          },
          include: [
            { model: Category, as: 'parent', attributes: ['categoryId', 'name'] }
          ],
          limit: parseInt(limit),
          offset: parseInt(offset),
          order: [['name', 'ASC']]
        });
        
        results.categories = categories;
        totalResults.categories = categoryCount;
      }
      
      // Search Suppliers
      if (entities.includes('suppliers')) {
        const { count: supplierCount, rows: suppliers } = await Supplier.findAndCountAll({
          where: {
            [Op.and]: [
              dateFilter,
              {
                [Op.or]: [
                  { name: { [Op.iLike]: `%${searchTerm}%` } },
                  { contact: { [Op.iLike]: `%${searchTerm}%` } },
                  { email: { [Op.iLike]: `%${searchTerm}%` } },
                  { address: { [Op.iLike]: `%${searchTerm}%` } }
                ]
              }
            ]
          },
          limit: parseInt(limit),
          offset: parseInt(offset),
          order: [['name', 'ASC']]
        });
        
        results.suppliers = suppliers;
        totalResults.suppliers = supplierCount;
      }
      
      // Search Maintenance Logs
      if (entities.includes('maintenance')) {
        const { count: maintenanceCount, rows: maintenance } = await MaintenanceLog.findAndCountAll({
          where: {
            [Op.and]: [
              dateFilter,
              {
                [Op.or]: [
                  { title: { [Op.iLike]: `%${searchTerm}%` } },
                  { description: { [Op.iLike]: `%${searchTerm}%` } },
                  { maintenanceType: { [Op.iLike]: `%${searchTerm}%` } },
                  { notes: { [Op.iLike]: `%${searchTerm}%` } }
                ]
              }
            ]
          },
          include: [
            { model: Item, attributes: ['itemId', 'name', 'model', 'serialNumber'] },
            { model: User, as: 'assignedUser', attributes: ['userId', 'name', 'email'] }
          ],
          limit: parseInt(limit),
          offset: parseInt(offset),
          order: [['scheduledDate', 'DESC']]
        });
        
        results.maintenance = maintenance;
        totalResults.maintenance = maintenanceCount;
      }
      
      // Search Damages
      if (entities.includes('damages')) {
        const { count: damageCount, rows: damages } = await Damage.findAndCountAll({
          where: {
            [Op.and]: [
              dateFilter,
              {
                [Op.or]: [
                  { damageType: { [Op.iLike]: `%${searchTerm}%` } },
                  { severity: { [Op.iLike]: `%${searchTerm}%` } },
                  { description: { [Op.iLike]: `%${searchTerm}%` } },
                  { notes: { [Op.iLike]: `%${searchTerm}%` } }
                ]
              }
            ]
          },
          include: [
            { model: Item, attributes: ['itemId', 'name', 'model', 'serialNumber'] },
            { model: User, as: 'reportedBy', attributes: ['userId', 'name', 'email'] }
          ],
          limit: parseInt(limit),
          offset: parseInt(offset),
          order: [['createdAt', 'DESC']]
        });
        
        results.damages = damages;
        totalResults.damages = damageCount;
      }
      
      // Calculate total results across all entities
      const totalCount = Object.values(totalResults).reduce((sum, count) => sum + count, 0);
      
      res.json({
        success: true,
        data: {
          query: searchTerm,
          results,
          totalResults,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalCount / limit),
            totalResults: totalCount,
            resultsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Error in global search:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to perform global search',
        error: error.message
      });
    }
  }
  
  // ==================== MULTI-CRITERIA FILTERING ====================
  
  /**
   * Advanced multi-criteria search for items
   */
  async searchItems(req, res) {
    try {
      const {
        query,
        page = 1,
        limit = 10,
        category,
        store,
        supplier,
        status,
        minQuantity,
        maxQuantity,
        minPrice,
        maxPrice,
        dateFrom,
        dateTo,
        sortBy = 'name',
        sortOrder = 'ASC'
      } = req.query;
      
      const offset = (page - 1) * limit;
      const whereClause = {};
      
      // Text search
      if (query && query.trim().length >= 2) {
        const searchTerm = query.trim();
        whereClause[Op.or] = [
          { name: { [Op.iLike]: `%${searchTerm}%` } },
          { description: { [Op.iLike]: `%${searchTerm}%` } },
          { model: { [Op.iLike]: `%${searchTerm}%` } },
          { serialNumber: { [Op.iLike]: `%${searchTerm}%` } },
          { manufacturer: { [Op.iLike]: `%${searchTerm}%` } },
          { barcode: { [Op.iLike]: `%${searchTerm}%` } }
        ];
      }
      
      // Category filter
      if (category) {
        whereClause.categoryId = category;
      }
      
      // Store filter
      if (store) {
        whereClause.storeId = store;
      }
      
      // Supplier filter
      if (supplier) {
        whereClause.supplierId = supplier;
      }
      
      // Status filter
      if (status) {
        whereClause.status = status;
      }
      
      // Quantity range filter
      if (minQuantity || maxQuantity) {
        whereClause.quantity = {};
        if (minQuantity) whereClause.quantity[Op.gte] = parseInt(minQuantity);
        if (maxQuantity) whereClause.quantity[Op.lte] = parseInt(maxQuantity);
      }
      
      // Price range filter
      if (minPrice || maxPrice) {
        whereClause.purchasePrice = {};
        if (minPrice) whereClause.purchasePrice[Op.gte] = parseFloat(minPrice);
        if (maxPrice) whereClause.purchasePrice[Op.lte] = parseFloat(maxPrice);
      }
      
      // Date range filter
      if (dateFrom || dateTo) {
        whereClause.createdAt = {};
        if (dateFrom) whereClause.createdAt[Op.gte] = new Date(dateFrom);
        if (dateTo) whereClause.createdAt[Op.lte] = new Date(dateTo);
      }
      
      const { count, rows: items } = await Item.findAndCountAll({
        where: whereClause,
        include: [
          { model: Category, attributes: ['categoryId', 'name', 'description'] },
          { model: Store, attributes: ['storeId', 'name', 'location'] },
          { model: Supplier, attributes: ['supplierId', 'name', 'contact'] }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[sortBy, sortOrder.toUpperCase()]]
      });
      
      res.json({
        success: true,
        data: {
          items,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            itemsPerPage: parseInt(limit)
          },
          filters: {
            query,
            category,
            store,
            supplier,
            status,
            minQuantity,
            maxQuantity,
            minPrice,
            maxPrice,
            dateFrom,
            dateTo
          }
        }
      });
    } catch (error) {
      console.error('Error searching items:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search items',
        error: error.message
      });
    }
  }
  
  /**
   * Advanced multi-criteria search for transactions
   */
  async searchTransactions(req, res) {
    try {
      const {
        query,
        page = 1,
        limit = 10,
        transactionType,
        status,
        borrower,
        approver,
        store,
        dateFrom,
        dateTo,
        minAmount,
        maxAmount,
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = req.query;
      
      const offset = (page - 1) * limit;
      const whereClause = {};
      
      // Text search
      if (query && query.trim().length >= 2) {
        const searchTerm = query.trim();
        whereClause[Op.or] = [
          { transactionType: { [Op.iLike]: `%${searchTerm}%` } },
          { status: { [Op.iLike]: `%${searchTerm}%` } },
          { notes: { [Op.iLike]: `%${searchTerm}%` } },
          { purpose: { [Op.iLike]: `%${searchTerm}%` } }
        ];
      }
      
      // Transaction type filter
      if (transactionType) {
        whereClause.transactionType = transactionType;
      }
      
      // Status filter
      if (status) {
        whereClause.status = status;
      }
      
      // Borrower filter
      if (borrower) {
        whereClause.borrowerId = borrower;
      }
      
      // Approver filter
      if (approver) {
        whereClause.approverId = approver;
      }
      
      // Store filter
      if (store) {
        whereClause.storeId = store;
      }
      
      // Date range filter
      if (dateFrom || dateTo) {
        whereClause.createdAt = {};
        if (dateFrom) whereClause.createdAt[Op.gte] = new Date(dateFrom);
        if (dateTo) whereClause.createdAt[Op.lte] = new Date(dateTo);
      }
      
      // Amount range filter
      if (minAmount || maxAmount) {
        whereClause.amount = {};
        if (minAmount) whereClause.amount[Op.gte] = parseFloat(minAmount);
        if (maxAmount) whereClause.amount[Op.lte] = parseFloat(maxAmount);
      }
      
      const { count, rows: transactions } = await Transaction.findAndCountAll({
        where: whereClause,
        include: [
          { model: User, as: 'borrower', attributes: ['userId', 'name', 'email', 'role'] },
          { model: User, as: 'approver', attributes: ['userId', 'name', 'email', 'role'] },
          { model: Item, attributes: ['itemId', 'name', 'model', 'serialNumber'] },
          { model: Store, attributes: ['storeId', 'name', 'location'] }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[sortBy, sortOrder.toUpperCase()]]
      });
      
      res.json({
        success: true,
        data: {
          transactions,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalTransactions: count,
            transactionsPerPage: parseInt(limit)
          },
          filters: {
            query,
            transactionType,
            status,
            borrower,
            approver,
            store,
            dateFrom,
            dateTo,
            minAmount,
            maxAmount
          }
        }
      });
    } catch (error) {
      console.error('Error searching transactions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search transactions',
        error: error.message
      });
    }
  }
  
  /**
   * Advanced multi-criteria search for deliveries
   */
  async searchDeliveries(req, res) {
    try {
      const {
        query,
        page = 1,
        limit = 10,
        status,
        deliveryType,
        assignedTo,
        fromStore,
        toStore,
        dateFrom,
        dateTo,
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = req.query;
      
      const offset = (page - 1) * limit;
      const whereClause = {};
      
      // Text search
      if (query && query.trim().length >= 2) {
        const searchTerm = query.trim();
        whereClause[Op.or] = [
          { status: { [Op.iLike]: `%${searchTerm}%` } },
          { deliveryType: { [Op.iLike]: `%${searchTerm}%` } },
          { notes: { [Op.iLike]: `%${searchTerm}%` } },
          { trackingNumber: { [Op.iLike]: `%${searchTerm}%` } }
        ];
      }
      
      // Status filter
      if (status) {
        whereClause.status = status;
      }
      
      // Delivery type filter
      if (deliveryType) {
        whereClause.deliveryType = deliveryType;
      }
      
      // Assigned to filter
      if (assignedTo) {
        whereClause.assignedTo = assignedTo;
      }
      
      // From store filter
      if (fromStore) {
        whereClause.fromStoreId = fromStore;
      }
      
      // To store filter
      if (toStore) {
        whereClause.toStoreId = toStore;
      }
      
      // Date range filter
      if (dateFrom || dateTo) {
        whereClause.createdAt = {};
        if (dateFrom) whereClause.createdAt[Op.gte] = new Date(dateFrom);
        if (dateTo) whereClause.createdAt[Op.lte] = new Date(dateTo);
      }
      
      const { count, rows: deliveries } = await Delivery.findAndCountAll({
        where: whereClause,
        include: [
          { model: User, as: 'assignedTo', attributes: ['userId', 'name', 'email', 'role'] },
          { model: Transaction, attributes: ['transactionId', 'transactionType', 'status'] },
          { model: Store, as: 'fromStore', attributes: ['storeId', 'name', 'location'] },
          { model: Store, as: 'toStore', attributes: ['storeId', 'name', 'location'] }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[sortBy, sortOrder.toUpperCase()]]
      });
      
      res.json({
        success: true,
        data: {
          deliveries,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalDeliveries: count,
            deliveriesPerPage: parseInt(limit)
          },
          filters: {
            query,
            status,
            deliveryType,
            assignedTo,
            fromStore,
            toStore,
            dateFrom,
            dateTo
          }
        }
      });
    } catch (error) {
      console.error('Error searching deliveries:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search deliveries',
        error: error.message
      });
    }
  }
  
  // ==================== FULL-TEXT SEARCH ====================
  
  /**
   * Full-text search with ranking and relevance
   */
  async fullTextSearch(req, res) {
    try {
      const {
        query,
        page = 1,
        limit = 10,
        entity = 'items',
        fields = ['name', 'description', 'model', 'manufacturer'],
        minScore = 0.1
      } = req.query;
      
      if (!query || query.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Search query must be at least 2 characters long'
        });
      }
      
      const offset = (page - 1) * limit;
      const searchTerm = query.trim();
      const searchWords = searchTerm.split(/\s+/);
      
      let results = [];
      let totalCount = 0;
      
      if (entity === 'items') {
        // Build full-text search conditions
        const searchConditions = fields.map(field => {
          const conditions = searchWords.map(word => ({
            [field]: { [Op.iLike]: `%${word}%` }
          }));
          return { [Op.or]: conditions };
        });
        
        const { count, rows } = await Item.findAndCountAll({
          where: {
            [Op.and]: searchConditions
          },
          include: [
            { model: Category, attributes: ['categoryId', 'name'] },
            { model: Store, attributes: ['storeId', 'name', 'location'] },
            { model: Supplier, attributes: ['supplierId', 'name'] }
          ],
          limit: parseInt(limit),
          offset: parseInt(offset),
          order: [['name', 'ASC']]
        });
        
        // Calculate relevance scores
        results = rows.map(item => {
          let score = 0;
          const itemData = item.toJSON();
          
          fields.forEach(field => {
            if (itemData[field]) {
              const fieldValue = itemData[field].toLowerCase();
              searchWords.forEach(word => {
                if (fieldValue.includes(word.toLowerCase())) {
                  score += 1;
                  // Bonus for exact matches
                  if (fieldValue === word.toLowerCase()) {
                    score += 2;
                  }
                  // Bonus for field importance
                  if (field === 'name') score += 1;
                  if (field === 'description') score += 0.5;
                }
              });
            }
          });
          
          return {
            ...itemData,
            relevanceScore: score / (searchWords.length * fields.length)
          };
        }).filter(item => item.relevanceScore >= parseFloat(minScore))
          .sort((a, b) => b.relevanceScore - a.relevanceScore);
        
        totalCount = count;
      }
      
      res.json({
        success: true,
        data: {
          query: searchTerm,
          entity,
          results,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalCount / limit),
            totalResults: totalCount,
            resultsPerPage: parseInt(limit)
          },
          searchConfig: {
            fields,
            minScore
          }
        }
      });
    } catch (error) {
      console.error('Error in full-text search:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to perform full-text search',
        error: error.message
      });
    }
  }
  
  // ==================== SEARCH ACROSS MULTIPLE ENTITIES ====================
  
  /**
   * Search across items, transactions, and deliveries with relationships
   */
  async crossEntitySearch(req, res) {
    try {
      const {
        query,
        page = 1,
        limit = 10,
        includeRelations = true,
        dateFrom,
        dateTo
      } = req.query;
      
      if (!query || query.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Search query must be at least 2 characters long'
        });
      }
      
      const offset = (page - 1) * limit;
      const searchTerm = query.trim();
      const results = {
        items: [],
        transactions: [],
        deliveries: [],
        relatedData: {}
      };
      
      // Build date filter
      const dateFilter = {};
      if (dateFrom || dateTo) {
        dateFilter.createdAt = {};
        if (dateFrom) dateFilter.createdAt[Op.gte] = new Date(dateFrom);
        if (dateTo) dateFilter.createdAt[Op.lte] = new Date(dateTo);
      }
      
      // Search items
      const { count: itemCount, rows: items } = await Item.findAndCountAll({
        where: {
          [Op.and]: [
            dateFilter,
            {
              [Op.or]: [
                { name: { [Op.iLike]: `%${searchTerm}%` } },
                { model: { [Op.iLike]: `%${searchTerm}%` } },
                { serialNumber: { [Op.iLike]: `%${searchTerm}%` } },
                { manufacturer: { [Op.iLike]: `%${searchTerm}%` } }
              ]
            }
          ]
        },
        include: includeRelations ? [
          { model: Category, attributes: ['categoryId', 'name'] },
          { model: Store, attributes: ['storeId', 'name', 'location'] },
          { model: Supplier, attributes: ['supplierId', 'name'] }
        ] : [],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['name', 'ASC']]
      });
      
      results.items = items;
      
      // Get related transactions for found items
      if (includeRelations && items.length > 0) {
        const itemIds = items.map(item => item.itemId);
        const relatedTransactions = await Transaction.findAll({
          where: {
            itemId: { [Op.in]: itemIds }
          },
          include: [
            { model: User, as: 'borrower', attributes: ['userId', 'name', 'email'] },
            { model: User, as: 'approver', attributes: ['userId', 'name', 'email'] }
          ],
          order: [['createdAt', 'DESC']],
          limit: 50
        });
        
        results.relatedData.transactions = relatedTransactions;
        
        // Get related deliveries for found transactions
        if (relatedTransactions.length > 0) {
          const transactionIds = relatedTransactions.map(t => t.transactionId);
          const relatedDeliveries = await Delivery.findAll({
            where: {
              transactionId: { [Op.in]: transactionIds }
            },
            include: [
              { model: User, as: 'assignedTo', attributes: ['userId', 'name', 'email'] }
            ],
            order: [['createdAt', 'DESC']],
            limit: 50
          });
          
          results.relatedData.deliveries = relatedDeliveries;
        }
      }
      
      // Search transactions
      const { count: transactionCount, rows: transactions } = await Transaction.findAndCountAll({
        where: {
          [Op.and]: [
            dateFilter,
            {
              [Op.or]: [
                { transactionType: { [Op.iLike]: `%${searchTerm}%` } },
                { status: { [Op.iLike]: `%${searchTerm}%` } },
                { notes: { [Op.iLike]: `%${searchTerm}%` } }
              ]
            }
          ]
        },
        include: includeRelations ? [
          { model: User, as: 'borrower', attributes: ['userId', 'name', 'email'] },
          { model: User, as: 'approver', attributes: ['userId', 'name', 'email'] },
          { model: Item, attributes: ['itemId', 'name', 'model', 'serialNumber'] }
        ] : [],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });
      
      results.transactions = transactions;
      
      // Search deliveries
      const { count: deliveryCount, rows: deliveries } = await Delivery.findAndCountAll({
        where: {
          [Op.and]: [
            dateFilter,
            {
              [Op.or]: [
                { status: { [Op.iLike]: `%${searchTerm}%` } },
                { deliveryType: { [Op.iLike]: `%${searchTerm}%` } },
                { trackingNumber: { [Op.iLike]: `%${searchTerm}%` } }
              ]
            }
          ]
        },
        include: includeRelations ? [
          { model: User, as: 'assignedTo', attributes: ['userId', 'name', 'email'] },
          { model: Transaction, attributes: ['transactionId', 'transactionType'] }
        ] : [],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });
      
      results.deliveries = deliveries;
      
      const totalCount = itemCount + transactionCount + deliveryCount;
      
      res.json({
        success: true,
        data: {
          query: searchTerm,
          results,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalCount / limit),
            totalResults: totalCount,
            resultsPerPage: parseInt(limit)
          },
          summary: {
            itemsFound: itemCount,
            transactionsFound: transactionCount,
            deliveriesFound: deliveryCount,
            totalFound: totalCount
          }
        }
      });
    } catch (error) {
      console.error('Error in cross-entity search:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to perform cross-entity search',
        error: error.message
      });
    }
  }
  
  // ==================== SEARCH SUGGESTIONS & AUTOCOMPLETE ====================
  
  /**
   * Get search suggestions for autocomplete
   */
  async getSearchSuggestions(req, res) {
    try {
      const { query, entity = 'items', limit = 10 } = req.query;
      
      if (!query || query.trim().length < 1) {
        return res.status(400).json({
          success: false,
          message: 'Query parameter is required'
        });
      }
      
      const searchTerm = query.trim();
      let suggestions = [];
      
      if (entity === 'items') {
        const items = await Item.findAll({
          where: {
            [Op.or]: [
              { name: { [Op.iLike]: `%${searchTerm}%` } },
              { model: { [Op.iLike]: `%${searchTerm}%` } },
              { serialNumber: { [Op.iLike]: `%${searchTerm}%` } },
              { manufacturer: { [Op.iLike]: `%${searchTerm}%` } }
            ]
          },
          attributes: ['itemId', 'name', 'model', 'serialNumber', 'manufacturer'],
          limit: parseInt(limit),
          order: [['name', 'ASC']]
        });
        
        suggestions = items.map(item => ({
          id: item.itemId,
          text: item.name,
          subtitle: `${item.model} - ${item.manufacturer}`,
          type: 'item'
        }));
      } else if (entity === 'users') {
        const users = await User.findAll({
          where: {
            [Op.or]: [
              { name: { [Op.iLike]: `%${searchTerm}%` } },
              { email: { [Op.iLike]: `%${searchTerm}%` } }
            ]
          },
          attributes: ['userId', 'name', 'email', 'role'],
          limit: parseInt(limit),
          order: [['name', 'ASC']]
        });
        
        suggestions = users.map(user => ({
          id: user.userId,
          text: user.name,
          subtitle: `${user.email} - ${user.role}`,
          type: 'user'
        }));
      } else if (entity === 'stores') {
        const stores = await Store.findAll({
          where: {
            [Op.or]: [
              { name: { [Op.iLike]: `%${searchTerm}%` } },
              { location: { [Op.iLike]: `%${searchTerm}%` } }
            ]
          },
          attributes: ['storeId', 'name', 'location'],
          limit: parseInt(limit),
          order: [['name', 'ASC']]
        });
        
        suggestions = stores.map(store => ({
          id: store.storeId,
          text: store.name,
          subtitle: store.location,
          type: 'store'
        }));
      }
      
      res.json({
        success: true,
        data: {
          query: searchTerm,
          entity,
          suggestions
        }
      });
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get search suggestions',
        error: error.message
      });
    }
  }
  
  // ==================== SEARCH ANALYTICS ====================
  
  /**
   * Get search analytics and popular searches
   */
  async getSearchAnalytics(req, res) {
    try {
      const { period = '30' } = req.query; // days
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(period));
      
      // This would typically come from a search logs table
      // For now, we'll return mock data
      const analytics = {
        totalSearches: 1250,
        uniqueSearches: 890,
        popularQueries: [
          { query: 'laptop', count: 45 },
          { query: 'dell', count: 32 },
          { query: 'maintenance', count: 28 },
          { query: 'delivery', count: 25 },
          { query: 'transaction', count: 22 }
        ],
        searchByEntity: [
          { entity: 'items', count: 650 },
          { entity: 'transactions', count: 320 },
          { entity: 'deliveries', count: 180 },
          { entity: 'users', count: 100 }
        ],
        searchTrends: [
          { date: '2024-01-01', searches: 45 },
          { date: '2024-01-02', searches: 52 },
          { date: '2024-01-03', searches: 38 },
          { date: '2024-01-04', searches: 61 },
          { date: '2024-01-05', searches: 48 }
        ],
        averageResultsPerSearch: 12.5,
        zeroResultSearches: 45
      };
      
      res.json({
        success: true,
        data: {
          period: `${period} days`,
          analytics
        }
      });
    } catch (error) {
      console.error('Error getting search analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get search analytics',
        error: error.message
      });
    }
  }
}

module.exports = new SearchController();
