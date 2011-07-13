var http    = require('http');
var io      = require('socket.io');
var express = require('express');

var config  = require(__dirname + '/config');     // Various configurations.
var logger  = require(__dirname + '/lib/logger'); // Simple logging utility.
var geo     = require(__dirname + '/lib/geo');    // Utility for making geo calculations.
var zombie  = require(__dirname + '/lib/zombie'); // Core game library.

// All people that have connected to the server.
var people = {};

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

var socket = io.listen(app, { log: function() {} });

// Socket events.
socket.on('connection', function(client) {
  people[client.sessionId] = client;
  
  logger.log(logger.NOTICE, 'User ' + client.sessionId + ' connected');
  
  client.on('message', function(data) {
    switch (data.action) {
      // A user is creating a new game.
      case 'create':
        var game = new zombie.Game(data.name, data.speed, data.outbreak, data.lat, data.lng);
        game.user(this.sessionId, { name: data.user, lat: data.lat, lng: data.lng });
        games[game.name] = game;
        logger.log(logger.NOTICE, 'Game created: ' + game.name);
        break;
      
      // A user is joining an existing game.
      case 'join':
        if (data.name in games) {
          games[data.name].user(this.sessionId, { lat: data.lat, lng: data.lng });
          logger.log(logger.NOTICE, 'User ' + this.sessionId + ' joined ' + data.name);
        }
        break;
      
      // A user is requesting to see a list of all games.
      // TODO: Limit this to games in the same geographical area. 
      case 'list':
        client.send({ action: 'list', games: Object.keys(games) });
        break;
      
      // A user is updating their position within a game.
      case 'ping':
        if (data.game in games) {
          games[data.game].user(this.sessionId, { lat: data.lat, lng: data.lng });
        }
        break;
    }
  });
  
  client.on('disconnect', function(data) {
    delete people[this.sessionId];
    logger.log(logger.NOTICE, 'User ' + this.sessionId + ' disconnected');
  });
  
});

// The game loop.
setTimeout(function update() {
  var toime = new Date;
  
  for (var name in games) {
    var game = games[name];
    
    // Move zombies.
    var state = game.update(config.get('game.interval'));
    
    // Send the game state to all players.
    for (var sid in game.users) {
      if (sid in people) {
        people[sid].send({ action: 'update', state: state, sid: sid });
      }
      else {
        // Get rid of disconnected users.
        // INTERESTING THOUGHT: Turn them into zombies?!
        game.removeUser(sid);
        logger.log(logger.NOTICE, 'User ' + sid + ' left ' + name);
      }
    }
    
    // Remove this game from the update queue if it's over.
    if (state.status & (zombie.GAME_LOSE | zombie.GAME_WIN)) {
      logger.log(logger.NOTICE, 'Game over: ' + name);
      delete games[name];
    }
  }
  
  // Compensate for loop processing time when firing next game update.
  var duration = new Date - toime;
  var interval = config.get('game.interval');
  setTimeout(update, duration > interval ? 0 : interval - duration);
  
}, config.get('game.interval'));

logger.log(logger.NOTICE, 
  'Server running in ' + config.get('environment') + ' mode ' +
  'at http://' + config.get('server.host') + ':' + config.get('server.port') + '/');
