// ENVIRONMENTS

var dev = {
	win : {
		mplayer_exec : 'C:/candy/mplayer/mplayer.exe'
	}
};

// Current parameters
var currentEnvironment = dev;
var currentOs = 'win';

exports.mplayer_exec = currentEnvironment[currentOs].mplayer_exec;