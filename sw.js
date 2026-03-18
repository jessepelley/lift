// LIFT Service Worker v1.0
const CACHE_NAME = 'lift-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// ── Install: cache core assets ──
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// ── Activate: clean old caches ──
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch: serve from cache, fallback to network ──
self.addEventListener('fetch', e => {
  // Don't intercept Supabase API calls
  if (e.request.url.includes('supabase.co')) return;

  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});

// ── Push Notifications ──
self.addEventListener('push', e => {
  const data = e.data?.json() ?? {};
  const title = data.title || 'LIFT';
  const options = {
    body: data.body || "Time to train 💪",
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: 'lift-reminder',
    renotify: true,
    requireInteraction: false,
    actions: [
      { action: 'start', title: 'Start Workout' },
      { action: 'snooze', title: 'Later' }
    ],
    data: { url: '/' }
  };
  e.waitUntil(self.registration.showNotification(title, options));
});

// ── Notification click ──
self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action === 'snooze') return;
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow('/');
    })
  );
});

// ── Background Sync (queue Supabase writes when offline) ──
self.addEventListener('sync', e => {
  if (e.tag === 'sync-workouts') {
    e.waitUntil(syncPendingWorkouts());
  }
});

async function syncPendingWorkouts() {
  // Signal to all open clients to retry their pending sync
  const allClients = await clients.matchAll({ type: 'window' });
  allClients.forEach(client => client.postMessage({ type: 'SYNC_REQUESTED' }));
}
