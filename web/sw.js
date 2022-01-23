self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.open("NOPASS").then(function (cache) {
      return cache.match(event.request).then(function (response) {
        if (response) { return response; }

        return fetch(event.request.clone()).then(function (response) {
          if (response.status < 400) { cache.put(event.request, response.clone()); }
          return response;
        });
      });
    })
  );
});