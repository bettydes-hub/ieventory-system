const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

// Models defined with direct sequelize import
const User = require('./User');
const Transaction = require('./Transaction');
const Delivery = require('./Delivery');
const Damage = require('./Damage');
const MaintenanceLog = require('./MaintenanceLog');
const AuditLog = require('./AuditLog');
const Notification = require('./Notification');
const Supplier = require('./Supplier');

// Models defined as factories (require initialization)
const defineStore = require('./store');
const defineItem = require('./item');
const defineCategory = require('./Category');

const Store = defineStore(sequelize, DataTypes);
const Item = defineItem(sequelize, DataTypes);
const Category = defineCategory(sequelize, DataTypes);

// Associations
// Items <-> Store/Category
if (Store.associate) Store.associate({ Item, User });
if (Category.associate) Category.associate({ Item });
if (Item.associate) Item.associate({ Store, Category });

// Transaction associations
Transaction.belongsTo(Item, { foreignKey: 'item_id' });
Transaction.belongsTo(Store, { as: 'fromStore', foreignKey: 'from_store_id' });
Transaction.belongsTo(Store, { as: 'toStore', foreignKey: 'to_store_id' });
Transaction.belongsTo(User, { as: 'user', foreignKey: 'user_id' });

// Delivery associations
Delivery.belongsTo(Transaction, { foreignKey: 'transaction_id' });
Delivery.belongsTo(User, { as: 'assignedTo', foreignKey: 'assigned_to' });

// Damage associations
Damage.belongsTo(Item, { foreignKey: 'item_id' });
Damage.belongsTo(User, { as: 'reporter', foreignKey: 'reported_by' });
Damage.belongsTo(User, { as: 'resolver', foreignKey: 'resolved_by' });

// Audit associations
AuditLog.belongsTo(User, { foreignKey: 'user_id' });

// Notification associations
Notification.belongsTo(User, { foreignKey: 'user_id' });

const models = {
  User,
  Transaction,
  Delivery,
  Damage,
  MaintenanceLog,
  AuditLog,
  Notification,
  Supplier,
  Store,
  Item,
  Category,
  sequelize
};

module.exports = models;
