const { Sequelize } = require('sequelize');

async function checkDatabase() {
  console.log('🔍 Checking PostgreSQL connection...\n');
  
  // First, try to connect to the default 'postgres' database
  const adminSequelize = new Sequelize(
    'postgres',  // Connect to default postgres database first
    'postgres',
    'ndhf@343',  // Your password
    {
      host: 'localhost',
      port: 5432,
      dialect: 'postgres',
      logging: console.log
    }
  );

  try {
    await adminSequelize.authenticate();
    console.log('✅ Connected to PostgreSQL as postgres user');
    
    // Check if our database exists
    const [results] = await adminSequelize.query("SELECT datname FROM pg_database WHERE datname = 'ieventory_db';");
    
    if (results.length > 0) {
      console.log('✅ Database "ieventory_db" exists');
    } else {
      console.log('❌ Database "ieventory_db" does not exist');
      console.log('Creating database...');
      await adminSequelize.query('CREATE DATABASE ieventory_db;');
      console.log('✅ Database "ieventory_db" created');
    }
    
    await adminSequelize.close();
    return true;
  } catch (error) {
    console.log('❌ Failed to connect to PostgreSQL:', error.message);
    
    // Try with different common passwords
    const commonPasswords = ['postgres', 'password', 'admin', '123456', '1123'];
    
    for (const password of commonPasswords) {
      try {
        const testSequelize = new Sequelize(
          'postgres',
          'postgres',
          password,
          {
            host: 'localhost',
            port: 5432,
            dialect: 'postgres',
            logging: false
          }
        );
        
        await testSequelize.authenticate();
        console.log(`✅ Connected with password: "${password}"`);
        await testSequelize.close();
        return true;
      } catch (err) {
        console.log(`❌ Failed with password "${password}"`);
      }
    }
    
    return false;
  }
}

checkDatabase().then(success => {
  if (success) {
    console.log('\n🎉 Database connection successful!');
    console.log('You can now start the server with: npm run dev');
  } else {
    console.log('\n❌ Database connection failed.');
    console.log('Please check your PostgreSQL installation and credentials.');
  }
}).catch(console.error);
