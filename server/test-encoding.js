const { Sequelize } = require('sequelize');

// Test different password formats
const passwordTests = [
  'Betty12@m',      // Original
  'Betty12%40m',    // URL encoded
  'Betty12\\@m',    // Escaped
  '"Betty12@m"',    // Quoted
  "'Betty12@m'",    // Single quoted
];

async function testPasswordFormat(password) {
  console.log(`🔍 Testing password format: "${password}"`);
  
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
    console.log(`✅ SUCCESS! Password format "${password}" works!`);
    await sequelize.close();
    return password;
  } catch (error) {
    console.log(`❌ Failed with format "${password}": ${error.message}`);
    await sequelize.close();
    return null;
  }
}

async function testAllFormats() {
  console.log('🔍 Testing different password formats...\n');
  
  for (const password of passwordTests) {
    const result = await testPasswordFormat(password);
    if (result) {
      console.log(`\n🎉 Found working format: "${result}"`);
      console.log('Use this exact format in your .env file:');
      console.log(`DB_PASSWORD=${result}`);
      return result;
    }
  }
  
  console.log('\n❌ None of the password formats worked.');
  return null;
}

testAllFormats().catch(console.error);
