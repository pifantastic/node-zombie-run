var http    = require('http');
var io      = require('socket.io');
var express = require('express');

var config  = require(__dirname + '/config');     // Various configurations.
var logger  = require(__dirname + '/lib/logger'); // Simple logging utility.
var geo     = require(__dirname + '/lib/geo');    // Utility for making geo calculations.
var zombie  = require(__dirname + '/lib/zombie'); // Core game library.

// All active games.
var games = {};

// Turn on logging in dev mode.
logger.on = config.get('environment') == 'dev';

// Create the application server.
var app = express.createServer();

app.configure(function() {
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: "ohaihellohey" }));
  app.use(express.static(__dirname + '/www'));
  app.use(app.router);
});

app.listen(config.get('server.port'));

var io = io.listen(app);

// Socket events.
io.sockets.on('connection', function(socket) {
  logger.log(logger.NOTICE, 'User ' + socket.id + ' connected');
  
  socket.on('create', function(data) {
    // Create the game.
    var game = new zombie.Game(data);
    
    // Remove this user from any other games.
    for (name in games) {
      if (socket.id in games[name].users) {
        delete games[name].users[socket.id];
      }
    }
    
    // Add the creator to the list of users.
    game.users[socket.id] = new zombie.User({
      sid: socket.id,
      name: data.user,
      lat: data.lat,
      lng: data.lng
    });
    
    games[game.name] = game;
    logger.log(logger.NOTICE, 'Game created: ' + game.name);
  });
        
  // A user is joining an existing game.
  socket.on('join', function(data) {
    if (data.name in games) {
      // Remove this user from any other game.
      for (name in games) {
        if (socket.id in games[name].users) {
          delete games[name].users[socket.id];
        }
      }
      // Add this user to the game they are joining.
      games[data.name].users[socket.id] = new zombie.User({
        sid: socket.id,
        name: data.user,
        lat: data.lat,
        lng: data.lng
      });
      logger.log(logger.NOTICE, 'User ' + socket.id + ' joined ' + data.name);
    }
  });
        
  // A user is requesting to see a list of all games.
  // TODO: Limit this to games in the same geographical area. 
  socket.on('list', function(data) {
    socket.emit('list', { games: Object.keys(games) });      
  });
  
  // A user is updating their position within a game.
  socket.on('ping', function(data) {
    if (data.game in games) {
      games[data.game].users[socket.id].position(data.lat, data.lng);
    }
  });
  
  // Get rid of disconnected users.
  // INTERESTING THOUGHT: Turn them into zombies?!
  socket.on('disconnect', function(data) {
    for (name in games) {
      if (socket.id in games[name].users) {
        delete games[name].users[socket.id];
      }
    }
    logger.log(logger.NOTICE, 'User ' + socket.id + ' disconnected');
  });
});

// The game loop.
setInterval(function update() {
  for (var name in games) {
    var game = games[name];
    
    // Move zombies.
    var state = game.update(config.get('game.interval'));
    
    // Send the game state to all players.
    for (var sid in game.users) {
      io.sockets.socket(sid).emit('update', { state: state, sid: sid });
    }
    
    // Remove this game from the update queue if it's over.
    if (state.status & (zombie.GAME_LOSE | zombie.GAME_WIN)) {
      logger.log(logger.NOTICE, 'Game over: ' + name);
      delete games[name];
    }
  }
}, config.get('game.interval'));

logger.log(logger.NOTICE, 
  'Server running in ' + config.get('environment') + ' mode at ' + 
  'http://' + config.get('server.host') + ':' + config.get('server.port') + '/');
