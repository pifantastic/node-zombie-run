
// Enable/disable logging.
var on = true;

// Logging levels defined by RFC 3164 
// http://www.ietf.org/rfc/rfc3164.txt

// Emergency: system is unusable
var EMERGENCY = 0;
// Alert: action must be taken immediately
var ALERT = 1;
// Critical: critical conditions
var CRITICAL = 2;
// Error: error conditions
var ERROR = 3;
// Warning: warning conditions
var WARNING = 4;
// Notice: normal but significant condition
var NOTICE = 5;
// Informational: informational messages
var INFO = 6;
// Debug: debug-level messages
var DEBUG = 7;

var LEVEL = DEBUG;

var levels = ['Emergency', 'Alert', 'Critical', 'Error', 'Warning', 'Notice', 'Info', 'Debug'];

var log = function(level, message) {
  if (arguments.length === 1) {
    message = level;
    level = NOTICE;
  }

  if (level > LEVEL) {
    return;
  }
  
  if (typeof message === 'string') {
    console.log((new Date).toString() + ': ' + levels[level] + ': ' + message);
  } else {
    console.log((new Date).toString() + ': ' + levels[level] + ':');
    console.log(message);
  }
};

exports.EMERGENCY = EMERGENCY;
exports.ALERT = ALERT;
exports.CRITICAL = CRITICAL;
exports.ERROR = ERROR;
exports.WARNING = WARNING;
exports.NOTICE = NOTICE;
exports.INFO = INFO;
exports.DEBUG = DEBUG;

exports.on = on;
exports.log = log;
exports.LEVEL = LEVEL;
