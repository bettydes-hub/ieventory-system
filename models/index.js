const { sequelize } = require('../config/database');
const User = require('./User');
const Transaction = require('./Transaction');
const Delivery = require('./Delivery');
const Damage = require('./Damage');
const MaintenanceLog = require('./MaintenanceLog');
const AuditLog = require('./AuditLog');
const Notification = require('./Notification');
const Supplier = require('./Supplier');

// Import other models (will be created by your partner)
// const Store = require('./Store');
// const Item = require('./Item');
// const Category = require('./Category');

// Define associations here
// Store.hasMany(Item);
// Item.belongsTo(Store);
// Category.hasMany(Item);
// Item.belongsTo(Category);

// Transaction associations (will be updated when partner creates Store/Item models)
// Transaction.belongsTo(Item, { foreignKey: 'item_id' });
// Transaction.belongsTo(Store, { as: 'fromStore', foreignKey: 'from_store_id' });
// Transaction.belongsTo(Store, { as: 'toStore', foreignKey: 'to_store_id' });
// Transaction.belongsTo(User, { foreignKey: 'user_id' });

// Delivery associations
Delivery.belongsTo(Transaction, { foreignKey: 'transaction_id' });
Delivery.belongsTo(User, { as: 'deliveryStaff', foreignKey: 'assigned_to' });

// Damage associations
Damage.belongsTo(User, { as: 'reporter', foreignKey: 'reported_by' });
Damage.belongsTo(User, { as: 'resolver', foreignKey: 'resolved_by' });

// Maintenance associations
MaintenanceLog.belongsTo(User, { as: 'assignee', foreignKey: 'assigned_to' });
MaintenanceLog.belongsTo(User, { as: 'performer', foreignKey: 'performed_by' });

// Audit associations
AuditLog.belongsTo(User, { foreignKey: 'user_id' });

// Notification associations
Notification.belongsTo(User, { foreignKey: 'user_id' });

// Export all models
const models = {
  User,
  Transaction,
  Delivery,
  Damage,
  MaintenanceLog,
  AuditLog,
  Notification,
  Supplier,
  // Store,
  // Item,
  // Category,
  sequelize
};

module.exports = models;
