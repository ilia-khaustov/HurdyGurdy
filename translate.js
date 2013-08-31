var config = require('./config.js');

var expressions = {
	vk : {
		try_connect : {
			en : 'Connect?',
			ru : 'Соединить?'
		},
		wait_connection : {
			en : 'Waiting to connect...',
			ru : 'Соединяем...'
		},
		connected : {
			en : 'Connected',
			ru : 'Соединено'
		}
	}
};

exports.expression = function(q) {
	var parts = q.split('.');
	var found = expressions;
	for (var key in parts) {
		var part = parts[key];
		console.log(part);
		if (part && found[part]) {
			found = found[part];
			if (found[config.locale]) {
				return found[config.locale];
			}
		}
	}
	return "";
};

exports.source = function() {
	
};