/**
 * Module dependencies.
 */
var express = require('express');
var app = express.createServer();
var io =  require('socket.io');

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
  app.use(express.staticProvider(__dirname + '/static'));
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
if (!module.parent) {
  app.listen(3000);
  io.listen(app);
  console.log("Express server listening on port %d", app.address().port)
}


