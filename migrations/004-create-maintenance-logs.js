'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('maintenance_logs', {
      maintenance_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      
      // Item Information
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
      
      // Scheduling
      scheduled_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      
      // Completion
      completed_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      
      // Status
      status: {
        type: Sequelize.ENUM('Pending', 'Completed'),
        allowNull: false,
        defaultValue: 'Pending'
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
    await queryInterface.addIndex('maintenance_logs', ['item_id']);
    await queryInterface.addIndex('maintenance_logs', ['status']);
    await queryInterface.addIndex('maintenance_logs', ['scheduled_date']);
    await queryInterface.addIndex('maintenance_logs', ['completed_date']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('maintenance_logs');
  }
};
