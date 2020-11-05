

const Messages = require('../models/messages');
const { Op } = require('sequelize');

   module.exports.findAllLastMess=(socket, user) =>
     Messages.findAll({where: {[Op.or]: [{fromid: socket.decoded.id, toid:user.id}, {toid: socket.decoded.id, fromid:user.id}]}, order:[['id', 'DESC']], limit: 1
  })

  module.exports.newMessUsers=(socket, toid, text, date)=>
     Messages.create({fromid:socket.decoded.id, toid, text, date, scanned:false})
  

  module.exports.getUserLastMess=(socket)=>{
    let to = Messages.findAll({
      where: { fromid: socket.decoded.id },
      attributes: ['toid'],
      group: ['toid'],
    });
    let from = Messages.findAll({
      where: { toid: socket.decoded.id },
      attributes: ['fromid'],
      group: ['fromid'],
    });
    return Promise.all([from, to])
      .then((mess) => {
        let newmessageTo = mess[0].map((el) => el.fromid);
        let newmessageFrom = mess[1].map((el) => el.toid);
        return new Set([...newmessageFrom, ...newmessageTo]);
        
      })
      .then((messages) => {
        if (messages.size) {
          return  require('./user').getUserLastMess(socket, messages)
        } else{
          socket.emit('setUserLastMess', []);
          return Promise.reject();
        } 
      })
      .then(async (users) => {
        for (const user of users)
          await Messages.findAll({
            where: { [Op.or]: [ { fromid: socket.decoded.id, toid: user.id }, { toid: socket.decoded.id, fromid: user.id }]},
            order: [['id', 'DESC']],
            limit: 1
          }).then((mess) => {
            user.dataValues.mess = mess[0];
          });
          
        return users;
        
      })
  }
 

  module.exports.updateViewedMess=(socket, id) =>
    Messages.update(
    { scanned: true },
    { where: { toid: socket.decoded.id, fromid: id } }
  )
  module.exports.getuserMessages = (socket, id, offset) =>
    Messages.findAll({
    where: { [Op.or]: [ { fromid: socket.decoded.id, toid: id }, { toid: socket.decoded.id, fromid: id }, ], },
    order: [['id', 'DESC']],
    limit: 15,
    offset: offset,
  })