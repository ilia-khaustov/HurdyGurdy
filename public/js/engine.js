var _tokenExpires = 0;
var _tracksFound = [];
var _userId = 0;
var _userAvatar = '';
var _serverHost = $.url().attr('host');
var	_socket = io.connect('ws://'+_serverHost+':3001');
var countdown = null;


ACCESS_TOKEN = null;

function doAuth() {
	window.open(
		"https://oauth.vk.com/authorize?" + 
		"client_id=" + app_client_id + "&" + 
		"scope=8&" + 
		"redirect_uri=http://" + _serverHost + "&" +
		"display=page&" + 
		"response_type=token", "_self"
		);
}

function getInputValueWithName(name) {
	return $('input[name="'+name+'"]').val();
}

function checkTokenExpired() {
	return (_tokenExpires <= (new Date()).valueOf());
}

function getDataFromUrl() {

	var url = $.url();
	var expires_in = url.fparam('expires_in') ? url.fparam('expires_in') : 0;

	ACCESS_TOKEN = url.fparam('access_token');
	_tokenExpires = (new Date()).valueOf() + parseInt(expires_in);
	_userId = url.fparam('user_id');

	saveDataToLocalStorage();

}

function checkAndDoAuthIfExpired() {
	if (checkTokenExpired()) {
		$('#vk_connect').html(getInputValueWithName('vk.wait_connect'));
		doAuth();
	} else {
		$('#vk_connect').hide();		
	}
}

function startAuthIfTokenExists() {
	if (ACCESS_TOKEN) { 
		startAuth();
		showUserInfo();
		_socket.emit('auth', {
			token:ACCESS_TOKEN, 
			user_id: _userId
		});
	}
}

function startAuth() {
	checkAndDoAuthIfExpired();
	setInterval(function() {
		checkAndDoAuthIfExpired();
	}, '1000000');
}

function sendToQueueTrackById(id){
	var track = _tracksFound[id];	
	sendToQueueTrack(track);
}

function renderUsers(users){	
	$('#users').empty();

	getUserInfo(users, function(result){
		
		for(var key in result.response){

			var userVK = result.response[key];			
			var img = $('<img />', {
				src: userVK.photo_50,
				height: '20px',
				width: '20px',
				title: userVK.last_name+ ' ' + userVK.first_name
			});

			var a = $('<a/>',{
				html: img, 
				href: 'http://vk.com/id' + userVK.uid
			});

			$('#users').append(a);
		}
	});
}

function setHandlers() {

	$('#vk_connect').on('click', function() {
		startAuth();
	});

	$('#showAudio').on('click', function() {
		showAudio();
	});

	$('#showRadio').on('click', function() {		
		showRadio();
	});

	$('.searchlist').on('click', '.searchItem', function(){
		event.stopPropagation();
		search($(this).html())
	});

	$('.searchlist').on('click', '.track-search', function(event) {
		event.stopPropagation();
		var id = $(this).attr('id').replace('trackSearch_', '');
		sendToQueueTrackById(id);
	});

	$('.playlist').on('click', '.track-playlist', function(event) {
		event.stopPropagation();
		var id = $(this).attr('id').replace('trackPlaylist_', '');
		removeFromQueueTrackById(id);
	});

	$('#vk_form_search').submit(function() {
		search($('#vk_search').val());
		return false;
	});

	$('#moveall').on('click', function() {		
		for(var key in _tracksFound){
			var track = _tracksFound[key];
			sendToQueueTrack(track);
		}
		return false;
	});


	_socket.on('playlist', function(tracks) {
		renderPlaylist(tracks);
	});

	_socket.on('users', function(users) {
		renderUsers(users);
	});
	

	_socket.on('currentTrack', function(track) {
		$('.track-playing').remove();

		if (track) {			
			$('#currentTrack').html(
				'<span class="track-playing">' + 
				track.artist + ' - ' + 
				track.title + ' - ' +
				formatDuration(track.duration) + 
				' <span id="countdown"></span>' +				
				'</span>'
				).attr({
					'data-url': track.url,
					'data-aid': track.aid
				});
			}

			$("#countdown").everyTime(1000, function(i) {
 				$(this).text(formatDuration(track.playing_time + i));
			});

			
		});

	_socket.on('currentVolume',function(value){
		$('#volumeSlider').children('a').css({left: value + '%'});	
	});


	$('#btn-stop').click(function() {
		$("#countdown").stopTime();
		_socket.emit('stop');
	});

	$('#btn-plus').click(function() {
		addAudioToVK();
	});

	$('#btn-play').click(function() {		
		_socket.emit('play');
	});

	$('#btn-download').click(function() {
		var url = $('#currentTrack').attr('data-url');		
		window.open(url, '_blank');
	});

	$('#btn-skip').click(function() {
		_socket.emit('skip');
	});

	$('#volumeSlider').slider({
		range: 'min',		
		min: 0,
		max: 100,
		values: 0,
		step: 1,		
		slide: function(event, ui){
			_socket.emit('setVolume', ui.value);
		}
	});    
}

function addAudioToVK(){
	var audio_id = $('#currentTrack').attr('data-aid');

	var url = prepareUrlString({
		method: 'audio.add',
		params: { 
			audio_id: audio_id,
			owner_id: _userId
		},
	});

	getDataFromVK(url, callbackAddAudioToVK);
}

function callbackAddAudioToVK(response){
	var message = (response.error) ? 'error' : 'added';
	alert(message);
}

function renderPlaylist(tracks){
	var playlist = $('.playlist');
	playlist.empty();

	for (var key in tracks) {
		var track = tracks[key];
		var trackView = renderPlaylistItem(track);
		playlist.append(trackView);
	}
}

function renderPlaylistItem(track){
	var avatar = $('<img />',{
		src: track.addByUserAvatar, 
		width: 20, 
		height: 20
	});

	var artist = track.artist;

	var title = $('<b />', {
		'data-id': track.hgId, 
		html: track.title
	});

	var item = $('<p/>')
	.append(avatar)
	.append('&nbsp;')
	.append(artist)
	.append('&nbsp;')
	.append(title)
	.append('&nbsp;')
	.append(formatDuration(track.duration));

	return item;
}

function search(query) { 
	var url = prepareUrlString({
		method: 'audio.search',
		params: { 
			q:query	
		},
	});	

	getDataFromVK(url, callbackSearch);
}


function showAudio(){
	getAudio(_userId);
}

function showRadio(){
	
	var array = getRadioList();
	
	$('.searchlist').empty();
	_tracksFound = [];

	fillTracksFound(array);

	var html = makeSearchList(_tracksFound);
	$('.searchlist').append(html);
}


function getRadioList(){
	return [
		{		
			url:'http://webcast.emg.fm:55655/europaplus128.mp3',
			title: 'Europa Plus 128Kbit',
		},
		{		
			url:'http://mp3.nashe.ru/nashe-128.mp3',
			title: 'Наше радио',
		},
		{
			url: 'http://217.29.51.162:8000/relaxfm-onair-128k.mp3',
			title: 'Relax FM',
		}
	];
}

function getAudio(user_id) { 

	var url = prepareUrlString({
		method: 'audio.get',
		params: { 
			owner_id: user_id	
		},
	});	

	getDataFromVK(url, callbackSearch);
}


function showUserInfo(){
	getUserInfo(_userId, callbackShowUserInfo);
}


function getUserInfo(user_id, callback){
	var url = prepareUrlString({
		method: 'users.get',
		params: { 
			user_ids: user_id,
			fields: 'photo_50'			
		},
	});	

	getDataFromVK(url, callback);	
}


function getDataFromVK(url, callback){
	$.ajax({
   		url: url,
   		dataType: "jsonp",   		
   		success: callback
  	});
}


function prepareUrlString(data){
	var domain = 'https://api.vk.com/method/';
	var method = data.method;
	
	var access_token = 'access_token=' + ACCESS_TOKEN;
	var params = '';

	for (var key in data.params){
		value = data.params[key];
		params += key + '=' + value + '&';
	}

	return domain + method + '?' + params + access_token;
}


function callbackShowUserInfo(result){
	var user = result.response[0];
	_userAvatar = user.photo_50;
	$('#signed_in').html('Login as ' + user.last_name + ' ' + user.first_name);
}


function callbackSearch(result) {
	$('.searchlist').empty();
	_tracksFound = [];

	fillTracksFound(result.response);

	var html = makeSearchList(_tracksFound);
	$('.searchlist').append(html);
}

function fillTracksFound(array){
	for (var key in array) {
		item = array[key];
		if (typeof item == 'object') {
			_tracksFound[key] = item;
			_tracksFound[key].addByUserId = _userId;
			_tracksFound[key].addByUserAvatar = _userAvatar;
		}
	}
}

function formatDuration(duration_in_seconds){
	var duration_string = '';
	if(duration_in_seconds){
		var duration = moment.duration(duration_in_seconds, "seconds");
		duration_string = duration.minutes() + ':' + duration.seconds();	
	}
	return duration_string;
}


function makeSearchList(tracks){
	
	for (var key in tracks){
		track = tracks[key];
		var artist = (track.artist) ? track.artist + ' ' : ' ';

		var artist_link = $('<a />', {
			html: artist,
			'class': 'searchItem',
			href: '#'
		});

		var track_link = $('<a />', {
			html: track.title,
			id: 'trackSearch_' + key,
			'class': 'track-search',
		});

		var duration = formatDuration(track.duration);

		var track_item = $('<p/>')
			.append(artist_link)
			.append('&nbsp;')
			.append(track_link)
			.append('&nbsp;')
			.append(duration);

		$('.searchlist').append(track_item);
	}
}




function sendToQueueTrack(track) {
	_socket.emit('send_track_to_playlist', track);
}

function removeFromQueueTrackById(trackId) {
	_socket.emit('remove_track_from_playlist', trackId);
}


function saveDataToLocalStorage(){
	localStorage.setItem('_userId',_userId);
	localStorage.setItem('_userAvatar',_userAvatar);
	localStorage.setItem('ACCESS_TOKEN', ACCESS_TOKEN);
	localStorage.setItem('_tokenExpires', _tokenExpires);
}

function isValidDataInLocalStorage(){
	var tokenExpires = localStorage.getItem('_tokenExpires');
	var currentDate = (new Date()).valueOf();
	return (currentDate < tokenExpires);
}

function getDataFromLocalStorage(){
	_userId = localStorage.getItem('_userId');
	_userAvatar = localStorage.getItem('_userAvatar');
	ACCESS_TOKEN = localStorage.getItem('ACCESS_TOKEN');
	_tokenExpires = parseInt(localStorage.getItem('_tokenExpires'));
}

$(document).ready(function() {
	
	setHandlers();

	if (isValidDataInLocalStorage()){
		getDataFromLocalStorage();
	}else{
		getDataFromUrl();
	}

	startAuthIfTokenExists();
});