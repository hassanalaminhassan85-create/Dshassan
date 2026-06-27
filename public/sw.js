// Service Worker for DS Tech Career Portal PWA
const CACHE_NAME = 'dstech-portal-cache-v2';
const ASSETS_TO_CACHE = [
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
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
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests; cache storage throws on POST, PUT, DELETE, etc.
  if (event.request.method !== 'GET') {
    return;
  }

  // Let API calls pass through, only cache local static assets
  if (event.request.url.includes('/api/')) {
    return;
  }
  
  // For html/document requests, use a Network-First strategy so users always get the latest bundle references
  if (event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || Response.error();
          });
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((response) => {
        // Cache dynamic local static assets (JS, CSS, images)
        const url = new URL(event.request.url);
        const isStaticAsset = url.pathname.startsWith('/assets/') || 
                              url.pathname.endsWith('.js') || 
                              url.pathname.endsWith('.css') || 
                              url.pathname.endsWith('.png') || 
                              url.pathname.endsWith('.jpg') || 
                              url.pathname.endsWith('.svg');

        if (response.status === 200 && response.type === 'basic' && isStaticAsset) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      }).catch(() => {
        return Response.error();
      });
    })
  );
});
