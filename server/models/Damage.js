const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Damage = sequelize.define('Damage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    field: 'damage_id'
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

  // Item Type and Damage Logic
  item_type: {
    type: DataTypes.ENUM('serial', 'bulk'),
    allowNull: false,
    comment: 'Type of item: serial (tracked by serial number) or bulk (tracked by quantity)'
  },

  serial_number: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Serial number for serial items (required when item_type is serial)'
  },

  quantity_damaged: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Quantity damaged for bulk items (required when item_type is bulk)',
    validate: {
      min: 1
    }
  },
  
  // User Information
  reported_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  
  // Damage Details
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  
  severity: {
    type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'),
    allowNull: false,
    defaultValue: 'Medium'
  },
  
  // Status
  status: {
    type: DataTypes.ENUM('Pending', 'Under Review', 'Resolved'),
    allowNull: false,
    defaultValue: 'Pending'
  },
  
  // Resolution
  resolved_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  
  resolution_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  // Timestamps
  date_reported: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  
  // Additional Information
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'damages',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['item_id']
    },
    {
      fields: ['reported_by']
    },
    {
      fields: ['status']
    },
    {
      fields: ['date_reported']
    },
    {
      fields: ['item_type']
    },
    {
      fields: ['serial_number']
    }
  ],
  // Validation hooks
  hooks: {
    beforeValidate: (damage) => {
      // Validate serial vs bulk logic
      if (damage.item_type === 'serial' && !damage.serial_number) {
        throw new Error('Serial number is required for serial items');
      }
      if (damage.item_type === 'bulk' && (!damage.quantity_damaged || damage.quantity_damaged < 1)) {
        throw new Error('Quantity damaged is required and must be at least 1 for bulk items');
      }
      if (damage.item_type === 'serial' && damage.quantity_damaged) {
        damage.quantity_damaged = null; // Clear quantity for serial items
      }
      if (damage.item_type === 'bulk' && damage.serial_number) {
        damage.serial_number = null; // Clear serial for bulk items
      }
    }
  }
});

// Instance methods
Damage.prototype.isPending = function() {
  return this.status === 'Pending';
};

Damage.prototype.isUnderReview = function() {
  return this.status === 'Under Review';
};

Damage.prototype.isResolved = function() {
  return this.status === 'Resolved';
};

Damage.prototype.isCritical = function() {
  return this.severity === 'Critical';
};

Damage.prototype.isHighSeverity = function() {
  return ['High', 'Critical'].includes(this.severity);
};

Damage.prototype.getResolutionTime = function() {
  if (!this.resolution_date || !this.date_reported) return null;
  const diffTime = this.resolution_date - this.date_reported;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Days
};

// New methods for serial vs bulk logic
Damage.prototype.isSerialItem = function() {
  return this.item_type === 'serial';
};

Damage.prototype.isBulkItem = function() {
  return this.item_type === 'bulk';
};

Damage.prototype.getDamageIdentifier = function() {
  if (this.isSerialItem()) {
    return `Serial: ${this.serial_number}`;
  } else if (this.isBulkItem()) {
    return `Quantity: ${this.quantity_damaged}`;
  }
  return 'Unknown';
};

Damage.prototype.getDamageSummary = function() {
  const base = `${this.description} (${this.status})`;
  if (this.isSerialItem()) {
    return `${base} - Serial: ${this.serial_number}`;
  } else if (this.isBulkItem()) {
    return `${base} - Qty: ${this.quantity_damaged}`;
  }
  return base;
};

module.exports = Damage;
