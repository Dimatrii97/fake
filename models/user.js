const { DataTypes, Model } = require('sequelize');
const sequelize = require('../db');
class User extends Model {}
User.init(
  {
    id: {
      type: DataTypes.STRING(80),
      primaryKey: true,
      allowNull: false,
    },
    login: {
      type: DataTypes.STRING(30),
    },
    password: {
      type: DataTypes.STRING(80),
    },
    name: {
      type: DataTypes.STRING(30),
    },
    email: {
      type: DataTypes.STRING(50),
    },
    age: {
      type: DataTypes.DATEONLY,
    },
    img: {
      type: DataTypes.STRING,
    },
    tel: {
      type: DataTypes.STRING,
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
    modelName: 'user',
  }
);
module.exports = User;


