const Enrolment = require('./enrolment');
const Task = require('./task');
const User = require('./user');
const Range = require('./range');
const Messages = require('./messages');
const Subtask = require('./subtask');
User.belongsToMany(Task, { through: Enrolment });
Task.belongsToMany(User, { through: Enrolment });
Task.hasMany(Subtask);
module.exports = {
  Enrolment,
  Task,
  User,
  Range,
  Messages,
  Subtask
} 