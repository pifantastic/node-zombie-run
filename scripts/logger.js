
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

var log = function(level, message) {
  if (level > LEVEL)
    return;
    
  var date = new Date,
      levels = { EMERGENCY: 'Emergency', ALERT: 'Alert', CRITICAL: 'Critical',
        ERROR: 'Error', WARNING: 'Warning', NOTICE: 'Notice', INFO: 'Info', DEBUG: 'Debug' };
  
  level = levels[level] || 'Unknown';
  console.log(date.toDateString() + ': ' + level + ': ' + message);
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
