
var geo = require('./geo');


PLAYER_VISION_DISTANCE = 500
MAX_TIME_INTERVAL_SECS = 60 * 10  // 10 minutes
ZOMBIE_SPEED_VARIANCE = 0.2
MIN_NUM_ZOMBIES = 20
MIN_ZOMBIE_DISTANCE_FROM_PLAYER = 50
MAX_ZOMBIE_CLUSTER_SIZE = 4
MAX_ZOMBIE_CLUSTER_RADIUS = 30
DEFAULT_ZOMBIE_SPEED = 3 * 0.447  // x miles per hour in meters per second
DEFAULT_ZOMBIE_DENSITY = 20.0  // zombies per square kilometer

OUTBREAKS = { early: 20, late: 100, pandemic: 1000 };

ZOMBIE_GUID = 1;
ZOMBIE_ATTACK_DISTANCE = 15;
ZOMBIE_VISION_DISTANCE = 200

var GAME_IN_PROGRESS = 0;
var GAME_WIN = 1;
var GAME_LOSE = 2;

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
    
    for (var x = 0; x < OUTBREAKS[this.outbreak]; x++) {
      this.zombies[ZOMBIE_GUID] = new Zombie(ZOMBIE_GUID++, this.speed, this.lat, this.lng);
    }
  },
  
  user: function(sid, data) {
    if (data) {
      this.users[sid] = data;
    }
    return this.users[sid];
  },
  
  removeUser: function(sid) {
    delete this.users[sid];
  },
  
  update: function(interval) {
    for (var zombie in this.zombies) {
      zombie = this.zombies[zombie];
      if (zombie.target) {
        var distance = zombie.distance(zombie.target.lat, zombie.target.lng);
        if (distance <= ZOMBIE_ATTACK_DISTANCE) {
          this.status = GAME_LOSE;
        } else if (distance > ZOMBIE_VISION_DISTANCE) {
          zombie.target = false;
        }
      } else {
        // Look for victims.
        for (var sid in this.users) {
          var distance = zombie.distance(this.users[sid].lat, this.users[sid].lng);
          if (distance <= ZOMBIE_VISION_DISTANCE) {
            zombie.target = this.users[sid];
            break;
          }
        }
      }
      zombie.move(interval);
    }
  },
  
  state: function() {
    return {
      zombies: this.zombies,
      users: this.users,
      status: this.status
    }
  }

};

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
    if (this.target) {
      var distance = geo.distance(this.lat, this.lng, this.target.lat, this.target.lng),
          magnitude = 1 - ((distance - (this.speed * interval)) / distance);
      this.vector[0] = (this.target.lat - this.lat) * magnitude;
      this.vector[1] = (this.target.lng - this.lng) * magnitude;
    } else {
      // TODO: Document/tweak these magic numbers. 
      this.vector[0] = (parseInt(Math.random() * 3, 10) - 1) / 20000;
      this.vector[1] = (parseInt(Math.random() * 3, 10) - 1) / 20000;
    }
    this.position(this.lat + this.vector[0], this.lng + this.vector[1]);
  },
  
  position: function(lat, lng) {
    if (lat && lng) {
      this.lat = lat;
      this.lng = lng;
    }
    return { lat: this.lat, lng: this.lng };
  },
  
  distance: function(lat, lng) {
    return geo.distance(this.lat, this.lng, lat, lng);
  }

};

exports.Game = Game;
exports.Zombie = Zombie;

exports.GAME_IN_PROGRESS = GAME_IN_PROGRESS;
exports.GAME_WIN = GAME_WIN;
exports.GAME_LOSE = GAME_LOSE;
