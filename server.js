var http = require('http');
var mongo = require("mongodb");
var mongoose = require('mongoose'),
	db_uri = process.env['DUOSTACK_DB_MONGODB'];
	mongoose.connect(db_uri);
	
var Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;
	
var TestSchema = new Schema({path: String, date: Date});
	mongoose.model("test", TestSchema);
	
	
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  console.log("served default page at: "+ new Date()); 
  var item = new TestSchema();
  item.path = "/";
  item.date = new Date();
  item.save(function(err) {
	res.puts(err);
  });
  
  Model.find({}).each(function(model){
	res.puts(model.path + " on: "+ model.date);
  },hydrate);
  
  res.end('Hello World from Duostack! - Fusspawn Style \n');
}).listen(80);

console.log('Server running at http://127.0.0.1:8124/');