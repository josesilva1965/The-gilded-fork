const CACHE_NAME = 'gilded-fork-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/logo.svg',
  '/robots.txt'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only handle GET requests and local/font/static files
  if (event.request.method !== 'GET' || url.pathname.startsWith('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch new version in background (Stale-While-Revalidate)
        fetch(event.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(() => { /* ignore offline errors */ });
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (
          networkResponse.status === 200 &&
          (url.origin === self.location.origin || url.host === 'fonts.googleapis.com' || url.host === 'fonts.gstatic.com')
        ) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch((err) => {
        // Offline fallback for HTML requests
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('/');
        }
        throw err;
      });
    })
  );
});
