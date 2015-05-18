importScripts('serviceworker-cache-polyfill.js');

// Cache version - To update everytime something cached resources
// changes in order to clear up old cache and build new one.
var CACHE_VERSION = 5;

// Shorthand identifier mapped to specific versioned cache.
var CURRENT_CACHES = {
  statics: 'static-cache-v' + CACHE_VERSION,
  dynamics: 'dynamic-cache-v' + CACHE_VERSION
};

var staticUrlsToCache = [
  './',
  './index.html',
  './404.html',
  './favicon.ico',
  './elements/elements.vulcanized.html',
  './scripts/app.js',
  './styles/main.css',
  './images/logo.svg'
];

console.log('SW startup');

self.addEventListener('install', function(event) {
  console.log('SW installed');
  
  // Pre cache all static ressources
  event.waitUntil(
    caches.open(CURRENT_CACHES.statics).then(function(cache) {
      console.log('Caching static resources');
      return cache.addAll(staticUrlsToCache);
    })
  );
});

self.addEventListener('activate', function(event) {
  console.log('SW activated');

  var expectedCacheNames = Object.keys(CURRENT_CACHES).map(function(key) {
    return CURRENT_CACHES[key];
  });

  // Active worker won't be treated as activated until promise resolves successfully.
  // Clear up old caches
  // Must not be done in the install callback not to cripple running workers
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (expectedCacheNames.indexOf(cacheName) === -1) {
            console.log('Deleting out of date cache: ' + cacheName);
            return caches.delete(cacheName);
          }
          console.log('Cache alive: ' + cacheName);
        })
      );
    })
  );
});

self.addEventListener('fetch', function(event) {
  console.log('SW caught a fetch for ' + event.request.url);
  
  event.respondWith(
    caches.match(event.request).then(function(response) {
      // Cache hit - return the cached response
      if (response) {
        console.log('SW cache hit');
        return response;
      }

      // IMPORTANT: Clone the request. A request is a stream and
      // can only be consumed once. Since we are consuming this
      // once by cache and once by the browser for fetch, we need
      // to clone the response
      var fetchRequest = event.request.clone();
      
	  console.log('===> SW fetching...');
      return fetch(fetchRequest).then(function(response) {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
		  console.log('SW says the response is not valid: ', response);
          return response;
        }

        // IMPORTANT: Clone the response. A response is a stream
        // and because we want the browser to consume the response
        // as well as the cache consuming the response, we need
        // to clone it so we have 2 stream.
        var responseToCache = response.clone();

        caches.open(CURRENT_CACHES.dynamics).then(function(cache) {
          cache.put(event.request, responseToCache);
		  console.log('SW cached response in dynamics', responseToCache);
        });

        return response;
      });
    }).catch(function(error) {
      // Handles exceptions that arise from match() or fetch().
      console.error('Error in fetch handler:', error);
      throw error;
    })
  );
});
