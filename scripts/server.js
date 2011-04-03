
var http = require('http'),
    io = require('socket.io'),
    logger = require('./logger.js'),
    geo = require('./geo.js'),
    zombie = require('./zombie.js'),
    people = {},
    games = {};

logger.on = true;
logger.LEVEL = logger.DEBUG;

server = http.createServer(function(req, res) {
 res.writeHead(200, {'Content-Type': 'text/html'});
 res.end('<h1>Hello world</h1>');
});
server.listen(8124);

var socket = io.listen(server, { log: function() {} });

socket.on('connection', function(client) {
  people[client.sessionId] = client;
  
  client.on('message', function(data) {
    switch (data.action) {
      case 'create':
        var game = new zombie.Game(data.name, data.type, data.outbreak, data.lat, data.lng);
        game.user(this.sessionId, {name: data.user, lat: data.lat, lng: data.lng});
        games[game.name] = game;
        logger.log(logger.NOTICE, 'Game created: ' + game.name);
        break;

      case 'join':
        if (data.name in games) {
          games[data.name].user(this.sessionId, {lat: data.lat, lng: data.lng});
          logger.log(logger.NOTICE, 'User ' + this.sessionId + ' joined ' + data.name);
        }
        break;
      
      case 'list':
        client.send({ action: 'list', games: Object.keys(games) });
      
      case 'ping':
        if (data.game in games) {
          games[data.game].user(this.sessionId, { lat: data.lat, lng: data.lng });
        }
        break;
    }
  });
  
  client.on('disconnect', function(data) {
    delete people[this.sessionId];
    logger.log(logger.NOTICE, 'User ' + this.sessionId + ' left');
  });
  
});

setTimeout(function update() {
  for (var name in games) {
    // Move zombies.
    games[name].update();
    // Get the current state of the game.
    var state = games[name].state();
    // Send the game state to all players.
    for (var sid in games[name].users) {
      if (sid in people) {
        people[sid].send({ action: 'update', state: state, sid: sid });
      } else {
        // Get rid of disconnected users.
        // INTERESTING THOUGHT: Turn them into zombies?!
        games[name].removeUser(sid);
      }
    }
    // Remove this game from the update queue if it's over.
    if (state.status & (zombie.GAME_LOSE ^ zombie.GAME_WIN)) {
      logger.log(logger.NOTICE, 'Game over: ' + name);
      delete games[name];
    }
  }
  setTimeout(update, 1500);
}, 1500);

logger.log(logger.NOTICE, 'Server running at http://127.0.0.1:8124/');
