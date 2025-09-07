'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('damages', {
      damage_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
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

      // Item Type and Damage Logic
      item_type: {
        type: Sequelize.ENUM('serial', 'bulk'),
        allowNull: false,
        comment: 'Type of item: serial (tracked by serial number) or bulk (tracked by quantity)'
      },

      serial_number: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Serial number for serial items (required when item_type is serial)'
      },

      quantity_damaged: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Quantity damaged for bulk items (required when item_type is bulk)'
      },
      
      // Damage Details
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      
      // Status
      status: {
        type: Sequelize.ENUM('Pending', 'Fixed', 'Discarded'),
        allowNull: false,
        defaultValue: 'Pending'
      },
      
      // Discovery
      reported_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      
      date_reported: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      
      // Resolution
      resolved_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      
      resolution_date: {
        type: Sequelize.DATE,
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
    await queryInterface.addIndex('damages', ['item_id']);
    await queryInterface.addIndex('damages', ['status']);
    await queryInterface.addIndex('damages', ['reported_by']);
    await queryInterface.addIndex('damages', ['date_reported']);
    await queryInterface.addIndex('damages', ['resolved_by']);
    await queryInterface.addIndex('damages', ['item_type']);
    await queryInterface.addIndex('damages', ['serial_number']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('damages');
  }
};
