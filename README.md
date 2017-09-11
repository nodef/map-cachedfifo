# map-cachedfifo

[![NPM](https://nodei.co/npm/map-cachedfifo.png)](https://nodei.co/npm/map-cachedfifo/)

FIFO Cached interface for a Promised Map.

```javascript
var MapCachedFifo = require('map-cachedfifo');
// MapCachedFifo(<source>, [<cache>], [<evict>])
// source: a promised map, like MapPg (map-pg)
// cache:  size of get and set cache, evicts and flushes when full (default 1024)
// evict:  fraction of get cache to evict when full (default 0.5)
```
```javascript
var MapPromised = require('map-promised');
var MapCachedFifo = require('map-cachedfifo');

var mapp = new MapPromised(new Map());
var mapc = new MapCachedFifo(mapp);
mapp.setup().then(() => {
  mapp.set('a', 1);
}).then(() => {
  // MapCachedFifo has no setup()
  mapc._num;                        // number of pairs in cache
  mapc._map;                        // cached items
  mapc._map.size;                   // number of items in cache, including deleted pairs
  mapc.set('b', 2);
  mapc.size.then((ans) => ans);     // 2
  mapc.get('b').then((ans) => ans); // 2
  mapc.get('a').then((ans) => ans); // 1
  mapc.delete('b');
  mapc.size.then((ans) => ans);     // 1
  mapc.set('c', 3);
  mapc.set('d', 4);
  mapc._num                         // <=2
  mapc.size.then((ans) => ans);     // 3
  mapc.flush().then(() => {
    return mapp.size;
  }).then((ans) => ans);            // 3
  // ...
});
```
