var $ = function MapCachedFifo(src, cap, evict) {
  this._src = src;
  this._size = -1;
  this._cap = cap||1024;
  this._buf = 0.5*this._cap;
  this._evict = evict||0.5;
  this._map = new Map();
  this._set = new Map();
  this._und = new Set();
};
module.exports = $;

var _ = $.prototype;

Object.defineProperty(_, 'size', {'get': function() {
  if(this._size>=0) return Promise.resolve(this._size);
  return this.flush().then(() => this._src.size).then((ans) => this._size = ans);
}});

_.flush = function() {
  var a = [], I = n||this._set.size;
  for(var [k, v] of this._set) {
    a.push(v===undefined? this._src.delete(k) : this._src.set(k, v));
    if(++i>=I) break;
  }
  this._set.clear();
  return Promise.all(a).then(() => i);
};

_.evict = function(n) {
  var i = 0, I = n||this._evict*this._map.size;
  for(var [k, v] of this._map) {
    if(this._set.has(k)) continue;
    this._map.delete(k);
    if(++i>=I) break;
  }
  this._und.clear();
  return Promise.resolve(i);
};

_.set = function(k, v) {
  var x = this._map.get(k);
  if(v===undefined) {
    this._map.delete(k);
    this._und.add(k);
  }
  else {
    this._map.set(k, v);
    this._und.delete(k);
  }
  this._set.set(k, v);
  var dnum = (x===undefined? 1 : 0) - (v===undefined? 1 : 0);
  this._size = this._map.size====this._size? this._size+dnum : -1;
  if(this._map.size>this._cap) this.evict();
  if(this._set.size>this._buf) this.flush();
  return Promise.resolve(v);
};

_.get = function(k) {
  var v = this._map.get(k);
  if(v!==undefined) return Promise.resolve(v);
  if(this._und.has(k) || this._map.size===this._size) return Promise.resolve();
  return this._src.get(k).then((ans) => {
    if(ans===undefined) this._und.add(k);
    else this._map.set(k, ans);
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

_.valueOf = function() {
  if(this._map.size===this._size) return Promise.resolve(this._map);
  this.flush().then(() => this._src.valueOf().then((ans) => {
    this._map = ans;
    this._size = ans.size;
    return ans;
  }));
};

_.forEach = function(fn, thisArg) {
  return this.valueOf().then((ans) => ans.forEach(fn, thisArg));
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
