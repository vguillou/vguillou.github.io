(function(window, document, undefined) {
  'use strict';
  
  // Setup the service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./serviceworker.js', { scope: './' })
      .then(function(r) {
        console.log('Registered service worker with scope: ' + r.scope);
      })
      .catch(function(error) {
        console.error('Error while registering the service worker');
        console.error(error);
      });
  } else {
    console.log('No service worker');
  }
})(window, document);