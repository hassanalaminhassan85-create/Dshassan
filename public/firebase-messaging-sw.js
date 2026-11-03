// DS TECH & DIGITAL MARKETING AGENCY LIMITED - Unified Enterprise PWA & FCM Service Worker
// Version: 2026.11.02-v3
// Purpose: Zero-stale deployment delivery, reliable network-first HTML navigation, and Firebase Push Messaging.

importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

const CACHE_VERSION = 'dstech-v3-prod';
const STATIC_CACHE_NAME = `dstech-static-${CACHE_VERSION}`;
const OFFLINE_FALLBACK_URL = '/';

// Essential assets to cache for offline availability
const ASSETS_TO_PRECACHE = [
  '/',
  '/manifest.json',
  '/icon.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/apple-touch-icon.png',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/official-logo.jpg'
];

// 1. INSTALL LIFECYCLE: Precache assets & activate immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      // Use catch for individual assets so single failures don't abort installation
      return Promise.all(
        ASSETS_TO_PRECACHE.map((url) => {
          return cache.add(url).catch((err) => {
            console.warn('[ServiceWorker] Precache failed for:', url, err);
          });
        })
      );
    }).then(() => {
      console.log('[ServiceWorker] Installed successfully - activating skipWaiting()');
      return self.skipWaiting();
    })
  );
});

// 2. ACTIVATE LIFECYCLE: Purge any old/stale caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          // Delete old dstech- or workbox- caches that don't match the current active version
          if (name !== STATIC_CACHE_NAME) {
            console.log('[ServiceWorker] Purging legacy cache:', name);
            return caches.delete(name);
          }
          return Promise.resolve();
        })
      );
    }).then(() => {
      console.log('[ServiceWorker] Active & claiming all clients immediately');
      return self.clients.claim();
    })
  );
});

// 3. FETCH STRATEGY:
// - HTML Navigations: ALWAYS Network-First with offline cache fallback (Guarantees zero-stale HTML on new deployments)
// - API routes & version check: Network-Only (Never cache dynamic data)
// - Content-hashed Vite assets (/assets/*): Cache-First (Safe because URLs change on every build)
// - Other static assets: Stale-While-Revalidate
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only intercept GET requests
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // A. ALWAYS BYPASS SERVICE WORKER FOR APIs, VERSION DESCRIPTOR, AND AUTH
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname === '/version.json' ||
    url.hostname.includes('firebaseio.com') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('identitytoolkit')
  ) {
    return; // Pass through to network directly
  }

  // B. NAVIGATION REQUESTS (HTML ENTRYPOINT) - STRICT NETWORK FIRST
  // Always retrieve the fresh HTML document directly from the origin network.
  // Never overwrite the root offline fallback URL with responses from other page navigations!
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => {
              // Cache specifically under this request's own URL
              cache.put(request, responseToCache);
              // ONLY update the root offline fallback if the navigated URL was actually the root homepage!
              if (url.pathname === '/' || url.pathname === '/index.html' || url.pathname === '') {
                cache.put(OFFLINE_FALLBACK_URL, networkResponse.clone());
              }
            });
          }
          return networkResponse;
        })
        .catch(() => {
          console.log('[ServiceWorker] Network unreachable, retrieving cached navigation entry');
          return caches.match(request).then((cached) => {
            return cached || caches.match(OFFLINE_FALLBACK_URL) || caches.match('/index.html');
          });
        })
    );
    return;
  }

  // C. CONTENT-HASHED ASSETS (/assets/*) - CACHE FIRST
  // Vite content-hashes these files, so they are genuinely immutable.
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // D. OTHER STATIC ASSETS (icons, manifest, images) - STALE WHILE REVALIDATE
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(STATIC_CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Silently tolerate background fetch failures when offline
      });

      return cachedResponse || fetchPromise;
    })
  );
});

// 4. CLIENT MESSAGE HANDLER: Controlled updates & cache purges from UI
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data === 'SKIP_WAITING' || event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'CLEAR_ALL_CACHES') {
    caches.keys().then((keys) => {
      return Promise.all(keys.map(k => caches.delete(k)));
    }).then(() => {
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ success: true });
      }
    });
  }

  if (event.data.type === 'GET_VERSION') {
    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage({ version: CACHE_VERSION });
    }
  }
});

// 5. FIREBASE CLOUD MESSAGING (FCM) BACKGROUND HANDLER
firebase.initializeApp({
  apiKey: "AIzaSyCAMd4TDpQKAh2yCU0j-Z2f107QKoSVWDA",
  authDomain: "aesthetic-reference-fw1xt.firebaseapp.com",
  projectId: "aesthetic-reference-fw1xt",
  storageBucket: "aesthetic-reference-fw1xt.firebasestorage.app",
  messagingSenderId: "1008870369485",
  appId: "1:1008870369485:web:99325dfe52ae1f0da56184"
});

const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function(payload) {
  console.log('[firebase-messaging-sw.js] Background push payload received:', payload);
  
  const notificationTitle = payload.notification?.title || payload.data?.title || 'DS Tech Official Notice';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'You have an official update from DS TECH.',
    icon: payload.notification?.image || payload.data?.icon || '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    data: payload.data
  };

  // Broadcast to all active open tabs
  if (self.clients) {
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clients) {
      if (clients && clients.length > 0) {
        clients.forEach(function(client) {
          client.postMessage({
            type: 'FCM_BG_NOTIFICATION',
            payload: payload
          });
        });
      }
    }).catch(function(err) {
      console.error('[firebase-messaging-sw.js] Failed broadcasting to clients:', err);
    });
  }

  return self.registration.showNotification(notificationTitle, notificationOptions);
});
