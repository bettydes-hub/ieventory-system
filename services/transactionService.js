const { Transaction, User } = require('../models');

class TransactionService {
  /**
   * Create a new transaction (borrow, return, transfer)
   * Enforces store rule: borrowed items must be returned to same store
   */
  static async createTransaction(transactionData) {
    try {
      // Validate store rule for returns
      if (transactionData.transactionType === 'return') {
        const isValidReturn = await this.validateStoreReturn(
          transactionData.itemId,
          transactionData.storeId
        );
        
        if (!isValidReturn) {
          throw new Error('Store rule violation: Items must be returned to the same store they were borrowed from');
        }
      }

      // Create the transaction
      const transaction = await Transaction.create(transactionData);
      
      // Update overdue status if applicable
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
      // Find the original borrow transaction for this item
      const originalTransaction = await Transaction.findOne({
        where: {
          itemId: itemId,
          transactionType: 'borrow',
          status: ['approved', 'in_progress']
        },
        order: [['createdAt', 'DESC']]
      });

      if (!originalTransaction) {
        throw new Error('No active borrow transaction found for this item');
      }

      // Check if return store matches original store
      return originalTransaction.originalStoreId === returnStoreId;
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

      // Check if approver has permission
      const approver = await User.findByPk(approverId);
      if (!approver || !approver.canBeApproved(approver.role)) {
        throw new Error('Insufficient permissions to approve transactions');
      }

      // Update transaction status
      await transaction.update({
        status: 'approved',
        approvedBy: approverId,
        approvedDate: new Date()
      });

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
      if (!transaction.canReturnToStore(returnData.returnStoreId)) {
        throw new Error('Store rule violation: Items must be returned to the same store they were borrowed from');
      }

      // Update transaction
      await transaction.update({
        status: 'completed',
        returnedDate: new Date(),
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
      
      const transactions = await Transaction.findAll({
        where: {
          ...whereClause,
          status: ['approved', 'in_progress'],
          dueDate: { [require('sequelize').Op.not]: null }
        }
      });

      for (const transaction of transactions) {
        const isOverdue = transaction.isOverdue();
        const overdueDays = transaction.calculateOverdueDays();
        
        if (isOverdue) {
          await transaction.update({
            isOverdue: true,
            overdueDays: overdueDays,
            status: 'overdue'
          });
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
          isOverdue: true,
          status: 'overdue'
        },
        include: [
          {
            model: User,
            as: 'requester',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ],
        order: [['overdueDays', 'DESC']]
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
        acc[stat.status] = parseInt(stat.dataValues.count);
        return acc;
      }, {});
    } catch (error) {
      throw error;
    }
  }
}

module.exports = TransactionService;
