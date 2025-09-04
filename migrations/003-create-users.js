'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {

      

      user_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
      },



      name: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },

      email: {
        type: Sequelize.STRING(200),
        allowNull: false,
        unique: true,
      },

      password_hash: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      role: {
        type: Sequelize.ENUM('Admin', 'Employee', 'Delivery Staff'),
        allowNull: false,
        defaultValue: 'Employee',
      },

          store_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'stores', key: 'store_id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },


      refresh_token: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      password_reset_token: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },

      password_reset_expiry: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },

      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },

      last_login: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      vehicle_info: {
        type: Sequelize.JSONB,
        allowNull: true,
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
    // Drop ENUM type explicitly (important for Postgres)
    await queryInterface.dropTable('users');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_role";');
  },
};
