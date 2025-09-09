module.exports = (sequelize, DataTypes) => {
  const Item = sequelize.define("Item", {
    item_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'category_id'
      }
    },
    store_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'stores',
        key: 'store_id'
      }
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    low_stock_threshold: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
    },
    max_stock_level: {
      type: DataTypes.INTEGER,
      defaultValue: 100,
    },
    status: {
      type: DataTypes.ENUM("available", "borrowed", "maintenance", "damaged", "reserved"),
      defaultValue: "available",
    },
    image_path: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    // Additional fields for better inventory management
    manufacturer: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    model: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    serial_number: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
    },
    purchase_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    purchase_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    warranty_expiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    condition: {
      type: DataTypes.ENUM("excellent", "good", "fair", "poor"),
      defaultValue: "excellent",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // QR Code for easy scanning
    qr_code: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: "items",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['serial_number']
      },
      {
        fields: ['category_id']
      },
      {
        fields: ['store_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['manufacturer']
      }
    ]
  });

  Item.associate = (models) => {
    Item.belongsTo(models.Store, { foreignKey: "store_id" });
    Item.belongsTo(models.Category, { foreignKey: "category_id" });
  };

  return Item;
};
