// Service worker AviAssist : l'app reste utilisable hors ligne et se met à jour
// dès qu'une nouvelle version est en ligne.
// - Pages : réseau d'abord (nouvelle version immédiate), cache si hors ligne.
// - Fichiers JS/CSS/images de l'app : cache d'abord (leurs noms changent à chaque version).
// - Supabase et autres sites : jamais mis en cache ici (sauf les polices).
const CACHE_NAME = 'aviassist-v2';

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(['/'])));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const putInCache = (request, response) => {
  if (response && response.ok) {
    const clone = response.clone();
    caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
  }
  return response;
};

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  const isFont = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (url.origin !== self.location.origin && !isFont) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => putInCache('/', response))
        .catch(() => caches.match('/'))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(response => putInCache(request, response)))
  );
});
