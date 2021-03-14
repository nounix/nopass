var CACHE_VERSION = "v1";

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('message', (event) => {
  if (event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_VERSION).then((cache) => cache.addAll(event.data.payload))
    );
  }
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.open(CACHE_VERSION).then(function (cache) {
      return cache.match(event.request).then(function (response) {
        if (response) return response;

        return fetch(event.request.clone()).then(function (response) {
          if (response.status < 400) cache.put(event.request, response.clone());
          return response;
        });
      });
    })
  );
});