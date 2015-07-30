var child_process = require('child_process');
var EventEmitter = require('events').EventEmitter;

function Volumer(){

	var cmd_volumer_exec = 'amixer';
	var emitter = new EventEmitter();

	var setVolume = function(value){

		var process = child_process.spawn(cmd_volumer_exec, ['set', 'Master', value]);
		var volume = value.split('%')[0];	
		emit('volume', volume);
	}

	var getVolume = function(callback){

		var process = child_process.exec(cmd_volumer_exec 
			+ ' get Master | awk \'/Mono.+/ {print $6=="[off]"?$6:$4}\' | tr -d \'[]\'',
			function (error, stdout, stderr) {
				if (error == null) {
					var volume = stdout.split('%')[0];				
					callback(volume);
				}
			});
	}

	var on = function(event, callback){
		emitter.on(event, callback);
	} 

	var emit = function(event, data){
		emitter.emit(event, data);
	}

	return {
		setVolume: setVolume,
		getVolume: getVolume,
		on: on,
		emit: emit
	}
}

exports = module.exports = Volumer;