
var d2r = function(degrees) {
  return Math.PI * (degrees / 180);
}

var distance = function(aLat, aLng, bLat, bLng) {
  var R = 6378100,
      dLat = d2r(bLat - aLat),
      dLon = d2r(bLng - aLng),
      c = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(d2r(aLat)) * Math.cos(d2r(bLat)) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
          
  return R * 2 * Math.atan2(Math.sqrt(c), Math.sqrt(1 - c));
}

exports.distance = distance;
