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

var onPlaybackEnds = function() {};

function playMp3(dataStream) {
	speaker = new Speaker(options);
	decoderMp3 = lame.Decoder();
	dataStream.pipe(decoderMp3).pipe(speaker);
	
	speaker.on('flush', function() {
		onPlaybackEnds();
	});
}

exports.play = function(dataStream) {
	playMp3(dataStream);
};

exports.onPlaybackEnds = function(callback) {
	onPlaybackEnds = callback;
};