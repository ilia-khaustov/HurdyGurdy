var url = require('url');
var http = require('http');
var player = require('./player.js');

function initPlayback(res) {
	player.play(res);
	player.onPlaybackEnds(function() {
		console.log('Playback ends.');
	});
}

exports.add = function(file_url) {
	var options = {
	    host: url.parse(file_url).host,
	    port: 80,
	    path: url.parse(file_url).pathname
	};
	http.get(options, function(res) {
		initPlayback(res);
	});
};
