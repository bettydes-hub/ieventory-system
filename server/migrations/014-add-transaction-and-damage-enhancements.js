'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add new fields to transactions table
    await queryInterface.addColumn('transactions', 'approved_by', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'user_id'
      },
      comment: 'User who approved/rejected the transaction'
    });

    await queryInterface.addColumn('transactions', 'approved_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'When the transaction was approved/rejected'
    });

    await queryInterface.addColumn('transactions', 'rejection_reason', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Reason for rejection if applicable'
    });

    await queryInterface.addColumn('transactions', 'returned_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'When the item was actually returned'
    });

    await queryInterface.addColumn('transactions', 'return_condition', {
      type: Sequelize.ENUM('excellent', 'good', 'fair', 'poor', 'damaged'),
      allowNull: true,
      comment: 'Condition of item when returned'
    });

    await queryInterface.addColumn('transactions', 'return_notes', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Notes about the return condition'
    });

    // Update transaction_type enum to include 'Purchase'
    await queryInterface.changeColumn('transactions', 'transaction_type', {
      type: Sequelize.ENUM('Borrow', 'Return', 'Transfer', 'Purchase'),
      allowNull: false
    });

    // Update status enum to include new statuses
    await queryInterface.changeColumn('transactions', 'status', {
      type: Sequelize.ENUM('Pending', 'Approved', 'Rejected', 'Completed', 'Overdue', 'Cancelled'),
      allowNull: false,
      defaultValue: 'Pending'
    });

    // Add severity field to damages table
    await queryInterface.addColumn('damages', 'severity', {
      type: Sequelize.ENUM('Low', 'Medium', 'High', 'Critical'),
      allowNull: false,
      defaultValue: 'Medium'
    });

    // Update damages status enum
    await queryInterface.changeColumn('damages', 'status', {
      type: Sequelize.ENUM('Pending', 'Under Review', 'Resolved'),
      allowNull: false,
      defaultValue: 'Pending'
    });

    // Add indexes for new fields
    await queryInterface.addIndex('transactions', ['approved_by']);
    await queryInterface.addIndex('transactions', ['approved_at']);
    await queryInterface.addIndex('transactions', ['returned_at']);
    await queryInterface.addIndex('damages', ['severity']);
  },

  async down(queryInterface, Sequelize) {
    // Remove indexes
    await queryInterface.removeIndex('transactions', ['approved_by']);
    await queryInterface.removeIndex('transactions', ['approved_at']);
    await queryInterface.removeIndex('transactions', ['returned_at']);
    await queryInterface.removeIndex('damages', ['severity']);

    // Remove columns from transactions table
    await queryInterface.removeColumn('transactions', 'approved_by');
    await queryInterface.removeColumn('transactions', 'approved_at');
    await queryInterface.removeColumn('transactions', 'rejection_reason');
    await queryInterface.removeColumn('transactions', 'returned_at');
    await queryInterface.removeColumn('transactions', 'return_condition');
    await queryInterface.removeColumn('transactions', 'return_notes');

    // Revert transaction_type enum
    await queryInterface.changeColumn('transactions', 'transaction_type', {
      type: Sequelize.ENUM('Borrow', 'Return', 'Transfer'),
      allowNull: false
    });

    // Revert status enum
    await queryInterface.changeColumn('transactions', 'status', {
      type: Sequelize.ENUM('Pending', 'Completed', 'Overdue'),
      allowNull: false,
      defaultValue: 'Pending'
    });

    // Remove severity field from damages table
    await queryInterface.removeColumn('damages', 'severity');

    // Revert damages status enum
    await queryInterface.changeColumn('damages', 'status', {
      type: Sequelize.ENUM('Pending', 'Fixed', 'Discarded'),
      allowNull: false,
      defaultValue: 'Pending'
    });
  }
};
