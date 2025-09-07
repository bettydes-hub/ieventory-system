const { sequelize } = require('./database');
const models = require('../models');

const initializeDatabase = async () => {
  try {
    // Sync all models with database (no ALTER to avoid enum DDL issues)
    await sequelize.sync({ force: false });
    console.log('Database synchronized successfully (no alter)');

    // Create default admin user if none exists
    const { User } = models;
    const adminExists = await User.findOne({ where: { role: 'Admin' } });

    if (!adminExists) {
      await User.create({
        name: 'System Administrator',
        email: 'admin@ieventory.com',
        password_hash: 'admin123', // model hook will hash
        role: 'Admin',
        isActive: true
      });
      console.log('Default admin user created');
    }

    console.log('Database initialization completed!');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};

module.exports = { initializeDatabase };
