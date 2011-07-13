var http    = require('http');
var io      = require('socket.io');
var express = require('express');

var logger  = require(__dirname + '/lib/logger');
var geo     = require(__dirname + '/lib/geo');
var zombie  = require(__dirname + '/lib/zombie');

var people = {};
var games = {};

logger.on = true;
logger.LEVEL = logger.DEBUG;

var GAME = {
  interval: 1000,
  port: 8124
};

var app = express.createServer();

app.configure(function() {
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: "ohaihellohey" }));
  app.use(express.static(__dirname + '/www'));
  app.use(app.router);
});

app.listen(GAME.port);

var socket = io.listen(app/*, { log: function() {} }*/);

socket.on('connection', function(client) {
  // TODO: This shouldn't be necessary, list of clients held by the server.
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

// The game loop
setTimeout(function update() {
  var toime = new Date;
  for (var name in games) {
    // Move zombies.
    var state = games[name].update(GAME.interval);
    
    // Send the game state to all players.
    for (var sid in games[name].users) {
      if (sid in people) {
        people[sid].send({ action: 'update', state: state, sid: sid });

      // Get rid of disconnected users.
      // INTERESTING THOUGHT: Turn them into zombies?!
      } else {
        games[name].removeUser(sid);
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
  setTimeout(update, duration > GAME.interval ? 0 : GAME.interval - duration);
}, GAME.interval);

logger.log(logger.NOTICE, 'Server running at http://127.0.0.1:' + GAME.port + '/');
