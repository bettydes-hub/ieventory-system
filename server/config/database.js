const { Sequelize } = require('sequelize');
require('dotenv').config();

const LOG_SQL = (process.env.DB_LOG_SQL || '').toLowerCase() === 'true';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.DB_STORAGE || './database.sqlite',
  // Control SQL logging via env (DB_LOG_SQL=true to enable)
  logging: LOG_SQL ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

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
