# map-cachedfifo

[![NPM](https://nodei.co/npm/map-cachedfifo.png)](https://nodei.co/npm/map-cachedfifo/)

FIFO Cached interface for a Promised Map.

```javascript
var MapPromised = require('map-promised');
var MapCached = require('map-cachedfifo');
// MapCached(<source>, <cache capacity>=1024, <evict fraction>=0.5)

var mapp = new MapPromised(new Map());
mapp.set('a', 1);
new MapCached(mapp, 2).then((mapc) => {
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
