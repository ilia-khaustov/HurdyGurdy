// ENVIRONMENTS

var dev = {
	win : {
		mplayer_exec : 'C:/candy/mplayer/mplayer.exe'
	},
	linux : {
		mplayer_exec : 'mplayer'
	}
};

var locales = {
	ru : 'ru',
	en : 'en'
};

// Current parameters
var currentEnvironment = dev;
var currentOs = 'win';
var currentLocale = locales.ru;

// Exports
exports.mplayer_exec = currentEnvironment[currentOs].mplayer_exec;
exports.locale = currentLocale;