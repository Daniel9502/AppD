/**
 * Service worker pentru exploratorul de graf.
 *
 * Are scope propriu (`/graph/`), deci nu se calcă în picioare cu cel de la
 * rădăcină, al aplicației de invitații.
 *
 * Când vrei ca toată lumea să primească imediat versiunea nouă,
 * crește numărul din VERSION.
 */

const VERSION = 1;
const CACHE = `graf-explorer-v${VERSION}`;

/* Tot ce trebuie ca aplicația să pornească fără net. Sub 200 KB cu totul. */
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
];

/* Graful e date, nu cod: îl luăm întâi de pe net, ca un `graphify update` să se
   vadă imediat, și cădem pe cache doar dacă nu merge. */
const DATA = new URL('../graphify-out/graph.json', self.location).href;

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(async cache => {
        await cache.addAll(ASSETS);
        // Graful poate lipsi (nu s-a rulat încă graphify), așa că nu blocăm instalarea.
        await cache.add(DATA).catch(() => {});
      })
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

  // Datele: net întâi.
  if (url.href === DATA) {
    event.respondWith(
      fetch(req)
        .then(res => {
          if (res && res.ok) caches.open(CACHE).then(c => c.put(DATA, res.clone()));
          return res;
        })
        .catch(async () => (await caches.match(DATA)) ||
          new Response('Offline', { status: 503, statusText: 'Offline' }))
    );
    return;
  }

  // Restul: din cache, cu împrospătare în fundal.
  const key = req.mode === 'navigate' ? './index.html' : req.url;

  event.respondWith(
    caches.open(CACHE).then(async cache => {
      const cached = await cache.match(key);

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
