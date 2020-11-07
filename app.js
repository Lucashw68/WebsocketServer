const Express = require("express")();
const Http = require("http").Server(Express);
const Socketio = require("socket.io")(Http);
const Models = require('./database/Model');

const mongoose = require('mongoose')

const dev = true
const addr = dev
  ? 'mongodb://mongodb'
  : 'mongodb://[url mongodb]'

const connect = mongoose.connect(addr, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log('Connected to mongodb database');
      if (dev) {
        mongoose.connection.dropDatabase();
      }
    })
    .catch(err => {
        console.error('Could not connect to mongodb database:', err.stack);
        process.exit(1);
    });

Http.listen(3000, () => {
    console.log("Listening at :3000...");
});

Socketio.on("connection", socket => {

  socket.emit('available', (true))
  console.log("User " + socket.id + " connected")

  connect.then(db => {
    Models.find({}).then(model => {
      model.forEach(property => {
        socket.emit('list-property', (property))
      })
    });
  })

  socket.on("disconnect", () => {
    console.log("User " + socket.id + " disconnected")
  });

  socket.on('list-property', (data) => {
    socket.broadcast.emit('list-property', (data));
    connect.then(db => {
      Models.create({ property: data.property });
    })
  });

  socket.on('joined', (data) => {
    console.log("User " + data + " connected")
    socket.broadcast.emit('joined', (data));
    socket.emit('connections', Object.keys(Socketio.sockets.connected).length);
  });

  socket.on('leave', (data) => {
    socket.broadcast.emit('leave', (data));
  });

});
