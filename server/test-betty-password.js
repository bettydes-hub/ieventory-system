const { Sequelize } = require('sequelize');

async function testBettyPassword() {
  console.log('🔍 Testing password: Betty12@m\n');
  
  const sequelize = new Sequelize(
    'ieventory_db',
    'postgres',
    'Betty12@m',
    {
      host: 'localhost',
      port: 5432,
      dialect: 'postgres',
      logging: console.log
    }
  );

  try {
    await sequelize.authenticate();
    console.log('✅ SUCCESS! Password "Betty12@m" works!');
    
    // Test if we can create tables
    console.log('Testing database operations...');
    await sequelize.query('SELECT 1 as test;');
    console.log('✅ Database operations work!');
    
    await sequelize.close();
    return true;
  } catch (error) {
    console.log('❌ Failed with password "Betty12@m":', error.message);
    await sequelize.close();
    return false;
  }
}

testBettyPassword().then(success => {
  if (success) {
    console.log('\n🎉 Database connection successful!');
    console.log('Update your .env file with:');
    console.log('DB_PASSWORD=Betty12@m');
    console.log('\nYou can now start the server with: npm run dev');
  } else {
    console.log('\n❌ Password "Betty12@m" did not work.');
  }
}).catch(console.error);
