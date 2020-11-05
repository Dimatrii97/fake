const Sequelize = require('sequelize');
const sequelize = new Sequelize ('d5njght44da1lo', 'gpykdpcehqnalr', '3e458a0c9c7afa61c7e0889b073d4b6e89fd880368fdf6f49c70fce37516e886', {
  host: 'ec2-54-246-67-245.eu-west-1.compute.amazonaws.com',
  port:'5432',
  dialect:'postgres',
  define: {
    timestamps: false
  }
});
sequelize.sync();
sequelize.authenticate().then(() => {
  }).catch(err => {
  })
module.exports = sequelize;