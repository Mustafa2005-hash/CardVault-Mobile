const PRECACHE = 'cv-cache-v3';
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  // OCR engine + English language for offline OCR (after first load)
  'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js',
  'https://tessdata.projectnaptha.com/5/eng.traineddata.gz'
];

self.addEventListener('install', (e)=>{
  e.waitUntil((async()=>{
    const cache = await caches.open(PRECACHE);
    try{ await cache.addAll(PRECACHE_URLS); }catch(e){ /* some CDNs may block addAll; ignore */ }
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
  e.respondWith((async()=>{
    const cached = await caches.match(e.request, {ignoreSearch:true});
    if(cached) return cached;
    try{
      const fresh = await fetch(e.request, {mode:'cors'});
      const cache = await caches.open(PRECACHE);
      try{ cache.put(e.request, fresh.clone()); }catch(e){ /* opaque responses can't be cached */ }
      return fresh;
    }catch(err){
      return cached || Response.error();
    }
  })());
});
