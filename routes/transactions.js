const express = require('express');
const router = express.Router();
const TransactionService = require('../services/transactionService');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireAuth, canApproveTransactions } = require('../middleware/roleMiddleware');

/**
 * @route   GET /api/transactions
 * @desc    Get all transactions
 * @access  Private
 */
router.get('/', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type, userId } = req.query;
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause = {};
    if (status) whereClause.status = status;
    if (type) whereClause.transactionType = type;
    if (userId) whereClause.userId = userId;

    const { Transaction, User } = require('../models');
    const transactions = await Transaction.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        transactions: transactions.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(transactions.count / limit),
          totalTransactions: transactions.count,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions'
    });
  }
});

/**
 * @route   GET /api/transactions/:id
 * @desc    Get transaction by ID
 * @access  Private
 */
router.get('/:id', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { Transaction, User } = require('../models');
    const transaction = await Transaction.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction'
    });
  }
});

/**
 * @route   POST /api/transactions
 * @desc    Create new transaction (borrow/return/transfer)
 * @access  Private
 */
router.post('/', authenticateToken, requireAuth, async (req, res) => {
  try {
    const transactionData = {
      ...req.body,
      userId: req.user.id // Set user from token
    };

    const transaction = await TransactionService.createTransaction(transactionData);

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: transaction
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   PUT /api/transactions/:id/approve
 * @desc    Approve transaction (Store Keeper/Admin only)
 * @access  Private/Store Keeper/Admin
 */
router.put('/:id/approve', authenticateToken, canApproveTransactions, async (req, res) => {
  try {
    const transaction = await TransactionService.approveTransaction(
      req.params.id,
      req.user.id
    );

    res.json({
      success: true,
      message: 'Transaction approved successfully',
      data: transaction
    });
  } catch (error) {
    console.error('Approve transaction error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   PUT /api/transactions/:id/return
 * @desc    Process item return
 * @access  Private
 */
router.put('/:id/return', authenticateToken, requireAuth, async (req, res) => {
  try {
    const returnData = req.body;
    const transaction = await TransactionService.processReturn(
      req.params.id,
      returnData
    );

    res.json({
      success: true,
      message: 'Item returned successfully',
      data: transaction
    });
  } catch (error) {
    console.error('Process return error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   GET /api/transactions/overdue
 * @desc    Get overdue transactions
 * @access  Private
 */
router.get('/overdue', authenticateToken, requireAuth, async (req, res) => {
  try {
    const overdueTransactions = await TransactionService.getOverdueTransactions();

    res.json({
      success: true,
      data: overdueTransactions
    });
  } catch (error) {
    console.error('Get overdue transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch overdue transactions'
    });
  }
});

/**
 * @route   GET /api/transactions/stats
 * @desc    Get transaction statistics
 * @access  Private
 */
router.get('/stats', authenticateToken, requireAuth, async (req, res) => {
  try {
    const stats = await TransactionService.getTransactionStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get transaction stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction statistics'
    });
  }
});

/**
 * @route   PUT /api/transactions/:id/status
 * @desc    Update transaction status
 * @access  Private
 */
router.put('/:id/status', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const { Transaction } = require('../models');

    const transaction = await Transaction.findByPk(req.params.id);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    await transaction.update({
      status,
      notes: notes || transaction.notes
    });

    res.json({
      success: true,
      message: 'Transaction status updated successfully',
      data: transaction
    });
  } catch (error) {
    console.error('Update transaction status error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
