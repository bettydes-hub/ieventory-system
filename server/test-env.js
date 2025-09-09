require('dotenv').config();

console.log('🔍 Testing .env file loading...\n');

console.log('Environment variables:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);

console.log('\n🔍 Testing database connection with loaded values...');

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'ieventory_db',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'Betty12@m',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log
  }
);

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection successful!');
    await sequelize.close();
    return true;
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    await sequelize.close();
    return false;
  }
}

testConnection().catch(console.error);
