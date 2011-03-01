var http = require('http');
var mongo = require("mongodb");
var orm = require("mongoose");
var parseURL = require("url").parse;
var components = parseURL(process.env['DUOSTACK_DB_MONGODB']);
var db = {
  host: components.hostname,
  port: parseInt(components.port),
  name: components.pathname.substr(1),
  user: components.auth.split(':')[0],
  pass: components.auth.split(':')[1]
};


var DB = mongo.Db(db.name, new mongo.Server(db.host, db.port, {}), {});

DB.open(function(err, db) {
	console.log("db opened");
	db.close(function(err, db) {
		console.log("db closed");
	});
});



http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World from Duostack! - Fusspawn Style \n');
  console.log("served default page at: "+ new Date());
  console.log("mongoose data: "+orm);
  
}).listen(80);

console.log('Server running at http://127.0.0.1:8124/');