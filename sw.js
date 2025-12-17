const CACHE_NAME = 'gencodebarre-v2.3'; // Incrémentez lors de mises à jour majeures

const urlsToCache = [
  './',
  './index.html',
  './plaquettes.html', // Ne pas oublier la page des planches !
  './plaquettes.css',
  './plaquettes.js',
  './manifest.json',
  './icon-192x192.png',
  './icon-512x512.png',
  'https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcode/1.5.1/qrcode.min.js',
  'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap'
];



self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Force le cache des fichiers essentiels
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // Active le SW immédiatement
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then(response => {
        // On vérifie si on doit mettre en cache (Status 200 ou 0 pour les CDN opaques)
        if (!response || (response.status !== 200 && response.status !== 0)) {
          return response;
        }

        // On clone la réponse
        const responseToCache = response.clone();
        
        // On ne met en cache que les requêtes GET sécurisées
        if (event.request.method === 'GET') {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }

        return response;
      }).catch(() => {
        // Optionnel : renvoyer une page d'erreur offline si nécessaire
      });
    })
  );
});
