/**
 * Service worker: aplicația pornește din cache (instant, chiar și fără net)
 * și se împrospătează în fundal.
 *
 * Numărul de versiune vine din `version.js`, ca să fie unul singur pentru
 * toată aplicația. Când îl crești acolo, browserul observă că un script
 * importat s-a schimbat, reinstalează service workerul și cache-ul vechi
 * dispare de la sine.
 */

importScripts('./version.js');

const CACHE = `hai-sa-ne-vedem-v${self.APP_VERSION}`;

const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './version.js',
  './script.js',
  './firebase-config.js',
  './cloud.js',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
];

/* SDK-ul Firebase și apelurile către Firestore sunt pe alt domeniu, deci trec
   pe lângă noi; vezi verificarea de origine din handlerul de fetch. Aplicația
   pornește offline, dar invitațiile au nevoie de internet. */

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

  // Invitațiile sunt tot index.html, doar cu alt query string, dar numai la
  // rădăcină. Subpaginile (ex. /graph/) își păstrează propriul URL, altfel ar
  // primi index.html-ul aplicației de invitații.
  const root = new URL('./', self.registration.scope).pathname;
  const isRoot = url.pathname === root || url.pathname === root + 'index.html';
  const key = req.mode === 'navigate' && isRoot ? './index.html' : req.url;

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
