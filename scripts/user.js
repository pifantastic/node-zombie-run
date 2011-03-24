
var User = function() {
  this.init();
};

User.prototype = {

  init: function() {
  
  },
  
  position: function(lat, lng) {
    if (lat && lng) {
      this._lat = lat;
      this._lng = lng;
    }
    return { lat: this._lat, lng: this._lng };
  },

  name: function(name) {
    if (name) {
      this._name = name;
    }
    return this._name;
  },
  
  game: function(game) {
    if (game) {
      this._game = game;
    }
    return this._game;
  },
  
  sid: function(sid) {
    if (sid) {
      this._sid = sid;
    }
    return this._sid;
  }

};
