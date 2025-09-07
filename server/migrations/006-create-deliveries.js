'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('deliveries', {
      delivery_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
      },

      transaction_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'transactions',
          key: 'transaction_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      assigned_to: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },

      delivery_type: {
        type: Sequelize.ENUM('transfer', 'return'),
        allowNull: false,
      },

      status: {
        type: Sequelize.ENUM('Pending', 'In-Progress', 'Completed'),
        allowNull: false,
        defaultValue: 'Pending',
      },

      from_location: {
        type: Sequelize.STRING,
      },

      to_location: {
        type: Sequelize.STRING,
      },

      pickup_time: {
        type: Sequelize.DATE,
      },

      delivery_time: {
        type: Sequelize.DATE,
      },

      tracking: {
        type: Sequelize.JSONB,
      },

      signature: {
        type: Sequelize.STRING,
      },

      notes: {
        type: Sequelize.TEXT,
      },

      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },

      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('deliveries');
  },
};
