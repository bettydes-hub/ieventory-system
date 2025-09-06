'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('transactions', {
      transaction_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true
      },
      
      // User and Item Information
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      
      item_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'items',
          key: 'item_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      
      // Transaction Type
      transaction_type: {
        type: Sequelize.ENUM('Borrow', 'Return', 'Transfer'),
        allowNull: false
      },
      
      // Store Information (for transfers)
      from_store_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'stores',
          key: 'store_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      
      to_store_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'stores',
          key: 'store_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      
      // Transaction Details
      amount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1
        }
      },
      
      due_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      
      // Status
      status: {
        type: Sequelize.ENUM('Pending', 'Completed', 'Overdue'),
        allowNull: false,
        defaultValue: 'Pending'
      },
      
      // Timestamps
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for better performance
    await queryInterface.addIndex('transactions', ['user_id']);
    await queryInterface.addIndex('transactions', ['item_id']);
    await queryInterface.addIndex('transactions', ['transaction_type']);
    await queryInterface.addIndex('transactions', ['status']);
    await queryInterface.addIndex('transactions', ['due_date']);
    await queryInterface.addIndex('transactions', ['from_store_id']);
    await queryInterface.addIndex('transactions', ['to_store_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('transactions');
  }
};
