module.exports = (sequelize, DataTypes) => {
  const Store = sequelize.define("Store", {
    store_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    store_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: "stores",
    timestamps: true,
    underscored: true,
  });

  Store.associate = (models) => {
    Store.hasMany(models.Item, { foreignKey: "store_id" });
    Store.hasMany(models.User, { foreignKey: "store_id" });
  };

  return Store;
};
