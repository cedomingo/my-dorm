/* eslint-disable */
const CACHE_NAME = 'dormtracker-v1';

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(['/']);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(fetchResponse => {
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, fetchResponse.clone());
        });
        return fetchResponse;
      }).catch(() => caches.match('/'));
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});

// Satisfy the Create React App build compiler
const placeholder = self.__WB_MANIFEST;