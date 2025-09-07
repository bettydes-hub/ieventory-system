const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    field: 'audit_id'
  },
  
  // User Information
  user_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  
  // Action Details
  action_type: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Action description (Add, Update, Delete, Borrow, Return, etc.)'
  },
  
  target_table: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Name of table affected'
  },
  
  target_id: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'Record ID affected'
  },
  
  // Change Tracking
  old_value: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Previous values before the change (for updates)'
  },
  
  new_value: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'New values after the change (for inserts/updates)'
  },
  
  // Timestamp
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'audit_logs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['action_type']
    },
    {
      fields: ['target_table']
    },
    {
      fields: ['target_id']
    },
    {
      fields: ['timestamp']
    }
  ]
});

// Instance methods
AuditLog.prototype.isAdd = function() {
  return this.action_type.toLowerCase().includes('add');
};

AuditLog.prototype.isUpdate = function() {
  return this.action_type.toLowerCase().includes('update');
};

AuditLog.prototype.isDelete = function() {
  return this.action_type.toLowerCase().includes('delete');
};

AuditLog.prototype.isBorrow = function() {
  return this.action_type.toLowerCase().includes('borrow');
};

AuditLog.prototype.isReturn = function() {
  return this.action_type.toLowerCase().includes('return');
};

AuditLog.prototype.hasChanges = function() {
  return this.old_value || this.new_value;
};

AuditLog.prototype.getChangeSummary = function() {
  return `${this.action_type} on ${this.target_table}`;
};

AuditLog.prototype.isRecent = function(hours = 24) {
  const cutoff = new Date(Date.now() - (hours * 60 * 60 * 1000));
  return this.timestamp > cutoff;
};

module.exports = AuditLog;
