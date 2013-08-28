try {

  var express = require('express'),
      app = express(),
      http = require('http'),
      server = http.createServer(app),
      io = require('socket.io').listen(server),
      fs = require('fs');

  app.listen(80);
  server.listen(3000);

  setRoutes(app);

  io.sockets.on('connection', function (socket) {
    socket.emit('news', { hello: 'world' });
    socket.on('other event', function (data) {
      console.log(data);
    });
  });

} catch (e) {
  console.log(e);
}

function setRoutes(app) {

  function getFile (res, file) {
    res.sendfile(__dirname + '/' + file);
  };

  app.get('/', function (req, res) {
    this.getFile(res, 'index.htm')
  });

  app.get('/js/engine', function (req, res) {
    this.getFile(res, 'engine.js')
  });

}