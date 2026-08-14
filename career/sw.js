// Karya Saarthi Career Portal — Service Worker (PWA)
// v4 — Self-hosted CSS, same-origin only
const CACHE_NAME = 'ks-career-v4';
const STATIC_ASSETS = [
  '/',
  '/careers.php',
  '/assets/css/style.css',
  '/assets/vendor/fontawesome/css/all.min.css',
  '/assets/js/app.js',
  '/assets/js/animations.js',
  '/assets/js/dark-mode.js',
  '/assets/js/chatbot.js',
  '/images/karyasaarthi.png',
];

// Install — cache static assets safely
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return Promise.allSettled(
          STATIC_ASSETS.map(url => cache.add(url).catch(err => console.warn('SW cache failed for:', url, err)))
        );
      })
      .then(() => self.skipWaiting())
  );
});

// Activate — clean ALL old caches aggressively
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — network first for pages, cache first for static assets
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  // Ignore third-party requests to avoid CSP & CORS issues
  if (url.origin !== self.location.origin) return;

  // For same-origin static assets (CSS, JS, images, fonts) — cache first, network fallback
  if (url.origin === self.location.origin && 
      (url.pathname.match(/\.(css|js|png|jpg|jpeg|webp|svg|woff2?|ttf|eot)$/) || 
       url.pathname.startsWith('/assets/') || 
       url.pathname.startsWith('/images/'))) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        // Return cache immediately, but also update cache in background
        const fetchPromise = fetch(event.request).then(response => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => cached);

        return cached || fetchPromise;
      })
    );
    return;
  }

  // For PHP pages — always network first, fallback to cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Only cache successful same-origin responses
        if (response.status === 200 && url.origin === self.location.origin) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
