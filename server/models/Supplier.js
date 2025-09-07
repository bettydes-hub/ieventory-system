const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Supplier = sequelize.define('Supplier', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    field: 'supplier_id'
  },
  
  // Basic information
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  
  contact: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  
  website: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  
  taxId: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  
  paymentTerms: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  
  creditLimit: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true
  },
  
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'suppliers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['name']
    },
    {
      fields: ['email']
    },
    {
      fields: ['isActive']
    }
  ]
});

// Instance methods
Supplier.prototype.isActiveSupplier = function() {
  return this.isActive === true;
};

Supplier.prototype.hasValidContact = function() {
  return !!(this.email || this.phone);
};

Supplier.prototype.getDisplayName = function() {
  return this.name;
};

module.exports = Supplier;
