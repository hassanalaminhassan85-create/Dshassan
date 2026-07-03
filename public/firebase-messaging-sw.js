// Firebase Service Worker for alihsan.online Push Notifications
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

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
  const notificationTitle = payload.notification?.title || payload.data?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'You have a new message from Al Ihsan.',
    icon: payload.notification?.image || payload.data?.icon || 'https://alihsan.online/logo.png',
    badge: 'https://alihsan.online/logo.png',
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
