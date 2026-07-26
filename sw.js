/**
 * Service worker: aplicația pornește din cache (instant, chiar și fără net)
 * și se împrospătează în fundal.
 *
 * Când vrei ca toată lumea să primească imediat versiunea nouă,
 * crește numărul din VERSION de mai jos.
 */

const VERSION = 3;
const CACHE = `hai-sa-ne-vedem-v${VERSION}`;

const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(names.filter(n => n !== CACHE).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  // Invitațiile sunt tot index.html, doar cu alt query string.
  const key = req.mode === 'navigate' ? './index.html' : req.url;

  event.respondWith(
    caches.open(CACHE).then(async cache => {
      const cached = await cache.match(key);

      // Împrospătăm în fundal: următoarea deschidere are versiunea nouă.
      const fresh = fetch(req)
        .then(res => {
          if (res && res.ok && res.type === 'basic') cache.put(key, res.clone());
          return res;
        })
        .catch(() => null);

      if (cached) return cached;
      const res = await fresh;
      return res || new Response('Offline', { status: 503, statusText: 'Offline' });
    })
  );
});
