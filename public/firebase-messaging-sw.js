// Firebase Service Worker for DS Tech PWA & Push Notifications
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

const CACHE_NAME = 'dstech-pwa-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/apple-touch-icon.png',
  '/favicon-32x32.png',
  '/favicon-16x16.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached response and fetch updated version in background
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(() => {});
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      }).catch(() => {
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('/');
        }
      });
    })
  );
});

// Initialize the Firebase app in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyCAMd4TDpQKAh2yCU0j-Z2f107QKoSVWDA",
  authDomain: "aesthetic-reference-fw1xt.firebaseapp.com",
  projectId: "aesthetic-reference-fw1xt",
  storageBucket: "aesthetic-reference-fw1xt.firebasestorage.app",
  messagingSenderId: "1008870369485",
  appId: "1:1008870369485:web:99325dfe52ae1f0da56184"
});

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.setBackgroundMessageHandler(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);
  
  // Extract notification parameters
  const notificationTitle = payload.notification?.title || payload.data?.title || 'DS Tech Alert';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'You have a new update from DS Tech.',
    icon: payload.notification?.image || payload.data?.icon || '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    data: payload.data
  };

  // Broadcast to all active clients (tabs/frontend) so they can show in-app alerts/toasts
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
      console.error('[firebase-messaging-sw.js] Failed to match clients:', err);
    });
  }

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

