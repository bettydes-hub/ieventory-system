const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    field: 'transaction_id'
  },
  
  // User Information
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id'
    }
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
  
  // Transaction Type
  transaction_type: {
    type: DataTypes.ENUM('Borrow', 'Return', 'Transfer', 'Purchase'),
    allowNull: false
  },
  
  // Store Information
  from_store_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'stores',
      key: 'store_id'
    },
    comment: 'For transfers - store transferring from'
  },
  
  to_store_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'stores',
      key: 'store_id'
    },
    comment: 'For transfers - store transferring to'
  },
  
  // Quantity and Dates
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  
  due_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Optional due date for borrowed items'
  },
  
  // Status
  status: {
    type: DataTypes.ENUM('Pending', 'Approved', 'Rejected', 'Completed', 'Overdue', 'Cancelled'),
    allowNull: false,
    defaultValue: 'Pending'
  },
  
  // Approval workflow
  approved_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'user_id'
    },
    comment: 'User who approved/rejected the transaction'
  },
  
  approved_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When the transaction was approved/rejected'
  },
  
  rejection_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Reason for rejection if applicable'
  },
  
  // Return information
  returned_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When the item was actually returned'
  },
  
  return_condition: {
    type: DataTypes.ENUM('excellent', 'good', 'fair', 'poor', 'damaged'),
    allowNull: true,
    comment: 'Condition of item when returned'
  },
  
  return_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notes about the return condition'
  },
  
  // Additional Information
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'transactions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['item_id']
    },
    {
      fields: ['transaction_type']
    },
    {
      fields: ['status']
    },
    {
      fields: ['due_date']
    }
  ]
});

// Instance methods
Transaction.prototype.isOverdue = function() {
  if (!this.due_date || this.status === 'Completed') return false;
  const today = new Date();
  const dueDate = new Date(this.due_date);
  return today > dueDate;
};

Transaction.prototype.calculateOverdueDays = function() {
  if (!this.due_date || this.status === 'Completed') return 0;
  const today = new Date();
  const dueDate = new Date(this.due_date);
  const diffTime = today - dueDate;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

Transaction.prototype.isTransfer = function() {
  return this.transaction_type === 'Transfer';
};

Transaction.prototype.isBorrow = function() {
  return this.transaction_type === 'Borrow';
};

Transaction.prototype.isReturn = function() {
  return this.transaction_type === 'Return';
};

Transaction.prototype.isApproved = function() {
  return this.status === 'Approved';
};

Transaction.prototype.isRejected = function() {
  return this.status === 'Rejected';
};

Transaction.prototype.isPending = function() {
  return this.status === 'Pending';
};

Transaction.prototype.isCompleted = function() {
  return this.status === 'Completed';
};

Transaction.prototype.canBeApproved = function() {
  return this.status === 'Pending';
};

Transaction.prototype.canBeRejected = function() {
  return this.status === 'Pending';
};

Transaction.prototype.canBeReturned = function() {
  return this.status === 'Approved' && this.transaction_type === 'Borrow';
};

Transaction.prototype.getDaysUntilDue = function() {
  if (!this.due_date || this.status === 'Completed') return null;
  const today = new Date();
  const dueDate = new Date(this.due_date);
  const diffTime = dueDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

module.exports = Transaction;
