const CACHE_NAME = 'cloud-recall-lab-v11';
const RUNTIME_CACHE_ORIGINS = new Set([
  'https://cdnjs.buymeacoffee.com',
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com'
]);
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './questions.js',
  './study_data.js',
  './mock_exams.js',
  './final_exam.js',
  './manifest.json',
  './favicon.svg',
  './icon-192.png',
  './icon-512.png',
  './og-image.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);

  if (requestUrl.origin !== self.location.origin) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        const network = fetch(event.request).then(response => {
          if (RUNTIME_CACHE_ORIGINS.has(requestUrl.origin) && (response.ok || response.type === 'opaque')) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          }
          return response;
        }).catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request).then(cached => cached || caches.match('./index.html')))
  );
});
