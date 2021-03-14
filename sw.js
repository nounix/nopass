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

// self.addEventListener('fetch', function (e) {
//   caches.open(CACHE_VERSION).then((cache) => cache.add(e.request.url))
//   e.respondWith(
//     fetch(e.request).catch(function(err) {
//       // console.error('Fetch failed; returning offline page instead.', err);
//       return caches.open(CACHE_VERSION).then(function(cache) {
//         return cache.match(e.request.url);
//       });
//     }))
// });

self.addEventListener('fetch', function(event) {
  console.log('Handling fetch event for', event.request.url);

  event.respondWith(
    caches.open(CACHE_VERSION).then(function(cache) {
      return cache.match(event.request).then(function(response) {
        if (response) return response;

        return fetch(event.request.clone()).then(function(response) {
          if (response.status < 400) cache.put(event.request, response.clone());
          return response;
        });
      }).catch(function(error) {
        // This catch() will handle exceptions that arise from the match() or fetch() operations.
        // Note that a HTTP error response (e.g. 404) will NOT trigger an exception.
        // It will return a normal response object that has the appropriate error code set.
        console.error('  Error in fetch handler:', error);
        console.log("event = ", event)

        throw error;
      });
    })
  );
});