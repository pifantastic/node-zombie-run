
RADIUS_OF_EARTH = 6378137;

var deg2rad = function(degrees) {
  return Math.PI * (degrees / 180);
}

var distance = function(aLat, aLon, bLat, bLon) {
  var dlat = aLat - bLat,
      dlon = aLon - bLon;
      
  a = Math.pow(Math.sin(deg2rad(dlat / 2)), 2) + 
      Math.cos(deg2rad(aLat)) *
      Math.cos(deg2rad(bLat)) *
      Math.pow(Math.sin(deg2rad(dlon / 2)), 2);
      
  return RADIUS_OF_EARTH * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

exports.distance = distance;
