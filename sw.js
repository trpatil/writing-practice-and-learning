// Service worker for the Writing Practice PWA.
// Caches the app shell so it keeps working offline once installed.
// Requires being served over http(s) — file:// pages can't register a
// service worker at all, so double-clicking the HTML file is unaffected.
const CACHE_NAME = 'writing-practice-v1';
const ASSETS = [
  './writing-practice.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (event)=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=> cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event)=>{
  event.waitUntil(
    caches.keys().then(keys=> Promise.all(keys.filter(k=> k!==CACHE_NAME).map(k=> caches.delete(k))))
  );
  self.clients.claim();
});

// Cache-first, falling back to network (and refreshing the cache from
// the network when possible) — keeps the app usable with no connection.
self.addEventListener('fetch', (event)=>{
  if(event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached=>{
      const network = fetch(event.request).then(response=>{
        if(response && response.ok){
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache=> cache.put(event.request, copy));
        }
        return response;
      }).catch(()=> cached);
      return cached || network;
    })
  );
});
