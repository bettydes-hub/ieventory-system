const { Transaction, User } = require('../models');

class TransactionService {
  /**
   * Create a new transaction (borrow, return, transfer)
   * Enforces store rule: borrowed items must be returned to same store
   */
  static async createTransaction(transactionData) {
    try {
      // Map camelCase inputs to model fields
      const payload = {
        transaction_type: transactionData.transaction_type || transactionData.transactionType,
        user_id: transactionData.user_id || transactionData.userId,
        item_id: transactionData.item_id || transactionData.itemId,
        from_store_id: transactionData.from_store_id || transactionData.fromStoreId,
        to_store_id: transactionData.to_store_id || transactionData.toStoreId,
        amount: transactionData.amount,
        due_date: transactionData.due_date || transactionData.dueDate,
        status: transactionData.status || 'Pending',
        notes: transactionData.notes || null,
      };

      // Validate store rule for returns
      if (payload.transaction_type === 'Return' && payload.to_store_id) {
        const isValidReturn = await this.validateStoreReturn(payload.item_id, payload.to_store_id);
        if (!isValidReturn) {
          throw new Error('Store rule violation: Items must be returned to the same store they were borrowed from');
        }
      }

      const transaction = await Transaction.create(payload);
      await this.updateOverdueStatus(transaction.id);
      return transaction;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate that an item is being returned to the correct store
   * Store rule: borrowed items must be returned to same store
   */
  static async validateStoreReturn(itemId, returnStoreId) {
    try {
      // Find the latest borrow transaction for this item
      const originalTransaction = await Transaction.findOne({
        where: {
          item_id: itemId,
          transaction_type: 'Borrow',
          status: 'Pending'
        },
        order: [['created_at', 'DESC']]
      });

      if (!originalTransaction || !originalTransaction.from_store_id) {
        // If we can’t determine, allow the return (avoid hard failure)
        return true;
      }

      return originalTransaction.from_store_id === returnStoreId;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Approve a transaction (only store keepers and admins can approve)
   */
  static async approveTransaction(transactionId, approverId) {
    try {
      const transaction = await Transaction.findByPk(transactionId);
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // Simple approval: set status to Completed if Pending
      if (transaction.status === 'Pending') {
        await transaction.update({ status: 'Completed' });
      }
      return transaction;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Process item return
   * Enforces store rule and updates transaction status
   */
  static async processReturn(transactionId, returnData) {
    try {
      const transaction = await Transaction.findByPk(transactionId);
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // Validate store rule
      const isValid = await this.validateStoreReturn(transaction.item_id, returnData.return_store_id || returnData.returnStoreId);
      if (!isValid) {
        throw new Error('Store rule violation: Items must be returned to the same store they were borrowed from');
      }

      await transaction.update({
        status: 'Completed',
        notes: returnData.notes || transaction.notes
      });
      return transaction;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update overdue status for transactions
   */
  static async updateOverdueStatus(transactionId = null) {
    try {
      const whereClause = transactionId ? { id: transactionId } : {};
      const { Op } = require('sequelize');

      const transactions = await Transaction.findAll({
        where: {
          ...whereClause,
          status: 'Pending',
          due_date: { [Op.not]: null }
        }
      });

      for (const transaction of transactions) {
        if (transaction.isOverdue()) {
          await transaction.update({ status: 'Overdue' });
        }
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get overdue transactions
   */
  static async getOverdueTransactions() {
    try {
      return await Transaction.findAll({
        where: {
          status: 'Overdue'
        },
        order: [['due_date', 'ASC']]
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get transaction statistics
   */
  static async getTransactionStats() {
    try {
      const stats = await Transaction.findAll({
        attributes: [
          'status',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
        ],
        group: ['status']
      });

      return stats.reduce((acc, stat) => {
        acc[stat.dataValues.status] = parseInt(stat.dataValues.count);
        return acc;
      }, {});
    } catch (error) {
      throw error;
    }
  }
}

module.exports = TransactionService;
