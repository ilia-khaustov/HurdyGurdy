var child_process = require('child_process');
var config = require('../config.js');

var queue = [];
var decoder = null;
var isBusy = false;

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
		queue.unshift(track);
		track = null;
	}

	if (isBusy) return;

	track = queue.pop();
	if (!track) {
		return;
	}

	play(track, function() {
		init(queue.pop());
	});
}

exports.sendToQueue = function(track) {
	console.log('Added to queue: ');
	for (var key in track) {
		console.log(key + ": " + track[key]);
	}
	init(track);
};
