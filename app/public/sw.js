/**
 * Service Worker for Carp School Web Push Notifications
 * Handles push notification display and click actions
 */

// Service worker version (increment to force update)
const SW_VERSION = 'v1.0.0';
const CACHE_NAME = `carp-school-sw-${SW_VERSION}`;

// Install event
self.addEventListener('install', (event) => {
  console.log(`[SW] Installing service worker ${SW_VERSION}`);
  self.skipWaiting(); // Force activation
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log(`[SW] Activating service worker ${SW_VERSION}`);
  
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName.startsWith('carp-school-sw-')) {
            console.log(`[SW] Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Take control of all pages
  event.waitUntil(self.clients.claim());
});

// Push event handler
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received:', event);

  if (!event.data) {
    console.warn('[SW] Push event has no data');
    return;
  }

  try {
    const data = event.data.json();
    
    const notificationOptions = {
      body: data.body || data.message || 'New notification',
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      tag: data.tag || 'default',
      data: data.data || {},
      requireInteraction: data.priority === 'urgent',
      silent: data.silent || false,
      vibrate: data.vibrate || [200, 100, 200],
      actions: data.actions || [
        {
          action: 'open',
          title: 'Open App',
          icon: '/icon-action-open.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/icon-action-dismiss.png'
        }
      ]
    };

    // Show notification
    event.waitUntil(
      self.registration.showNotification(
        data.title || 'Carp School',
        notificationOptions
      )
    );

  } catch (error) {
    console.error('[SW] Error parsing push data:', error);
    
    // Fallback notification
    event.waitUntil(
      self.registration.showNotification('Carp School', {
        body: 'You have a new notification',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png'
      })
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);

  event.notification.close();

  const action = event.action;
  const data = event.notification.data || {};

  if (action === 'dismiss') {
    // Just close the notification
    return;
  }

  // Handle click action (open app or specific page)
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Try to find existing app window
        for (let client of clientList) {
          if (client.url.includes(self.location.origin)) {
            // Focus existing window and navigate
            return client.focus().then(() => {
              if (data.url) {
                return client.navigate(data.url);
              } else if (data.rideId) {
                return client.navigate(`/mobile/ride-info/${data.rideId}`);
              } else if (data.chatId) {
                return client.navigate(`/chat?chatId=${data.chatId}`);
              }
              return client;
            });
          }
        }

        // No existing window, open new one
        let url = self.location.origin;
        
        if (data.url) {
          url = data.url;
        } else if (data.rideId) {
          url += `/mobile/ride-info/${data.rideId}`;
        } else if (data.chatId) {
          url += `/chat?chatId=${data.chatId}`;
        }

        return clients.openWindow(url);
      })
  );
});

// Background sync (for future use)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'notification-status-sync') {
    // Could sync notification read status with server
    event.waitUntil(syncNotificationStatus());
  }
});

// Helper function for syncing notification status
async function syncNotificationStatus() {
  try {
    // Get unsynced notification interactions from IndexedDB
    // Send to server
    console.log('[SW] Syncing notification status...');
  } catch (error) {
    console.error('[SW] Sync failed:', error);
  }
}

// Message handler (for communication with main app)
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
