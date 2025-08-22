const PRECACHE = 'cv-cache-local-v1';
const PRECACHE_URLS = ['./','./index.html','./manifest.json'];

self.addEventListener('install', (e)=>{
  e.waitUntil((async()=>{
    const cache = await caches.open(PRECACHE);
    await cache.addAll(PRECACHE_URLS);
  })());
  self.skipWaiting();
});

self.addEventListener('activate', (e)=>{
  e.waitUntil((async()=>{
    const keys = await caches.keys();
    await Promise.all(keys.filter(k=>k!==PRECACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e)=>{
  const url = new URL(e.request.url);
  if (url.origin === location.origin){
    e.respondWith(caches.match(e.request, {ignoreSearch:true}).then(r => r || fetch(e.request)));
  }
});
