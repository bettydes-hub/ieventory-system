'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('audit_logs', {
      audit_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true
      },
      
      // Who performed the action
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      
      // Action details
      action_type: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Description of the action performed'
      },
      
      // Target information
      target_table: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Name of the table where the change occurred'
      },
      
      target_id: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: 'ID of the record that was changed'
      },
      
      // Change tracking
      old_value: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Previous values before the change (for UPDATE/DELETE)'
      },
      
      new_value: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'New values after the change (for INSERT/UPDATE)'
      },
      
      // Timestamp
      timestamp: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for better performance
    await queryInterface.addIndex('audit_logs', ['user_id']);
    await queryInterface.addIndex('audit_logs', ['action_type']);
    await queryInterface.addIndex('audit_logs', ['target_table']);
    await queryInterface.addIndex('audit_logs', ['target_id']);
    await queryInterface.addIndex('audit_logs', ['timestamp']);
    await queryInterface.addIndex('audit_logs', ['target_table', 'target_id']);
    await queryInterface.addIndex('audit_logs', ['user_id', 'timestamp']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('audit_logs');
  }
};
