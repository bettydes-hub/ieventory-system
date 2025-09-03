const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Delivery = sequelize.define('Delivery', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    field: 'delivery_id'
  },
  
  // Transaction Information
  transaction_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'transactions',
      key: 'transaction_id'
    }
  },
  
  // Delivery Staff Assignment
  assigned_to: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  
  // Status
  status: {
    type: DataTypes.ENUM('Pending', 'In-Progress', 'Completed'),
    allowNull: false,
    defaultValue: 'Pending'
  },
  
  // Timing Information
  pickup_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  delivery_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  // Additional Information
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'deliveries',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['transaction_id']
    },
    {
      fields: ['assigned_to']
    },
    {
      fields: ['status']
    },
    {
      fields: ['pickup_time']
    }
  ]
});

// Instance methods
Delivery.prototype.isPending = function() {
  return this.status === 'Pending';
};

Delivery.prototype.isInProgress = function() {
  return this.status === 'In-Progress';
};

Delivery.prototype.isCompleted = function() {
  return this.status === 'Completed';
};

Delivery.prototype.canBeStarted = function() {
  return this.status === 'Pending';
};

Delivery.prototype.canBeCompleted = function() {
  return this.status === 'In-Progress';
};

module.exports = Delivery;
