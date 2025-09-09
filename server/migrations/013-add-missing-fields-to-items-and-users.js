'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add missing fields to items table
    await queryInterface.addColumn('items', 'description', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn('items', 'manufacturer', {
      type: Sequelize.STRING(255),
      allowNull: true
    });

    await queryInterface.addColumn('items', 'model', {
      type: Sequelize.STRING(255),
      allowNull: true
    });

    await queryInterface.addColumn('items', 'serial_number', {
      type: Sequelize.STRING(255),
      allowNull: true,
      unique: true
    });

    await queryInterface.addColumn('items', 'purchase_date', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('items', 'purchase_price', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true
    });

    await queryInterface.addColumn('items', 'warranty_expiry', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('items', 'condition', {
      type: Sequelize.ENUM('excellent', 'good', 'fair', 'poor'),
      defaultValue: 'excellent'
    });

    await queryInterface.addColumn('items', 'notes', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn('items', 'max_stock_level', {
      type: Sequelize.INTEGER,
      defaultValue: 100
    });

    await queryInterface.addColumn('items', 'qr_code', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    // Update status enum to include new values
    await queryInterface.changeColumn('items', 'status', {
      type: Sequelize.ENUM('available', 'borrowed', 'maintenance', 'damaged', 'reserved'),
      defaultValue: 'available'
    });

    // Add missing fields to users table
    await queryInterface.addColumn('users', 'isFirstLogin', {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    });

    await queryInterface.addColumn('users', 'passwordChanged', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });

    // Add indexes for better performance
    await queryInterface.addIndex('items', ['serial_number']);
    await queryInterface.addIndex('items', ['manufacturer']);
    await queryInterface.addIndex('items', ['status']);
  },

  async down(queryInterface, Sequelize) {
    // Remove indexes
    await queryInterface.removeIndex('items', ['status']);
    await queryInterface.removeIndex('items', ['manufacturer']);
    await queryInterface.removeIndex('items', ['serial_number']);

    // Remove fields from users table
    await queryInterface.removeColumn('users', 'passwordChanged');
    await queryInterface.removeColumn('users', 'isFirstLogin');

    // Revert status enum
    await queryInterface.changeColumn('items', 'status', {
      type: Sequelize.ENUM('available', 'damaged', 'reserved'),
      defaultValue: 'available'
    });

    // Remove fields from items table
    await queryInterface.removeColumn('items', 'qr_code');
    await queryInterface.removeColumn('items', 'max_stock_level');
    await queryInterface.removeColumn('items', 'notes');
    await queryInterface.removeColumn('items', 'condition');
    await queryInterface.removeColumn('items', 'warranty_expiry');
    await queryInterface.removeColumn('items', 'purchase_price');
    await queryInterface.removeColumn('items', 'purchase_date');
    await queryInterface.removeColumn('items', 'serial_number');
    await queryInterface.removeColumn('items', 'model');
    await queryInterface.removeColumn('items', 'manufacturer');
    await queryInterface.removeColumn('items', 'description');
  }
};
