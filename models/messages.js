const { DataTypes, Model } = require('sequelize');
const sequelize = require('../db');
class Messages extends Model {}
Messages.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    text: {
      type: DataTypes.STRING,
    },
    scanned: {
      type: DataTypes.BOOLEAN,
    },
    date: {
      type: DataTypes.STRING,
    },
    fromid: {
      type: DataTypes.STRING(90),
    },
    toid: {
      type: DataTypes.STRING(90),
    },
  },
  {
    sequelize,
    modelName: 'messages',
  }
);
module.exports = Messages;
