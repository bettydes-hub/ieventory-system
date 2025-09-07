'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Enable pgcrypto for gen_random_uuid()
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
  },

  async down(queryInterface, Sequelize) {
    // Do not drop the extension in down to avoid affecting other schemas
  },
};

