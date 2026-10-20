// Compras GOA: funciona sin señal. Guarda las páginas y lo que necesitan la primera vez que se abren con internet.
const CACHE='goa-offline-v1';
const PRECACHE=['./','./index.html','./checklist.html','./manifest.json','./icon-192.png','./icon-512.png',
  'https://cdn.tailwindcss.com','https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.all(PRECACHE.map(u=>c.add(new Request(u,{mode:u.startsWith('http')?'no-cors':'same-origin'})).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
const LIVE=['dolarapi.com','api.anthropic.com','wa.me','api.whatsapp.com'];
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(LIVE.some(h=>url.hostname.endsWith(h)))return; // datos en vivo: siempre por internet
  if(url.origin===location.origin){
    // Páginas propias: primero internet (para recibir cambios), si no hay señal, la copia guardada
    e.respondWith(fetch(req).then(r=>{if(r.ok){const c=r.clone();caches.open(CACHE).then(ca=>ca.put(req,c))}return r})
      .catch(()=>caches.match(req,{ignoreSearch:true}).then(r=>r||(req.mode==='navigate'?caches.match('./index.html'):undefined))));
  }else{
    // Estilos, íconos y letras de internet: primero la copia guardada
    e.respondWith(caches.match(req).then(r=>r||fetch(req).then(n=>{const c=n.clone();caches.open(CACHE).then(ca=>ca.put(req,c));return n})));
  }
});
