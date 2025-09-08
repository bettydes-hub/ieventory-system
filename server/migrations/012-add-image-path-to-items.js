'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('items', 'image_path', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'status'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('items', 'image_path');
  }
};

