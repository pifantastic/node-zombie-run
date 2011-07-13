
(function(window, $) {

var Map = function(selector, options) {
  return this.init(selector, options);
};

Map.prototype = {
  
  defaults: {
    zoom: 16,
    center: new google.maps.LatLng(0, 0),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  },
  
  // Create the map.
  init: function(selector, options) {
    this._zombies = {};
    this._players = {};
    this.user = null;
    this.selector = selector;
    this.settings = $.merge(this.defaults, options || {});
    this.map = new google.maps.Map($(this.selector).get(0), this.settings);
    return this;
  },
  
  // Update the entities on the map.
  update: function(state, sid) {
    for (var zombie in state.zombies) {
      var lat = state.zombies[zombie].lat,
          lng = state.zombies[zombie].lng,
          position = new google.maps.LatLng(lat, lng);
          
      if (zombie in this._zombies) {
        this._zombies[zombie].setPosition(position);
        this._zombies[zombie].setIcon(this.icon(state.zombies[zombie].target ? 'zombie!' : 'zombie'));
      } else {
        this._zombies[zombie] = this.marker(lat, lng, state.zombies[zombie].target ? 'zombie!' : 'zombie');
      }
    }
    
    for (var user in state.users) {
      if (user == sid)
        continue;
        
      var lat = state.users[user].lat,
          lng = state.users[user].lng,
          position = new google.maps.LatLng(lat, lng);
          
      if (user in this._players) {
        this._players[user].setPosition(position);
      } else {
        this._players[user] = this.marker(lat, lng, 'player');
      }
    }
  },
  
  icon: function(type) {
    var icons = {
      'zombie!': '/img/bullet_red.png',
      'zombie': '/img/bullet_green.png',
      'player': '/img/bullet_black.png',
    };
    
    return icons[type] || '/img/bullet_blue.png';
  },
  
  // Create a map marker with the given position and icon.
  marker: function(lat, lng, type) {
    var position = new google.maps.LatLng(lat, lng);
    return new google.maps.Marker({ position: position, map: this.map, icon: this.icon(type) });
  },
  
  // Clear all markers from the map.
  clear: function(type) {
    for (var zombie in this._zombies) {
      this._zombies[zombie].setMap(null);
    }
    if (this.user) {
      this.user.setMap(null);
    }
  },
  
  center: function(lat, lng) {
    // Set the center of the map.
    var position = new google.maps.LatLng(lat, lng);
    this.map.setCenter(position);
    // Draw the user on the map.
    if (!this.user) {
      this.user = this.marker(lat, lng, 'user');
    } else {
      this.user.setPosition(position);
    }
  }

};

window.Map = Map;

})(this, jQuery);
