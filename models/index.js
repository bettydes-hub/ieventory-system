const { sequelize } = require('../config/database');
const User = require('./User');

// Import other models (will be created by your partner)
// const Store = require('./Store');
// const Item = require('./Item');
// const Category = require('./Category');

// Define associations here
// Store.hasMany(Item);
// Item.belongsTo(Store);
// Category.hasMany(Item);
// Item.belongsTo(Category);

// Export all models
const models = {
  User,
  // Store,
  // Item,
  // Category,
  sequelize
};

module.exports = models;
