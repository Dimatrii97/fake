const { DataTypes, Model } = require('sequelize');
const sequelize = require('../db');
class Task extends Model {}
Task.init(
  {
    id: {
      type: DataTypes.STRING(80),
      primaryKey: true,
      allowNull: false,
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    subtitle: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    settask: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },
    scanned: {
      type: DataTypes.BOOLEAN,
    },
    status: {
      type: DataTypes.BOOLEAN,
    },
    startdate: {
      type: DataTypes.DATEONLY,
    },
    deadline: {
      type: DataTypes.DATEONLY,
    },
    type: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING(8),
      allowNull: false,
    }
  },
  {
    sequelize,
    modelName: 'task',
  }
);
module.exports = Task;
