const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    field: 'user_id'
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(200),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('Admin', 'Store Keeper', 'Employee', 'Delivery Staff'),
    allowNull: false,
    defaultValue: 'Employee'
  },
  store_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'stores',
      key: 'store_id'
    }
  },
  refresh_token: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  password_reset_token: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  password_reset_expiry: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // Additional fields for flexibility
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // For delivery staff - their assigned vehicle/transport info
  vehicleInfo: {
    type: DataTypes.JSON,
    allowNull: true
  },
  // First-time login tracking
  isFirstLogin: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  passwordChanged: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password_hash) {
        user.password_hash = await bcrypt.hash(user.password_hash, 12);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password_hash')) {
        user.password_hash = await bcrypt.hash(user.password_hash, 12);
      }
    }
  }
});

// Instance method to check password
User.prototype.checkPassword = async function(password) {
  return await bcrypt.compare(password, this.password_hash);
};

// Instance method to get full name
User.prototype.getFullName = function() {
  return this.name;
};

// Instance method to check if user has specific role
User.prototype.hasRole = function(role) {
  return this.role === role;
};

// Instance method to check if user has any of the specified roles
User.prototype.hasAnyRole = function(roles) {
  return roles.includes(this.role);
};

module.exports = User;
