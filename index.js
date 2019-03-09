let express = require('express'); 
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
const cookie = require('cookie');

let activeUsers = [];
let messagesArr = [];

app.use(express.static('public'));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  
  let user = {};
  const prefix = ['Cool', 'Awesome', 'Fabulous', 'Crazy', 'Weird', 'Funny', 'Angry', 'Sad', 'Happy', 'Wild', 'Strong', 'Super'];
  const base = ['Guy', 'Person', 'Gal', 'Pal', 'Buddy', 'Man', 'Dog', 'Cat', 'Dude'];
  const suffix = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14'];

  socket.emit('chat history', messagesArr);
  user.name = prefix[randomNumber(12)] + base[randomNumber(8)] + suffix[randomNumber(11)];
  uniqueGeneration = activeUsers.filter(unique => (unique.name === user.name));

  if (uniqueGeneration.length === 0) {
    socket.name = user.name;
  } else {
    user.name = prefix[randomNumber(12)] + base[randomNumber(8)] + suffix[randomNumber(11)];
    socket.name = user.name;
  }

  socket.emit('create user', user)

  socket.on('cookie exists', function(existingUser) {
    user.name = existingUser
    activeUsers.push(user);
    socket.name = user.name;
    socket.broadcast.emit('user connected', user);
    socket.emit('you connected');
    io.emit('edit users', activeUsers)
  });
  
  socket.on('cookie does not exist', function() {
    activeUsers.push(user);
    socket.name = user.name;
    socket.broadcast.emit('user connected', user);
    socket.emit('you connected');
    io.emit('edit users', activeUsers)
  });

  socket.on('chat message', function(msg, user){
    
    let current = new Date();
    let time = current.getHours() + ':' + current.getMinutes();
    let string = msg;
    let nick = '/nick ';
    let nickColor = '/nickcolor '
    let newName = string.substring(6);
    let newColor = string.substring(11)

    if (string.indexOf(nick) == 0 && (newName != '')) {

      let oldName = user.name
      uniqueName = activeUsers.filter(unique => (unique.name === newName));

      if (uniqueName.length === 0) {

        user.name = newName;
        socket.name = newName;

        let index = activeUsers.findIndex(swap => swap.name === oldName);
        activeUsers[index].name = user.name;

        io.emit('edit users', activeUsers);
        socket.broadcast.emit('username change', user, time, oldName);
        socket.emit('personal username change', user, time, oldName);

      } else {
          socket.emit('username error');
      }
    }
    else if (string.indexOf(nickColor) == 0 && newColor != '') {
      let regex = /[0-9A-Fa-f]{6}/g;
      if(regex.test(newColor)) {
        user.color = newColor;
        socket.broadcast.emit('color change', user, time);
        socket.emit('personal color change', user, time);
      } else {
          socket.emit('color error');
      }
    }
    else { 
      if (messagesArr.length < 200){
        messagesArr.push('<div>'+ time + ' ' + '<p style="display: inline; color: #' + user.color + ';"> ' + user.name + '</p>' + ': ' + msg + '</div>')
      }else {
        while(messagesArr.length >= 200){
          messagesArr.splice(0,1);
        }
      } 
      socket.broadcast.emit('user message', msg, time, user);
      socket.emit('my message', msg, time, user);
    }
  }); 

  socket.on('disconnect', function(){
    let index = activeUsers.findIndex(remove => remove.name === socket.name);
    activeUsers.splice(index, 1);
    socket.broadcast.emit('user disconnected', socket.name)
    io.emit('edit users', activeUsers);
  });

});

function randomNumber(range) {
  return Math.floor((range * Math.random()));
};

http.listen(3000, function(){
  console.log('listening on *:3000');
});