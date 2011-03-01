var http = require('http');
var orm = require("mongoose");


http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World from Duostack! - Fusspawn Style \n');
  console.log("served default page at: "+ new Date());
  console.log("mongoose data: "+ JSON.stringify(orm));
  
}).listen(80);

console.log('Server running at http://127.0.0.1:8124/');