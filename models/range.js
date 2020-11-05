const { DataTypes, Model } = require('sequelize');
const sequelize = require('../db');
class Range extends Model {}
Range.init(
  {
    id: {
      type: DataTypes.STRING(80),
      primaryKey: true,
      allowNull: false,
    },
    range: {
      type: DataTypes.INTEGER,
    },
    department: {
      type: DataTypes.STRING(30),
    },
    position: {
      type: DataTypes.STRING(30),
    },
  },
  {
    sequelize,
    modelName: 'range',
  }
);
module.exports = Range;
