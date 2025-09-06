'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('notifications', {
      notification_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true
      },
      
      // Recipient
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
      
      // Notification Type
      type: {
        type: Sequelize.ENUM('email', 'dashboard alert'),
        allowNull: false,
        defaultValue: 'dashboard alert'
      },
      
      // Message
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      
      // Status
      status: {
        type: Sequelize.ENUM('Sent', 'Pending'),
        allowNull: false,
        defaultValue: 'Pending'
      },
      
      // Timestamp
      timestamp: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for better performance
    await queryInterface.addIndex('notifications', ['user_id']);
    await queryInterface.addIndex('notifications', ['type']);
    await queryInterface.addIndex('notifications', ['status']);
    await queryInterface.addIndex('notifications', ['timestamp']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('notifications');
  }
};
