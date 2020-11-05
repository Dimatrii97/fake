const cors = require('cors');
var express = require('express');
const app = express();
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const jwt = require('jsonwebtoken');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const { Op } = require('sequelize');
const {Enrolment, Task, User, Range, Messages, Subtask} = require('./models/index');

const authRoutes = require('./routes/auth.routes');

app.use('/api/auth', authRoutes);

app.post('/api/login', (req, res, next) => {});
app.post('/api/userMes/', (req, res) => {
  Messages.findAll({
    where: {
      [Op.or]: [
        { fromid: req.body.fromid, toid: req.body.toid },
        { toid: req.body.fromid, fromid: req.body.toid },
      ],
    },
    order: [['id', 'DESC']],
    limit: 15,
    offset: req.body.offset,
  }).then((mess) => {
    mess = mess.reverse();
    res.json(mess);
  });
});
const staticFileMiddleware = express.static(path.join(__dirname, 'dist'))
app.use(staticFileMiddleware);
app.get('/*',  (req, res) => 
{
res.sendFile(path.resolve(__dirname, 'dist','index.html'))
});
io.use(function (socket, next) {
  if (socket.handshake.query && socket.handshake.query.token){
    jwt.verify(socket.handshake.query.token, 'ss', function(err, decoded) {
      if (err) return next(new Error('Authentication error'));
      socket.decoded = decoded;
      next();
    });
  }
  else {
    next(new Error('Authentication error'));
  }  
}).on('connection', function (socket) {
  console.log("connect")
  socket.join(socket.decoded.id);
  socket.on('disconnect', function (data) {
    socket.leave(socket.decoded.id);
  });
  require('./socket/user').getUser(socket, ['position'], socket.decoded.id).then(user=>{
    if(user[0].position === "admin"){
      socket.emit('setRoleAdmin');
    }
  })
  //message
  socket.on('getUserLastMess', function () {
    require('./socket/messages').getUserLastMess(socket).then((users)=>{
      socket.emit('setUserLastMess', users);
    }).catch((error)=>console.log("Заглушка 67"))
  });
  socket.on('newMessUsers', function ({ toid, text, date }) {
    require('./socket/messages').newMessUsers(socket, toid, text, date).then((mes)=>{
      socket.to(mes.toid).emit( 'SetNewMess' , {message_id:mes.id,fromid:mes.fromid, toid:mes.toid, scanned:mes.scanned, text: mes.text,date: mes.date})
      socket.emit( 'SetNewMess' , {message_id:mes.id,fromid:mes.fromid, toid:mes.toid, scanned:mes.scanned, text: mes.text,date: mes.date})
    });
    
  });
  socket.on('updateViewedMess', function (id) {
    require('./socket/messages').updateViewedMess(socket, id).then((res) => {
      console.log(res);
      socket.to(id).emit('updateScanned', socket.decoded.id);
      socket.emit('updateScanned', id);
      socket.to(id).emit('updateAllScanned');
    });
  });
  socket.on('getuserMessages', function ({ id, offset }) {
    require('./socket/messages').getuserMessages(socket, id, offset).then((mess) => {
      mess = mess.reverse();
      socket.emit('setuserMessages', mess);
    });
  });

  //User 
  socket.on('adminNewUser', function (data) {
    require('./socket/user').adminNewUser(socket, data).then((users)=>socket.emit('allUsers', users))
    });

  socket.on('getpositions', function (data) {
    require('./socket/user').getpositions(data).then((tableRange) => {
      socket.emit('setPosition', tableRange);
    });
  });

  socket.on('delUser', function (id) {
    require('./socket/user').delUser(id).then((users)=>socket.emit('allUsers', users))
  });

  socket.on('addNewDepartment', function (data) {
    require('./socket/user').addNewDepartment(data).then(
        (tableRange) => {
          socket.emit('setDepartaments', tableRange);
        }
      );
  });

  socket.on('getDepartamentsUsers', function () {

    require('./socket/user').getDepartamentsUsers().then(
      (tableRange) => {
        socket.emit('setDepartaments', tableRange);
      }
    );
  });

  socket.on('allDeps', function () {
    require('./socket/user').allDeps().then((users) => {
      socket.emit('allDeps', users);
    });
  });
  socket.on('searchUsersByName', function (name) {
    require('./socket/user').getUserBySearch(name).then((users) => {
      socket.emit('searchUsers', users);
    });
  });
  socket.on('allUsers', function () {
    if (socket.decoded.id == '1') {
      require('./socket/user').allUsers(socket, [ 'name', 'id', 'img', 'position', 'department', ])
      .then((users)=>{
        socket.emit('allUsers', users);
      });
    } 
    else {
      require('./socket/user').allUsers(socket, ['name', 'id', 'img']).then((users)=>{
        socket.emit('allUsers', users);
      });
    }
  });

  socket.on('getUsersDepartment', function (data) {
    require('./socket/user').getUsersDepartment(socket).then((users) => {
        socket.emit('currentUsers', users);
      });;
  });
  socket.on('getUser', function (data) {
    require('./socket/user').getUser(socket).then(user=>{
      socket.emit('currentUser', user[0] ); 
    });
  });
  
  socket.on('getUserById', function (id) {
    require('./socket/user').getUser(socket, ['name', 'img', 'id'], id).then(user=>{
      socket.emit('currentUsers', user ); 
    });
  });







  //==============admin
  socket.on('setTasks', function (data) {
    require('./socket/tasks').setTask(socket, io, data).then((task)=>{
      console.log(task);
      let { id, title, deadline, startdate, color, type } = task;
      for (const user of task.users) {
        if (io.nsps['/'].adapter.rooms[user.id]){
        socket.to(user.id).emit('newTasksOnline', { id, title, deadline, startdate, color, type, users: task.users });
        }
      }
    })
  })
  
  
  socket.on('getTasks', function (data) {
    getTaskTitle(socket);
  });

 
  socket.on('getTaskById', function (id) {
    require('./socket/tasks').getTasks(id).then((task) => {
      socket.emit("setTaskAdditional", task)
    });
  });

  socket.on('updateSubTask', function (id) {
    require('./socket/tasks').updateSubtask(id).then((TasksUser)=>{
      socket.emit("updatedSubtask", {idTask:TasksUser.id, idSubtasks:id })
      for (const user of TasksUser.users) {
        if (io.nsps['/'].adapter.rooms[user.id]){
          socket.to(user.id)
            .emit('updatedSubtask', {idTask:TasksUser.id, idSubtasks:id } );
          }
        }
      })
  });
  socket.on('completeTask', function (id) {
    Task.update({ status: true }, { where: { id: id } });
    Task.findOne({
      where: { id: id },
      attributes: ['id'],
      include: [{ model: User, attributes:["id"]}]
    }).then((TasksUser)=>{
      socket.emit("closeTask", {idTask:TasksUser.id })
      for (const user of TasksUser.users) {
        if (io.nsps['/'].adapter.rooms[user.id]){
          socket.to(user.id)
            .emit('closeTask', {idTask:TasksUser.id} );
          }
        }
      })
  });
  
  socket.on('updateViewedTask', function (id) {
    Task.update({ scanned: true }, { where: { id: id } }).then((res) => {
    });
  });
 
 
  socket.on('', function () {});
  socket.on('', function () {});
  socket.on('', function () {});
});


function getTaskById(socket, id) {
  return 
}
function getTaskTitle(socket) {
  User.findOne({ where: { id: socket.decoded.id } }).then((user) => {
    if (!user) return;
    user
      .getTasks({
        where: { status: false },
        attributes: ['id', 'startdate', 'deadline', 'title', 'scanned', "color"],
        include: [{ model: User, attributes: ['id']}]
      })
      .then( (tasks) => {
         socket.emit('getAllTasks', tasks)
        })
      
  });
}
http.listen(process.env.port, function () {
  console.log('Express serving on 5000!');
});
