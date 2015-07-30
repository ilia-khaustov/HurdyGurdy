var Track = require('./track');
var Player = require('./player');
var Volumer = require('./volumer');
var EventEmitter = require('events').EventEmitter;
var Stopwatch = require('stopwatch-emitter').Stopwatch;
var JSONFile = require('jsonfile');


function Manager(){

	var playlist = [];
	var currentTrack = null;	

	var player = new Player();
	var volumer = new Volumer();
	var emitter = new EventEmitter();
	var stopwatch = null;
	var radiolist = null;

	var optionPlayNext = true;

	var initStopwatch = function(duration){
		duration = (duration) ? duration : '0';		
		stopwatch = new Stopwatch(duration+'s');
	}
	
	var startStopwatch = function(){
		if(stopwatch){
			stopwatch.start();
		}
	}


	var readRadioList = function(filename){
		JSONFile.readFile(filename, function(err, content){

			if(!err){
				radiolist = content;
			}else{
				console.log('Not valid radiolist file. Please, check valid JSON');
			}
		});
	}


	var shuffle = function() {
		playlist = shuffleYates(playlist);
		emit('updatePlaylist', getPlaylist());
	}


	var shuffleYates = function(array) {
		var currentIndex = array.length, temporaryValue, randomIndex;  		
  		while (0 !== currentIndex) {

    		// Pick a remaining element...
    		randomIndex = Math.floor(Math.random() * currentIndex);
    		currentIndex -= 1;

    		// And swap it with the current element.
    		temporaryValue = array[currentIndex];
    		array[currentIndex] = array[randomIndex];
    		array[randomIndex] = temporaryValue;
		}

		return array;
	}

    var getCurrentTime = function(){
    	var curtime = 0;
    	
    	if(stopwatch && stopwatch.isRunning()){
    		curtime = stopwatch.getCurrentTime();
    	}else{
    		curtime = 0;
    	}

    	return curtime;
    }

    var stopStopwatch = function(){
    	if(stopwatch){
    		stopwatch.stop();
    	}
    }

	var getVolume = function(callback){
		volumer.getVolume(callback);
	}

	var onVolumeHandler = function(){
		volumer.on('volume', function(value){		
			emit('currentVolume', value);
		});
	}

	var getRadiolist = function(){		
		return radiolist;
	}

	var setVolume = function(value){
		volumer.setVolume(value);
	}

	var getCurrentTrack = function(){
		
		if(currentTrack){
			currentTrack.setPlayingTime(getCurrentTime());
		}
		
		return (currentTrack) ? currentTrack.getData() : null;
	}

	var setCurrentTrack = function(track){
		currentTrack = track;		
		emit('currentTrack', currentTrack);
	}

	var addTrackToPlaylist = function(track){
		var length = playlist.push(track);

		checkPlayerAndPlayNext();

		emit('updatePlaylist', getPlaylist());
		return length;
	}

	var getTrackFromPlaylist = function(){
		var track = playlist.shift();

		emit('updatePlaylist', getPlaylist());
		return track;
	}

	var getPlaylist = function(){
		return playlist;
	}

	var setPlayerOnStart = function(callback){
		player.on('playstart', callback);
	}

	var setPlayerOnEnd = function(callback){
		player.on('playend', callback);
	}	

	var playTrack = function(track){
		setCurrentTrack(track);
		initStopwatch(track.getDuration());		
		player.play(track.url);
		startStopwatch();
	}

	var play = function(){
		setOptionPlayNext(true);
		checkPlayerAndPlayNext();
	}

	var playNext = function(){
		var track = getTrackFromPlaylist();		

		if(track){
			playTrack(track);
		}else{
			setCurrentTrack(null);
		}
	}

	var skip = function(){
		setCurrentTrack(null);
		stopStopwatch();
		player.stop();
	}

	var stop = function(){
		setCurrentTrack(null);
		stopStopwatch();
		setOptionPlayNext(false);
		player.stop();
	}    

	var setOptionPlayNext = function(value){
		optionPlayNext = value;
	}

	var emit = function(event, data){
		emitter.emit(event, data);
	}

	var on = function(event, callback){
		emitter.on(event, callback);
	}

	var checkPlayerAndPlayNext = function(){
		if(!player.isBusy() && optionPlayNext){
			playNext();
		}
	}

	var initPlayer = function(){		
		setPlayerOnEnd(checkPlayerAndPlayNext);
		onVolumeHandler();
		readRadioList('radiolist.json');
	}


	initPlayer();

	return {
		getVolume: getVolume,
		setVolume: setVolume,
		getRadiolist: getRadiolist,
		getCurrentTrack: getCurrentTrack,
		addTrackToPlaylist: addTrackToPlaylist,
		getPlaylist: getPlaylist,
		playNext: playNext,
		play: play,
		stop: stop,
		skip: skip,
		on: on,
		emit: emit,
		shuffle: shuffle,
	}
}

exports = module.exports = Manager;