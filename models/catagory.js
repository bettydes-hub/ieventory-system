module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define("Category", {
    category_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
    },
  }, {
    tableName: "categories",
    timestamps: true,
    underscored: true,
  });

  Category.associate = (models) => {
    Category.hasMany(models.Item, { foreignKey: "category_id" });
  };

  return Category;
};
