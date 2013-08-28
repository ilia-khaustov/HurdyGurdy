var fs = require('fs');
var url = require('url');
var http = require('http');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var player = require('./player.js');

var tracksList = [];

function initPlayback() {
	if (tracksList.length <= 0) {
		return;
	}
	if (player.isPlaying()) {
		console.log('Still playing, wait for end.')
		return;
	}

	console.log('Tracks : ' + tracksList.length);
	player.play(tracksList[0]);
   	tracksList[0].on('end', function() {
   		player.onFlush = function() {
	   		console.log('Custom onFlush');
	        tracksList.splice(0, 1);
	        initPlayback();
   		};
   	});
}

exports.add = function(file_url) {
	var options = {
	    host: url.parse(file_url).host,
	    port: 80,
	    path: url.parse(file_url).pathname
	};
	http.get(options, function(res) {
		tracksList.push(res);
		initPlayback();
	});
};
