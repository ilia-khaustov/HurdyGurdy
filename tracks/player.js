var fs = require('fs');
var lame = require('lame');
var Speaker = require('speaker');

var options = {
	audio: {
		channels: 2,
		bitDepth: 16,
		sampleRate: 44100
	}
};

var decoderMp3 = lame.Decoder();
var speaker = new Speaker(options);
var stop = true;

var currentStream = null;

speaker.on('flush', function() {
	console.log('Track ended.');
	stop = true;
	exports.onFlush();
});

function playMp3(dataStream) {
	console.log('Track started.');
	currentStream = dataStream;
	currentStream.pipe(decoderMp3, {end:false}).pipe(speaker, {end:false});
}

exports.play = function(dataStream) {
	playMp3(dataStream);
	stop = false;
};

exports.isPlaying = function() {
	return !stop;
};

exports.onFlush = function() {
	return;
};