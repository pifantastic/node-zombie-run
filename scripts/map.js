
(function(window, $) {

var Map = function(selector, options) {
  return this.init(selector, options);
};

Map.prototype = {
  
  // Zombie markers.
  _zombies: {},
  
  // Player markers.
  _players: {},
  
  user: null,
  
  defaults: {
    zoom: 15,
    center: new google.maps.LatLng(0, 0),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  },
  
  settings: {},
  
  // Create the map.
  init: function(selector, options) {
    options = options || {};
    this.selector = selector;
    this.settings = $.merge(this.defaults, options);
    this.map = new google.maps.Map($(this.selector).get(0), this.settings);
    return this;
  },
  
  // Update the entities on the map.
  update: function(state) {
    for (var zombie in state.zombies) {
      var lat = state.zombies[zombie].lat,
          lng = state.zombies[zombie].lng,
          position = new google.maps.LatLng(lat, lng);
      if (zombie in this._zombies) {
        this._zombies[zombie].setPosition(position);
      } else {
        this._zombies[zombie] = this.marker(lat, lng, 'zombie');
      }
    }
  },
  
  // Create a map marker with the given position and icon.
  marker: function(lat, lng, type) {
    var image, position, marker;
    switch (type) {
      case 'zombie': image = '/img/bullet_red.png'; break;
      case 'player': image = '/img/bullet_green.png'; break;
      default: image = '/img/bullet_blue.png';
    }
    position = new google.maps.LatLng(lat, lng);
    return new google.maps.Marker({ position: position, map: this.map, icon: image });
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
