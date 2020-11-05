const { DataTypes, Model } = require('sequelize');
const sequelize = require('../db');
class Subtask extends Model {}
Subtask.init({
  id: {
     type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false, 
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status:{
    type: DataTypes.BOOLEAN,
  },

}
 ,
  {
    sequelize,
    modelName: 'subtask',
  }
);
module.exports = Subtask;

