var http = require('http');
var mongo = require("./lib/mongodb");
var db = new mongo.MongoDB();
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World from Duostack! - Fusspawn Style \n');
  console.log("served default page at: "+ new Date());
  
}).listen(8124);

console.log('Server running at http://127.0.0.1:8124/');