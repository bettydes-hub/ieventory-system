'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('suppliers', {
      supplier_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true
      },
      
      // Basic information
      name: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      
      contact: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      
      email: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      
      address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      
      website: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      
      tax_id: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      
      payment_terms: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      
      credit_limit: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true
      },
      
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      
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

    // Add indexes
    await queryInterface.addIndex('suppliers', ['name']);
    await queryInterface.addIndex('suppliers', ['email']);
    await queryInterface.addIndex('suppliers', ['is_active']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('suppliers');
  }
};
