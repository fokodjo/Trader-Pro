// TRADER PRO — Service Worker v3 (force refresh)
var CACHE = 'traderpro-v3';
var FILES = ['./', './index.html', './manifest.json', './licences.json'];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(FILES);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  // licences.json : toujours depuis le réseau (jamais depuis le cache)
  if (e.request.url.indexOf('licences.json') !== -1) {
    e.respondWith(fetch(e.request).catch(function() {
      return caches.match('./licences.json');
    }));
    return;
  }
  // Autres fichiers : cache d'abord
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(resp) {
        if (resp && resp.status === 200) {
          var copy = resp.clone();
          caches.open(CACHE).then(function(cache) { cache.put(e.request, copy); });
        }
        return resp;
      }).catch(function() { return caches.match('./index.html'); });
    })
  );
});
