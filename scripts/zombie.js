
var geo = require('./geo');

RADIUS_OF_EARTH_METERS = 6378100
TRIGGER_DISTANCE_METERS = 15
ZOMBIE_VISION_DISTANCE_METERS = 200
PLAYER_VISION_DISTANCE_METERS = 500
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

var Game = function(name, type, outbreak, lat, lng) {
  return this.init(name, type, outbreak, lat, lng);
};

Game.prototype = {
  
  init: function(name, type, outbreak, lat, lng) {
    this.name = name;
    this.type = type;
    this.outbreak = outbreak;
    this.lat = lat;
    this.lng = lng;
    this.users = {};
    this.zombies = {};
    
    for (var x = 0; x < OUTBREAKS[this.outbreak]; x++) {
      this.zombies[ZOMBIE_GUID] = new Zombie(ZOMBIE_GUID++, this.lat, this.lng);
    }
  },
  
  user: function(sid, data) {
    if (data) {
      this.users[sid] = data;
    }
    return this.users[sid];
  },
  
  update: function() {
    for (var zombie in this.zombies) {
      zombie = this.zombies[zombie];
      if (zombie.target) {
        // Is this victim still visible?
        if (zombie.canSee(this.users[zombie.target].lat, this.users[zombie.target].lng)) {
          zombie.target = false;
        }
      } else {
        // Look for victims.
        for (var sid in this.users) {
          if (zombie.canSee(this.users[sid].lat, this.users[sid].lng)) {
            zombie.target = sid;
          }
        } 
      }
      zombie.move();
    }
  },
  
  state: function() {
    return {
      zombies: this.zombies
    }
  }

};

var Zombie = function(id, lat, lng) {
  return this.init(id, lat, lng);
};

Zombie.prototype = {

  init: function(id, lat, lng) {
    this.id = id;
    this.lat = lat + (Math.random() * 5 - 1) / 100;
    this.lng = lng + (Math.random() * 5 - 1) / 100;
    this.target = false;
    this.vector = [0, 0];
    this.move();
  },
  
  move: function(lat, lng) {
    if (lat && lng) {
      // Move towards people
    } else {
      this.vector[0] = (parseInt(Math.random() * 3, 10) - 1) / 10000;
      this.vector[1] = (parseInt(Math.random() * 3, 10) - 1) / 10000;
      this.position(this.lat + this.vector[0], this.lng + this.vector[1]);
    }
  },
  
  position: function(lat, lng) {
    if (lat && lng) {
      this.lat = lat;
      this.lng = lng;
    }
    return { lat: this.lat, lng: this.lng };
  },
  
  canSee: function(lat, lng) {
    return geo.distance(this.lat, this.lng, lat, lng) < ZOMBIE_VISION_DISTANCE_METERS;
  }

};

exports.Game = Game;
exports.Zombie = Zombie;
