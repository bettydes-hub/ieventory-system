const { sequelize } = require('./database');
const models = require('../models');

const initializeDatabase = async () => {
  try {
    // Sync all models with database
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ Database synchronized successfully');
    
    // Create default admin user if none exists
    const User = models.User;
    const adminExists = await User.findOne({ where: { role: 'admin' } });
    
    if (!adminExists) {
      await User.create({
        username: 'admin',
        email: 'admin@ieventory.com',
        password: 'admin123',
        firstName: 'System',
        lastName: 'Administrator',
        role: 'admin',
        isActive: true
      });
      console.log('✅ Default admin user created');
    }
    
    console.log('🎉 Database initialization completed!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

module.exports = { initializeDatabase };
