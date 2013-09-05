var child_process = require('child_process');
var config = require('../config.js');

var queue = [];
var decoder = null;
var isBusy = false;
var sockets = [];

function play(track, onPlaybackEnds) {
	decoder = child_process.spawn(config.mplayer_exec, [ '-really-quiet', '-nolirc', track.url]);
	decoder.stdout.pipe(process.stdout);
	decoder.stderr.pipe(process.stderr);
	console.log('>>> ' + track.title + ' by ' + track.artist + ' is playing.');
	decoder.on('exit', function (code) {
		if(code == 0) {
			isBusy = false;
			onPlaybackEnds();
		} else if(code != null) {
			isBusy = false;
			console.log('Child process exited with code ' + code);
		}
	});
	isBusy = true;
}

function init(track) {
    if (track) {
        track.hgId = 1;
        if (queue.length > 0) {
            track.hgId = queue[0].hgId + 1;
        }
        queue.unshift(track);
        track = null;
    }

	if (isBusy) return;

	track = queue.pop();
	if (!track) {
		return;
	}

	play(track, function() {
		init();
		sendToSockets('playlist', queue);
	});
}

function sendToQueue(track) {
	console.log('Added to queue: ');
	for (var key in track) {
		console.log(key + ": " + track[key]);
	}
	init(track);
}

exports.sendToQueue = function(track) {
	sendToQueue(track);
};

function removeFromQueue(trackId) {
	for (var key in queue) {
		var track = queue[key];
		if (track.hgId && track.hgId == trackId) {
			queue.splice(key,1);
			return;
		}
	}
}

function sendToSockets(action, data) {
    for (var key in sockets) {
        sockets[key].emit(action, data);  
    }
}

exports.addClient = function(client) {
    if (client.socket) {
        sockets.push(client.socket);

        client.socket.on('send_track_to_queue', function (track) {
            sendToQueue(track);
            sendToSockets('playlist', queue);
        });

        client.socket.on('remove_track_from_queue', function(trackId) {
            removeFromQueue(trackId);
            sendToSockets('playlist', queue);
        });

        sendToSockets('playlist', queue);
    }
}
