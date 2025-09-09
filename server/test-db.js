const { Sequelize } = require('sequelize');

// Test different password combinations
const passwords = ['1123', 'password', 'postgres', 'admin', ''];

async function testConnection(password) {
  const sequelize = new Sequelize(
    'ieventory_db',
    'postgres',
    password,
    {
      host: 'localhost',
      port: 5432,
      dialect: 'postgres',
      logging: false
    }
  );

  try {
    await sequelize.authenticate();
    console.log(`✅ Database connection successful with password: "${password}"`);
    return true;
  } catch (error) {
    console.log(`❌ Database connection failed with password: "${password}"`);
    return false;
  } finally {
    await sequelize.close();
  }
}

async function testAllPasswords() {
  console.log('🔍 Testing database connection with different passwords...\n');
  
  for (const password of passwords) {
    const success = await testConnection(password);
    if (success) {
      console.log(`\n🎉 Found working password: "${password}"`);
      console.log('Please create a .env file with:');
      console.log(`DB_PASSWORD=${password}`);
      break;
    }
  }
}

testAllPasswords().catch(console.error);
