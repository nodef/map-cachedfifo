var $ = function MapCachedFifo(src, cap, evict) {
  this._src = src;
  this._size = -1;
  this._cap = cap||1024;
  this._evict = evict||0.5;
  this._map = new Map();
  this._set = new Map();
};
module.exports = $;

var _ = $.prototype;

Object.defineProperty(_, 'size', {'get': function() {
  if(this._size>=0) return Promise.resolve(this._size);
  return this._src.size().then((ans) => this._size = ans);
}});

_.flush = function() {
  var a = [];
  for(var [k, v] of this._set)
    a.push(v===undefined? this._src.delete(k) : this._src.set(k, v));
  this._set.clear();
  return Promise.all(a);
};

_.evict = function() {
  return this.flush().then(() => {
    var i = 0, I = this._evict*this._map.size;
    for(var [k, v] of this._map) {
      if(i++>=I) break;
      this._map.delete(k);
    }
    return this;
  });
};

_.set = function(k, v) {
  if(v===undefined) this._map.delete(k);
  else this._map.set(k, v);
  this._set.set(k, v);
  return Promise.resolve(this);
};

_.get = function(k) {
  var v = this._map.get(k);
  if(v!==undefined || this._map.size===this._size) return Promise.resolve(v);
  return this._src.get(k).then((ans) => {
    if(ans===undefined) return ans;
    this._map.set(k, ans);
    if(this._map.size>this._cap) this.evict();
    return ans;
  });
};

_.delete = function(k) {
  return this.set(k, undefined);
};

_.has = function(k) {
  this.get(k).then((ans) => ans===undefined? false : true);
};

_.clear = function() {
  this._map.clear();
  this._set.clear();
  this._size = 0;
  return this._src.clear();
};

_.forEach = function(fn, thisArg) {
  if(this._map.size===this._size) return this._map.forEach(fn, thisArg);
  return this.flush().then(() => this._src.forEach(fn, thisArg));
};

_.valueOf = function() {
  if(this._map.size===this._size) return Promise.resolve(this._map);
  this.flush().then(() => this._src.valueOf().then((ans) => {
    this._map = ans;
    this._size = ans.size;
    return ans;
  }));
};

_.entries = function() {
  return this.valueOf().then((ans) => ans.entries());
};

_.keys = function() {
  return this.valueOf().then((ans) => ans.keys());
};

_.values = function() {
  return this.valueOf().then((ans) => ans.values());
};
