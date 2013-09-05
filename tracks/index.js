var child_process = require('child_process');
var config = require('../config.js');

var queue = [];
var decoder = null;
var isBusy = false;
var sockets = [];
var addresses = [];
var trackPlaying = null;
var skipVotes = [];

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
    }

	if (isBusy) return;

	track = queue.pop();
	if (track) {
        play(track, function() {
            trackPlaying = null;
            init();
            sendToSockets('playlist', queue);
        });
	}

    trackPlaying = track;
    sendToSockets('track_playing', trackPlaying);
}

function sendToQueue(track) {
	console.log('Added to queue: ');
	for (var key in track) {
		console.log(key + ": " + track[key]);
	}
	init(track);
}

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

function stop() {
    if (decoder) {
        decoder.kill();
        decoder = null;
        isBusy = false;
        sendToSockets('track_playing', null);
    }
}

function skip(address) {
    if (skipVotes.indexOf(address) < 0) {
        skipVotes.push(address);
    }
    if (skipVotes.length >= addresses.length/2) {
        skipVotes = [];
        stop();
        init();
        sendToSockets('playlist', queue);
    }
}

exports.addClient = function(client) {
    if (client.socket) {
        sockets.push(client.socket);
        if (addresses.indexOf(client.address) < 0) {
            addresses.push(client.address);
        }

        client.socket.on('send_track_to_queue', function (track) {
            sendToQueue(track);
            sendToSockets('playlist', queue);
        });

        client.socket.on('remove_track_from_queue', function(trackId) {
            removeFromQueue(trackId);
            sendToSockets('playlist', queue);
        });

        client.socket.on('stop', function() {
            stop();
        });

        client.socket.on('skip', function() {
            skip(client.address);
        });

        sendToSockets('playlist', queue);
        sendToSockets('track_playing', trackPlaying);
    }
};

exports.removeClient = function(client) {
    if (client.socket) {
        sockets.remove(client.socket);
        addresses.remove(client.address);
    }
};
