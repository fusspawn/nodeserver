var http = require('http');
var mongo = require("mongodb");

var mongoose = require('mongoose/').Mongoose,
    db = mongoose.connect(process.env['DUOSTACK_DB_MONGODB']),      
    Model = mongoose.noSchema('test', db); // collection name

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  console.log("served default page at: "+ new Date());, 
  var db_item = new Model({path: "/", date: new Date()});
  db_item.save();
  
  Model.find({}).each(function(model){
	res.puts(model.path + " on: "+ model.date);
  },hydrate);
  
  res.end('Hello World from Duostack! - Fusspawn Style \n');
}).listen(80);

console.log('Server running at http://127.0.0.1:8124/');