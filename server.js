/**
 * Module dependencies.
 */
var express = require('tfe-express');
var app = express.createServer();
var io =  require('socket.io');
var sys = require("sys");
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

// Only listen on $ node app.js
app.listen(80);
var socket = io.listen(app);
console.log("Express server listening on port %d", app.address().port)
//
socket.on("connection", function(client) {
	  // new client is here! 
	  console.log("client_conn");
	  client.on('message', function(message){ 
		  var msg = "undefined";
		  var data = JSON.parse(message);
		  if(data.message) 
			msg = data.message;
		 
		  console.log(msg); 
		  socket.broadcast(message);
	  });
	  client.on('disconnect', function(){ console.log("client_dced"); }) 
});

