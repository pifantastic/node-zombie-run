
var config = {
  environment: 'dev',
  
  server: {
    port: 1337,
    host: 'localhost'
  },
  
  game: {
    interval: 1000
  }
};

var get = exports.get = function(item) {
  var items = item.split('.');
  switch (items.length) {
    case 3:
      return config[items[0]][items[1]][items[2]];
    case 2:
      return config[items[0]][items[1]];
    default:
      return config[items[0]];
  }
};

var set = exports.set = function(item, val) {
  var items = item.split('.');
  switch (items.length) {
    case 3:
      return config[items[0]][items[1]][items[2]] = val;
    case 2:
      return config[items[0]][items[1]] = val;
    default:
      return config[items[0]] = val;
  }
};
