const { Sequelize } = require('sequelize');
const path = require('path');

// Test with SQLite for development
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'test.db'),
  logging: false
});

async function testSQLite() {
  try {
    await sequelize.authenticate();
    console.log('✅ SQLite connection successful!');
    
    // Test creating a simple table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS test_table (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('✅ SQLite table creation successful!');
    
    await sequelize.close();
    return true;
  } catch (error) {
    console.log('❌ SQLite connection failed:', error.message);
    return false;
  }
}

testSQLite().then(success => {
  if (success) {
    console.log('\n🎉 SQLite is working! We can use it for testing.');
    console.log('This will allow us to test the backend without PostgreSQL setup.');
  } else {
    console.log('\n❌ SQLite test failed.');
  }
}).catch(console.error);
