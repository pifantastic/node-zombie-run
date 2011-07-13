var geo = require(__dirname + '/geo');

// Number of initial zombies to spawn.
var OUTBREAKS = { early: 20, late: 100, pandemic: 1000 };
    
// Unique for each zombie.
var ZOMBIE_GUID = 1;
    
// How close a zombie has to be to eat a player's brains.
var ZOMBIE_ATTACK_DISTANCE = 15;
    
// How close a zombie needs to be to see and run towards a player.
var ZOMBIE_VISION_DISTANCE = 200;
    
// Game states.
var GAME_IN_PROGRESS = 0;
var GAME_WIN = 1;
var GAME_LOSE = 2;

// TODO: switch these args to a config object.
var Game = function(name, speed, outbreak, lat, lng) {
  return this.init(name, speed, outbreak, lat, lng);
};

Game.prototype = {
  
  init: function(name, speed, outbreak, lat, lng) {
    this.name = name;
    this.speed = speed;
    this.outbreak = outbreak;
    this.lat = lat;
    this.lng = lng;
    this.users = {};
    this.zombies = {};
    this.status = GAME_IN_PROGRESS;
    
    // Spawn zombies.
    for (var x = 0; x < OUTBREAKS[this.outbreak]; x++) {
      this.zombies[ZOMBIE_GUID] = new Zombie(ZOMBIE_GUID++, this.speed, this.lat, this.lng);
    }
  },
  
  // Add/get a user.
  user: function(sid, data) {
    if (data) {
      this.users[sid] = data;
    }
    return this.users[sid];
  },
  
  // Remove a user.
  removeUser: function(sid) {
    delete this.users[sid];
  },
  
  // Update the game's state by simulating interval seconds of gameplay.
  update: function(interval) {
    for (var zombie in this.zombies) {
      zombie = this.zombies[zombie];
      zombie.move(interval);
      
      // See if this zombie is currently chasing a player.
      if (zombie.target) {
        var distance = zombie.distance(zombie.target.lat, zombie.target.lng);
        if (distance <= ZOMBIE_ATTACK_DISTANCE) {
          // Attack!
          this.status = GAME_LOSE;
        } else if (distance > ZOMBIE_VISION_DISTANCE) {
          // User has escaped.
          zombie.target = false;
        }
      }
      else {
        // Look for victims.
        for (var sid in this.users) {
          var distance = zombie.distance(this.users[sid].lat, this.users[sid].lng);
          if (distance <= ZOMBIE_VISION_DISTANCE) {
            zombie.target = this.users[sid];
            break;
          }
        }
      }
    }
    
    return this.state();
  },
  
  state: function() {
    return {
      zombies: this.zombies,
      users: this.users,
      status: this.status
    }
  }

};

// TODO: switch these args to a config object.
var Zombie = function(id, speed, lat, lng) {
  return this.init(id, speed, lat, lng);
};

Zombie.prototype = {

  init: function(id, speed, lat, lng) {
    this.id = id;
    this.lat = lat + (Math.random() * 4 - 1) / 100;
    this.lng = lng + (Math.random() * 4 - 1) / 100;
    this.target = false;
    this.vector = [0, 0];
    this.speed = speed; // meters per second
    this.move();
  },
  
  move: function(interval) {
    interval /= 1000;
    // If this zombie is chasing a player, move them towards the player.
    if (this.target) {
      var distance = geo.distance(this.lat, this.lng, this.target.lat, this.target.lng),
          magnitude = 1 - ((distance - (this.speed * interval)) / distance);
      this.vector[0] = (this.target.lat - this.lat) * magnitude;
      this.vector[1] = (this.target.lng - this.lng) * magnitude;
    }
    else {
      // Brownian zombie motion.
      // TODO: Document/tweak these magic numbers.
      this.vector[0] = (parseInt(Math.random() * 3, 10) - 1) / 20000;
      this.vector[1] = (parseInt(Math.random() * 3, 10) - 1) / 20000;
    }
    
    // Update this zombie's position.
    this.position(this.lat + this.vector[0], this.lng + this.vector[1]);
  },
  
  // Get/set this zombie's position.
  position: function(lat, lng) {
    if (lat && lng) {
      this.lat = lat;
      this.lng = lng;
    }
    return { lat: this.lat, lng: this.lng };
  },
  
  // Measure distance between this zombie and another point.
  distance: function(lat, lng) {
    return geo.distance(this.lat, this.lng, lat, lng);
  }

};

exports.Game = Game;
exports.Zombie = Zombie;

exports.GAME_IN_PROGRESS = GAME_IN_PROGRESS;
exports.GAME_WIN = GAME_WIN;
exports.GAME_LOSE = GAME_LOSE;
