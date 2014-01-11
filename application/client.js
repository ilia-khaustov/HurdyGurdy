var md5 = require('MD5');
var Track = require('./track');
var VK = require('vkapi');
var EventEmitter = require('events').EventEmitter;

function Client(object){

    var id = md5(new Date());
    var socket = object.socket;    
    var manager = object.manager;
    var authenticated = false;
    var user_id = null;
    var emitter = new EventEmitter();
    var app = object.app;

    var vk = new VK({
            'appID': app.get('client_id'),
            'mode': 'oauth'        
        });

    var getUserId = function(){
        return user_id;
    }

    var initClient = function(){
        manager.getVolume(function(volume){
            socket.emit('currentVolume', volume);
        });

        socket.emit('playlist', manager.getPlaylist());
        socket.emit('currentTrack', manager.getCurrentTrack());    

        setOnAuthHandler();
    };

    var onSocketDisconnect = function(callback){
        socket.on('disconnect', callback);
    };

    var onAuthenticated = function(callback){        
        emitter.on('authenticated', callback);
    }

    var setAuthenticated = function(){
        authenticated = true;
        emitter.emit('authenticated');        
    }

    var equalsIdsAndSetAuthenticated = function(id1, id2){
        if (id1 == id2) {
            setAuthenticated();
        };
    }

    var onVKRequestUsersGetCallback = function(user){
        vk.on('done:users.get', function(_o) {
            var vk_id = (_o.response) ? _o.response[0].uid : null;
            user_id = user.user_id;
            equalsIdsAndSetAuthenticated(vk_id, user.user_id);
        });
    }

    var setOnAuthHandler = function(){
        socket.on('auth', function(user){           
            vk.setToken({token: user.token});
            vk.request('users.get', {});
            onVKRequestUsersGetCallback(user);
        });
    }
     
    var setOnAdvancedHandler = function(){        
        socket.on('send_track_to_playlist', function (data) {
            var track = new Track(data);
            manager.addTrackToPlaylist(track);
        });

        socket.on('remove_track_from_playlist', function(trackId) {
            console.log('add remove track from queue!!!');
        });
        
        socket.on('stop', function() {
            manager.stop();
        });

        socket.on('play', function() {            
            manager.play();
        });

        socket.on('skip', function() {
            manager.skip();
        });

        socket.on('setVolume', function(value){
            manager.setVolume(value + '%');
        });
    };

    var isAuthenticated = function(){
        return authenticated;
    }

    var getSocket = function(){
        return socket;
    };

    var getAddress = function(){
        return socket.handshake.address.address;
    };

    var getId = function(){
        return id;
    };

    var emitSocket = function(event, data){
        socket.emit(event, data);
    };

    var onSocket = function(event, callback){
        socket.on(event, callback)
    };

    var emit = function(event, data){
        emitter.emit(event, data);
    }

    var on = function(event, callback){
        emitter.on(event, callback);
    }

    initClient();

    return {
        getUserId: getUserId,
        onAuthenticated: onAuthenticated,
        setOnAdvancedHandler: setOnAdvancedHandler,
        onSocketDisconnect: onSocketDisconnect,
        getSocket: getSocket,
        getAddress: getAddress,
        getId: getId,
        emitSocket: emitSocket,
        onSocket: onSocket,
        emit: emit,
        on: on
    }
}

exports = module.exports = Client;