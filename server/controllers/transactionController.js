const { Transaction, Item, User, Store, Category, AuditLog } = require('../models');
const { Op } = require('sequelize');
const { mapItemToFrontend, mapUserToFrontend } = require('../utils/fieldMapper');

class TransactionController {
  // ==================== BASIC OPERATIONS ====================
  
  /**
   * Get all transactions
   */
  async getAllTransactions(req, res) {
    try {
      const { page = 1, limit = 10, status, type } = req.query;
      const offset = (page - 1) * limit;
      
      const whereClause = {};
      if (status) whereClause.status = status;
      if (type) whereClause.transaction_type = type;
      
      const { count, rows: transactions } = await Transaction.findAndCountAll({
        where: whereClause,
        include: [
          { model: Item, attributes: ['item_id', 'name', 'description'] },
          { model: User, as: 'user', attributes: ['user_id', 'name', 'email'] }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      
      res.json({
        success: true,
        data: {
          transactions: transactions.map(t => ({
            id: t.transaction_id,
            type: t.transaction_type,
            status: t.status,
            quantity: t.quantity,
            dueDate: t.due_date,
            reason: t.reason,
            notes: t.notes,
            createdAt: t.created_at,
            item: t.Item ? {
              id: t.Item.item_id,
              name: t.Item.name,
              description: t.Item.description
            } : null,
            user: t.user ? {
              id: t.user.user_id,
              name: t.user.name,
              email: t.user.email
            } : null
          })),
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Error getting transactions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve transactions',
        error: error.message
      });
    }
  }

  // ==================== BORROW OPERATIONS ====================
  
  /**
   * Create a new borrow request
   */
  async createBorrowRequest(req, res) {
    try {
      const {
        itemId,
        quantity,
        dueDate,
        reason,
        notes
      } = req.body;
      
      const userId = req.user.userId;
      
      // Validate required fields
      if (!itemId || !quantity || !dueDate) {
        return res.status(400).json({
          success: false,
          message: 'Item ID, quantity, and due date are required'
        });
      }
      
      // Check if item exists and is available
      const item = await Item.findByPk(itemId, {
        include: [
          { model: Store, attributes: ['storeId', 'name', 'location'] },
          { model: Category, attributes: ['categoryId', 'name'] }
        ]
      });
      
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        });
      }
      
      if (item.status !== 'available') {
        return res.status(400).json({
          success: false,
          message: 'Item is not available for borrowing'
        });
      }
      
      if (item.amount < quantity) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock available'
        });
      }
      
      // Check if user already has a pending or approved borrow request for this item
      const existingRequest = await Transaction.findOne({
        where: {
          user_id: userId,
          item_id: itemId,
          transaction_type: 'Borrow',
          status: { [Op.in]: ['Pending', 'Approved'] }
        }
      });
      
      if (existingRequest) {
        return res.status(400).json({
          success: false,
          message: 'You already have a pending or approved request for this item'
        });
      }
      
      // Create borrow request
      const transaction = await Transaction.create({
        user_id: userId,
        item_id: itemId,
        transaction_type: 'Borrow',
        amount: quantity,
        due_date: new Date(dueDate),
        notes: notes || reason,
        status: 'Pending'
      });
      
      // Log audit
      await AuditLog.create({
        userId: userId,
        targetTable: 'transactions',
        targetId: transaction.transaction_id,
        actionType: 'CREATE',
        newValue: JSON.stringify(transaction.toJSON())
      });
      
      res.status(201).json({
        success: true,
        message: 'Borrow request created successfully',
        data: {
          transaction: {
            id: transaction.transaction_id,
            type: transaction.transaction_type,
            status: transaction.status,
            quantity: transaction.amount,
            dueDate: transaction.due_date,
            createdAt: transaction.created_at
          },
          item: mapItemToFrontend(item)
        }
      });
    } catch (error) {
      console.error('Error creating borrow request:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create borrow request',
        error: error.message
      });
    }
  }
  
  /**
   * Get user's borrow requests
   */
  async getUserBorrowRequests(req, res) {
    try {
      const userId = req.user.userId;
      const { status, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;
      
      const whereClause = {
        user_id: userId,
        transaction_type: 'Borrow'
      };
      
      if (status) {
        whereClause.status = status;
      }
      
      const { count, rows: transactions } = await Transaction.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Item,
            include: [
              { model: Store, attributes: ['storeId', 'name', 'location'] },
              { model: Category, attributes: ['categoryId', 'name'] }
            ]
          },
          {
            model: User,
            as: 'Approver',
            attributes: ['userId', 'name', 'email'],
            foreignKey: 'approved_by'
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });
      
      const mappedTransactions = transactions.map(transaction => {
        const data = transaction.toJSON();
        return {
          id: data.transaction_id,
          type: data.transaction_type,
          status: data.status,
          quantity: data.amount,
          dueDate: data.due_date,
          createdAt: data.created_at,
          approvedAt: data.approved_at,
          returnedAt: data.returned_at,
          notes: data.notes,
          rejectionReason: data.rejection_reason,
          returnCondition: data.return_condition,
          returnNotes: data.return_notes,
          item: mapItemToFrontend(data.Item),
          approver: data.Approver ? mapUserToFrontend(data.Approver) : null,
          daysUntilDue: transaction.getDaysUntilDue(),
          isOverdue: transaction.isOverdue()
        };
      });
      
      res.json({
        success: true,
        data: {
          transactions: mappedTransactions,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Error getting user borrow requests:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve borrow requests',
        error: error.message
      });
    }
  }
  
  // ==================== APPROVAL OPERATIONS ====================
  
  /**
   * Get pending borrow requests for approval (Store Keepers and Admins)
   */
  async getPendingRequests(req, res) {
    try {
      const { page = 1, limit = 10, storeId } = req.query;
      const offset = (page - 1) * limit;
      
      const whereClause = {
        status: 'Pending',
        transaction_type: 'Borrow'
      };
      
      const includeClause = [
        {
          model: Item,
          include: [
            { model: Store, attributes: ['storeId', 'name', 'location'] },
            { model: Category, attributes: ['categoryId', 'name'] }
          ]
        },
        {
          model: User,
          attributes: ['userId', 'name', 'email', 'role']
        }
      ];
      
      // Filter by store if specified
      if (storeId) {
        includeClause[0].where = { store_id: storeId };
      }
      
      const { count, rows: transactions } = await Transaction.findAndCountAll({
        where: whereClause,
        include: includeClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'ASC']]
      });
      
      const mappedTransactions = transactions.map(transaction => {
        const data = transaction.toJSON();
        return {
          id: data.transaction_id,
          type: data.transaction_type,
          status: data.status,
          quantity: data.amount,
          dueDate: data.due_date,
          createdAt: data.created_at,
          notes: data.notes,
          item: mapItemToFrontend(data.Item),
          user: mapUserToFrontend(data.User),
          daysUntilDue: transaction.getDaysUntilDue()
        };
      });
      
      res.json({
        success: true,
        data: {
          transactions: mappedTransactions,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Error getting pending requests:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve pending requests',
        error: error.message
      });
    }
  }
  
  /**
   * Approve a borrow request
   */
  async approveBorrowRequest(req, res) {
    try {
      const { transactionId } = req.params;
      const approverId = req.user.userId;
      
      const transaction = await Transaction.findByPk(transactionId, {
        include: [
          {
            model: Item,
            include: [
              { model: Store, attributes: ['storeId', 'name', 'location'] },
              { model: Category, attributes: ['categoryId', 'name'] }
            ]
          },
          {
            model: User,
            attributes: ['userId', 'name', 'email']
          }
        ]
      });
      
      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
      }
      
      if (!transaction.canBeApproved()) {
        return res.status(400).json({
          success: false,
          message: 'Transaction cannot be approved in its current status'
        });
      }
      
      // Check if item is still available
      if (transaction.Item.amount < transaction.amount) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock available for approval'
        });
      }
      
      // Update transaction status
      await transaction.update({
        status: 'Approved',
        approved_by: approverId,
        approved_at: new Date()
      });
      
      // Update item stock and status
      const newAmount = transaction.Item.amount - transaction.amount;
      const newStatus = newAmount === 0 ? 'reserved' : 'available';
      
      await transaction.Item.update({
        amount: newAmount,
        status: newStatus
      });
      
      // Log audit
      await AuditLog.create({
        userId: approverId,
        targetTable: 'transactions',
        targetId: transaction.transaction_id,
        actionType: 'APPROVE',
        oldValue: JSON.stringify({ status: 'Pending' }),
        newValue: JSON.stringify({ status: 'Approved', approved_by: approverId })
      });
      
      res.json({
        success: true,
        message: 'Borrow request approved successfully',
        data: {
          transaction: {
            id: transaction.transaction_id,
            status: 'Approved',
            approvedAt: transaction.approved_at
          },
          item: mapItemToFrontend(transaction.Item)
        }
      });
    } catch (error) {
      console.error('Error approving borrow request:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to approve borrow request',
        error: error.message
      });
    }
  }
  
  /**
   * Reject a borrow request
   */
  async rejectBorrowRequest(req, res) {
    try {
      const { transactionId } = req.params;
      const { rejectionReason } = req.body;
      const approverId = req.user.userId;
      
      const transaction = await Transaction.findByPk(transactionId);
      
      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
      }
      
      if (!transaction.canBeRejected()) {
        return res.status(400).json({
          success: false,
          message: 'Transaction cannot be rejected in its current status'
        });
      }
      
      // Update transaction status
      await transaction.update({
        status: 'Rejected',
        approved_by: approverId,
        approved_at: new Date(),
        rejection_reason: rejectionReason
      });
      
      // Log audit
      await AuditLog.create({
        userId: approverId,
        targetTable: 'transactions',
        targetId: transaction.transaction_id,
        actionType: 'REJECT',
        oldValue: JSON.stringify({ status: 'Pending' }),
        newValue: JSON.stringify({ 
          status: 'Rejected', 
          approved_by: approverId,
          rejection_reason: rejectionReason 
        })
      });
      
      res.json({
        success: true,
        message: 'Borrow request rejected successfully',
        data: {
          transaction: {
            id: transaction.transaction_id,
            status: 'Rejected',
            rejectedAt: transaction.approved_at,
            rejectionReason: transaction.rejection_reason
          }
        }
      });
    } catch (error) {
      console.error('Error rejecting borrow request:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reject borrow request',
        error: error.message
      });
    }
  }
  
  // ==================== RETURN OPERATIONS ====================
  
  /**
   * Return a borrowed item
   */
  async returnItem(req, res) {
    try {
      const { transactionId } = req.params;
      const {
        returnCondition = 'excellent',
        returnNotes
      } = req.body;
      
      const transaction = await Transaction.findByPk(transactionId, {
        include: [
          {
            model: Item,
            include: [
              { model: Store, attributes: ['storeId', 'name', 'location'] },
              { model: Category, attributes: ['categoryId', 'name'] }
            ]
          }
        ]
      });
      
      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
      }
      
      if (!transaction.canBeReturned()) {
        return res.status(400).json({
          success: false,
          message: 'Item cannot be returned in its current status'
        });
      }
      
      // Update transaction status
      await transaction.update({
        status: 'Completed',
        returned_at: new Date(),
        return_condition: returnCondition,
        return_notes: returnNotes
      });
      
      // Update item stock
      await transaction.Item.update({
        amount: transaction.Item.amount + transaction.amount,
        status: 'available'
      });
      
      // Log audit
      await AuditLog.create({
        userId: transaction.user_id,
        targetTable: 'transactions',
        targetId: transaction.transaction_id,
        actionType: 'RETURN',
        oldValue: JSON.stringify({ status: 'Approved' }),
        newValue: JSON.stringify({ 
          status: 'Completed',
          returned_at: new Date(),
          return_condition: returnCondition,
          return_notes: returnNotes
        })
      });
      
      res.json({
        success: true,
        message: 'Item returned successfully',
        data: {
          transaction: {
            id: transaction.transaction_id,
            status: 'Completed',
            returnedAt: transaction.returned_at,
            returnCondition: transaction.return_condition
          },
          item: mapItemToFrontend(transaction.Item)
        }
      });
    } catch (error) {
      console.error('Error returning item:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to return item',
        error: error.message
      });
    }
  }
  
  // ==================== DASHBOARD DATA ====================
  
  /**
   * Get dashboard statistics for user
   */
  async getUserDashboardStats(req, res) {
    try {
      const userId = req.user.userId;
      
      const [
        activeBorrows,
        overdueItems,
        pendingRequests,
        completedReturns
      ] = await Promise.all([
        Transaction.count({
          where: {
            user_id: userId,
            transaction_type: 'Borrow',
            status: 'Approved'
          }
        }),
        Transaction.count({
          where: {
            user_id: userId,
            transaction_type: 'Borrow',
            status: 'Approved',
            due_date: { [Op.lt]: new Date() }
          }
        }),
        Transaction.count({
          where: {
            user_id: userId,
            transaction_type: 'Borrow',
            status: 'Pending'
          }
        }),
        Transaction.count({
          where: {
            user_id: userId,
            transaction_type: 'Borrow',
            status: 'Completed'
          }
        })
      ]);
      
      res.json({
        success: true,
        data: {
          activeBorrows,
          overdueItems,
          pendingRequests,
          completedReturns
        }
      });
    } catch (error) {
      console.error('Error getting user dashboard stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve dashboard statistics',
        error: error.message
      });
    }
  }
}

module.exports = new TransactionController();
