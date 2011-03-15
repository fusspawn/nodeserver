var inspect = require("sys").inspect;

function Player(socket) {
	this.socket = socket;
	this.clientid = socket.sessionId;
	this.x = 0;
	this.y = 0;
	this.lastx = 0;
	this.lasty = 0;
	this.max_speed = 9999;
	this.persistAccount = false;
	this.db_id = -1;
	this.last_action = new Date().now;
	this.serializables = {};
}

Player.prototype.init = function(name, x, y) {
	this.x = this.lastx = x;
	this.y = this.lasty = y;
	this.name = name;
	
	this.serializables.name = name;
	this.serializables.x = x;
	this.serializables.y = y;
	
	var Packet = {};
	Packet.client_name = this.name;
	Packet.x = x;
	Packet.y = y;
	Packet.type = "player_joined";
	this.broadcast_message(Packet);
}

Player.prototype.build_data_packet = function() {
	return this.serializables;
}


Player.prototype.handle_movement = function(message){
	var x = message.x;
	var y = message.y;
	this.move_to(x,y);
	console.log("attempted move to: "+ x + "/" + y);
}

Player.prototype.send_message = function(message) {
	this.socket.send(message);
}

Player.prototype.broadcast_message = function(message) {
	this.socket.broadcast(message);
}

Player.prototype.move_to = function(x, y) {
	this.lastx = x;
	this.lasty = y;
	this.x = x;
	this.y = y;
	this.serializables.x = x;
	this.serializables.y = y;
}

exports.player = Player;