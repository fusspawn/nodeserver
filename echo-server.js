var sys = require("sys");
var express = require("express");
var websockets = require("websocket-server");
var WebApplicationServer = express.createServer();
var WebSocketServer = websockets.createServer();
var database = require("mongodb").DB;

var client = new database('test',
							new Server("127.0.0.1", 27017), 
						    {native_parser:true});

WebApplicationServer.get("/", function(request, response){
	response.send("Welcome to express game server is running <a href='http://localhost:82'> Here <a/>");
	sys.puts("served request to \"/\" ");
	var request_stat = {path: "/"};
	sys.puts("monogo: "+JSON.stringify(request_stat));
});

WebApplicationServer.listen(81);
WebSocketServer.listen(82);
sys.puts("web server starting.. at http://localhost:81/");
sys.puts("websocket server starting at http://localhost:82");