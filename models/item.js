module.exports = (sequelize, DataTypes) => {
  const Item = sequelize.define("Item", {
    item_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
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
    status: {
      type: DataTypes.ENUM("available", "damaged", "reserved"),
      defaultValue: "available",
    },
  }, {
    tableName: "items",
    timestamps: true,
    underscored: true,
  });

  Item.associate = (models) => {
    Item.belongsTo(models.Store, { foreignKey: "store_id" });
    Item.belongsTo(models.Category, { foreignKey: "category_id" });
  };

  return Item;
};
