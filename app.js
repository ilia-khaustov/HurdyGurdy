var express = require('express'),
    http = require('http'),
    io = require('socket.io'),
    path = require('path'),
    md5 = require('MD5'),
    Client = require('./application/client'),
    Pool = require('./application/pool'),
    Manager = require('./application/manager');


var app = express();

var pool = new Pool();
var manager = new Manager();


app.set('port_http', 80);
app.set('port_websocket', 3001);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.set('client_id', '3668304')

app.use(express.favicon());
app.use(express.logger());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', function(request, response){    
    response.render('index', {client_id: app.get('client_id')});
});

app.listen(app.get('port_http'), function() {
    console.log('Express server listening on port ' + app.get('port_http'));
});


WebsocketServer = http.createServer(app);

WebsocketServer.listen(app.get('port_websocket'), function() {
    console.log('WebSockets server listening on port ' + app.get('port_websocket'));
});


WebsocketListener = io.listen(WebsocketServer);

WebsocketListener.sockets.on('connection', function (socket) {

    var client = new Client({
        socket: socket,        
        manager: manager,
        app: app
    });

    pool.addClient(client);
});


manager.on('updatePlaylist', function(){
    pool.emitSocket('playlist', manager.getPlaylist());
});

manager.on('currentTrack', function(){
    pool.emitSocket('currentTrack', manager.getCurrentTrack());
});

manager.on('currentVolume', function(value){
    pool.emitSocket('currentVolume', value);
});