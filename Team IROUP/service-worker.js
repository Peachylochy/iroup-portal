const IROUP_PWA_CACHE = 'iroup-static-v1';

const STATIC_ASSETS = [
  '/manifest-admin.webmanifest',
  '/manifest-public.webmanifest',
  '/css/iroup-theme.css',
  '/css/iroup-admin-responsive.css',
  '/js/iroup-admin-guard.js',
  '/js/iroup-config.js',
  '/js/iroup-image-helper.js',
  '/js/iroup-selectors.js',
  '/js/iroup-sidebar.js',
  '/js/iroup-utils.js',
  '/js/iroup-v2-api.js',
  '/js/iroup-v2-endpoint.js',
  '/js/pwa-register.js',
  '/assets/IROUP_LOGO.webp',
  '/assets/iroup-logo.png',
  '/assets/Globy_IROUP.png',
  '/assets/app-icon-admin-192.png',
  '/assets/app-icon-admin-512.png',
  '/assets/app-icon-public-192.png',
  '/assets/app-icon-public-512.png',
  '/assets/landing-hero-earth-dark.webp',
  '/assets/landing-hero-earth-light.webp',
  '/assets/MOU-hero-earth-dark-.webp',
  '/assets/MOU-hero-earth-light.webp',
  '/assets/events-hero-dark.webp',
  '/assets/events-hero-light.webp',
  '/assets/news-hero-dark.webp',
  '/assets/news-hero-light.webp',
  '/assets/knowledge-hero-dark.webp',
  '/assets/knowledge-hero-light.webp',
  '/assets/scholarship-hero-dark.webp',
  '/assets/scholarship-hero-light.webp'
];

const CACHEABLE_EXTENSIONS = new Set([
  '.css',
  '.js',
  '.png',
  '.webp',
  '.svg',
  '.ico',
  '.webmanifest',
  '.woff',
  '.woff2'
]);

const BLOCKED_PATH_PARTS = [
  '/api/',
  '/exec',
  '/upload',
  '/export',
  '/report'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(IROUP_PWA_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
      .catch(() => undefined)
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key !== IROUP_PWA_CACHE)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (!request || request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (!isSafeStaticRequest(url, request)) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const copy = response.clone();
        caches.open(IROUP_PWA_CACHE).then((cache) => cache.put(request, copy));
        return response;
      });
    })
  );
});

function isSafeStaticRequest(url, request) {
  if (request.mode === 'navigate' || request.destination === 'document') return false;

  const path = url.pathname;
  const lowerPath = path.toLowerCase();
  if (BLOCKED_PATH_PARTS.some((part) => lowerPath.includes(part))) return false;
  if (url.search && /(^|[?&])(action|token|adminToken|googleAccessToken|payload)=/i.test(url.search)) {
    return false;
  }

  const extension = lowerPath.slice(lowerPath.lastIndexOf('.'));
  return CACHEABLE_EXTENSIONS.has(extension);
}
