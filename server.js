// Array Remove - By John Resig (MIT Licensed)
Array.remove = function(array, from, to) {
  var rest = array.slice((to || from) + 1 || array.length);
  array.length = from < 0 ? array.length + from : from;
  return array.push.apply(array, rest);
};

/**
 * Module dependencies.
 */
var express = require('tfe-express');
var app = express.createServer();
var io =  require('socket.io'); 
var sys = require("sys");

var mongoose = require("mongoose");
var duodb = process.env['DUOSTACK_DB_MONGODB'];
var localhost = "mongodb://localhost/test";

var db = mongoose.connect(duodb);
var Player = require("./libs/Player.js").player;

// GAMES DATA
connected_players = Array(); 
// END OF GAMES

function get_connected_player(socket) {
	for(var i =0; i < connected_players.length; i++)  {
		if(connected_players[i].clientid == socket.sessionId) 	{
			return connected_players[i];
		}
	}
}

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyDecoder());
  app.use(express.methodOverride());
  app.use(express.cookieDecoder()); 
  app.use(express.session({ secret: 'gtfomysession' }));
  app.use(app.router);
  app.use(express.staticProvider(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes
app.get('/', function(req, res){
  res.render('index', {
    locals: {
      title: 'Express'
    }
  });
});

app.get("/ships", function(req,res) {
	get_ships(function(ships) {
		var count = ships.length;	
		console.log("there were: "+count);
		res.render("index", {
			locals: {
				title: "Spaceships.",
				count: count,
			}
		});
	});
});

app.get("/randomship", function(req,res) {
	get_ships(function(ships) {
		 var ship_count = ships.length;
		 var random_ship_index = random_between(1, ship_count -1);
		 res.end(json(ships[random_ship_index]));
		 console.log("served random image");
	});
}

function random_between(minVal,maxVal,floatVal)
{
	var randVal = minVal+(Math.random()*(maxVal-minVal));
	return typeof floatVal=='undefined'?Math.round(randVal):randVal.toFixed(floatVal);
}


var SpaceShipImage = new mongoose.Schema({
		colorseed: Number,
		seed: Number,
		imagedata: String,
});
mongoose.model("SpaceShipImage", SpaceShipImage);


function get_ships(callback) {
	var model = mongoose.model("SpaceShipImage");
	console.log("got mongoose model");
	model.find({}, function(err, data) {
				if(!err)
					callback(data);
				else {
					console.log(err);
					callback(null);
				}
			});
}


app.listen(80);
var socket = io.listen(app);
console.log("Express server listening on port %d", app.address().port)
//
socket.on("connection", function(client) {
	  // new client is here! 
	 console.log("client_connected");
	 connected_players.push(new Player(client));
	 
	 var pack = {};
	 pack.type="set_id";
	 pack.sessid=client.sessionId;
	 client.send(pack);
	 
	 client.on('message', function(message){ 
		  var msg = "undefined";
		  var data = JSON.parse(message);
		  handle_packet(data.type, data, client);
	  });
	  
	  client.on('disconnect', function(){
		  connected_players[client.sessionId] = null;
	  }) 
});


function json(data) {
	return JSON.stringify(data);
}

function dejson(data) {
	return JSON.parse(data);
}

function on_robot(packet, client) {
	 var SpaceShipImage = mongoose.model("SpaceShipImage");
	 var ship = new SpaceShipImage();
	 ship.colorseed = packet.color;
	 ship.seed = packet.genseed;
	 ship.imagedata = packet.payload;
	 ship.save();
	 packet.drawn_by = client.sessionId;
	 console.log("saved Spaceship to db");
}

function handle_request(client, packet) {
			 var Images = Array();
			 Images.push("grass.png");
			 Images.push("dirt.png");
			 
			 var Packet = {};
			 Packet.type = "response";
			 Packet.response_for = "image_list";
			 Packet.response = Images;
			 client.send(Packet);
			 console.log("sending image_list data was"+ json(Packet));
}


function handle_packet(type, packet, client) {
	switch(type) {
		case "chat": 
				socket.broadcast(packet);
				break;
		case "enter_world":
				get_connected_player(client).init(packet.client_name, 0, 0);
				console.log("Player: "+ get_connected_player(client).name +" Connected");
				break;
		case "player_move":
				get_connected_player(client).handle_movement(packet);
				break;
		case "render_completed":
				console.log("Player: "+get_connected_player(client).name +" Completed Rendering");
				break;
		case "request":
				console.log("Doing Request for: " + packet.request_what );
				handle_request(client, packet);
				break;
		case "robot_rendered":
				on_robot(packet, client);
				console.log("new robot uploaded");
				var packrat = {};
				packrat.type = "new_robot";
				client.send(packrat);
				socket.broadcast(packet);
				break;
		default:
				console.log("No Packet Handler Found");
				socket.broadcast(packet);
				break;
	}
	
	console.log(type);
}

