const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MaintenanceLog = sequelize.define('MaintenanceLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    field: 'maintenance_id'
  },
  
  // Item Information
  item_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'items',
      key: 'item_id'
    }
  },
  
  // Scheduling
  scheduled_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  completed_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  // Status
  status: {
    type: DataTypes.ENUM('Pending', 'Completed'),
    allowNull: false,
    defaultValue: 'Pending'
  },
  
  // Notes
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'maintenance_logs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['item_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['scheduled_date']
    }
  ]
});

// Instance methods
MaintenanceLog.prototype.isPending = function() {
  return this.status === 'Pending';
};

MaintenanceLog.prototype.isCompleted = function() {
  return this.status === 'Completed';
};

MaintenanceLog.prototype.isOverdue = function() {
  if (!this.scheduled_date || this.status === 'Completed') return false;
  const today = new Date();
  const scheduledDate = new Date(this.scheduled_date);
  return today > scheduledDate;
};

MaintenanceLog.prototype.getOverdueDays = function() {
  if (!this.isOverdue()) return 0;
  const today = new Date();
  const scheduledDate = new Date(this.scheduled_date);
  const diffTime = today - scheduledDate;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

module.exports = MaintenanceLog;
