const User = require('../models/user');
const Range = require('../models/range');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
let allUsers = (socket, attributes = ['name', 'id', 'img', 'position', 'department', 'email', 'age', 'tel', 'range']) => {
  return User.findAll({
    order: ['department'],
    where: { id: { [Op.ne]: socket.decoded.id, }, id: { [Op.ne]: 'admin', }, },
    attributes: attributes,
  });
};
let getDepartamentsUsers = () =>
  Range.findAll({ attributes: ['department'], group: ['department'] })

module.exports.allUsers = allUsers
module.exports.getDepartamentsUsers = getDepartamentsUsers

module.exports.getUser = (socket, attributes = ['name', 'id', 'img', 'position', 'department', 'email', 'age', 'tel', 'range'], id = null, ) => {
  let searchId = id==null? socket.decoded.id : id
  return User.findAll({
    where: {id: searchId},
    attributes
  });
};

module.exports.getUsersDepartment = (socket) => {
 return User.findOne({where:{id: socket.decoded.id}, attributes: [  'department', 'range']}).then((user)=>{
    return  User.findAll({
      order: ['position'],
      where: { department: user.department, id: { [Op.ne]: socket.decoded.id, }},
      attributes: ['name', 'id', 'img', 'position', 'department', 'range']
    })
 })
};


module.exports.findOne = (socket, id, attributes) => {
  let userWrap = null;
  return User.findOne({ where: { id: id }, attributes: ['id', 'name', 'img']})
    .then((user) => {
      userWrap = user;
      return require('./messages').findAllLastMess(socket, user);
    })
    .then((mess) => {
      userWrap.dataValues.mess = mess[0];
      return userWrap;
    });
};
module.exports.getUserLastMess = (socket, messages)=>{
  return  User.findAll({
    where: { id: { [Op.and]: { [Op.or]: [...messages], [Op.ne]: socket.decoded.id, }, }, },
    attributes: ['id', 'name', 'img'],
  });
  
}

module.exports.adminNewUser = (socket, data)=>{
  let uid = uuidv4();
  let name =  data.firstname + " " + data.lastname;
  let password = bcrypt.hashSync(data.password, 10);
   return Range.findOne({
      where: { department: data.department, position: data.position },
    })
    .then((range) => {
      return User.create({ id: uid, login: data.login, password: password, name: name, email: data.email, age: data.age, img: 'https://www.ercolemoretti.it/WP2016/wp-content/uploads/2016/06/em_avatar_default-user.png', tel: data.tel, range: range.range, department: data.department, position: data.position, })
    })
    .then((res) => {
      return   allUsers(socket);
    })
  }


module.exports.getpositions = (department)=>
  Range.findAll({
  where: { department },
  attributes: ['position'],
})
  
module.exports.delUser = (id)=>{
 return User.destroy({ where: { id } }).then((res) => allUsers(socket))
}
  

module.exports.addNewDepartment = ({range, department, position})=>{
  let uid = uuidv4();
  return Range.create({ id: uid, range, department, position, }).then((res)=> getDepartamentsUsers())
}
  
module.exports.allDeps = ()=>
  Range.findAll({ order: ['department'] })

module.exports.getUserBySearch = (text)=>{
  if (text == null) text = '';
  return User.findAll({
  where: { name: { [Op.iLike]: `%${text}%` } },
  attributes: ['name', 'img', 'id'],
})
}

  