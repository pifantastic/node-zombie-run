
var http = require('http'),
    io = require('socket.io'),
    geo = require('./geo.js'),
    zombie = require('./zombie.js'),
    people = {},
    games = {};

server = http.createServer(function(req, res) {
 res.writeHead(200, {'Content-Type': 'text/html'});
 res.end('<h1>Hello world</h1>');
});
server.listen(8124);

var socket = io.listen(server);

socket.on('connection', function(client) {
  // Keep track of who has connected.
  people[client.sessionId] = client;
  
  client.on('message', function(data) {
    console.log(data);
    
    switch (data.action) {
      // Create a new game.
      case 'create':
        // Create the new game.
        var game = new zombie.Game(data.name, data.type, data.outbreak, data.lat, data.lng);
        game.user(this.sessionId, {lat: data.lat, lng: data.lng});
        games[game.name] = game;
        break;
      
      case 'ping':
        if (data.game in games) {
          games[data.game].user(this.sessionId, { lat: data.lat, lng: data.lng });
        }
        break;
    }
  });
  
});

setTimeout(function update() {
  for (var name in games) {
    // Move zombies.
    console.log("Update: " + name);
    games[name].update();
    // Get the current state of the game.
    var state = games[name].state();
    // Send the game state to all players.
    for (var sid in games[name].users) {
      people[sid].send({ action: 'update', state: state });
    }
  }
  setTimeout(update, 1500);
}, 1500);

console.log('Server running at http://127.0.0.1:8124/');
