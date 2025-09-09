const { Sequelize } = require('sequelize');

// Test different password variations
const passwordVariations = [
  'ndhf@343',        // Original password
  'ndhf%40343',      // URL encoded
  'ndhf\\@343',      // Escaped
  '"ndhf@343"',      // Quoted
  "'ndhf@343'",      // Single quoted
];

async function testPasswordVariation(password) {
  const sequelize = new Sequelize(
    'ieventory_db',
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
    console.log(`✅ SUCCESS! Password works: "${password}"`);
    await sequelize.close();
    return password;
  } catch (error) {
    console.log(`❌ Failed with password: "${password}"`);
    await sequelize.close();
    return null;
  }
}

async function testAllVariations() {
  console.log('🔍 Testing different password variations...\n');
  
  for (const password of passwordVariations) {
    const result = await testPasswordVariation(password);
    if (result) {
      console.log(`\n🎉 Found working password: "${result}"`);
      console.log('\n📝 Use this in your .env file:');
      console.log(`DB_PASSWORD=${result}`);
      return result;
    }
  }
  
  console.log('\n❌ None of the password variations worked.');
  console.log('Please check:');
  console.log('1. Is the database "ieventory_db" created?');
  console.log('2. Is the user "postgres" correct?');
  console.log('3. Is PostgreSQL running?');
  return null;
}

testAllVariations().catch(console.error);
