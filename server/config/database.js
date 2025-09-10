const { Sequelize } = require('sequelize');
require('dotenv').config();

const LOG_SQL = (process.env.DB_LOG_SQL || '').toLowerCase() === 'true';

// Use PostgreSQL with the new password from .env
const sequelize = new Sequelize(
  process.env.DB_NAME || 'inventory_db',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'Password', // Use the new password
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: LOG_SQL ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Test the connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  }
};

module.exports = { sequelize, testConnection };
