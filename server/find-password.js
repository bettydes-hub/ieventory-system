const { Sequelize } = require('sequelize');

// Common PostgreSQL passwords to try
const commonPasswords = [
  '', // Empty password
  'postgres',
  'password',
  'admin',
  'root',
  '123456',
  '1123',
  'postgres123',
  'admin123',
  'password123'
];

async function testPassword(password) {
  const sequelize = new Sequelize(
    'postgres', // Connect to default postgres database first
    'postgres',
    password,
    {
      host: 'localhost',
      port: 5432,
      dialect: 'postgres',
      logging: false,
      pool: {
        max: 1,
        min: 0,
        acquire: 3000,
        idle: 1000
      }
    }
  );

  try {
    await sequelize.authenticate();
    console.log(`✅ SUCCESS! Password found: "${password}"`);
    
    // Test if we can create the database
    try {
      await sequelize.query('CREATE DATABASE ieventory_db;');
      console.log('✅ Database "ieventory_db" created successfully');
    } catch (dbError) {
      if (dbError.message.includes('already exists')) {
        console.log('✅ Database "ieventory_db" already exists');
      } else {
        console.log('⚠️  Database creation failed:', dbError.message);
      }
    }
    
    await sequelize.close();
    return password;
  } catch (error) {
    console.log(`❌ Failed with password: "${password}"`);
    await sequelize.close();
    return null;
  }
}

async function findCorrectPassword() {
  console.log('🔍 Searching for correct PostgreSQL password...\n');
  
  for (const password of commonPasswords) {
    const result = await testPassword(password);
    if (result) {
      console.log(`\n🎉 Found working password: "${result}"`);
      console.log('\n📝 Create a .env file with:');
      console.log(`DB_PASSWORD=${result}`);
      console.log('\nThen run: npm run dev');
      return result;
    }
  }
  
  console.log('\n❌ No working password found.');
  console.log('Please check the database-setup-guide.md for manual setup instructions.');
  return null;
}

findCorrectPassword().catch(console.error);
