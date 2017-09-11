var assert = require('assert');
var MapPromised = require('map-promised');
var MapCachedFifo = require('./');

var mapp = new MapPromised(new Map());
var mapc = new MapCachedFifo(mapp);
mapp.setup().then(() => {
  mapp.set('a', 1);
}).then(() => {
  mapc.set('b', 2);
  mapc.size.then((ans) => assert.equal(ans, 2));
  mapc.get('b').then((ans) => assert.equal(ans, 2));
  mapc.get('a').then((ans) => assert.equal(ans, 1));
  mapc.delete('b');
  mapc.size.then((ans) => assert.equal(ans, 1));
  mapc.set('c', 3);
  mapc.set('d', 4);
  assert.ok(mapc._num<=2);
  mapc.size.then((ans) => assert.equal(ans, 3));
  mapc.flush().then(() => {
    return mapp.size;
  }).then((ans) => assert.equal(ans, 3));
  // ...
});
