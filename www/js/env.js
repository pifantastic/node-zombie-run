
;(function(global) {
  
  var env = {

    _deps: {},
    _ready: function() {},
    _change: function() {},

    // Add dependencies.
    deps: function() {
      for (var x = 0, len = arguments.length; x < len; x++) {
        this._deps[arguments[x]] = false;
      }
      
      return this;
    },

    // Update the state of a dependency.
    dep: function(dep, state) {
      if (dep in this._deps) {
        if (arguments.length === 1) {
          return this._deps[dep];
        }
        else {
          this._deps[dep] = !!state;
          this._change(dep, !!state);
          for (var dep in this._deps) {
            if (!this._deps[dep]) {
              return this;
            }
          }
          this._ready(this._deps);
          return this;
        }
      }
    },

    // Supply a callback to execute when all dependencies 
    // have been fulfilled.
    ready: function(cb) {
      this._ready = cb;
      return this;
    },

    // Supply a callback to execute when the state
    // of a dependency changes.
    change: function(cb) {
      this._change = cb;
      return this;
    }
  };

  global.env = env;
  
})(this.exports || this);
