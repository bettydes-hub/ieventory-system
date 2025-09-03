'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('deliveries', {
      delivery_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      
      // Transaction Reference
      transaction_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'transactions',
          key: 'transaction_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      
      // Delivery Staff Assignment
      assigned_to: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      
      // Status
      status: {
        type: Sequelize.ENUM('Pending', 'In-Progress', 'Completed'),
        allowNull: false,
        defaultValue: 'Pending'
      },
      
      // Timing
      pickup_time: {
        type: Sequelize.DATE,
        allowNull: true
      },
      
      delivery_time: {
        type: Sequelize.DATE,
        allowNull: true
      },
      
      // Notes
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
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
    await queryInterface.addIndex('deliveries', ['transaction_id']);
    await queryInterface.addIndex('deliveries', ['assigned_to']);
    await queryInterface.addIndex('deliveries', ['status']);
    await queryInterface.addIndex('deliveries', ['pickup_time']);
    await queryInterface.addIndex('deliveries', ['delivery_time']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('deliveries');
  }
};
