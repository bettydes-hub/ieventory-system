const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    field: 'notification_id'
  },
  
  // Recipient
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  
  // Notification Type
  type: {
    type: DataTypes.ENUM('email', 'dashboard alert'),
    allowNull: false,
    defaultValue: 'dashboard alert'
  },
  
  // Message
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  
  // Status
  status: {
    type: DataTypes.ENUM('Sent', 'Pending'),
    allowNull: false,
    defaultValue: 'Pending'
  },
  
  // Timestamp
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'notifications',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['type']
    },
    {
      fields: ['status']
    },
    {
      fields: ['timestamp']
    }
  ]
});

// Instance methods
Notification.prototype.markAsSent = function() {
  this.status = 'Sent';
  this.timestamp = new Date();
  return this.save();
};

Notification.prototype.isEmailType = function() {
  return this.type === 'email';
};

Notification.prototype.isDashboardAlert = function() {
  return this.type === 'dashboard alert';
};

module.exports = Notification;
