function Pool(){

	var clients = [];

	var addClient = function(client){
		
		addClientToClients(client);

		client.onAuthenticated(function(){			
    		client.setOnAdvancedHandler();	
    		emitSocket('users', getClientsUsers());
    	});
		
		client.onSocketDisconnect(function(){
        	removeClient(client.getId());
    	});
	};

	var getClientsUsers = function(){
		var users = [];
		for (var key in clients){	
			var client = clients[key];
			users.push(client.getUserId());
		}
		return users;
	}

	var addClientToClients = function(client){
		var client_id = client.getId();		
		clients[client_id] = client;
	};

	var removeClient = function(client_id){		
		delete clients[client_id];
	};

	var emitSocket = function(action, data){		
		for (var key in clients){		
			var client = clients[key];
			client.emitSocket(action, data);
		}
	};

	var getClientsCount = function(){
		return Object.keys(clients).length;
	};

	var getClients = function(){
		return clients;
	};

	return {
		addClient: addClient,
		removeClient: removeClient,
		emitSocket: emitSocket,
		getClientsCount: getClientsCount,
		getClients: getClients
	}
}

exports = module.exports = Pool;