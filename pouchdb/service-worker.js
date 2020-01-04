'use strict';

const RUNTIME = 'runtime';

self.addEventListener('install', event => {
});

self.addEventListener('activate', event => {
});

// Intercept and cache all fetch
self.addEventListener('fetch', function(event) {
  // Skip cross-origin requests, like those for Google Analytics.
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      // Respond from the cache if possible
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Otherwise do the actual fetch and cache the response
        return caches.open(RUNTIME).then(cache => {
          return fetch(event.request).then(response => {
            // Put a copy of the response in the runtime cache.
            return cache.put(event.request, response.clone()).then(() => {
              return response;
            });
          });
        });
      })
    );
  }
});
