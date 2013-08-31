var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , io = require('socket.io')
  , tracks = require('./tracks')
  , path = require('path');

var app = express();

// all environments
app.set('port_http', process.env.PORT || 80);
app.set('port_ws', 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/listen', function(req, res) {
  tracks.play(req, res);
});

serverWs = http.createServer(app);

app.listen(app.get('port_http'), function() {
  console.log('Express server listening on port ' + app.get('port_http'));
});

serverWs.listen(app.get('port_ws'), function() {
  console.log('WebSockets server listening on port ' + app.get('port_ws'));
});

listener_ws = io.listen(serverWs);
listener_ws.sockets.on('connection', function (socket) {

  socket.on('send_track_to_queue', function (track) {
    tracks.sendToQueue(track);
  });

});
