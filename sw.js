const CACHE_VERSION = '2026-08-30-v1';
const CACHE_NAME = `cjhubs-store-${CACHE_VERSION}`;
const APP_ORIGIN = self.location.origin;
const BACKEND_ORIGIN = 'https://cjhubs-backend.onrender.com';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.webmanifest',
  '/preload-bridge.js',
  '/dot.jpg',
  '/web.png',
  '/aab.png',
  '/assets/css/style.css',
  '/assets/js/data.js?v=20260816a',
  '/assets/js/layout.js?v=20260816a',
  '/assets/js/app.js?v=20260816a',
  '/assets/js/comments.js',
  '/assets/js/ratings-ui.js',
  '/assets/js/admin.js',
  '/about.html',
  '/account.html',
  '/cart.html',
  '/checkout.html',
  '/contact.html',
  '/gift-ideas.html',
  '/login.html',
  '/order-success.html',
  '/product.html',
  '/products-accessories.html',
  '/products-and-accessories.html',
  '/register.html',
  '/shop.html',
  '/admin/add-product.html',
  '/admin/customers.html',
  '/admin/dashboard.html',
  '/admin/login.html',
  '/admin/orders.html',
  '/admin/products.html'
];

function isBackendRequest(url) {
  return url.origin === BACKEND_ORIGIN || url.pathname.startsWith('/api/');
}

function sameOriginAsset(request) {
  return request.url.startsWith(APP_ORIGIN);
}

async function cacheResponse(request, response) {
  if (!response || (!response.ok && response.type !== 'opaque')) return response;
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response.clone());
  return response;
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request, { ignoreSearch: true });
  if (cached) return cached;
  try {
    const response = await fetch(request);
    return await cacheResponse(request, response);
  } catch (error) {
    return cached || cache.match('/offline.html') || Response.error();
  }
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return (
      await cache.match(request, { ignoreSearch: true }) ||
      await cache.match('/index.html') ||
      await cache.match('/offline.html') ||
      Response.error()
    );
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key.startsWith('cjhubs-store-') && key !== CACHE_NAME).map((key) => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (isBackendRequest(url)) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  if (sameOriginAsset(request) || url.origin !== APP_ORIGIN || ['script', 'style', 'image', 'font'].includes(request.destination)) {
    event.respondWith(cacheFirst(request));
  }
});
