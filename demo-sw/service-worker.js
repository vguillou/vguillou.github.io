// Needs a server even for dev. On a Mac: python -m SimpleHTTPServer 8000

'use strict';

self.addEventListener('install', event => {
    console.log('SW install');
});

self.addEventListener('activate', event => {
    console.log('SW activate');
    const swListener = new BroadcastChannel('swListener');
    swListener.postMessage('This is From SW');
});

self.addEventListener('push', event => {
    console.log('Received push: ' + JSON.stringify(event));

    let notificationOptions = {
        body: "Hello World",
        data: {
            url: 'http://example.com/updates'
        }
    };
    let title = "Ceci est une notification !";
    return self.registration.showNotification(title, notificationOptions);
});

// Intercept and cache all fetch
const RUNTIME = 'runtimeCache';

self.addEventListener('fetch', event => {
    event.respondWith(
        // Respond from the cache if possible
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                console.log('Serving from cache: ' + event.request.url);
                return cachedResponse;
            }

            // Otherwise do the actual fetch and cache the response
            return caches.open(RUNTIME).then(cache => {
                console.log('No cache hit, fetching: ' + event.request.url);
                return fetch(event.request).then(response => {
                    // Put a copy of the response in the runtime cache.
                    return cache.put(event.request, response.clone()).then(() => {
                        return response;
                    });
                });
            });
        })
    );
});
