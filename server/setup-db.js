const { Sequelize } = require('sequelize');

async function setupDatabase() {
  // First, try to connect to the default 'postgres' database
  const adminSequelize = new Sequelize(
    'postgres',
    'postgres',
    '', // Try empty password first
    {
      host: 'localhost',
      port: 5432,
      dialect: 'postgres',
      logging: console.log
    }
  );

  try {
    await adminSequelize.authenticate();
    console.log('✅ Connected to PostgreSQL as admin');
    
    // Create the database if it doesn't exist
    await adminSequelize.query('CREATE DATABASE ieventory_db;');
    console.log('✅ Database "ieventory_db" created successfully');
    
    await adminSequelize.close();
    return true;
  } catch (error) {
    console.log('❌ Failed to connect as admin:', error.message);
    
    // Try with different passwords
    const passwords = ['1123', 'password', 'postgres', 'admin'];
    
    for (const password of passwords) {
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
        
        // Create the database
        await testSequelize.query('CREATE DATABASE ieventory_db;');
        console.log('✅ Database "ieventory_db" created successfully');
        
        await testSequelize.close();
        return true;
      } catch (err) {
        console.log(`❌ Failed with password "${password}":`, err.message);
      }
    }
    
    return false;
  }
}

setupDatabase().then(success => {
  if (success) {
    console.log('\n🎉 Database setup completed!');
    console.log('You can now start the server with: npm run dev');
  } else {
    console.log('\n❌ Database setup failed.');
    console.log('Please check your PostgreSQL installation and credentials.');
  }
}).catch(console.error);
