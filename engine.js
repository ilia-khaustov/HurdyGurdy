/*

	Шарманка

*/

var TokenExpires = 0;

ACCESS_TOKEN = null;

function doAuth() {
	window.open(
		"https://oauth.vk.com/authorize?"+ 
		"client_id=3769914&"+ 
		"scope=8&"+ 
		"redirect_uri=http://192.168.0.77:8000&"+ 
		"display=page&"+ 
		"response_type=token", "_self"
	);
}

function checkTokenExpired() {
	if (TokenExpires <= (new Date()).valueOf()) {
		return true;
	}
	else {
		return false;
	}
}

function getToken() {
	ACCESS_TOKEN = getHashParam("access_token", 0);
	TokenExpires = (new Date()).valueOf() + getHashParam('expires_in', 0);
}

function checkAndDoAuthIfExpired() {
	if (checkTokenExpired()) {
		$('#vk_connect').html("Соединяем...");
		doAuth();
	} else {
		$('#vk_connect').html("Соединено.");
	}
}

function startAuthIfTokenExists() {
	getToken();
	if (ACCESS_TOKEN) { 
		startAuth();
	}
}

function startAuth() {
	checkAndDoAuthIfExpired();
	setInterval(function() {
		checkAndDoAuthIfExpired();
	}, '10000');
}

function getHashParam( param , def){
	var hash = location.hash.substr(1);
	var value = hash.substr(hash.indexOf(param+'=')).split('&')[0].split('=')[1];
	value = value?value:def;
    return value;
}

function setHandlers() {
	$('#vk_connect').one("click", function() {
		startAuth();
	});
	$('#search').keypress(function() {
		search(this.value);
	});
}

function search(query) { 
	var script = document.createElement('SCRIPT'); 
	script.src = 'https://api.vk.com/method/audio.search?q='+
					query+
					'&access_token='+
					ACCESS_TOKEN+
					'&callback=callbackSearch'; 
	document.getElementsByTagName("head")[0].appendChild(script); 
}

function callbackSearch(result) {
	$('.result').empty();
  	for (var key in result.response) {
  		item = result.response[key];
  		if (key == 0) continue;
  		$('.result').append("<p>" + 
  			item.artist + " - <a href='" + item.url + "'>" + item.title + "</a>");
  	}
} 
