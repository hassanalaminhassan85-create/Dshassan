import { useState, useEffect } from 'react';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyCAMd4TDpQKAh2yCU0j-Z2f107QKoSVWDA",
  authDomain: "aesthetic-reference-fw1xt.firebaseapp.com",
  projectId: "aesthetic-reference-fw1xt",
  storageBucket: "aesthetic-reference-fw1xt.firebasestorage.app",
  messagingSenderId: "1008870369485",
  appId: "1:1008870369485:web:99325dfe52ae1f0da56184"
};

// Safe Firebase App Initialization
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export function useFCM() {
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const currentPermission = Notification.permission;
      setPermission(currentPermission);
      
      if (currentPermission === 'granted') {
        try {
          const messaging = getMessaging(app);
          onMessage(messaging, (payload) => {
            console.log('Auto-registered Foreground Push Message Received:', payload);
            window.dispatchEvent(new CustomEvent('fcm-foreground-message', { detail: payload }));
          });
        } catch (err) {
          console.warn('FCM auto-foreground setup failed (this is expected if VAPID keys require manual resolution):', err);
        }
      }
    }
  }, []);

  const requestPermissionAndGetToken = async (vapidKey?: string) => {
    setLoading(true);
    setError(null);
    try {
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service workers are not supported in this browser.');
      }

      // 1. Request user notification permission
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult !== 'granted') {
        throw new Error('Notification permission was denied by the user.');
      }

      // 2. Register the service worker with correct scope to avoid conflicts
      console.log('Registering Firebase Cloud Messaging Service Worker...');
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/'
      });
      console.log('Firebase Service Worker registered successfully! Scope:', registration.scope);

      // 3. Retrieve FCM Token
      const messaging = getMessaging(app);
      
      // If a custom VAPID key is supplied, use it; otherwise, let Firebase attempt VAPID default
      const activeVapidKey = vapidKey || 'YOUR_VAPID_PUBLIC_KEY_FROM_FIREBASE_CONSOLE';
      const vapidOptions = activeVapidKey === 'YOUR_VAPID_PUBLIC_KEY_FROM_FIREBASE_CONSOLE' 
        ? undefined 
        : { vapidKey: activeVapidKey };

      console.log('Fetching FCM Registration Token...');
      const fcmToken = await getToken(messaging, {
        serviceWorkerRegistration: registration,
        ...vapidOptions
      });

      if (fcmToken) {
        setToken(fcmToken);
        console.log('🔑 SUCCESS! FCM Token Retrieved:', fcmToken);
        console.warn('COPY-PASTE FCM TOKEN FOR BACKEND PIPELINE:', fcmToken);
      } else {
        throw new Error('No registration token available. Ensure permission is granted and VAPID key is correct.');
      }

      // 4. Register Foreground Message Listener
      onMessage(messaging, (payload) => {
        console.log('Foreground Push Message Received:', payload);
        // Fire custom event for reactive frontends
        window.dispatchEvent(new CustomEvent('fcm-foreground-message', { detail: payload }));
      });

    } catch (err: any) {
      console.error('FCM Integration error:', err);
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return {
    token,
    permission,
    loading,
    error,
    requestPermissionAndGetToken
  };
}
