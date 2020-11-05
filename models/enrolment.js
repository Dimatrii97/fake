const { DataTypes, Model } = require('sequelize');
const sequelize = require('../db');
class Enrolment extends Model {}
Enrolment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
  },
  {
    sequelize,
    modelName: 'enrolment',
  }
);
module.exports = Enrolment;
