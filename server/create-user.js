const { Client } = require('pg');

async function createDatabaseUser() {
  console.log('🔧 Creating new database user...\n');
  
  // Try to connect as superuser (might work without password)
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: '', // Try empty password
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL');
    
    // Create new user
    await client.query(`
      CREATE USER ieventory_user WITH PASSWORD 'ieventory123';
    `);
    console.log('✅ Created user "ieventory_user"');
    
    // Create database
    await client.query(`
      CREATE DATABASE ieventory_db OWNER ieventory_user;
    `);
    console.log('✅ Created database "ieventory_db"');
    
    // Grant privileges
    await client.query(`
      GRANT ALL PRIVILEGES ON DATABASE ieventory_db TO ieventory_user;
    `);
    console.log('✅ Granted privileges to ieventory_user');
    
    await client.end();
    
    console.log('\n🎉 Database setup completed!');
    console.log('Update your .env file with:');
    console.log('DB_USER=ieventory_user');
    console.log('DB_PASSWORD=ieventory123');
    
    return true;
  } catch (error) {
    console.log('❌ Failed to create user:', error.message);
    
    // Try with different approaches
    const approaches = [
      { user: 'postgres', password: 'postgres' },
      { user: 'postgres', password: 'password' },
      { user: 'postgres', password: 'admin' },
      { user: 'postgres', password: '123456' },
    ];
    
    for (const approach of approaches) {
      try {
        const testClient = new Client({
          host: 'localhost',
          port: 5432,
          database: 'postgres',
          user: approach.user,
          password: approach.password,
        });
        
        await testClient.connect();
        console.log(`✅ Connected with user: ${approach.user}, password: ${approach.password}`);
        
        // Create new user
        await testClient.query(`
          CREATE USER ieventory_user WITH PASSWORD 'ieventory123';
        `);
        console.log('✅ Created user "ieventory_user"');
        
        // Create database
        await testClient.query(`
          CREATE DATABASE ieventory_db OWNER ieventory_user;
        `);
        console.log('✅ Created database "ieventory_db"');
        
        // Grant privileges
        await testClient.query(`
          GRANT ALL PRIVILEGES ON DATABASE ieventory_db TO ieventory_user;
        `);
        console.log('✅ Granted privileges to ieventory_user');
        
        await testClient.end();
        
        console.log('\n🎉 Database setup completed!');
        console.log('Update your .env file with:');
        console.log('DB_USER=ieventory_user');
        console.log('DB_PASSWORD=ieventory123');
        
        return true;
      } catch (err) {
        console.log(`❌ Failed with user: ${approach.user}, password: ${approach.password}`);
      }
    }
    
    return false;
  }
}

createDatabaseUser().then(success => {
  if (success) {
    console.log('\n✅ You can now start the server!');
  } else {
    console.log('\n❌ Could not create database user.');
    console.log('Please check your PostgreSQL installation or contact support.');
  }
}).catch(console.error);
