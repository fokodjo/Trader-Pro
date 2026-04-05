var CACHE = 'tp-v4';
self.addEventListener('install', function(e) {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c) {
    return c.addAll(['./index.html','./manifest.json','./licences.json']);
  }));
});
self.addEventListener('activate', function(e) {
  e.waitUntil(caches.keys().then(function(keys) {
    return Promise.all(keys.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));
  }));
  self.clients.claim();
});
self.addEventListener('fetch', function(e) {
  if (e.request.url.indexOf('licences.json') > -1) {
    e.respondWith(fetch(e.request.url + '?t=' + Date.now()).catch(function() { return caches.match('./licences.json'); }));
    return;
  }
  e.respondWith(caches.match(e.request).then(function(r) { return r || fetch(e.request); }));
});
